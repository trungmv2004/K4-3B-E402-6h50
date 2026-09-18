import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import type { QuizQuestion, TranscriptSnippet } from '../src/types';
import { logGeminiCall } from './logging';

export const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

const parseModelList = (value: string) =>
  value
    .split(',')
    .map(m => m.trim())
    .filter(Boolean);

// Chuỗi model MẠNH (sinh quiz, trích transcript video) theo thứ tự ưu tiên. GEMINI_FALLBACK_MODEL nhận nhiều model
// cách nhau bằng dấu phẩy; mỗi model có hạn mức miễn phí riêng theo ngày nên càng nhiều model dự phòng càng ít bị chặn.
export const MODEL_CHAIN: string[] = [
  ...new Set([MODEL, ...parseModelList(process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.5-flash')]),
];

// Chuỗi model NHẸ (trợ lý AI, chấm bài, đánh giá căn cứ): nhanh và rẻ hơn; hết hạn mức thì dùng tiếp các model mạnh.
export const LIGHT_MODEL_CHAIN: string[] = [
  ...new Set([
    ...parseModelList(process.env.GEMINI_LIGHT_MODEL || 'gemini-3.5-flash-lite,gemini-3.1-flash-lite'),
    ...MODEL_CHAIN,
  ]),
];
export const MIN_WORD_THRESHOLD = 300;
export const MIN_EVIDENCE_SCORE = 80;
export const LOW_CONFIDENCE_THRESHOLD = 60;

const geminiApiKey = process.env.GEMINI_API_KEY;
const hasKey = !!geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY';
if (!hasKey) {
  console.warn('[server] GEMINI_API_KEY chưa được cấu hình trong .env — các endpoint AI sẽ trả lỗi.');
}
export const ai = hasKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

export function countWords(transcript: TranscriptSnippet[]): number {
  return transcript.reduce((sum, s) => sum + s.text.trim().split(/\s+/).filter(Boolean).length, 0);
}

// Mỗi dòng transcript gửi cho AI chỉ gồm id và nội dung; mốc thời gian được máy chủ tra lại theo id khi cần.
export function transcriptTable(transcript: TranscriptSnippet[]): string {
  return transcript.map(s => `${s.id} | ${s.text}`).join('\n');
}

const STOPWORDS = new Set([
  'những', 'các', 'một', 'không', 'được', 'trong', 'cho', 'với', 'này', 'khi', 'thế', 'nào', 'sao', 'tại',
  'vì', 'gì', 'của', 'và', 'là', 'có', 'để', 'như', 'thì', 'mà', 'bạn', 'tôi', 'hãy', 'giải', 'thích',
]);

const tokenize = (text: string) =>
  text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(w => w.length >= 3 && !STOPWORDS.has(w));

// Chọn các đoạn transcript liên quan nhất tới câu hỏi để gửi thay cho toàn bộ transcript (giảm token).
// Không tìm được đoạn nào trùng từ khoá thì gửi toàn bộ, tránh AI trả lời "ngoài phạm vi" chỉ vì thiếu ngữ cảnh.
export function pickRelevantSnippets(
  transcript: TranscriptSnippet[],
  query: string,
  maxSnippets = 10
): TranscriptSnippet[] {
  if (transcript.length <= maxSnippets) return transcript;
  const queryTokens = new Set(tokenize(query));
  if (queryTokens.size === 0) return transcript;

  const scored = transcript.map((snippet, index) => {
    const words = new Set(tokenize(`${snippet.title ?? ''} ${snippet.text}`));
    let score = 0;
    for (const w of queryTokens) if (words.has(w)) score += 1;
    return { snippet, index, score };
  });
  const top = scored.filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, maxSnippets);
  if (top.length === 0) return transcript;
  return top.sort((a, b) => a.index - b.index).map(x => x.snippet);
}

export const RETRY_ATTEMPTS = 5;
// Sau lần thử thứ 2 thất bại vì quá tải tạm thời, chuyển sang model kế tiếp trong chuỗi.
const FALLBACK_AFTER_ATTEMPT = 2;
const EXHAUSTED_TTL_MS = 30 * 60 * 1000;
const exhaustedUntil = new Map<string, number>();

const isDailyQuotaError = (message: string) => message.includes('PerDay');

function firstAvailableModel(chain: string[], from: number): number {
  const now = Date.now();
  for (let i = from; i < chain.length; i++) {
    if ((exhaustedUntil.get(chain[i]) ?? 0) <= now) return i;
  }
  return -1;
}

// Thông báo dành cho người dùng cuối (học viên/giảng viên), không lộ chi tiết kỹ thuật của API.
const QUOTA_MESSAGE =
  'Hệ thống AI đã hết lượt sử dụng miễn phí trong ngày. Vui lòng thử lại sau (hạn mức thường làm mới vào khoảng 14h–15h giờ Việt Nam) hoặc liên hệ quản trị viên.';
const RATE_LIMIT_MESSAGE = 'Hệ thống AI đang nhận quá nhiều yêu cầu cùng lúc. Vui lòng đợi khoảng một phút rồi thử lại.';
const OVERLOADED_MESSAGE = 'Máy chủ AI đang quá tải tạm thời. Vui lòng thử lại sau ít phút.';

export class AiUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiUnavailableError';
  }
}

