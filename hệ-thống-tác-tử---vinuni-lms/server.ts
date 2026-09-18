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
  countWords,
  evaluateEvidence,
  friendlyAiMessage,
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
import { createQuizSession, gradeQuizSession } from './server/quizSessions';
import { getLectureProgress, getUserProgress, markCompleted, markViewed } from './server/progress';
import { isBusy, quizStep, recoverInterruptedJobs, runPipeline, transcribeStep } from './server/pipeline';
import { buildClassReport } from './server/report';
import {
  UPLOAD_DIR,
  addVideo,
  getVideo,
  loadVideos,
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
  // Tự chạy nền: trích transcript → sinh quiz. Giảng viên theo dõi tiến độ qua trạng thái video.
  void runPipeline(record.id);
  res.json({ video: record });
});

// Học viên không được nhận nội dung quiz (có đáp án chuẩn) — chỉ nhận số câu; quiz được cấp qua /api/quiz/start.
function forViewer<T extends { quiz?: QuizQuestion[] }>(video: T, role: string) {
  if (role === 'teacher') return video;
  const { quiz, ...rest } = video;
  return { ...rest, quizCount: quiz?.length ?? 0 };
}

app.get('/api/videos', requireAuth, (req, res) => {
  const role = getCurrentUser(req)!.role;
  res.json({ videos: loadVideos().map(v => forViewer(v, role)) });
});

app.get('/api/videos/:id', requireAuth, (req, res) => {
  const video = getVideo(req.params.id);
  if (!video) {
    res.status(404).json({ error: 'Không tìm thấy video.' });
    return;
  }
  res.json({ video: forViewer(video, getCurrentUser(req)!.role) });
});

// Lỗi hạn mức/quá tải của AI trả về 503 kèm thông báo dễ hiểu; trả true nếu đã phản hồi.
function respondAiUnavailable(res: express.Response, err: unknown): boolean {
  const message = friendlyAiMessage(err);
  if (!message) return false;
  res.status(503).json({ error: message });
  return true;
}

app.post('/api/videos/:id/transcribe', requireRole('teacher'), async (req, res) => {
  const video = getVideo(req.params.id);
  if (!video) {
    res.status(404).json({ error: 'Không tìm thấy video.' });
    return;
  }
  if (isBusy(video)) {
    res.status(409).json({ error: 'Video đang được AI xử lý, hãy thử lại sau.' });
    return;
  }
  try {
    const updated = await transcribeStep(video.id);
    res.json({ video: updated });
  } catch (err) {
    console.error('[api/videos/transcribe]', err);
    if (respondAiUnavailable(res, err)) return;
    const message = err instanceof Error ? err.message : 'Không thể trích transcript từ video.';
    res.status(500).json({ error: message });
  }
});

// Giáo viên tự xác nhận đây là video giới thiệu/chuyển tiếp: học viên được miễn quiz (cùng trạng thái với evidence gate).
app.post('/api/videos/:id/mark-intro', requireRole('teacher'), (req, res) => {
  const video = getVideo(req.params.id);
  if (!video) {
    res.status(404).json({ error: 'Không tìm thấy video.' });
    return;
  }
  if (isBusy(video)) {
    res.status(409).json({ error: 'Video đang được AI xử lý, hãy thử lại sau.' });
    return;
  }
  const updated = updateVideo(video.id, {
    status: 'insufficient_evidence',
    quiz: undefined,
    evidenceScore: video.evidenceScore ?? 0,
    wordCount: video.transcript ? countWords(video.transcript) : 0,
    errorMessage: 'Giảng viên xác nhận đây là video giới thiệu/chuyển tiếp, không có nội dung kiến thức cần kiểm tra.',
  });
  res.json({ video: updated });
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
  if (isBusy(video)) {
    res.status(409).json({ error: 'Video đang được AI xử lý, hãy thử lại sau.' });
    return;
  }
  try {
    res.json(await quizStep(video.id));
  } catch (err) {
    console.error('[api/videos/generate-quiz]', err);
    if (respondAiUnavailable(res, err)) return;
    const message = err instanceof Error ? err.message : 'Không thể sinh quiz từ video này.';
    res.status(500).json({ error: message });
  }
});

