import type { ClassReport, HardQuestionStat, LectureReport, StudentLectureStat } from '../src/types';
import { loadUsers } from './auth';
import { loadAllProgress, loadAttempts } from './progress';
import { loadVideos } from './videos';

export const DEMO_LECTURE_ID = 'demo-day03';
const DEMO_LECTURE_TITLE = 'Bài giảng mẫu (Hệ Thống Tác Tử & Các Mức Độ Tự Chủ)';
const MAX_HARD_QUESTIONS = 5;

// Tổng hợp cho giảng viên: học viên nào đã xem, điểm số, và câu hỏi nào bị sai nhiều nhất trên từng bài giảng.
export function buildClassReport(): ClassReport {
  const students = loadUsers().filter(u => u.role === 'student');
  const progress = loadAllProgress();
  const attempts = loadAttempts();

  const lectures: { id: string; title: string; kind: LectureReport['kind'] }[] = [
    { id: DEMO_LECTURE_ID, title: DEMO_LECTURE_TITLE, kind: 'quiz' },
    ...loadVideos()
      .filter(v => v.status === 'quiz_ready' || v.status === 'insufficient_evidence')
      .map(v => ({
        id: v.id,
        title: v.title,
        kind: (v.status === 'quiz_ready' ? 'quiz' : 'exempt') as LectureReport['kind'],
      })),
  ];

  const reports: LectureReport[] = lectures.map(lecture => {
    const rows: StudentLectureStat[] = students.map(u => {
      const p = progress.find(r => r.userId === u.id && r.lectureId === lecture.id);
      return {
        userId: u.id,
        name: u.name,
        email: u.email,
        viewed: !!(p?.viewedAt || p?.attempts || p?.completed),
        viewedAt: p?.viewedAt,
        attempts: p?.attempts ?? 0,
        bestScorePercent: p?.bestScorePercent ?? 0,
        lastScorePercent: p?.lastScorePercent ?? 0,
        completed: p?.completed ?? false,
      };
    });

    const stats = new Map<string, { attempts: number; wrong: number }>();
    for (const a of attempts.filter(a => a.lectureId === lecture.id)) {
      for (const q of a.questions) {
        const s = stats.get(q.title) ?? { attempts: 0, wrong: 0 };
        s.attempts += 1;
        if (!q.isCorrect) s.wrong += 1;
        stats.set(q.title, s);
      }
    }
    const hardestQuestions: HardQuestionStat[] = [...stats.entries()]
      .filter(([, s]) => s.wrong > 0)
      .map(([title, s]) => ({
        title,
        attempts: s.attempts,
        wrongCount: s.wrong,
        wrongPercent: Math.round((s.wrong / s.attempts) * 100),
      }))
      .sort((a, b) => b.wrongPercent - a.wrongPercent || b.wrongCount - a.wrongCount)
      .slice(0, MAX_HARD_QUESTIONS);

    const attempted = rows.filter(r => r.attempts > 0);
    return {
      lectureId: lecture.id,
      title: lecture.title,
      kind: lecture.kind,
      students: rows,
      viewedCount: rows.filter(r => r.viewed).length,
      attemptedCount: attempted.length,
      completedCount: rows.filter(r => r.completed).length,
      avgBestScorePercent: attempted.length
        ? Math.round(attempted.reduce((sum, r) => sum + r.bestScorePercent, 0) / attempted.length)
        : null,
      hardestQuestions,
    };
  });

  return { totalStudents: students.length, lectures: reports };
}
