import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import path from 'path';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import type { QuizQuestion, TranscriptSnippet } from './src/types';
import {
  MIN_EVIDENCE_SCORE,
  MIN_WORD_THRESHOLD,
  evaluateEvidence,
  gradeAnswer,
  generateQuizQuestions,
  tutorChat,
} from './server/gemini';
import {
  findUserByEmail,
  getCurrentUser,
  requireAuth,
  requireRole,
  toPublicUser,
  verifyPassword,
} from './server/auth';
import {
  UPLOAD_DIR,
  addVideo,
  getVideo,
  loadVideos,
  transcribeVideoWithGemini,
  updateVideo,
  upload,
} from './server/videos';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production' || import.meta.url.endsWith('server.js');
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(
  session({
    name: 'vinuni.sid',
    secret: process.env.SESSION_SECRET || 'dev-only-secret-doi-truoc-khi-deploy-that',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 },
  })
);
app.use('/uploads', express.static(UPLOAD_DIR));

// ---- Auth ----
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: 'Thiếu email hoặc mật khẩu.' });
    return;
  }
  const user = findUserByEmail(email);
  if (!user || !verifyPassword(user, password)) {
    res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' });
    return;
  }
  req.session.userId = user.id;
  res.json({ user: toPublicUser(user) });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/auth/me', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) {
    res.status(401).json({ error: 'Chưa đăng nhập.' });
    return;
  }
  res.json({ user });
});

// ---- Videos: giáo viên upload, AI nghe video lấy transcript rồi sinh quiz ----
app.post('/api/videos', requireRole('teacher'), upload.single('video'), (req, res) => {
  const user = getCurrentUser(req)!;
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'Thiếu file video.' });
    return;
  }
  const title = (req.body?.title as string)?.trim() || file.originalname;
  const record = {
    id: randomUUID(),
    title,
    filename: file.filename,
    mimeType: file.mimetype,
    uploadedByUserId: user.id,
    uploadedByName: user.name,
    createdAt: new Date().toISOString(),
    status: 'uploaded' as const,
  };
  addVideo(record);
  res.json({ video: record });
});

app.get('/api/videos', requireAuth, (_req, res) => {
  res.json({ videos: loadVideos() });
});

app.get('/api/videos/:id', requireAuth, (req, res) => {
  const video = getVideo(req.params.id);
  if (!video) {
    res.status(404).json({ error: 'Không tìm thấy video.' });
    return;
  }
  res.json({ video });
});

app.post('/api/videos/:id/transcribe', requireRole('teacher'), async (req, res) => {
  const video = getVideo(req.params.id);
  if (!video) {
    res.status(404).json({ error: 'Không tìm thấy video.' });
    return;
  }
  updateVideo(video.id, { status: 'transcribing', errorMessage: undefined });
  try {
    const transcript = await transcribeVideoWithGemini(video);
    const updated = updateVideo(video.id, { status: 'transcribed', transcript });
    res.json({ video: updated });
  } catch (err) {
    console.error('[api/videos/transcribe]', err);
    const message = err instanceof Error ? err.message : 'Không thể trích transcript từ video.';
    updateVideo(video.id, { status: 'transcribe_failed', errorMessage: message });
    res.status(500).json({ error: message });
  }
});

app.post('/api/videos/:id/generate-quiz', requireRole('teacher'), async (req, res) => {
  const video = getVideo(req.params.id);
  if (!video) {
    res.status(404).json({ error: 'Không tìm thấy video.' });
    return;
  }
  if (!video.transcript || video.transcript.length === 0) {
    res.status(400).json({ error: 'Video này chưa có transcript, hãy trích transcript trước.' });
    return;
  }
  updateVideo(video.id, { status: 'quiz_generating', errorMessage: undefined });
  try {
    const evaluation = await evaluateEvidence(video.transcript);
    if (!evaluation.sufficientEvidence) {
      const updated = updateVideo(video.id, {
        status: 'insufficient_evidence',
        evidenceScore: evaluation.evidenceScore,
        wordCount: evaluation.wordCount,
        errorMessage: evaluation.reasoning,
      });
      res.json({ video: updated, sufficientEvidence: false, reasoning: evaluation.reasoning });
      return;
    }
    const questions = await generateQuizQuestions(video.title, video.transcript, evaluation.evidenceScore);
    const updated = updateVideo(video.id, {
      status: 'quiz_ready',
      quiz: questions,
      evidenceScore: evaluation.evidenceScore,
      wordCount: evaluation.wordCount,
    });
    res.json({ video: updated, sufficientEvidence: true });
  } catch (err) {
    console.error('[api/videos/generate-quiz]', err);
    const message = err instanceof Error ? err.message : 'Không thể sinh quiz từ video này.';
    updateVideo(video.id, { status: 'quiz_failed', errorMessage: message });
    res.status(500).json({ error: message });
  }
});