// ---- Duyệt quiz trước khi phát hành: giảng viên sửa/xoá câu AI sinh rồi mới cho học viên làm ----
type EditedQuestion = {
  id: number;
  title?: unknown;
  options?: { key: unknown; text: unknown }[];
  correctAnswer?: unknown;
  explanation?: unknown;
};

const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const;

// Chỉ nhận các trường được phép sửa (đề, lựa chọn, đáp án, giải thích); căn cứ transcript giữ nguyên từ câu gốc.
function applyQuizEdits(original: QuizQuestion[], edits: EditedQuestion[]): QuizQuestion[] | string {
  const byId = new Map(original.map(q => [q.id, q]));
  const result: QuizQuestion[] = [];
  for (const e of edits) {
    const base = byId.get(e.id);
    if (!base) return 'Có câu hỏi không thuộc quiz này.';
    const title = typeof e.title === 'string' ? e.title.trim() : '';
    if (!title) return 'Đề câu hỏi không được để trống.';
    if (!Array.isArray(e.options) || e.options.length !== 4) return 'Mỗi câu phải có đủ 4 lựa chọn A-D.';
    const options = OPTION_KEYS.map((key, i) => ({
      key,
      text: e.options![i] && typeof e.options![i].text === 'string' ? (e.options![i].text as string).trim() : '',
    }));
    if (options.some(o => !o.text)) return 'Các lựa chọn không được để trống.';
    if (!OPTION_KEYS.includes(e.correctAnswer as (typeof OPTION_KEYS)[number])) return 'Đáp án đúng phải là A, B, C hoặc D.';
    result.push({
      ...base,
      title,
      options,
      correctAnswer: e.correctAnswer as QuizQuestion['correctAnswer'],
      explanation: typeof e.explanation === 'string' ? e.explanation.trim() : base.explanation,
    });
  }
  return result.map((q, i) => ({ ...q, id: i + 1, questionNumber: i + 1, totalQuestions: result.length }));
}

app.put('/api/videos/:id/quiz', requireRole('teacher'), (req, res) => {
  const video = getVideo(req.params.id);
  if (!video?.quiz) {
    res.status(404).json({ error: 'Không tìm thấy quiz của video này.' });
    return;
  }
  if (video.status !== 'quiz_review') {
    res.status(409).json({ error: 'Chỉ sửa được quiz ở trạng thái chờ duyệt. Hãy rút quiz về bản nháp trước.' });
    return;
  }
  const edits = (req.body as { quiz?: EditedQuestion[] }).quiz;
  if (!Array.isArray(edits) || edits.length === 0) {
    res.status(400).json({ error: 'Quiz phải còn ít nhất 1 câu hỏi.' });
    return;
  }
  const applied = applyQuizEdits(video.quiz, edits);
  if (typeof applied === 'string') {
    res.status(400).json({ error: applied });
    return;
  }
  res.json({ video: updateVideo(video.id, { quiz: applied }) });
});

app.post('/api/videos/:id/publish', requireRole('teacher'), (req, res) => {
  const video = getVideo(req.params.id);
  if (!video || video.status !== 'quiz_review' || !video.quiz?.length) {
    res.status(409).json({ error: 'Video này không có quiz nào đang chờ duyệt.' });
    return;
  }
  res.json({ video: updateVideo(video.id, { status: 'quiz_ready' }) });
});

app.post('/api/videos/:id/unpublish', requireRole('teacher'), (req, res) => {
  const video = getVideo(req.params.id);
  if (!video || video.status !== 'quiz_ready') {
    res.status(409).json({ error: 'Video này chưa được phát hành.' });
    return;
  }
  res.json({ video: updateVideo(video.id, { status: 'quiz_review' }) });
});