function classifyAiError(err: unknown): string | null {
  if (err instanceof AiUnavailableError) return err.message;
  const message = err instanceof Error ? err.message : String(err);
  const status = (err as { status?: number; error?: { status?: string } })?.status;
  if (isDailyQuotaError(message)) return QUOTA_MESSAGE;
  if (status === 429 || message.includes('RESOURCE_EXHAUSTED')) return RATE_LIMIT_MESSAGE;
  if (status === 503 || message.includes('UNAVAILABLE')) return OVERLOADED_MESSAGE;
  return null;
}

// Thông báo dễ hiểu cho lỗi 429/503 của Gemini; trả về null nếu đây không phải lỗi hạn mức/quá tải.
export function friendlyAiMessage(err: unknown): string | null {
  return classifyAiError(err);
}

function toFriendlyError(err: unknown): unknown {
  const friendly = classifyAiError(err);
  if (!friendly) return err;
  console.warn('[gemini]', friendly, '|', (err instanceof Error ? err.message : String(err)).slice(0, 160));
  return err instanceof AiUnavailableError ? err : new AiUnavailableError(friendly);
}

// Chạy một lời gọi Gemini với retry (backoff 2s, 4s, 8s, 16s) và chuyển model:
// - hết hạn mức THEO NGÀY của model → ghi nhớ model đó đã cạn, đổi ngay sang model kế tiếp (không chờ vô ích);
// - quá tải tạm thời (503/429 theo phút) → thử lại, sau lần thứ 2 thì đổi sang model kế tiếp.
export async function withModelFallback<T>(
  attempts: number,
  run: (model: string, attempt: number) => Promise<T>,
  chain: string[] = MODEL_CHAIN
): Promise<T> {
  let idx = firstAvailableModel(chain, 0);
  if (idx === -1) throw new AiUnavailableError(QUOTA_MESSAGE);

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const model = chain[idx];
    try {
      return await run(model, attempt);
    } catch (err: any) {
      const message = err instanceof Error ? err.message : String(err);
      const status = err?.status ?? err?.error?.status;
      const isRetryable = status === 429 || status === 503 || message.includes('RESOURCE_EXHAUSTED');
      if (!isRetryable) throw err;
      if (attempt === attempts) throw toFriendlyError(err);

      if (isDailyQuotaError(message)) {
        exhaustedUntil.set(model, Date.now() + EXHAUSTED_TTL_MS);
        const next = firstAvailableModel(chain, 0);
        if (next === -1) throw new AiUnavailableError(QUOTA_MESSAGE);
        idx = next;
        continue;
      }

      if (attempt >= FALLBACK_AFTER_ATTEMPT) {
        const next = firstAvailableModel(chain, idx + 1);
        if (next !== -1) idx = next;
      }
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  throw new Error('unreachable');
}

interface CallOptions {
  systemPrompt: string;
  userPrompt: string;
  context: string;
  jsonMode?: boolean;
  caseId?: string;
  contents?: any;
  temperature?: number;
  maxOutputTokens?: number;
  // 'light' = model nhẹ cho tác vụ đơn giản; 'strong' = model mạnh cho sinh quiz.
  tier?: 'light' | 'strong';
  // Mức "suy nghĩ" của model: 'minimal' cho tác vụ đơn giản (nhanh, ít token); bỏ trống = mặc định của model.
  thinking?: 'minimal' | 'low' | 'medium' | 'high';
}

const isInvalidArgument = (err: unknown) =>
  (err as { status?: number })?.status === 400 || (err instanceof Error && err.message.includes('INVALID_ARGUMENT'));

// Gọi Gemini với JSON mode qua cơ chế retry/chuyển model ở trên.
// Mọi lời gọi được ghi lại vào logs/gemini-calls.jsonl.
async function callGemini(opts: CallOptions): Promise<string> {
  if (!ai) throw new Error('GEMINI_API_KEY chưa được cấu hình.');
  const {
    systemPrompt,
    userPrompt,
    context,
    jsonMode = false,
    caseId,
    contents = userPrompt,
    temperature = 0.1,
    maxOutputTokens = 8192,
    tier = 'strong',
    thinking,
  } = opts;
  const promptText = `[system] ${systemPrompt}\n[user] ${userPrompt}`;

  const generate = (model: string, withThinking: boolean) =>
    ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: systemPrompt,
        ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
        temperature,
        maxOutputTokens,
        ...(thinking && withThinking
          ? { thinkingConfig: { thinkingLevel: ThinkingLevel[thinking.toUpperCase() as keyof typeof ThinkingLevel] } }
          : {}),
      },
    });

  return withModelFallback(
    RETRY_ATTEMPTS,
    async (model, attempt) => {
      const startedAt = Date.now();
      try {
        let response;
        try {
          response = await generate(model, true);
        } catch (err) {
          // Model dự phòng không hỗ trợ mức "suy nghĩ" này thì gọi lại không kèm cấu hình đó.
          if (!thinking || !isInvalidArgument(err)) throw err;
          response = await generate(model, false);
        }
        const text = response.text ?? '';
        logGeminiCall({
          timestamp: new Date().toISOString(),
          context,
          model,
          attempt,
          latencyMs: Date.now() - startedAt,
          status: 'ok',
          promptText,
          rawResponseText: text,
          caseId,
        });
        return text;
      } catch (err) {
        logGeminiCall({
          timestamp: new Date().toISOString(),
          context,
          model,
          attempt,
          latencyMs: Date.now() - startedAt,
          status: 'error',
          promptText,
          errorMessage: err instanceof Error ? err.message : String(err),
          caseId,
        });
        throw err;
      }
    },
    tier === 'light' ? LIGHT_MODEL_CHAIN : MODEL_CHAIN
  );
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

  const userPrompt = `Transcript (${wordCount} từ):\n${transcript.map(s => s.text).join('\n')}\n\nTrả về JSON.`;

  const text = await callGemini({
    systemPrompt,
    userPrompt,
    context: 'quiz.evaluateEvidence',
    jsonMode: true,
    caseId,
    tier: 'light',
    thinking: 'minimal',
    maxOutputTokens: 1024,
  });
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

  const userPrompt = `Tiêu đề chương: ${chapterTitle}\n\nTranscript (id | nội dung):\n${transcriptTable(transcript)}\n\nSinh 3 câu hỏi, trả về JSON.`;

  const text = await callGemini({
    systemPrompt,
    userPrompt,
    context: 'quiz.generateQuestions',
    jsonMode: true,
    caseId,
    tier: 'strong',
  });
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

