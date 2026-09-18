import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { Type } from '@google/genai';
import { ai, generateContentWithRetry } from './gemini';
import { readJsonFile, writeJsonFile } from './db';
import type { QuizQuestion, TranscriptSnippet } from '../src/types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIDEOS_FILE = path.resolve(__dirname, '../data/videos.json');
export const UPLOAD_DIR = path.resolve(__dirname, '../uploads/videos');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export type VideoStatus =
  | 'uploaded'
  | 'transcribing'
  | 'transcribed'
  | 'transcribe_failed'
  | 'insufficient_evidence'
  | 'quiz_generating'
  | 'quiz_ready'
  | 'quiz_failed';

export interface VideoRecord {
  id: string;
  title: string;
  filename: string;
  mimeType: string;
  uploadedByUserId: string;
  uploadedByName: string;
  createdAt: string;
  status: VideoStatus;
  errorMessage?: string;
  transcript?: TranscriptSnippet[];
  quiz?: QuizQuestion[];
  evidenceScore?: number;
  wordCount?: number;
}

export const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || '.mp4';
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 300 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) {
      cb(new Error('Chỉ chấp nhận file video.'));
      return;
    }
    cb(null, true);
  },
});

export function loadVideos(): VideoRecord[] {
  return readJsonFile<VideoRecord[]>(VIDEOS_FILE, []);
}

function saveVideos(videos: VideoRecord[]): void {
  writeJsonFile(VIDEOS_FILE, videos);
}

export function addVideo(video: VideoRecord): void {
  const videos = loadVideos();
  videos.push(video);
  saveVideos(videos);
}

export function getVideo(id: string): VideoRecord | undefined {
  return loadVideos().find(v => v.id === id);
}

export function updateVideo(id: string, patch: Partial<VideoRecord>): VideoRecord | undefined {
  const videos = loadVideos();
  const idx = videos.findIndex(v => v.id === id);
  if (idx === -1) return undefined;
  videos[idx] = { ...videos[idx], ...patch };
  saveVideos(videos);
  return videos[idx];
}

const transcriptSchema = {
  type: Type.OBJECT,
  properties: {
    snippets: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          timestamp: { type: Type.STRING, description: 'Định dạng mm:ss' },
          seconds: { type: Type.NUMBER, description: 'Thời điểm bắt đầu, tính bằng giây' },
          title: { type: Type.STRING, description: 'Tiêu đề ngắn cho ý chính của đoạn' },
          text: { type: Type.STRING, description: 'Lời nói nguyên văn trong đoạn, chép lại chính xác theo audio' },
        },
        required: ['timestamp', 'seconds', 'title', 'text'],
      },
    },
  },
  required: ['snippets'],
};

// AI quyết định #0 (bước giáo viên upload): nghe trực tiếp audio trong video qua Gemini File API
// để chép lại transcript thật — không dùng dịch vụ speech-to-text riêng, tận dụng đúng khả năng
// đa phương thức (nghe video/audio) sẵn có của Gemini.
export async function transcribeVideoWithGemini(video: VideoRecord): Promise<TranscriptSnippet[]> {
  if (!ai) throw new Error('GEMINI_API_KEY chưa được cấu hình.');

  const filePath = path.join(UPLOAD_DIR, video.filename);
  let fileInfo = await ai.files.upload({
    file: filePath,
    config: { mimeType: video.mimeType, displayName: video.title },
  });

  const fileName = fileInfo.name;
  if (!fileName) throw new Error('Gemini không trả về tên file sau khi upload.');

  for (let attempt = 0; attempt < 60 && fileInfo.state === 'PROCESSING'; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    fileInfo = await ai.files.get({ name: fileName });
  }

  if (fileInfo.state !== 'ACTIVE' || !fileInfo.uri || !fileInfo.mimeType) {
    throw new Error(`Gemini không xử lý được file video (trạng thái: ${fileInfo.state ?? 'không rõ'}).`);
  }

  const response = await generateContentWithRetry(
    {
      model: 'gemini-3.6-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { fileData: { fileUri: fileInfo.uri, mimeType: fileInfo.mimeType } },
            {
              text: 'Nghe kỹ toàn bộ audio trong video này và chép lại thành transcript tiếng Việt, chia thành các đoạn theo từng ý chính, mỗi đoạn kèm mốc thời gian bắt đầu. Ghi lại đúng nguyên văn lời nói, KHÔNG tóm tắt, KHÔNG bịa thêm nội dung không có trong audio. Trả về JSON đúng schema.',
            },
          ],
        },
      ],
      config: { responseMimeType: 'application/json', responseSchema: transcriptSchema },
    },
    // Xử lý video/audio là request nặng hơn, Gemini hay trả 503 tạm thời hơn các lời gọi text
    // thuần — tăng số lần thử và độ trễ backoff so với mặc định để đỡ phải upload lại từ đầu.
    'video.transcribe',
    6
  );

  const json = JSON.parse(response.text ?? '{}');
  const rawSnippets: any[] = Array.isArray(json.snippets) ? json.snippets : [];
  if (rawSnippets.length === 0) {
    throw new Error('Gemini không trích được đoạn transcript nào từ video này.');
  }

  return rawSnippets.map((s, idx) => ({
    id: `v-${idx + 1}`,
    timestamp: String(s.timestamp),
    seconds: Number(s.seconds) || 0,
    title: String(s.title),
    speaker: 'Giảng viên',
    text: String(s.text),
  }));
}