// Đánh giá căn cứ rồi sinh quiz từ transcript; trả về kết quả cổng căn cứ nếu transcript không đủ.
async function evaluateAndGenerate(chapterTitle: string, transcript: TranscriptSnippet[], caseId?: string) {
  const evaluation = await evaluateEvidence(transcript, caseId);
  if (!evaluation.sufficientEvidence) {
    return {
      gate: {
        sufficientEvidence: false as const,
        wordCount: evaluation.wordCount,
        minWordThreshold: MIN_WORD_THRESHOLD,
        evidenceScore: evaluation.evidenceScore,
        evidenceRequired: MIN_EVIDENCE_SCORE,
        reasoning: evaluation.reasoning,
        transcriptSample: transcript.map(s => s.text).join(' '),
      },
    };
  }
  const questions = await generateQuizQuestions(chapterTitle, transcript, evaluation.evidenceScore, caseId);
  return { evaluation, questions };
}

// ---- Quiz sinh từ transcript đưa thẳng vào request (giữ cho bộ đánh giá eval/, trả về cả đáp án chuẩn) ----
app.post('/api/quiz/generate', requireAuth, async (req, res) => {
  try {
    const { chapterTitle, transcript, caseId } = req.body as {
      chapterTitle: string;
      transcript: TranscriptSnippet[];
      caseId?: string;
    };
    if (!Array.isArray(transcript) || transcript.length === 0) {
      res.status(400).json({ error: 'Thiếu transcript của chương học.' });
      return;
    }

    const result = await evaluateAndGenerate(chapterTitle, transcript, caseId);
    if ('gate' in result) {
      res.json(result.gate);
      return;
    }
    res.json({
      sufficientEvidence: true,
      wordCount: result.evaluation.wordCount,
      evidenceScore: result.evaluation.evidenceScore,
      questions: result.questions,
    });
  } catch (err) {
    console.error('[api/quiz/generate]', err);
    if (respondAiUnavailable(res, err)) return;
    res.status(500).json({ error: 'Không thể sinh câu hỏi từ transcript lúc này. Vui lòng thử lại.' });
  }
});

// ---- Luồng học viên: máy chủ giữ đáp án trong phiên làm bài, chấm bài ở /api/quiz/submit ----
app.post('/api/quiz/start', requireAuth, async (req, res) => {
  try {
    const user = getCurrentUser(req)!;
    const { videoId, lectureId, chapterTitle, transcript } = req.body as {
      videoId?: string;
      lectureId?: string;
      chapterTitle?: string;
      transcript?: TranscriptSnippet[];
    };

    if (videoId) {
      const video = getVideo(videoId);
      if (!video || video.status !== 'quiz_ready' || !video.quiz?.length || !video.transcript) {
        res.status(404).json({ error: 'Bài giảng này chưa có quiz sẵn sàng.' });
        return;
      }
      const started = createQuizSession(user.id, video.id, video.quiz, video.transcript);
      res.json({
        sufficientEvidence: true,
        wordCount: video.wordCount ?? 0,
        evidenceScore: video.evidenceScore ?? 0,
        ...started,
      });
      return;
    }

    if (!chapterTitle || !Array.isArray(transcript) || transcript.length === 0) {
      res.status(400).json({ error: 'Thiếu transcript của chương học.' });
      return;
    }
    const result = await evaluateAndGenerate(chapterTitle, transcript);
    if ('gate' in result) {
      res.json(result.gate);
      return;
    }
    const started = createQuizSession(user.id, lectureId || 'demo', result.questions, transcript);
    res.json({
      sufficientEvidence: true,
      wordCount: result.evaluation.wordCount,
      evidenceScore: result.evaluation.evidenceScore,
      ...started,
    });
  } catch (err) {
    console.error('[api/quiz/start]', err);
    if (respondAiUnavailable(res, err)) return;
    res.status(500).json({ error: 'Không thể sinh câu hỏi từ transcript lúc này. Vui lòng thử lại.' });
  }
});

