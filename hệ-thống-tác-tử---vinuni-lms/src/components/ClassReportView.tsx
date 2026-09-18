import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { ClassReport } from '../types';
import { fetchClassReport } from '../services/api';

const formatTime = (iso?: string) => (iso ? new Date(iso).toLocaleString('vi-VN') : '—');

// Bảng thống kê cho giảng viên: học viên nào đã xem, điểm, và câu hỏi sai nhiều nhất để biết chỗ bài giảng cần nói rõ hơn.
export const ClassReportView: React.FC = () => {
  const [report, setReport] = useState<ClassReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setReport(await fetchClassReport());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được báo cáo lớp.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800">
          Kết quả lớp {report ? `(${report.totalStudents} học viên)` : ''}
        </h2>
        <button
          onClick={load}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-lg disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          <span>Làm mới</span>
        </button>
      </div>

      {error && <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</div>}

      {report?.lectures.map(lecture => (
        <section key={lecture.lectureId} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-800">{lecture.title}</h3>
            {lecture.kind === 'exempt' && (
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Video giới thiệu — miễn quiz
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
            <div className="bg-slate-50 rounded-lg p-2">
              <div className="text-lg font-bold text-slate-800">
                {lecture.viewedCount}/{report.totalStudents}
              </div>
              <div className="text-[10px] text-slate-500">Đã xem</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2">
              <div className="text-lg font-bold text-slate-800">
                {lecture.kind === 'exempt' ? '—' : `${lecture.attemptedCount}/${report.totalStudents}`}
              </div>
              <div className="text-[10px] text-slate-500">Đã làm quiz</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2">
              <div className="text-lg font-bold text-slate-800">
                {lecture.avgBestScorePercent === null ? '—' : `${lecture.avgBestScorePercent}%`}
              </div>
              <div className="text-[10px] text-slate-500">Điểm TB (cao nhất)</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2">
              <div className="text-lg font-bold text-slate-800">
                {lecture.completedCount}/{report.totalStudents}
              </div>
              <div className="text-[10px] text-slate-500">Đã hoàn thành</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-1.5 pr-3 font-semibold">Học viên</th>
                  <th className="py-1.5 pr-3 font-semibold">Đã xem</th>
                  <th className="py-1.5 pr-3 font-semibold">Số lần làm</th>
                  <th className="py-1.5 pr-3 font-semibold">Điểm cao nhất</th>
                  <th className="py-1.5 pr-3 font-semibold">Lần gần nhất</th>
                  <th className="py-1.5 font-semibold">Hoàn thành</th>
                </tr>
              </thead>
              <tbody>
                {lecture.students.map(s => (
                  <tr key={s.userId} className="border-b border-slate-100 last:border-0">
                    <td className="py-1.5 pr-3">
                      <div className="font-semibold text-slate-800">{s.name}</div>
                      <div className="text-[10px] text-slate-400">{s.email}</div>
                    </td>
                    <td className="py-1.5 pr-3 text-slate-600">{s.viewed ? formatTime(s.viewedAt) : 'Chưa xem'}</td>
                    <td className="py-1.5 pr-3 text-slate-600">{lecture.kind === 'exempt' ? '—' : s.attempts}</td>
                    <td className="py-1.5 pr-3 font-semibold text-slate-800">
                      {s.attempts > 0 ? `${s.bestScorePercent}%` : '—'}
                    </td>
                    <td className="py-1.5 pr-3 text-slate-600">{s.attempts > 0 ? `${s.lastScorePercent}%` : '—'}</td>
                    <td className="py-1.5">
                      {s.completed ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Rồi
                        </span>
                      ) : (
                        <span className="text-slate-400">Chưa</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {lecture.kind === 'quiz' && (
            <div>
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Câu hỏi sai nhiều nhất — chỗ bài giảng có thể cần nói rõ hơn
              </h4>
              {lecture.hardestQuestions.length === 0 ? (
                <p className="text-xs text-slate-400">Chưa có câu nào bị sai (hoặc chưa có học viên làm quiz).</p>
              ) : (
                <div className="space-y-1.5">
                  {lecture.hardestQuestions.map(q => (
                    <div key={q.title} className="bg-rose-50/60 border border-rose-100 rounded-lg p-2.5">
                      <p className="text-xs font-semibold text-slate-800">{q.title}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-rose-100 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500" style={{ width: `${q.wrongPercent}%` }} />
                        </div>
                        <span className="text-[11px] font-semibold text-rose-700 shrink-0">
                          Sai {q.wrongCount}/{q.attempts} lượt ({q.wrongPercent}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      ))}
    </div>
  );
};
