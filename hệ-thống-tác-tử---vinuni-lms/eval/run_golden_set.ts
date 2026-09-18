import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.EVAL_BASE_URL || 'http://localhost:3000';
const GOLDEN_SET_PATH = path.resolve(__dirname, 'golden_set.json');
const RUN_LOG_PATH = path.resolve(__dirname, 'run_log.jsonl');

interface GoldenCase {
  id: string;
  category: string;
  endpoint: string;
  description: string;
  input: Record<string, unknown>;
  expected: Record<string, unknown>;
}

const REFUSAL_HINTS = [
  'ngoài phạm vi',
  'không có căn cứ',
  'không nằm trong',
  'không thể trả lời',
  'không có trong bài giảng',
  'không có trong transcript',
  'trợ giảng',
  'xin lỗi',
  'không có thông tin',
];

function isLikelyRefusal(reply: string): boolean {
  const lower = reply.toLowerCase();
  return REFUSAL_HINTS.some(hint => lower.includes(hint));
}

async function login(): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'hocsinh1@vinuni.edu.vn', password: 'hocsinh123' }),
  });
  if (!res.ok) throw new Error(`Đăng nhập thất bại: HTTP ${res.status}`);
  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) throw new Error('Không nhận được session cookie sau khi đăng nhập.');
  return setCookie.split(';')[0];
}

async function callEndpoint(cookie: string, endpoint: string, body: Record<string, unknown>) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

function evaluate(expected: Record<string, unknown>, response: any): { verdict: 'PASS' | 'FAIL' | 'OBSERVE'; note: string } {
  if (expected.field === 'sufficientEvidence' || expected.field === 'needsReview' || expected.field === 'isCorrect') {
    if (expected.equals === null) {
      return {
        verdict: 'OBSERVE',
        note: `Không chốt trước — giá trị thực tế: ${expected.field}=${JSON.stringify(response[expected.field as string])}, evidenceScore=${response.evidenceScore}`,
      };
    }
    const actual = response[expected.field as string];
    return actual === expected.equals
      ? { verdict: 'PASS', note: `${expected.field}=${actual} khớp kỳ vọng` }
      : { verdict: 'FAIL', note: `${expected.field}=${actual}, kỳ vọng ${expected.equals}` };
  }

  if (expected.mustNotContainFabricatedAnswer) {
    const reply = String(response.reply ?? '');
    return isLikelyRefusal(reply)
      ? { verdict: 'PASS', note: 'Phát hiện dấu hiệu từ chối/redirect trong câu trả lời (cần đọc lại thủ công để xác nhận không có thông tin bịa).' }
      : { verdict: 'FAIL', note: 'Không phát hiện dấu hiệu từ chối — cần đọc raw reply để kiểm tra có bịa thông tin hay không.' };
  }

  if (expected.mustMentionAnswer) {
    const reply = String(response.reply ?? '');
    const found = reply.toLowerCase().includes(String(expected.mustMentionAnswer).toLowerCase());
    return found
      ? { verdict: 'PASS', note: `Câu trả lời có nhắc "${expected.mustMentionAnswer}"` }
      : { verdict: 'FAIL', note: `Câu trả lời KHÔNG nhắc "${expected.mustMentionAnswer}"` };
  }

  return { verdict: 'OBSERVE', note: 'Không có tiêu chí tự động, cần đọc thủ công.' };
}

async function main() {
  const goldenSet = JSON.parse(fs.readFileSync(GOLDEN_SET_PATH, 'utf-8')) as { cases: GoldenCase[] };
  const cookie = await login();
  console.log(`[eval] Đăng nhập thành công, chạy ${goldenSet.cases.length} ca qua ${BASE_URL}...\n`);

  fs.writeFileSync(RUN_LOG_PATH, '');
  const summary: { id: string; category: string; verdict: string; note: string }[] = [];

  for (const testCase of goldenSet.cases) {
    const caseId = testCase.id;
    const body = { ...testCase.input, caseId };
    const startedAt = Date.now();
    try {
      const { status, json } = await callEndpoint(cookie, testCase.endpoint, body);
      const latencyMs = Date.now() - startedAt;
      const { verdict, note } = status === 200 ? evaluate(testCase.expected, json) : { verdict: 'FAIL' as const, note: `HTTP ${status}: ${JSON.stringify(json)}` };

      const logEntry = {
        timestamp: new Date().toISOString(),
        caseId,
        category: testCase.category,
        endpoint: testCase.endpoint,
        description: testCase.description,
        requestBody: body,
        httpStatus: status,
        rawResponse: json,
        latencyMs,
        verdict,
        note,
      };
      fs.appendFileSync(RUN_LOG_PATH, `${JSON.stringify(logEntry)}\n`);
      summary.push({ id: caseId, category: testCase.category, verdict, note });
      console.log(`[${caseId}] ${verdict} (${latencyMs}ms) — ${note}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const logEntry = {
        timestamp: new Date().toISOString(),
        caseId,
        category: testCase.category,
        endpoint: testCase.endpoint,
        description: testCase.description,
        requestBody: body,
        error: message,
        verdict: 'FAIL',
      };
      fs.appendFileSync(RUN_LOG_PATH, `${JSON.stringify(logEntry)}\n`);
      summary.push({ id: caseId, category: testCase.category, verdict: 'FAIL', note: message });
      console.log(`[${caseId}] FAIL (lỗi) — ${message}`);
    }
  }

  const passCount = summary.filter(s => s.verdict === 'PASS').length;
  const failCount = summary.filter(s => s.verdict === 'FAIL').length;
  const observeCount = summary.filter(s => s.verdict === 'OBSERVE').length;
  console.log(`\n[eval] Tổng: ${summary.length} ca — PASS ${passCount} · FAIL ${failCount} · OBSERVE ${observeCount}`);
  console.log(`[eval] Log chi tiết: ${RUN_LOG_PATH}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