app.post('/api/quiz/submit', requireAuth, async (req, res) => {
  try {
    const user = getCurrentUser(req)!;
    const { quizId, answers } = req.body as {
      quizId?: string;
      answers?: { questionId: number; selectedKey: unknown }[];
    };
    if (!quizId || !Array.isArray(answers)) {
      res.status(400).json({ error: 'Thiếu dữ liệu bài làm.' });
      return;
    }
    const graded = await gradeQuizSession(quizId, user.id, answers);
    if (!graded) {
      res.status(404).json({ error: 'Phiên làm bài không tồn tại hoặc đã hết hạn. Hãy bắt đầu lại bài kiểm tra.' });
      return;
    }
    res.json(graded);
  } catch (err) {
    console.error('[api/quiz/submit]', err);
    if (respondAiUnavailable(res, err)) return;
    res.status(500).json({ error: 'Không thể chấm bài lúc này. Vui lòng thử lại.' });
  }
});

app.post('/api/quiz/grade', requireAuth, async (req, res) => {
  try {
    const { question, selectedKey, transcript, caseId } = req.body as {
      question: QuizQuestion;
      selectedKey: 'A' | 'B' | 'C' | 'D';
      transcript: TranscriptSnippet[];
      caseId?: string;
    };
    if (!question || !selectedKey || !Array.isArray(transcript)) {
      res.status(400).json({ error: 'Thiếu dữ liệu để chấm câu trả lời.' });
      return;
    }
    const result = await gradeAnswer(question, selectedKey, transcript, caseId);
    res.json(result);
  } catch (err) {
    console.error('[api/quiz/grade]', err);
    res.status(500).json({ error: 'Không thể chấm câu trả lời lúc này. Vui lòng thử lại.' });
  }
});

app.post('/api/tutor/chat', requireAuth, async (req, res) => {
  try {
    const { transcript, history, message, caseId } = req.body as {
      transcript: TranscriptSnippet[];
      history: { sender: 'user' | 'ai'; text: string }[];
      message: string;
      caseId?: string;
    };
    if (!message || !Array.isArray(transcript)) {
      res.status(400).json({ error: 'Thiếu nội dung câu hỏi.' });
      return;
    }
    const reply = await tutorChat(transcript, Array.isArray(history) ? history : [], message, caseId);
    res.json({ reply });
  } catch (err) {
    console.error('[api/tutor/chat]', err);
    if (respondAiUnavailable(res, err)) return;
    res.status(500).json({ error: 'AI Tutor không phản hồi được lúc này. Vui lòng thử lại.' });
  }
});

// ---- Tiến độ học: lưu theo từng học viên, không mất khi tải lại trang ----
app.get('/api/progress', requireAuth, (req, res) => {
  res.json({ progress: getUserProgress(getCurrentUser(req)!.id) });
});

app.post('/api/progress/view', requireAuth, (req, res) => {
  const { lectureId } = req.body as { lectureId?: string };
  if (!lectureId) {
    res.status(400).json({ error: 'Thiếu mã bài giảng.' });
    return;
  }
  markViewed(getCurrentUser(req)!.id, lectureId);
  res.json({ ok: true });
});

app.get('/api/teacher/report', requireRole('teacher'), (_req, res) => {
  res.json(buildClassReport());
});

app.post('/api/progress/complete', requireAuth, (req, res) => {
  const user = getCurrentUser(req)!;
  const { lectureId } = req.body as { lectureId?: string };
  if (!lectureId) {
    res.status(400).json({ error: 'Thiếu mã bài giảng.' });
    return;
  }
  // Chỉ cho hoàn thành khi thật sự đủ điều kiện: làm đúng hết quiz, hoặc là video giới thiệu được miễn thi.
  const video = getVideo(lectureId);
  const isExempt = video?.status === 'insufficient_evidence';
  const passedAll = (getLectureProgress(user.id, lectureId)?.bestScorePercent ?? 0) >= 100;
  if (!isExempt && !passedAll) {
    res.status(403).json({ error: 'Bạn chưa đủ điều kiện hoàn thành bài giảng này.' });
    return;
  }
  markCompleted(user.id, lectureId);
  res.json({ progress: getLectureProgress(user.id, lectureId) });
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

recoverInterruptedJobs();

app.listen(PORT, () => {
  console.log(`[server] VinUni LMS đang chạy tại http://localhost:${PORT}`);
});
