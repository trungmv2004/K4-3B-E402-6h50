import path from 'path';
import { fileURLToPath } from 'url';
import { readJsonFile, writeJsonFile } from './db';
import type { LectureProgress } from '../src/types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROGRESS_FILE = path.resolve(__dirname, '../data/progress.json');
const ATTEMPTS_FILE = path.resolve(__dirname, '../data/attempts.json');

type ProgressRecord = LectureProgress & { userId: string };

function loadAll(): ProgressRecord[] {
  return readJsonFile<ProgressRecord[]>(PROGRESS_FILE, []);
}

function upsert(userId: string, lectureId: string, update: (r: ProgressRecord) => void): ProgressRecord {
  const all = loadAll();
  let record = all.find(r => r.userId === userId && r.lectureId === lectureId);
  if (!record) {
    record = { userId, lectureId, attempts: 0, bestScorePercent: 0, lastScorePercent: 0, completed: false };
    all.push(record);
  }
  update(record);
  writeJsonFile(PROGRESS_FILE, all);
  return record;
}

export function getUserProgress(userId: string): LectureProgress[] {
  return loadAll()
    .filter(r => r.userId === userId)
    .map(({ userId: _u, ...rest }) => rest);
}

export function getLectureProgress(userId: string, lectureId: string): LectureProgress | undefined {
  return getUserProgress(userId).find(r => r.lectureId === lectureId);
}

export interface AttemptQuestionResult {
  title: string;
  isCorrect: boolean;
}

export interface AttemptRecord {
  userId: string;
  lectureId: string;
  at: string;
  questions: AttemptQuestionResult[];
}

export function loadAttempts(): AttemptRecord[] {
  return readJsonFile<AttemptRecord[]>(ATTEMPTS_FILE, []);
}

export function recordAttempt(userId: string, lectureId: string, questions: AttemptQuestionResult[]): void {
  const attempts = loadAttempts();
  attempts.push({ userId, lectureId, at: new Date().toISOString(), questions });
  writeJsonFile(ATTEMPTS_FILE, attempts);

  const correct = questions.filter(q => q.isCorrect).length;
  const total = questions.length;
  const scorePercent = total > 0 ? Math.round((correct / total) * 100) : 0;
  upsert(userId, lectureId, r => {
    r.attempts += 1;
    r.lastScorePercent = scorePercent;
    r.bestScorePercent = Math.max(r.bestScorePercent, scorePercent);
    r.lastAttemptAt = new Date().toISOString();
  });
}

export function markCompleted(userId: string, lectureId: string): void {
  upsert(userId, lectureId, r => {
    if (!r.completed) r.completedAt = new Date().toISOString();
    r.completed = true;
  });
}

export function markViewed(userId: string, lectureId: string): void {
  upsert(userId, lectureId, r => {
    if (!r.viewedAt) r.viewedAt = new Date().toISOString();
  });
}

export function loadAllProgress(): ProgressRecord[] {
  return loadAll();
}