// Kết quả chấm không cần gọi AI: đúng/sai theo đáp án chuẩn, lời giải thích và căn cứ lấy từ dữ liệu đã sinh cùng câu hỏi.
export function deterministicGrade(question: QuizQuestion, selectedKey: 'A' | 'B' | 'C' | 'D'): GradeResult {
  const isCorrect = selectedKey === question.correctAnswer;
  return {
    isCorrect,
    confidence: 100,
    feedback: question.explanation || (isCorrect ? 'Bạn đã chọn đúng đáp án.' : `Đáp án đúng là ${question.correctAnswer}.`),
    groundingSnippetId: question.groundingSnippetId ?? '',
    groundingQuote: question.groundingQuote,
    suggestedSnippetIds: question.groundingSnippetId ? [question.groundingSnippetId] : [],
    needsReview: false,
  };
}

// Chấm gộp: MỘT lượt gọi AI cho tất cả các câu chọn sai của một bài (câu đúng dùng lời giải thích có sẵn, không gọi AI).
// AI chỉ viết nhận xét và dẫn căn cứ; đúng/sai đã được xác định bằng đáp án chuẩn. Câu nào AI không trả về thì dùng kết quả cố định.
export async function gradeWrongAnswers(
  items: { question: QuizQuestion; selectedKey: 'A' | 'B' | 'C' | 'D' }[],
  transcript: TranscriptSnippet[],
  caseId?: string
): Promise<Map<number, GradeResult>> {
  const results = new Map<number, GradeResult>();
  if (items.length === 0) return results;

  // Chỉ gửi các đoạn căn cứ của những câu này (kèm đoạn liền kề), không gửi toàn bộ transcript.
  const needed = new Set<number>();
  for (const { question } of items) {
    const idx = transcript.findIndex(s => s.id === question.groundingSnippetId);
    if (idx >= 0) [idx - 1, idx, idx + 1].forEach(i => i >= 0 && i < transcript.length && needed.add(i));
  }
  const relevantSnippets =
    needed.size > 0
      ? [...needed].sort((a, b) => a - b).map(i => transcript[i])
      : pickRelevantSnippets(transcript, items.map(i => i.question.title).join(' '), 8);

  const systemPrompt = `Bạn là AI chấm bài kiểm tra hiểu bài. PHẢI đối chiếu với transcript, không được tự suy diễn ngoài transcript.

Dưới đây là các câu học viên chọn SAI. Đáp án đúng của từng câu ĐÃ ĐƯỢC XÁC ĐỊNH SẴN, bạn KHÔNG chấm lại đúng/sai mà chỉ giải thích.

Với MỖI câu:
1. feedback: giải thích ngắn gọn vì sao lựa chọn của học viên sai và đáp án đúng là gì, căn cứ theo transcript.
2. confidence: đặt THẤP (dưới 60) nếu transcript không đủ rõ ràng để phân biệt dứt khoát các lựa chọn.
3. groundingSnippetId + groundingQuote: đúng 1 dòng transcript làm bằng chứng chính, trích gần như nguyên văn.
4. suggestedSnippetIds: mảng 2-3 id dòng transcript liên quan nhất học viên nên xem lại.

Trả về JSON với cấu trúc, một phần tử cho mỗi câu, giữ nguyên questionId:
{"results":[{"questionId":1,"confidence":85,"feedback":"...","groundingSnippetId":"id-dong","groundingQuote":"trích dẫn...","suggestedSnippetIds":["id1","id2"]}]}`;

  const questionsBlock = items
    .map(({ question, selectedKey }) => {
      const chosen = question.options.find(o => o.key === selectedKey);
      return `[questionId ${question.id}] ${question.title}
Các lựa chọn: ${question.options.map(o => `${o.key}. ${o.text}`).join(' | ')}
Học viên chọn (SAI): ${selectedKey}. ${chosen?.text ?? ''}
Đáp án đúng: ${question.correctAnswer}`;
    })
    .join('\n\n');

  const userPrompt = `${questionsBlock}

Các đoạn transcript liên quan (id | nội dung):
${transcriptTable(relevantSnippets)}

Chấm các câu trên và trả về JSON.`;

  try {
    const text = await callGemini({
      systemPrompt,
      userPrompt,
      context: 'quiz.gradeBatch',
      jsonMode: true,
      caseId,
      tier: 'light',
      thinking: 'minimal',
      maxOutputTokens: 512 + 384 * items.length,
    });
    const parsed = JSON.parse(text);
    const list: any[] = Array.isArray(parsed?.results) ? parsed.results : [];
    for (const { question, selectedKey } of items) {
      const r = list.find(x => Number(x?.questionId) === question.id);
      if (!r) continue;
      const confidence = Number(r.confidence ?? 0);
      results.set(question.id, {
        isCorrect: false,
        confidence,
        feedback: typeof r.feedback === 'string' && r.feedback ? r.feedback : deterministicGrade(question, selectedKey).feedback,
        groundingSnippetId: r.groundingSnippetId || question.groundingSnippetId || '',
        groundingQuote: r.groundingQuote || question.groundingQuote,
        suggestedSnippetIds: Array.isArray(r.suggestedSnippetIds) ? r.suggestedSnippetIds : [],
        needsReview: confidence < LOW_CONFIDENCE_THRESHOLD,
      });
    }
  } catch (err) {
    console.error('[gradeWrongAnswers] AI không khả dụng, chấm theo đáp án chuẩn:', err instanceof Error ? err.message.slice(0, 200) : err);
  }
  return results;
}

