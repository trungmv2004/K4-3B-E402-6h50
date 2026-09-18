export type ScreenMode = 
  | 'video-completion'  // Màn hình 1: Video bài giảng hoàn thành & Kích hoạt AI Quiz
  | 'quiz-taking'       // Màn hình 2: Làm bài trắc nghiệm AI & Căn cứ nguồn Transcript
  | 'remediation'       // Màn hình 3: Chấm điểm & Đối chiếu Timestamp Transcript
  | 'fallback';         // Màn hình 4: Xử lý Ngoại lệ An toàn (AI Fallback)

export interface QuestionOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface QuizQuestion {
  id: number;
  questionNumber: number;
  totalQuestions: number;
  badgeText: string;
  questionType: string;
  title: string;
  highlightWords?: { word: string; color: string }[];
  options: QuestionOption[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  userAnswer?: 'A' | 'B' | 'C' | 'D';
  isFlaggedForReview?: boolean;
  groundingTimestamp: string;
  groundingMatchPercent: number;
  groundingQuote: string;
  groundingSnippetId?: string;
  audioSeconds?: number;
  diagramTitle?: string;
  diagramSubtitle?: string;
  diagramLevels?: {
    level: string;
    name: string;
    isTarget?: boolean;
    badge?: string;
  }[];
  explanation?: string;
  aiDiagnosticRemark?: string;
}

// Trả về từ /api/quiz/generate khi transcript không đủ căn cứ kiến thức để sinh quiz an toàn.
export interface EvidenceGateResult {
  sufficientEvidence: false;
  wordCount: number;
  minWordThreshold: number;
  evidenceScore: number;
  evidenceRequired: number;
  reasoning: string;
  transcriptSample: string;
}

// Câu hỏi gửi cho học viên khi đang làm bài: KHÔNG chứa đáp án chuẩn, lời giải thích hay căn cứ transcript.
export type PublicQuizQuestion = Omit<
  QuizQuestion,
  | 'correctAnswer'
  | 'explanation'
  | 'groundingTimestamp'
  | 'groundingMatchPercent'
  | 'groundingQuote'
  | 'groundingSnippetId'
  | 'audioSeconds'
  | 'aiDiagnosticRemark'
>;

// Trả về từ /api/quiz/start: phiên làm bài do máy chủ giữ đáp án, hoặc kết quả cổng căn cứ khi transcript không đủ.
export type StartQuizResult =
  | { sufficientEvidence: true; quizId: string; wordCount: number; evidenceScore: number; questions: PublicQuizQuestion[] }
  | EvidenceGateResult;

// Trả về từ /api/quiz/submit: máy chủ chấm bài rồi mới công bố đáp án và căn cứ.
export interface SubmitQuizResult {
  questions: QuizQuestion[];
  results: GradedAnswer[];
}

// Dữ liệu hiển thị đầy đủ cho màn hình Graceful Fallback (phần chrome tĩnh + phần AI quyết định).
export interface FallbackAuditData {
  phase: string;
  stageName: string;
  systemStatus: string;
  wordCount: number;
  minWordThreshold: number;
  evidenceScore: number;
  evidenceRequired: number;
  appliedMode: string;
  academicBenefit: string;
  transcriptSample: string;
  aiReasoning: string;
}

// Kết quả đối chiếu một câu trả lời của học viên với transcript, do AI quyết định.
export interface GradedAnswer {
  questionId: number;
  selectedKey: 'A' | 'B' | 'C' | 'D' | null; // null = học viên bỏ trống câu này
  isCorrect: boolean;
  confidence: number;
  needsReview: boolean;
  feedback: string;
  groundingSnippetId: string;
  groundingQuote: string;
  suggestedSnippetIds: string[];
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface TranscriptSnippet {
  id: string;
  timestamp: string;
  seconds: number;
  title: string;
  speaker?: string;
  text: string;
  tag?: string;
  isImportant?: boolean;
  relatedQuestionId?: number;
}

export type Role = 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type VideoStatus =
  | 'uploaded'
  | 'transcribing'
  | 'transcribed'
  | 'transcribe_failed'
  | 'insufficient_evidence'
  | 'quiz_generating'
  | 'quiz_review'
  | 'quiz_ready'
  | 'quiz_failed';

// Bài giảng do giáo viên upload: AI (Gemini) nghe video lấy transcript rồi sinh quiz từ đó.
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
  quizCount?: number; // học viên chỉ thấy số câu, không nhận nội dung quiz/đáp án
}

// Tiến độ học của một học viên với một bài giảng, lưu ở máy chủ để không mất khi tải lại trang.
export interface LectureProgress {
  lectureId: string;
  attempts: number;
  bestScorePercent: number;
  lastScorePercent: number;
  completed: boolean;
  lastAttemptAt?: string;
  completedAt?: string;
  viewedAt?: string;
}

// ---- Báo cáo kết quả lớp (giảng viên) ----
export interface StudentLectureStat {
  userId: string;
  name: string;
  email: string;
  viewed: boolean;
  viewedAt?: string;
  attempts: number;
  bestScorePercent: number;
  lastScorePercent: number;
  completed: boolean;
}

export interface HardQuestionStat {
  title: string;
  attempts: number;
  wrongCount: number;
  wrongPercent: number;
}

export interface LectureReport {
  lectureId: string;
  title: string;
  kind: 'quiz' | 'exempt';
  students: StudentLectureStat[];
  viewedCount: number;
  attemptedCount: number;
  completedCount: number;
  avgBestScorePercent: number | null;
  hardestQuestions: HardQuestionStat[];
}

export interface ClassReport {
  totalStudents: number;
  lectures: LectureReport[];
}
