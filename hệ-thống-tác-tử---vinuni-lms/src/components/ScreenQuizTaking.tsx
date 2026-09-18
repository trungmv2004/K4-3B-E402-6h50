import React, { useState, useEffect } from 'react';
import { PublicQuizQuestion } from '../types';
import {
  Sparkles,
  Clock,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  AlertTriangle,
  FileText,
  Edit3,
  Paperclip,
  CheckCircle2
} from 'lucide-react';

interface ScreenQuizTakingProps {
  questions: PublicQuizQuestion[];
  onSubmitQuiz: (answeredQuestions: PublicQuizQuestion[]) => void;
  onPrevScreen: () => void;
}

export const ScreenQuizTaking: React.FC<ScreenQuizTakingProps> = ({
  questions: initialQuestions,
  onSubmitQuiz,
  onPrevScreen
}) => {
  const [questions, setQuestions] = useState<PublicQuizQuestion[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(582); // 09:42 = 582s

  const currentQ = questions[currentIndex];

  // Bộ câu hỏi có thể thay đổi giữa các lượt (AI sinh mới khi làm lại bài), nên đồng bộ lại state cục bộ.
  useEffect(() => {
    setQuestions(initialQuestions);
    setCurrentIndex(0);
  }, [initialQuestions]);

  // Timer countdown simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (key: 'A' | 'B' | 'C' | 'D') => {
    setQuestions(prev =>
      prev.map((q, idx) =>
        idx === currentIndex ? { ...q, userAnswer: key } : q
      )
    );
  };

  const toggleFlagForReview = () => {
    setQuestions(prev =>
      prev.map((q, idx) =>
        idx === currentIndex ? { ...q, isFlaggedForReview: !q.isFlaggedForReview } : q
      )
    );
  };

  const answeredCount = questions.filter(q => !!q.userAnswer).length;
  const unansweredIndexes = questions.map((q, idx) => (q.userAnswer ? -1 : idx)).filter(idx => idx >= 0);
  const [showSubmitWarning, setShowSubmitWarning] = useState(false);

  // Còn câu bỏ trống thì hỏi lại trước khi nộp, vì câu bỏ trống bị tính là sai.
  const handleSubmitClick = () => {
    if (unansweredIndexes.length > 0) {
      setShowSubmitWarning(true);
      return;
    }
    onSubmitQuiz(questions);
  };

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {/* Central Quiz Work Area */}
      <main className="flex-1 overflow-y-auto px-6 py-5 bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto space-y-4">

          {/* Header: Quiz Meta & AI Generation Badge */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-red-700 uppercase tracking-wide bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                  NGÀY 03 · HỆ THỐNG TÁC TỬ
                </span>
                <span className="text-xs text-purple-700 bg-purple-50 font-medium px-2 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  Sinh bởi AI Tutor từ Transcript
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1.5">
                Kiểm tra độ hiểu bài: Hệ thống tác tử &amp; Các mức độ tự chủ
              </h2>
            </div>

            {/* Timer & Status */}
            <div className="flex items-center space-x-3 text-right shrink-0">
              <div className="flex items-center text-slate-600 text-xs font-semibold bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <Clock className="w-4 h-4 mr-1.5 text-slate-500" />
                <span>Thời gian: {formatTimer(secondsRemaining)}</span>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <article className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Câu hỏi {currentQ.questionNumber} / {currentQ.totalQuestions}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {currentQ.questionType}
              </span>
            </div>

            {/* Question Content */}
            <h3 className="text-sm font-semibold text-slate-900 leading-normal">{currentQ.title}</h3>



            {/* Answer Options List */}
            <div className="space-y-2.5 pt-2">
              {currentQ.options.map(option => {
                const isSelected = currentQ.userAnswer === option.key;
                return (
                  <label
                    key={option.key}
                    onClick={() => handleSelectOption(option.key)}
                    className={`flex items-start p-3 rounded-xl cursor-pointer transition ${isSelected
                        ? 'border-2 border-blue-600 bg-blue-50/50 hover:bg-blue-50'
                        : 'border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name={`answer-${currentQ.id}`}
                      value={option.key}
                      checked={isSelected}
                      onChange={() => handleSelectOption(option.key)}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div className="ml-3 text-xs leading-relaxed text-slate-700">
                      <span
                        className={`font-bold mr-1 ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}
                      >
                        {option.key}.
                      </span>{' '}
                      <span className={isSelected ? 'text-slate-900 font-medium' : ''}>
                        {option.text}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Bottom Navigation Controls */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition ${currentIndex === 0
                    ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer'
                  }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Câu trước</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleFlagForReview}
                  className={`inline-flex items-center space-x-1 px-3 py-1.5 border rounded-lg text-xs font-medium transition cursor-pointer ${currentQ.isFlaggedForReview
                      ? 'border-amber-400 bg-amber-100 text-amber-900'
                      : 'border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100'
                    }`}
                >
                  <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    {currentQ.isFlaggedForReview ? 'Đã đánh dấu' : 'Đánh dấu xem lại'}
                  </span>
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                    className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <span>Câu tiếp theo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitClick}
                    className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <span>Nộp bài kiểm tra</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </article>
        </div>
      </main>

      {/* Right Quick Drawer & Question Palette */}
      <aside className="w-72 bg-white border-l border-slate-200 flex flex-col shrink-0 select-none overflow-y-auto">
        {/* Header */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Danh sách câu hỏi
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Đã làm: {answeredCount}/{questions.length}
          </span>
        </div>

        {/* Question Grid Palette */}
        <div className="p-4 border-b border-slate-100">
          <div className="grid grid-cols-3 gap-2">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const isAnswered = !!q.userAnswer;

              if (isCurrent) {
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className="h-9 rounded-lg border-2 border-blue-600 bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer relative"
                  >
                    {`0${idx + 1}`}
                    {q.isFlaggedForReview && (
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-300"></span>
                    )}
                  </button>
                );
              }

              if (isAnswered) {
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className="h-9 rounded-lg border border-slate-300 bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center hover:bg-slate-200 cursor-pointer relative"
                  >
                    {`0${idx + 1}`}
                    {q.isFlaggedForReview && (
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    )}
                  </button>
                );
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className="h-9 rounded-lg border border-dashed border-slate-300 text-slate-400 font-medium text-xs flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                >
                  {`0${idx + 1}`}
                </button>
              );
            })}
          </div>

          {/* Legend Status */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2">
            <div className="flex items-center space-x-1">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
              <span>Đang chọn</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200 border border-slate-400"></div>
              <span>Đã làm</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2.5 h-2.5 rounded-full border border-dashed border-slate-400"></div>
              <span>Chưa làm</span>
            </div>
          </div>
        </div>

        {/* Grounding Evidence AI Engine Card */}
        <div className="p-4 space-y-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="flex items-center space-x-2 text-purple-700 text-xs font-bold mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Hệ thống đối chiếu căn cứ AI</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-normal">
              Toàn bộ các đáp án đúng đều được trích lọc có đối chiếu (Grounding) với phụ đề video của
              giáo trình VinUni.
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-200 text-[10px] space-y-1 text-slate-500">
              <div className="flex justify-between">
                <span>Độ tin cậy:</span>
                <span className="font-semibold text-emerald-600">Rất cao (High Confidence)</span>
              </div>
              <div className="flex justify-between">
                <span>Mô hình chấm điểm:</span>
                <span className="font-semibold text-slate-700">Semantic AI v2.4</span>
              </div>
            </div>
          </div>

          {/* Quick Toolbar Shortcuts */}
          <div className="space-y-1 pt-2">
            <button
              onClick={() => onPrevScreen()}
              className="w-full flex items-center space-x-2 p-2 text-left text-xs text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Transcript bài học</span>
            </button>
            <button
              onClick={() => alert('Mở bảng ghi chú cá nhân')}
              className="w-full flex items-center space-x-2 p-2 text-left text-xs text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-slate-500" />
              <span>Ghi chú của tôi</span>
            </button>
            <button
              onClick={() => alert('Mở danh sách tài liệu đính kèm')}
              className="w-full flex items-center space-x-2 p-2 text-left text-xs text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              <Paperclip className="w-4 h-4 text-slate-500" />
              <span>Tài liệu đính kèm</span>
            </button>
          </div>
        </div>
      </aside>
      {showSubmitWarning && (
        <div className="absolute inset-0 z-40 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-5 max-w-sm w-full space-y-3">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold">Bạn còn {unansweredIndexes.length} câu chưa trả lời</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Câu {unansweredIndexes.map(idx => idx + 1).join(', ')} chưa được chọn đáp án. Câu bỏ trống sẽ bị tính là sai.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => {
                  setShowSubmitWarning(false);
                  setCurrentIndex(unansweredIndexes[0]);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Quay lại làm tiếp
              </button>
              <button
                onClick={() => {
                  setShowSubmitWarning(false);
                  onSubmitQuiz(questions);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                Vẫn nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
