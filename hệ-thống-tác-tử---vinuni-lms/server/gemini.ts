import Groq from 'groq-sdk';
import type { QuizQuestion, TranscriptSnippet } from '../src/types';
import { logGeminiCall } from './logging';

// ---- Cấu hình Groq (thay thế Gemini để tránh rate limit free tier) ----
// Model: openai/gpt-oss-20b — hỗ trợ json_mode, text-only, 131K context, đủ nhỏ để tiết kiệm token
export const MODEL = 'openai/gpt-oss-20b';
export const MIN_WORD_THRESHOLD = 300;
export const MIN_EVIDENCE_SCORE = 80;
export const LOW_CONFIDENCE_THRESHOLD = 60;

const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
  console.warn('[server] GROQ_API_KEY chưa được cấu hình trong .env — các endpoint AI sẽ trả lỗi.');
}
export const ai = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

export function countWords(transcript: TranscriptSnippet[]): number {
  return transcript.reduce((sum, s) => sum + s.text.trim().split(/\s+/).filter(Boolean).length, 0);
}

export function transcriptTable(transcript: TranscriptSnippet[]): string {
  return transcript.map(s => `${s.id} | ${s.timestamp} | ${s.text}`).join('\n');
}

// Gọi Groq với JSON mode, retry khi gặp lỗi 429/503.
// Mọi lời gọi được ghi lại vào logs/gemini-calls.jsonl (giữ tên file để tương thích logging cũ).
async function callGroq(
  systemPrompt: string,
  userPrompt: string,
  context: string,
  jsonMode: boolean,
  attempts = 3,
  caseId?: string
): Promise<string> {
  if (!ai) throw new Error('GROQ_API_KEY chưa được cấu hình.');

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const startedAt = Date.now();
    try {
      const completion = await ai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
        temperature: 0.1,
        max_tokens: 2048,
      });
      const text = completion.choices[0]?.message?.content ?? '';
      logGeminiCall({
        timestamp: new Date().toISOString(),
        context,
        model: MODEL,
        attempt,
        latencyMs: Date.now() - startedAt,
        status: 'ok',
        promptText: `[system] ${systemPrompt}\n[user] ${userPrompt}`,
        rawResponseText: text,
        caseId,
      });
      return text;
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logGeminiCall({
        timestamp: new Date().toISOString(),
        context,
        model: MODEL,
        attempt,
        latencyMs: Date.now() - startedAt,
        status: 'error',
        promptText: `[system] ${systemPrompt}\n[user] ${userPrompt}`,
        errorMessage,
        caseId,
      });
      const status = err?.status ?? err?.error?.status;
      const isRetryable = status === 429 || status === 503 || errorMessage.includes('rate_limit');
      if (!isRetryable || attempt === attempts) throw err;
      // Backoff: 1s, 2s, 4s — giảm tải rate limit token/phút
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
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
export async function evaluateEvidence(transcript: TranscriptSnippet[], caseId?: string): Promise<EvidenceEvaluation> {
  const wordCount = countWords(transcript);

  const systemPrompt = `Bạn là hệ thống kiểm định chất lượng nội dung cho một AI Tutor. Đánh giá transcript bài giảng có đủ nội dung kiến thức thực chất để tạo câu hỏi kiểm tra hiểu bài đáng tin cậy hay không.
Trả về JSON với đúng 2 trường:
- "evidenceScore": số nguyên 0-100, mức độ transcript chứa kiến thức thực chất (định nghĩa/so sánh/lập luận) có thể kiểm chứng
- "reasoning": chuỗi giải thích ngắn gọn lý do cho điểm trên`;

  const userPrompt = `Transcript (${wordCount} từ):\n${transcriptTable(transcript)}\n\nTrả về JSON.`;

  const text = await callGroq(systemPrompt, userPrompt, 'quiz.evaluateEvidence', true, 3, caseId);
  let json: any = {};
  try { json = JSON.parse(text); } catch { json = { evidenceScore: 0, reasoning: 'Lỗi parse JSON từ model.' }; }

  const evidenceScore = Number(json.evidenceScore ?? 0);
  return {
    wordCount,
    evidenceScore,
    reasoning: json.reasoning ?? 'Nội dung transcript không đủ căn cứ kiến thức kiểm chứng được.',
    sufficientEvidence: wordCount >= MIN_WORD_THRESHOLD && evidenceScore >= MIN_EVIDENCE_SCORE,
  };
}

