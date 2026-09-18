import fs from 'fs';
import path from 'path';

// "Database" tối giản dạng file JSON — đủ cho quy mô demo hackathon, không cần cài đặt DB ngoài.
export function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJsonFile<T>(filePath: string, data: T): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
