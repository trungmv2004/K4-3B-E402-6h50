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