// AI quyết định #3 (thời điểm chấm bài): câu trả lời của học viên có đúng bản chất và có căn cứ hay không.
export async function gradeAnswer(
  question: QuizQuestion,
  selectedKey: 'A' | 'B' | 'C' | 'D',
  transcript: TranscriptSnippet[],
  caseId?: string
): Promise<GradeResult> {
  const selectedOption = question.options.find(o => o.key === selectedKey);

  // Chỉ gửi đoạn căn cứ của câu hỏi và các đoạn liền kề thay vì toàn bộ transcript.
  const groundingIdx = transcript.findIndex(s => s.id === question.groundingSnippetId);
  const relevantSnippets =
    groundingIdx >= 0
      ? transcript.slice(Math.max(0, groundingIdx - 1), groundingIdx + 2)
      : pickRelevantSnippets(transcript, `${question.title} ${selectedOption?.text ?? ''}`, 5);

  const systemPrompt = `Bạn là AI chấm bài kiểm tra hiểu bài. PHẢI đối chiếu với transcript, không được tự suy diễn ngoài transcript.

Đáp án đúng của câu hỏi ĐÃ ĐƯỢC XÁC ĐỊNH SẴN (được cung cấp bên dưới), bạn KHÔNG chấm lại đúng/sai mà chỉ giải thích.

Nhiệm vụ:
1. feedback: nếu học viên chọn đúng đáp án đúng thì giải thích vì sao đúng; nếu chọn sai thì giải thích vì sao lựa chọn đó sai và đáp án đúng là gì, căn cứ theo transcript.
2. confidence: đặt THẤP (dưới 60) nếu transcript không đủ rõ ràng để phân biệt dứt khoát các lựa chọn.
3. groundingSnippetId + groundingQuote: đúng 1 dòng transcript làm bằng chứng chính, trích gần như nguyên văn.
4. suggestedSnippetIds: mảng 2-3 id dòng transcript liên quan nhất học viên nên xem lại.

Trả về JSON với cấu trúc:
{"confidence":85,"feedback":"Giải thích ngắn gọn...","groundingSnippetId":"id-dong","groundingQuote":"trích dẫn...","suggestedSnippetIds":["id1","id2"]}`;

  const userPrompt = `Câu hỏi: ${question.title}
Học viên chọn (${selectedKey}): ${selectedOption?.text ?? ''}
Toàn bộ lựa chọn: ${question.options.map(o => `${o.key}. ${o.text}`).join(' | ')}
Đáp án đúng: ${question.correctAnswer}
Kết quả: học viên chọn ${selectedKey === question.correctAnswer ? 'ĐÚNG' : 'SAI'}

Các đoạn transcript liên quan (id | nội dung):
${transcriptTable(relevantSnippets)}

Chấm bài và trả về JSON.`;

  let result: any;
  try {
    const text = await callGemini({
      systemPrompt,
      userPrompt,
      context: 'quiz.gradeAnswer',
      jsonMode: true,
      caseId,
      tier: 'light',
      thinking: 'minimal',
      maxOutputTokens: 1024,
    });
    result = JSON.parse(text);
  } catch (err) {
    // Đúng/sai đã xác định bằng đáp án chuẩn nên khi AI không khả dụng (hết hạn mức, quá tải...) vẫn chấm được:
    // dùng lời giải thích và căn cứ đã sinh sẵn cùng câu hỏi thay vì trả lỗi 500 cho học viên.
    console.error('[gradeAnswer] AI không khả dụng, chấm theo đáp án chuẩn:', err instanceof Error ? err.message.slice(0, 200) : err);
    return deterministicGrade(question, selectedKey);
  }

  const confidence = Number(result.confidence ?? 0);
  // Đúng/sai được quyết định xác định bằng đáp án đã sinh cùng câu hỏi; LLM chỉ giải thích và dẫn căn cứ.
  const isCorrect = selectedKey === question.correctAnswer;
  return {
    ...result,
    isCorrect,
    confidence,
    suggestedSnippetIds: Array.isArray(result.suggestedSnippetIds) ? result.suggestedSnippetIds : [],
    // Chọn đúng đáp án thì không bao giờ bị đẩy sang "cần xem lại" chỉ vì độ tự tin của LLM thấp.
    needsReview: !isCorrect && confidence < LOW_CONFIDENCE_THRESHOLD,
  };
}

