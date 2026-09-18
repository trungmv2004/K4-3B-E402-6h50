import { GoogleGenAI, Type } from '@google/genai';
import type { GenerateContentParameters } from '@google/genai';
import type { QuizQuestion, TranscriptSnippet } from '../src/types';

export const MODEL = 'gemini-3.6-flash';
export const MIN_WORD_THRESHOLD = 300;
export const MIN_EVIDENCE_SCORE = 80;
export const LOW_CONFIDENCE_THRESHOLD = 60;

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
  console.warn('[server] GEMINI_API_KEY chưa được cấu hình trong .env — các endpoint AI sẽ trả lỗi.');
}
export const ai = apiKey && apiKey !== 'MY_GEMINI_API_KEY' ? new GoogleGenAI({ apiKey }) : null;

export function countWords(transcript: TranscriptSnippet[]): number {
  return transcript.reduce((sum, s) => sum + s.text.trim().split(/\s+/).filter(Boolean).length, 0);
}

export function transcriptTable(transcript: TranscriptSnippet[]): string {
  return transcript.map(s => `${s.id} | ${s.timestamp} | ${s.text}`).join('\n');
}

// Gemini trả 503 UNAVAILABLE khá thường xuyên khi model đang quá tải tạm thời;
// thử lại một vài lần với backoff ngắn trước khi báo lỗi cho người dùng.
export async function generateContentWithRetry(params: GenerateContentParameters, attempts = 3) {
  if (!ai) throw new Error('GEMINI_API_KEY chưa được cấu hình.');
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status !== 503 || attempt === attempts) throw err;
      await new Promise(resolve => setTimeout(resolve, attempt * 800));
    }
  }
  throw new Error('unreachable');
}

export interface EvidenceEvaluation {
  wordCount: number;
  evidenceScore: number;
  reasoning: string;
  sufficientEvidence: boolean;
}

// AI quyết định #1: transcript có đủ căn cứ kiến thức để sinh quiz kiểm tra hiểu bài an toàn hay không.
export async function evaluateEvidence(transcript: TranscriptSnippet[]): Promise<EvidenceEvaluation> {
  const wordCount = countWords(transcript);
  const schema = {
    type: Type.OBJECT,
    properties: {
      evidenceScore: {
        type: Type.NUMBER,
        description:
          '0-100, mức độ transcript chứa kiến thức thực chất (định nghĩa/so sánh/lập luận) có thể kiểm chứng, thay vì lời dẫn/giới thiệu/chuyển tiếp.',
      },
      reasoning: { type: Type.STRING },
    },
    required: ['evidenceScore', 'reasoning'],
  };

  const response = await generateContentWithRetry({
    model: MODEL,
    contents: `Bạn là hệ thống kiểm định chất lượng nội dung cho một AI Tutor. Đánh giá đoạn transcript bài giảng dưới đây (${wordCount} từ) có đủ nội dung kiến thức thực chất để tạo câu hỏi kiểm tra hiểu bài đáng tin cậy hay không, hay chỉ là lời dẫn nhập/giới thiệu/chuyển tiếp không có gì để kiểm chứng.\n\nTranscript:\n${transcriptTable(transcript)}\n\nTrả về JSON đúng schema.`,
    config: { responseMimeType: 'application/json', responseSchema: schema },
  });

  const json = JSON.parse(response.text ?? '{}');
  const evidenceScore = Number(json.evidenceScore ?? 0);
  return {
    wordCount,
    evidenceScore,
    reasoning: json.reasoning ?? 'Nội dung transcript không đủ căn cứ kiến thức kiểm chứng được.',
    sufficientEvidence: wordCount >= MIN_WORD_THRESHOLD && evidenceScore >= MIN_EVIDENCE_SCORE,
  };
}

const quizSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                key: { type: Type.STRING, description: 'Một trong A, B, C, D' },
                text: { type: Type.STRING },
              },
              required: ['key', 'text'],
            },
          },
          correctAnswer: { type: Type.STRING, description: 'Một trong A, B, C, D' },
          explanation: { type: Type.STRING },
          groundingSnippetId: { type: Type.STRING, description: 'id của đúng 1 dòng transcript làm bằng chứng' },
          groundingQuote: { type: Type.STRING, description: 'Trích dẫn gần như nguyên văn từ đúng dòng transcript đó' },
        },
        required: ['title', 'options', 'correctAnswer', 'explanation', 'groundingSnippetId', 'groundingQuote'],
      },
    },
  },
  required: ['questions'],
};

