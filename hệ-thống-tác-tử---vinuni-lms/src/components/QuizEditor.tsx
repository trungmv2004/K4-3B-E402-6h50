import React, { useState } from 'react';
import { CheckCircle2, Loader2, Rocket, Save, Trash2 } from 'lucide-react';
import { QuizQuestion, VideoRecord } from '../types';
import { publishQuiz, saveQuizEdits } from '../services/api';

interface QuizEditorProps {
  video: VideoRecord;
  onChanged: () => Promise<void> | void;
  onError: (message: string | null) => void;
}

// Giảng viên duyệt quiz AI vừa sinh: sửa đề, lựa chọn, đáp án đúng, giải thích hoặc xoá câu sai, rồi mới phát hành.
export const QuizEditor: React.FC<QuizEditorProps> = ({ video, onChanged, onError }) => {
  const [draft, setDraft] = useState<QuizQuestion[]>(video.quiz ?? []);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const updateQuestion = (id: number, patch: Partial<QuizQuestion>) => {
    setDraft(prev => prev.map(q => (q.id === id ? { ...q, ...patch } : q)));
    setIsDirty(true);
  };

  const updateOption = (id: number, key: string, text: string) => {
    setDraft(prev =>
      prev.map(q => (q.id === id ? { ...q, options: q.options.map(o => (o.key === key ? { ...o, text } : o)) } : q))
    );
    setIsDirty(true);
  };

  const removeQuestion = (id: number) => {
    setDraft(prev => prev.filter(q => q.id !== id));
    setIsDirty(true);
  };

  const save = async () => {
    onError(null);
    setIsSaving(true);
    try {
      const saved = await saveQuizEdits(video.id, draft);
      if (saved.quiz) setDraft(saved.quiz);
      setIsDirty(false);
      await onChanged();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Không lưu được quiz.');
    } finally {
      setIsSaving(false);
    }
  };

  const publish = async () => {
    onError(null);
    setIsPublishing(true);
    try {
      if (isDirty) await saveQuizEdits(video.id, draft);
      await publishQuiz(video.id);
      await onChanged();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Không phát hành được quiz.');
    } finally {
      setIsPublishing(false);
    }
  };

  const busy = isSaving || isPublishing;

  return (
    <div className="space-y-3">
      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
        Duyệt quiz AI sinh ({draft.length} câu) — học viên chưa thấy cho tới khi bạn phát hành
      </h4>

      {draft.length === 0 && (
        <p className="text-xs text-rose-600">Bạn đã xoá hết câu hỏi. Cần ít nhất 1 câu để phát hành.</p>
      )}

      {draft.map((q, idx) => (
        <div key={q.id} className="border border-slate-200 rounded-lg p-3 space-y-2 bg-white">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">Câu {idx + 1}</span>
            <button
              onClick={() => removeQuestion(q.id)}
              disabled={busy}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-lg disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" /> Xoá câu
            </button>
          </div>

          <textarea
            value={q.title}
            onChange={e => updateQuestion(q.id, { title: e.target.value })}
            rows={2}
            className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500"
            placeholder="Đề câu hỏi"
          />

          <div className="space-y-1.5">
            {q.options.map(option => (
              <label key={option.key} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${video.id}-${q.id}`}
                  checked={q.correctAnswer === option.key}
                  onChange={() => updateQuestion(q.id, { correctAnswer: option.key })}
                  title="Chọn làm đáp án đúng"
                  className="text-emerald-600"
                />
                <span className="text-xs font-bold text-slate-600 w-4">{option.key}.</span>
                <input
                  type="text"
                  value={option.text}
                  onChange={e => updateOption(q.id, option.key, e.target.value)}
                  className={`flex-1 text-xs border rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 ${
                    q.correctAnswer === option.key ? 'border-emerald-400 bg-emerald-50/50' : 'border-slate-300'
                  }`}
                />
              </label>
            ))}
            <p className="text-[10px] text-slate-400 pl-6">Chọn nút tròn bên trái để đặt đáp án đúng.</p>
          </div>

          <textarea
            value={q.explanation ?? ''}
            onChange={e => updateQuestion(q.id, { explanation: e.target.value })}
            rows={2}
            className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500"
            placeholder="Lời giải thích hiển thị cho học viên sau khi nộp bài"
          />

          {q.groundingQuote && (
            <p className="text-[11px] text-slate-500 bg-slate-50 rounded px-2 py-1.5">
              <span className="font-semibold">Căn cứ [{q.groundingTimestamp}]:</span> <em>"{q.groundingQuote}"</em>
            </p>
          )}
        </div>
      ))}

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={save}
          disabled={busy || !isDirty || draft.length === 0}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 disabled:opacity-50 px-3 py-1.5 rounded-lg cursor-pointer"
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Lưu thay đổi</span>
        </button>
        <button
          onClick={publish}
          disabled={busy || draft.length === 0}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-3 py-1.5 rounded-lg cursor-pointer"
        >
          {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
          <span>Phát hành cho học viên</span>
        </button>
        {!isDirty && draft.length > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã lưu
          </span>
        )}
      </div>
    </div>
  );
};