// AI Tutor hội thoại, chỉ được trả lời trong phạm vi transcript bài giảng (grounded Q&A).
export async function tutorChat(
  transcript: TranscriptSnippet[],
  history: { sender: 'user' | 'ai'; text: string }[],
  message: string,
  caseId?: string
): Promise<string> {
  // Chỉ gửi các đoạn transcript liên quan tới câu hỏi (và câu hỏi liền trước của học viên) thay vì toàn bộ.
  const lastUserTurn = [...history].reverse().find(m => m.sender === 'user')?.text ?? '';
  const relevantSnippets = pickRelevantSnippets(transcript, `${message} ${lastUserTurn}`, 10);

  const systemPrompt = `Bạn là AI Tutor của VinUni đồng hành cùng học viên khóa "AI in Action". CHỈ được trả lời dựa trên transcript bài giảng dưới đây. Nếu câu hỏi nằm ngoài phạm vi transcript, hãy nói rõ rằng bạn không có căn cứ trong bài giảng này và đề nghị học viên liên hệ trợ giảng — KHÔNG được bịa thông tin ngoài transcript. Trả lời ngắn gọn, súc tích, bằng tiếng Việt, KHÔNG nhắc tới mã id của các đoạn transcript (như v-5).

Transcript (id | nội dung):
${transcriptTable(relevantSnippets)}`;

  const contents = [
    ...history.map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ];

  return callGemini({
    systemPrompt,
    userPrompt: message,
    context: 'tutor.chat',
    caseId,
    contents,
    temperature: 0.2,
    maxOutputTokens: 1024,
    tier: 'light',
    thinking: 'minimal',
  });
}

