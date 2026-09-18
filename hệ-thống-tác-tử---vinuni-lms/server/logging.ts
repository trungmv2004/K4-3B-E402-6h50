import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { GenerateContentParameters } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.resolve(__dirname, '../logs');
const LOG_FILE = path.join(LOG_DIR, 'gemini-calls.jsonl');

export interface GeminiCallLogEntry {
  timestamp: string;
  context: string;
  model: string;
  attempt: number;
  latencyMs: number;
  status: 'ok' | 'error';
  promptText: string;
  rawResponseText?: string;
  errorMessage?: string;
  caseId?: string;
}

// Rút gọn `contents` (string | Content | Content[] | Part | Part[] ...) thành một chuỗi dễ đọc
// để ghi log — phục vụ xác minh kỹ thuật: đúng prompt nào đã được gửi cho model ở lần gọi đó.
function stringifyOne(item: unknown): string {
  if (typeof item === 'string') return item;
  if (Array.isArray(item)) return item.map(stringifyOne).join('\n');
  if (item && typeof item === 'object') {
    const obj = item as Record<string, unknown>;
    if (Array.isArray(obj.parts)) {
      const role = typeof obj.role === 'string' ? `[${obj.role}] ` : '';
      return `${role}${obj.parts.map(stringifyOne).join('\n')}`;
    }
    if (typeof obj.text === 'string') return obj.text;
    if (obj.fileData && typeof obj.fileData === 'object') {
      const fd = obj.fileData as Record<string, unknown>;
      return `[fileData: ${fd.fileUri}]`;
    }
    return JSON.stringify(obj);
  }
  return String(item);
}

export function stringifyContents(contents: GenerateContentParameters['contents']): string {
  return stringifyOne(contents);
}

export function logGeminiCall(entry: GeminiCallLogEntry): void {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.appendFileSync(LOG_FILE, `${JSON.stringify(entry)}\n`, 'utf-8');
  } catch (err) {
    console.error('[logging] Không ghi được log Gemini:', err);
  }
}

export function readGeminiLogs(limit?: number): GeminiCallLogEntry[] {
  try {
    const raw = fs.readFileSync(LOG_FILE, 'utf-8');
    const lines = raw
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line) as GeminiCallLogEntry);
    return limit ? lines.slice(-limit) : lines;
  } catch {
    return [];
  }
}
