import { randomUUID } from 'crypto';
import type { GradedAnswer, PublicQuizQuestion, QuizQuestion, TranscriptSnippet } from '../src/types';
import { deterministicGrade, gradeWrongAnswers } from './gemini';
import { recordAttempt } from './progress';

type OptionKey = 'A' | 'B' | 'C' | 'D';

interface QuizSession {
  userId: string;
  lectureId: string;
  questions: QuizQuestion[];
  transcript: TranscriptSnippet[];
  createdAt: number;
}

const SESSION_TTL_MS = 6 * 60 * 60 * 1000;
const sessions = new Map<string, QuizSession>();

function purgeExpired() {
  const now = Date.now();
  for (const [id, s] of sessions) {
    if (now - s.createdAt > SESSION_TTL_MS) sessions.delete(id);
  }
}

// Bỏ đáp án chuẩn, lời giải thích và căn cứ trước khi gửi câu hỏi cho học viên.
export function toPublicQuestion(q: QuizQuestion): PublicQuizQuestion {
  const {
    correctAnswer,
    explanation,
    groundingTimestamp,
    groundingMatchPercent,
    groundingQuote,
    groundingSnippetId,
    audioSeconds,
    aiDiagnosticRemark,
    userAnswer,
    ...rest
  } = q;
  return rest;
}

export function createQuizSession(
  userId: string,
  lectureId: string,
  questions: QuizQuestion[],
  transcript: TranscriptSnippet[]
) {
  purgeExpired();
  const quizId = randomUUID();
  sessions.set(quizId, { userId, lectureId, questions, transcript, createdAt: Date.now() });
  return { quizId, questions: questions.map(toPublicQuestion) };
}

const isOptionKey = (v: unknown): v is OptionKey => v === 'A' || v === 'B' || v === 'C' || v === 'D';

// Chấm toàn bộ bài ở máy chủ; chỉ sau bước này học viên mới nhận được đáp án chuẩn và căn cứ.
export async function gradeQuizSession(
  quizId: string,
  userId: string,
  answers: { questionId: number; selectedKey: unknown }[]
): Promise<{ questions: QuizQuestion[]; results: GradedAnswer[] } | null> {
  const session = sessions.get(quizId);
  if (!session || session.userId !== userId) return null;

  const answerByQuestion = new Map<number, OptionKey>();
  for (const a of answers) {
    if (isOptionKey(a?.selectedKey)) answerByQuestion.set(a.questionId, a.selectedKey);
  }

  // Câu đúng dùng lời giải thích có sẵn (không gọi AI); các câu sai được chấm gộp trong MỘT lượt gọi AI.
  const wrongItems = session.questions
    .map(q => ({ question: q, selectedKey: answerByQuestion.get(q.id) }))
    .filter((x): x is { question: QuizQuestion; selectedKey: OptionKey } => !!x.selectedKey && x.selectedKey !== x.question.correctAnswer);
  const aiWrongResults = await gradeWrongAnswers(wrongItems, session.transcript);

  const results: GradedAnswer[] = session.questions.map(q => {
    const selectedKey = answerByQuestion.get(q.id);
    if (!selectedKey) {
      return {
        questionId: q.id,
        selectedKey: null,
        isCorrect: false,
        confidence: 100,
        needsReview: false,
        feedback: 'Bạn chưa chọn đáp án cho câu hỏi này nên câu bị tính là sai.',
        groundingSnippetId: q.groundingSnippetId ?? '',
        groundingQuote: q.groundingQuote,
        suggestedSnippetIds: q.groundingSnippetId ? [q.groundingSnippetId] : [],
      };
    }
    const graded = aiWrongResults.get(q.id) ?? deterministicGrade(q, selectedKey);
    return { questionId: q.id, selectedKey, ...graded };
  });

  recordAttempt(
    userId,
    session.lectureId,
    session.questions.map((q, i) => ({ title: q.title, isCorrect: results[i].isCorrect }))
  );
  return { questions: session.questions, results };
}