// AI quyết định #2 (thời điểm sinh đề): sinh câu hỏi tình huống có trích dẫn ngược từ transcript thật.
export async function generateQuizQuestions(
  chapterTitle: string,
  transcript: TranscriptSnippet[],
  evidenceScore: number,
  caseId?: string
): Promise<QuizQuestion[]> {
  const systemPrompt = `Bạn là AI Tutor. Sinh đúng 3 câu hỏi kiểm tra hiểu bài THEO TÌNH HUỐNG ÁP DỤNG kiến thức (không hỏi tái hiện định nghĩa/từ khóa trực tiếp), dựa CHỈ trên transcript bài giảng được cung cấp.
Mỗi câu có 4 lựa chọn A-D, đúng 1 đáp án đúng.
groundingSnippetId PHẢI là id một dòng transcript chứa bằng chứng cho đáp án đúng.
groundingQuote PHẢI trích gần như nguyên văn từ đúng dòng đó, KHÔNG được bịa nội dung ngoài transcript.

Trả về JSON với cấu trúc:
{"questions":[{"title":"...","options":[{"key":"A","text":"..."},{"key":"B","text":"..."},{"key":"C","text":"..."},{"key":"D","text":"..."}],"correctAnswer":"A","explanation":"...","groundingSnippetId":"id-dong-transcript","groundingQuote":"trích dẫn nguyên văn"}]}`;

  const userPrompt = `Tiêu đề chương: ${chapterTitle}\n\nTranscript (id | timestamp | nội dung):\n${transcriptTable(transcript)}\n\nSinh 3 câu hỏi, trả về JSON.`;

  const text = await callGroq(systemPrompt, userPrompt, 'quiz.generateQuestions', true, 3, caseId);
  let json: any = {};
  try { json = JSON.parse(text); } catch { json = { questions: [] }; }

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
  transcript: TranscriptSnippet[],
  caseId?: string
): Promise<GradeResult> {
  const selectedOption = question.options.find(o => o.key === selectedKey);

  const systemPrompt = `Bạn là AI chấm bài kiểm tra hiểu bài. PHẢI đối chiếu với transcript, không được tự suy diễn ngoài transcript.

Nhiệm vụ:
1. Xác định lựa chọn của học viên có đúng bản chất kiến thức theo transcript hay không (isCorrect: true/false).
2. confidence: đặt THẤP (dưới 60) nếu transcript không đủ rõ ràng để phân biệt dứt khoát các lựa chọn.
3. groundingSnippetId + groundingQuote: đúng 1 dòng transcript làm bằng chứng chính, trích gần như nguyên văn.
4. suggestedSnippetIds: mảng 2-3 id dòng transcript liên quan nhất học viên nên xem lại.

Trả về JSON với cấu trúc:
{"isCorrect":true,"confidence":85,"feedback":"Giải thích ngắn gọn...","groundingSnippetId":"id-dong","groundingQuote":"trích dẫn...","suggestedSnippetIds":["id1","id2"]}`;

  const userPrompt = `Câu hỏi: ${question.title}
Học viên chọn (${selectedKey}): ${selectedOption?.text ?? ''}
Toàn bộ lựa chọn: ${question.options.map(o => `${o.key}. ${o.text}`).join(' | ')}

Transcript (id | timestamp | nội dung):
${transcriptTable(transcript)}

Chấm bài và trả về JSON.`;

  const text = await callGroq(systemPrompt, userPrompt, 'quiz.gradeAnswer', true, 3, caseId);
  let result: any = {};
  try { result = JSON.parse(text); } catch { result = { isCorrect: false, confidence: 0, feedback: 'Lỗi parse JSON.', groundingSnippetId: '', groundingQuote: '', suggestedSnippetIds: [] }; }

  const confidence = Number(result.confidence ?? 0);
  return { ...result, confidence, needsReview: confidence < LOW_CONFIDENCE_THRESHOLD };
}

// AI Tutor hội thoại, chỉ được trả lời trong phạm vi transcript bài giảng (grounded Q&A).
export async function tutorChat(
  transcript: TranscriptSnippet[],
  history: { sender: 'user' | 'ai'; text: string }[],
  message: string,
  caseId?: string
): Promise<string> {
  const systemPrompt = `Bạn là AI Tutor của VinUni đồng hành cùng học viên khóa "AI in Action". CHỈ được trả lời dựa trên transcript bài giảng dưới đây. Nếu câu hỏi nằm ngoài phạm vi transcript, hãy nói rõ rằng bạn không có căn cứ trong bài giảng này và đề nghị học viên liên hệ trợ giảng — KHÔNG được bịa thông tin ngoài transcript. Trả lời ngắn gọn, súc tích, bằng tiếng Việt.

Transcript:
${transcriptTable(transcript)}`;

  // Build conversation messages
  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history.map(m => ({
      role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.text,
    })),
    { role: 'user', content: message },
  ];

  if (!ai) throw new Error('GROQ_API_KEY chưa được cấu hình.');
  const startedAt = Date.now();
  try {
    const completion = await ai.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.2,
      max_tokens: 512,
    });
    const text = completion.choices[0]?.message?.content ?? '';
    logGeminiCall({
      timestamp: new Date().toISOString(),
      context: 'tutor.chat',
      model: MODEL,
      attempt: 1,
      latencyMs: Date.now() - startedAt,
      status: 'ok',
      promptText: `[system] ${systemPrompt}\n[user] ${message}`,
      rawResponseText: text,
      caseId,
    });
    return text;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logGeminiCall({
      timestamp: new Date().toISOString(),
      context: 'tutor.chat',
      model: MODEL,
      attempt: 1,
      latencyMs: Date.now() - startedAt,
      status: 'error',
      promptText: `[system] ${systemPrompt}\n[user] ${message}`,
      errorMessage,
      caseId,
    });
    throw err;
  }
}

// Giữ lại export giả để server/videos.ts không bị lỗi import khi build.
// transcribeVideoWithGemini vẫn dùng Gemini vì Groq không hỗ trợ file/video upload.
export const generateContentWithRetry = undefined as any;
export const stringifyContents = undefined as any;