// ---- Quiz sinh từ transcript đưa thẳng vào request (dùng cho bài giảng demo có sẵn) ----
app.post('/api/quiz/generate', requireAuth, async (req, res) => {
  try {
    const { chapterTitle, transcript } = req.body as { chapterTitle: string; transcript: TranscriptSnippet[] };
    if (!Array.isArray(transcript) || transcript.length === 0) {
      res.status(400).json({ error: 'Thiếu transcript của chương học.' });
      return;
    }

    const evaluation = await evaluateEvidence(transcript);
    if (!evaluation.sufficientEvidence) {
      res.json({
        sufficientEvidence: false,
        wordCount: evaluation.wordCount,
        minWordThreshold: MIN_WORD_THRESHOLD,
        evidenceScore: evaluation.evidenceScore,
        evidenceRequired: MIN_EVIDENCE_SCORE,
        reasoning: evaluation.reasoning,
        transcriptSample: transcript.map(s => s.text).join(' '),
      });
      return;
    }

    const questions = await generateQuizQuestions(chapterTitle, transcript, evaluation.evidenceScore);
    res.json({
      sufficientEvidence: true,
      wordCount: evaluation.wordCount,
      evidenceScore: evaluation.evidenceScore,
      questions,
    });
  } catch (err) {
    console.error('[api/quiz/generate]', err);
    res.status(500).json({ error: 'Không thể sinh câu hỏi từ transcript lúc này. Vui lòng thử lại.' });
  }
});

app.post('/api/quiz/grade', requireAuth, async (req, res) => {
  try {
    const { question, selectedKey, transcript } = req.body as {
      question: QuizQuestion;
      selectedKey: 'A' | 'B' | 'C' | 'D';
      transcript: TranscriptSnippet[];
    };
    if (!question || !selectedKey || !Array.isArray(transcript)) {
      res.status(400).json({ error: 'Thiếu dữ liệu để chấm câu trả lời.' });
      return;
    }
    const result = await gradeAnswer(question, selectedKey, transcript);
    res.json(result);
  } catch (err) {
    console.error('[api/quiz/grade]', err);
    res.status(500).json({ error: 'Không thể chấm câu trả lời lúc này. Vui lòng thử lại.' });
  }
});

app.post('/api/tutor/chat', requireAuth, async (req, res) => {
  try {
    const { transcript, history, message } = req.body as {
      transcript: TranscriptSnippet[];
      history: { sender: 'user' | 'ai'; text: string }[];
      message: string;
    };
    if (!message || !Array.isArray(transcript)) {
      res.status(400).json({ error: 'Thiếu nội dung câu hỏi.' });
      return;
    }
    const reply = await tutorChat(transcript, Array.isArray(history) ? history : [], message);
    res.json({ reply });
  } catch (err) {
    console.error('[api/tutor/chat]', err);
    res.status(500).json({ error: 'AI Tutor không phản hồi được lúc này. Vui lòng thử lại.' });
  }
});

// Bắt lỗi từ multer (file quá lớn, sai định dạng...) trả JSON thay vì trang lỗi mặc định của Express.
app.use((err: Error, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  console.error('[server] Unhandled error:', err);
  res.status(400).json({ error: err.message || 'Đã có lỗi xảy ra.' });
});

if (!isProd) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`[server] VinUni LMS đang chạy tại http://localhost:${PORT}`);
});
