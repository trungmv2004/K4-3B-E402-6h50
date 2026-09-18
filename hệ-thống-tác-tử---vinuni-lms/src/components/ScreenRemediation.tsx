import React, { useState, useRef } from 'react';
import { GradedAnswer, QuizQuestion, TranscriptSnippet } from '../types';
import {
  Check,
  X,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Search,
  FileText,
  ShieldAlert
} from 'lucide-react';

interface ScreenRemediationProps {
  questions: QuizQuestion[];
  gradedAnswers: GradedAnswer[];
  transcript: TranscriptSnippet[];
  onRetakeQuiz: () => void;
  onGoToFallback: () => void;
}

const PASS_THRESHOLD_PERCENT = 70;

export const ScreenRemediation: React.FC<ScreenRemediationProps> = ({
  questions,
  gradedAnswers,
  transcript,
  onRetakeQuiz,
  onGoToFallback
}) => {
  const findSnippet = (snippetId: string) => transcript.find(s => s.id === snippetId);

  const firstNeedsReview = gradedAnswers.find(g => g.needsReview || !g.isCorrect);
  const initialSnippet = firstNeedsReview ? findSnippet(firstNeedsReview.groundingSnippetId) : undefined;

  const [activeTimestamp, setActiveTimestamp] = useState(initialSnippet?.timestamp ?? transcript[0]?.timestamp ?? '');
  const [highlightedSnippetId, setHighlightedSnippetId] = useState(initialSnippet?.id ?? transcript[0]?.id ?? '');
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const activeSnippetRef = useRef<HTMLDivElement>(null);

  const jumpToTime = (timestamp: string, snippetId: string) => {
    setActiveTimestamp(timestamp);
    setHighlightedSnippetId(snippetId);
    if (activeSnippetRef.current) {
      activeSnippetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const filteredSnippets = transcript.filter(item =>
    item.text.toLowerCase().includes(transcriptSearch.toLowerCase()) ||
    item.title.toLowerCase().includes(transcriptSearch.toLowerCase()) ||
    item.timestamp.includes(transcriptSearch)
  );

  const gradedByQuestionId = new Map<number, GradedAnswer>(gradedAnswers.map(g => [g.questionId, g]));
  const total = questions.length || 1;
  const correctCount = gradedAnswers.filter(g => g.isCorrect && !g.needsReview).length;
  const reviewCount = gradedAnswers.filter(g => g.needsReview).length;
  const scorePercent = Math.round((correctCount / total) * 1000) / 10;
  const passed = scorePercent >= PASS_THRESHOLD_PERCENT;

  const weakestGraded = gradedAnswers.find(g => g.needsReview) ?? gradedAnswers.find(g => !g.isCorrect);
  const weakestSnippet = weakestGraded ? findSnippet(weakestGraded.groundingSnippetId) : undefined;

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Center Main Remediation Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 flex flex-col gap-5">

        {/* Top Step Header Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Quy trình tự học thích ứng (Adaptive Learning)
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              BƯỚC 3: Chấm Điểm &amp; Đối Chiếu Timestamp Transcript
            </h2>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="px-2.5 py-1 bg-slate-200 rounded-full">1. Xem bài giảng</span>
            <span className="text-slate-300">→</span>
            <span className="px-2.5 py-1 bg-slate-200 rounded-full">2. Làm Quiz</span>
            <span className="text-slate-300">→</span>
            <span className="px-2.5 py-1 bg-rose-600 text-white rounded-full font-semibold shadow-xs">
              3. Chấm &amp; Đối chiếu
            </span>
          </div>
        </div>

        {/* Overall Score Card Banner */}
        <div className={`border rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs ${
          passed ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md ${
              passed ? 'bg-emerald-500' : 'bg-amber-500'
            }`}>
              {passed ? <Check className="w-6 h-6" /> : '!'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-black ${passed ? 'text-emerald-900' : 'text-amber-900'}`}>{scorePercent}%</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                  passed ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                }`}>
                  {passed ? 'Đạt' : 'Chưa Đạt'}
                </span>
                <span className={`text-xs font-medium ${passed ? 'text-emerald-700' : 'text-amber-700'}`}>
                  (Đúng có căn cứ {correctCount}/{total} câu{reviewCount > 0 ? ` · ${reviewCount} câu AI chưa đủ tự tin` : ''})
                </span>
              </div>
              <p className={`text-xs md:text-sm mt-1 ${passed ? 'text-emerald-800' : 'text-amber-800'}`}>
                Bạn cần đạt tối thiểu <strong className="font-bold">{PASS_THRESHOLD_PERCENT}.0%</strong>{' '}
                để tự động mở khóa bài giảng tiếp theo theo chuẩn đào tạo VinUni AI in Action.
              </p>
            </div>
          </div>

          {!passed && weakestSnippet && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => alert('Tiêu chí mở khóa: Trả lời đúng và có căn cứ tối thiểu 70% các câu hỏi trắc nghiệm sinh từ transcript.')}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-xs transition cursor-pointer"
              >
                Xem lại tiêu chí
              </button>
              <button
                onClick={() => jumpToTime(weakestSnippet.timestamp, weakestSnippet.id)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded-lg text-xs font-semibold text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Khắc phục lỗ hổng [{weakestSnippet.timestamp}]</span>
              </button>
            </div>
          )}
        </div>

        {/* AI Tutor Adaptive Diagnostic Feedback */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-xl p-4 md:p-5 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>Chẩn đoán nhận thức thích ứng từ AI Tutor</span>
          </div>
          <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
            {weakestGraded
              ? weakestGraded.feedback
              : 'Bạn đã trả lời đúng và có căn cứ transcript rõ ràng cho toàn bộ các câu hỏi. AI Tutor không phát hiện lỗ hổng nào cần ôn lại.'}
          </p>
        </div>

        {/* Detailed Questions Comparison List */}
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const graded = gradedByQuestionId.get(q.id);
            if (!graded) return null;

            const snippet = findSnippet(graded.groundingSnippetId);
            const selectedOption = q.options.find(o => o.key === graded.selectedKey);
            const correctOption = q.options.find(o => o.key === q.correctAnswer);
            const status: 'correct' | 'review' | 'incorrect' = graded.needsReview
              ? 'review'
              : graded.isCorrect
              ? 'correct'
              : 'incorrect';

            if (status === 'correct') {
              return (
                <div key={q.id} className="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                      <h3 className="text-xs md:text-sm font-bold text-slate-800">
                        Câu {idx + 1}: {q.title}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      +1.0 Điểm (Đúng)
                    </span>
                  </div>

                  <div className="mt-2.5 text-xs grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                    <div>
                      <span className="text-slate-400 font-medium">Lựa chọn của bạn:</span>
                      <span className="text-emerald-700 font-semibold ml-1">
                        {graded.selectedKey}. {selectedOption?.text}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Đáp án chuẩn:</span>
                      <span className="text-slate-700 font-semibold ml-1">
                        {q.correctAnswer}. {correctOption?.text}
                      </span>
                    </div>
                  </div>

                  {snippet && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-medium text-slate-400">Chứng minh từ bài giảng:</span>
                      <button
                        onClick={() => jumpToTime(snippet.timestamp, snippet.id)}
                        className="inline-flex items-center gap-1 font-mono text-[11px] bg-slate-100 text-indigo-600 px-2 py-0.5 rounded hover:underline cursor-pointer"
                      >
                        ⏱ [{snippet.timestamp}] Video Bài 3
                      </button>
                      <span className="truncate text-slate-500 text-[11px] italic">"{graded.groundingQuote}"</span>
                    </div>
                  )}
                </div>
              );
            }

            const isReview = status === 'review';
            return (
              <div
                key={q.id}
                className={`rounded-xl p-4 md:p-5 shadow-xs relative overflow-hidden ${
                  isReview ? 'bg-amber-50/70 border-2 border-amber-300' : 'bg-rose-50/70 border-2 border-rose-300'
                }`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${isReview ? 'bg-amber-500' : 'bg-rose-600'}`}></div>

                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center ${
                        isReview ? 'bg-amber-500' : 'bg-rose-600'
                      }`}
                    >
                      {isReview ? <AlertTriangle className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 stroke-[3]" />}
                    </span>
                    <h3 className={`text-xs md:text-sm font-bold ${isReview ? 'text-amber-950' : 'text-rose-950'}`}>
                      Câu {idx + 1} ({isReview ? 'AI CHƯA ĐỦ TỰ TIN - CẦN TỰ KIỂM CHỨNG' : 'SAI - CẦN ÔN TẬP'}): {q.title}
                    </h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border shrink-0 ${
                      isReview
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    {isReview ? `Độ tin cậy ${graded.confidence}%` : '0.0 Điểm'}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className={`bg-white p-3 rounded-lg border ${isReview ? 'border-amber-200' : 'border-rose-200'}`}>
                    <div className={`font-bold uppercase tracking-wider text-[10px] mb-1 ${isReview ? 'text-amber-600' : 'text-rose-600'}`}>
                      {isReview ? '⚠ Lựa chọn của bạn:' : '❌ Lựa chọn của bạn:'}
                    </div>
                    <p className="text-slate-700 font-medium">
                      {graded.selectedKey}. {selectedOption?.text}
                    </p>
                    <div className={`mt-2 text-[11px] p-2 rounded ${isReview ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50'}`}>
                      <strong>Nhận xét AI:</strong> {graded.feedback}
                    </div>
                  </div>

                  <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-300">
                    <div className="text-emerald-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                      ✅ Đáp án chuẩn xác:
                    </div>
                    <p className="text-slate-800 font-semibold">
                      {q.correctAnswer}. {correctOption?.text}
                    </p>
                    {q.explanation && (
                      <div className="mt-2 text-[11px] text-emerald-800 bg-white/80 p-2 rounded border border-emerald-200">
                        <strong>Cốt lõi lý thuyết:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                </div>

                {snippet && (
                  <div className={`mt-4 bg-white rounded-xl border p-4 shadow-xs ${isReview ? 'border-amber-300' : 'border-rose-300'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-3 w-3 relative">
                          <span
                            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                              isReview ? 'bg-amber-400' : 'bg-rose-400'
                            }`}
                          ></span>
                          <span className={`relative inline-flex rounded-full h-3 w-3 ${isReview ? 'bg-amber-600' : 'bg-rose-600'}`}></span>
                        </span>
                        <span className="text-xs font-bold text-slate-800">Mốc thời gian cần xem lại trong video bài giảng:</span>
                        <span
                          className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                            isReview ? 'text-amber-700 bg-amber-100 border-amber-200' : 'text-rose-700 bg-rose-100 border-rose-200'
                          }`}
                        >
                          [{snippet.timestamp}]
                        </span>
                      </div>

                      <button
                        onClick={() => jumpToTime(snippet.timestamp, snippet.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer ${
                          isReview ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Xem ngay đoạn video [{snippet.timestamp}]</span>
                      </button>
                    </div>

                    <div className="mt-3">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Trích đoạn Transcript nguyên văn giảng viên (VinUni Instructor):
                      </div>
                      <blockquote
                        className={`text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border-l-4 italic leading-relaxed ${
                          isReview ? 'border-amber-500' : 'border-rose-500'
                        }`}
                      >
                        "{graded.groundingQuote}"
                      </blockquote>
                    </div>

                    {graded.suggestedSnippetIds.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-slate-500 font-medium">Mốc liên quan nên xem thêm:</span>
                        {graded.suggestedSnippetIds.map(sid => {
                          const s = findSnippet(sid);
                          if (!s) return null;
                          return (
                            <button
                              key={sid}
                              onClick={() => jumpToTime(s.timestamp, s.id)}
                              className="inline-flex items-center gap-1 font-mono text-[11px] bg-slate-100 text-indigo-600 px-2 py-0.5 rounded hover:underline cursor-pointer"
                            >
                              ⏱ {s.timestamp}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Footer Buttons */}
        <div className="mt-2 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {weakestSnippet
              ? <>Chỉ cần ôn lại mốc <span className="font-mono font-bold text-slate-700">[{weakestSnippet.timestamp}]</span> để hoàn thành điều kiện mở khóa.</>
              : 'Bạn đã hoàn thành đầy đủ điều kiện mở khóa bài tiếp theo.'}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onGoToFallback}
              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg text-xs font-medium text-amber-800 transition flex items-center gap-1.5 cursor-pointer"
              title="Xem kịch bản khi transcript không đủ điều kiện tạo quiz an toàn"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Xem ngoại lệ Fallback (Bước 4)</span>
            </button>

            <button
              onClick={onRetakeQuiz}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Làm lại bài kiểm tra</span>
            </button>
          </div>
        </div>
      </main>

      {/* Right Sidebar: Transcript & Mini Player */}
      <aside className="w-80 lg:w-96 border-l border-slate-200 bg-white flex flex-col shrink-0 overflow-hidden">
        {/* Header Tabs */}
        <div className="h-11 border-b border-slate-200 px-3 flex items-center justify-between bg-slate-50 shrink-0 text-xs font-medium">
          <div className="flex items-center gap-3">
            <button className="text-indigo-600 font-bold border-b-2 border-indigo-600 pb-2 pt-2.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Transcript Đồng Bộ</span>
            </button>
            <button className="text-slate-500 hover:text-slate-800 pb-2 pt-2.5">Ghi chú (0)</button>
            <button className="text-slate-500 hover:text-slate-800 pb-2 pt-2.5">Tài liệu</button>
          </div>
          <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">Auto-sync</span>
        </div>

        {/* Mini Player Frame */}
        <div className="bg-slate-900 border-b border-slate-200 p-2 shrink-0">
          <div className="relative aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex flex-col justify-between p-3 text-white shadow-inner">
            <div className="flex justify-between items-start text-[10px]">
              <span className="text-rose-400 font-bold uppercase tracking-wider">NGÀY 03 · HỆ THỐNG TÁC TỬ</span>
              <span className="text-slate-400">• VinUni · AI in Action 20K</span>
            </div>

            <div className="my-auto text-center">
              <h4 className="text-xs font-bold text-white mb-1.5">Nói đã kiểm tra có chứng minh đã làm?</h4>
              <div className="inline-block bg-rose-700 text-white text-[9px] px-2 py-0.5 rounded-full font-bold mb-2">
                KHUNG GIẢNG DẠY CỦA KHÓA HỌC
              </div>
            </div>

            <div className="w-full">
              <div className="flex justify-between text-[9px] text-slate-300 font-mono mb-1">
                <span className="text-rose-400 font-bold">{activeTimestamp}</span>
                <span>04:41</span>
              </div>
              <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '76%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Transcript Auto-scrolled Feed */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 font-sans text-xs">
          {filteredSnippets.map(snippet => {
            const isHighlighted = snippet.id === highlightedSnippetId;

            if (isHighlighted) {
              return (
                <div
                  key={snippet.id}
                  ref={activeSnippetRef}
                  className="p-3 rounded-xl bg-amber-50 border-2 border-rose-400 text-slate-900 shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                    <span className="text-rose-700 font-bold bg-rose-100 px-1.5 py-0.5 rounded border border-rose-300 animate-pulse">
                      ▶ {snippet.timestamp} (Đang phát)
                    </span>
                    {snippet.tag && <span className="text-rose-800 font-bold text-[10px] uppercase">{snippet.tag}</span>}
                  </div>
                  <p className="leading-relaxed font-medium">{snippet.text}</p>
                </div>
              );
            }

            return (
              <div
                key={snippet.id}
                onClick={() => jumpToTime(snippet.timestamp, snippet.id)}
                className={`p-2.5 rounded-lg transition cursor-pointer ${
                  snippet.isImportant ? 'bg-rose-50/70 border border-rose-200 text-slate-800' : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className="text-indigo-600 font-bold">{snippet.timestamp}</span>
                  {snippet.tag && <span className="text-slate-400 text-[10px] font-semibold">{snippet.tag}</span>}
                </div>
                <p className="leading-relaxed">{snippet.text}</p>
              </div>
            );
          })}
        </div>

        {/* Search input */}
        <div className="p-2.5 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
          <input
            type="text"
            value={transcriptSearch}
            onChange={e => setTranscriptSearch(e.target.value)}
            placeholder="Tìm kiếm từ khóa trong transcript..."
            className="w-full text-xs rounded-lg border border-slate-300 py-1.5 px-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <button className="p-1.5 text-slate-500 hover:text-slate-800 rounded">
            <Search className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </div>
  );
};