// AI quyết định #2 (thời điểm sinh đề): sinh câu hỏi tình huống có trích dẫn ngược từ transcript thật.
export async function generateQuizQuestions(
  chapterTitle: string,
  transcript: TranscriptSnippet[],
  evidenceScore: number
): Promise<QuizQuestion[]> {
  const response = await generateContentWithRetry({
    model: MODEL,
    contents: `Bạn là AI Tutor. Sinh đúng 3 câu hỏi kiểm tra hiểu bài THEO TÌNH HUỐNG ÁP DỤNG kiến thức (không hỏi tái hiện định nghĩa/từ khóa trực tiếp), dựa CHỈ trên transcript bài giảng dưới đây, mỗi câu gắn với một mốc kiến thức khác nhau. Mỗi câu có 4 lựa chọn A-D, đúng 1 đáp án đúng. groundingSnippetId PHẢI là id một dòng transcript chứa bằng chứng cho đáp án đúng; groundingQuote PHẢI trích gần như nguyên văn từ đúng dòng đó, KHÔNG được bịa nội dung ngoài transcript.\n\nTiêu đề chương: ${chapterTitle}\n\nTranscript (id | timestamp | nội dung):\n${transcriptTable(transcript)}\n\nTrả về JSON đúng schema.`,
    config: { responseMimeType: 'application/json', responseSchema: quizSchema },
  });

  const json = JSON.parse(response.text ?? '{}');
  const snippetById = new Map(transcript.map(s => [s.id, s]));
  const rawQuestions: any[] = Array.isArray(json.questions) ? json.questions : [];

  return rawQuestions.map((q, idx) => {
    const snippet = snippetById.get(q.groundingSnippetId) ?? transcript[0];
    return {
      id: idx + 1,
      questionNumber: idx + 1,
      totalQuestions: rawQuestions.length,
      badgeText: 'Sinh bởi AI Tutor',
      questionType: 'Trắc nghiệm đơn (Single Choice)',
      title: q.title,
      options: q.options,
      correctAnswer: q.correctAnswer,
      groundingTimestamp: snippet.timestamp,
      groundingMatchPercent: evidenceScore,
      groundingQuote: q.groundingQuote,
      groundingSnippetId: snippet.id,
      audioSeconds: snippet.seconds,
      explanation: q.explanation,
    };
  });
}

export interface GradeResult {
  isCorrect: boolean;
  confidence: number;
  feedback: string;
  groundingSnippetId: string;
  groundingQuote: string;
  suggestedSnippetIds: string[];
  needsReview: boolean;
}

// AI quyết định #3 (thời điểm chấm bài): câu trả lời của học viên có đúng bản chất và có căn cứ hay không.
export async function gradeAnswer(
  question: QuizQuestion,
  selectedKey: 'A' | 'B' | 'C' | 'D',
  transcript: TranscriptSnippet[]
): Promise<GradeResult> {
  const selectedOption = question.options.find(o => o.key === selectedKey);
  const schema = {
    type: Type.OBJECT,
    properties: {
      isCorrect: { type: Type.BOOLEAN },
      confidence: { type: Type.NUMBER, description: '0-100, mức độ tự tin vào kết luận isCorrect dựa trên transcript' },
      feedback: { type: Type.STRING, description: 'Nhận xét ngắn gọn giải thích vì sao đúng/sai, dựa trên transcript' },
      groundingSnippetId: { type: Type.STRING },
      groundingQuote: { type: Type.STRING },
      suggestedSnippetIds: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: '2-3 id dòng transcript liên quan nhất nên xem lại để tự kiểm chứng',
      },
    },
    required: ['isCorrect', 'confidence', 'feedback', 'groundingSnippetId', 'groundingQuote', 'suggestedSnippetIds'],
  };

  const response = await generateContentWithRetry({
    model: MODEL,
    contents: `Bạn là AI chấm bài kiểm tra hiểu bài, PHẢI đối chiếu với transcript, không được tự suy diễn ngoài transcript.\n\nCâu hỏi: ${question.title}\nHọc viên chọn (${selectedKey}): ${selectedOption?.text}\nToàn bộ lựa chọn: ${question.options.map(o => `${o.key}. ${o.text}`).join(' | ')}\n\nTranscript (id | timestamp | nội dung):\n${transcriptTable(transcript)}\n\nNhiệm vụ:\n1. Xác định lựa chọn của học viên có đúng bản chất kiến thức theo transcript hay không.\n2. confidence: đặt THẤP (dưới 60) nếu transcript không đủ rõ ràng để phân biệt dứt khoát các lựa chọn, thay vì đoán liều.\n3. groundingSnippetId + groundingQuote: đúng 1 dòng transcript làm bằng chứng chính, trích gần như nguyên văn.\n4. suggestedSnippetIds: 2-3 id dòng transcript liên quan nhất học viên nên xem lại.\n\nTrả về JSON đúng schema.`,
    config: { responseMimeType: 'application/json', responseSchema: schema },
  });

  const result = JSON.parse(response.text ?? '{}');
  const confidence = Number(result.confidence ?? 0);
  return { ...result, confidence, needsReview: confidence < LOW_CONFIDENCE_THRESHOLD };
}

// AI Tutor hội thoại, chỉ được trả lời trong phạm vi transcript bài giảng (grounded Q&A).
export async function tutorChat(
  transcript: TranscriptSnippet[],
  history: { sender: 'user' | 'ai'; text: string }[],
  message: string
): Promise<string> {
  const systemPreamble = `Bạn là AI Tutor của VinUni đồng hành cùng học viên khóa "AI in Action". CHỈ được trả lời dựa trên transcript bài giảng dưới đây. Nếu câu hỏi nằm ngoài phạm vi transcript, hãy nói rõ rằng bạn không có căn cứ trong bài giảng này và đề nghị học viên liên hệ trợ giảng — KHÔNG được bịa thông tin ngoài transcript. Trả lời ngắn gọn, súc tích, bằng tiếng Việt.\n\nTranscript:\n${transcriptTable(transcript)}`;

  const contents = [
    { role: 'user' as const, parts: [{ text: systemPreamble }] },
    { role: 'model' as const, parts: [{ text: 'Đã hiểu, tôi sẽ chỉ trả lời trong phạm vi transcript này.' }] },
    ...history.map(m => ({
      role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
      parts: [{ text: m.text }],
    })),
    { role: 'user' as const, parts: [{ text: message }] },
  ];

  const response = await generateContentWithRetry({ model: MODEL, contents });
  return response.text ?? '';
}
