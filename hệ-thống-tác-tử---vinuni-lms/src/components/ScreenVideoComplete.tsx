import React, { useState } from 'react';
import { ScreenMode } from '../types';
import { TRANSCRIPT_TIMELINE } from '../data/courseData';
import { 
  Check, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  Download, 
  ThumbsUp, 
  ThumbsDown, 
  Volume2, 
  Subtitles, 
  Settings, 
  Maximize2, 
  Search, 
  FileText, 
  Edit3, 
  Paperclip,
  CheckCircle2
} from 'lucide-react';

interface ScreenVideoCompleteProps {
  onStartQuiz: () => void;
  onJumpToTimestamp?: (seconds: number) => void;
}

export const ScreenVideoComplete: React.FC<ScreenVideoCompleteProps> = ({
  onStartQuiz
}) => {
  const [likes, setLikes] = useState(1);
  const [hasLiked, setHasLiked] = useState(false);
  const [dislikes, setDislikes] = useState(0);
  const [hasDisliked, setHasDisliked] = useState(false);
  const [activeTab, setActiveTab] = useState<'transcript' | 'notes' | 'files'>('transcript');
  const [searchQuery, setSearchQuery] = useState('');
  const [userNotes, setUserNotes] = useState(
    'Ghi chú buổi 3: 4 mức độ tự chủ không phải là xếp hạng mức nào tốt hơn, mà là phạm vi trao quyền tự chủ cho hệ thống.'
  );

  const filteredTimeline = TRANSCRIPT_TIMELINE.filter(item =>
    item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.timestamp.includes(searchQuery)
  );

  const handleLike = () => {
    if (hasLiked) {
      setLikes(likes - 1);
      setHasLiked(false);
    } else {
      setLikes(likes + 1);
      setHasLiked(true);
      if (hasDisliked) {
        setDislikes(dislikes - 1);
        setHasDisliked(false);
      }
    }
  };

  const handleDislike = () => {
    if (hasDisliked) {
      setDislikes(dislikes - 1);
      setHasDisliked(false);
    } else {
      setDislikes(dislikes + 1);
      setHasDisliked(true);
      if (hasLiked) {
        setLikes(likes - 1);
        setHasLiked(false);
      }
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Center Video & Action Main Section */}
      <main className="flex-1 flex flex-col bg-slate-100 overflow-y-auto p-4 lg:p-6 select-none">
        <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col">
          {/* Video Player Stage with Slide Background and AI Tutor Modal Overlay */}
          <div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-xl border border-slate-300 flex flex-col justify-end">
            
            {/* Background Simulated Slide (VinUni Day 03) */}
            <div className="absolute inset-0 bg-white p-6 flex flex-col items-center justify-between pointer-events-none opacity-40 filter blur-[1px]">
              <div className="w-full flex justify-between items-start text-xs text-slate-500">
                <span className="font-bold text-red-700 tracking-wider text-[11px]">
                  NGÀY 03 · HỆ THỐNG TÁC TỬ
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  • VinUni · AI in Action 20K
                </span>
              </div>

              <div className="text-center my-auto">
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                  Nói đã kiểm tra có chứng minh đã làm?
                </h2>
                <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-red-700 text-white text-[11px] font-semibold uppercase tracking-wide">
                  Khung giảng dạy của khóa học
                </span>

                {/* 4 Levels Grid from Slide */}
                <div className="grid grid-cols-4 gap-3 mt-6 max-w-3xl">
                  <div className="border-2 border-sky-600 rounded-lg p-3 bg-white shadow-xs">
                    <p className="text-xs font-bold text-sky-800">MỨC 1</p>
                    <p className="text-[11px] text-slate-600 mt-1 font-medium">Trả lời theo kịch bản</p>
                  </div>
                  <div className="border-2 border-sky-600 rounded-lg p-3 bg-white shadow-xs">
                    <p className="text-xs font-bold text-sky-800">MỨC 2</p>
                    <p className="text-[11px] text-slate-600 mt-1 font-medium">Trợ lý hội thoại</p>
                  </div>
                  <div className="border-2 border-rose-500 bg-rose-50/50 rounded-lg p-3 shadow-xs">
                    <p className="text-xs font-bold text-rose-700">MỨC 3</p>
                    <p className="text-[11px] text-slate-700 mt-1 font-semibold">Phản ứng với yêu cầu</p>
                  </div>
                  <div className="border-2 border-rose-500 bg-rose-50/50 rounded-lg p-3 shadow-xs">
                    <p className="text-xs font-bold text-rose-700">MỨC 4</p>
                    <p className="text-[11px] text-slate-700 mt-1 font-semibold">Theo đuổi mục tiêu</p>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 italic">
                Phạm vi tự chủ · không phải bảng xếp hạng chất lượng
              </div>
            </div>

            {/* AI Tutor Modal Overlay (Matching Image 3 exactly) */}
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs z-20 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 text-center relative overflow-hidden transition-all duration-300">
                {/* Decorative top accent gradient */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

                {/* Completion Icon */}
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 shadow-xs">
                  <Check className="w-8 h-8 stroke-[2.5]" />
                </div>

                {/* Title and duration */}
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Bạn đã xem xong video bài giảng!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Thời lượng đã học:{' '}
                  <span className="font-semibold text-slate-700">4:28 / 4:28</span> • Trạng thái:{' '}
                  <span className="text-emerald-600 font-bold">Hoàn thành 100%</span>
                </p>

                {/* AI Tutor Card */}
                <div className="mt-4 p-3.5 bg-gradient-to-br from-indigo-50/90 to-purple-50/90 rounded-xl border border-indigo-100 text-left flex items-start space-x-3">
                  <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-xs mt-0.5 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-950 uppercase tracking-wide">
                        AI Tutor Phân Tích Tức Thì
                      </span>
                      <span className="text-[10px] bg-indigo-200/80 text-indigo-900 font-semibold px-2 py-0.5 rounded-full">
                        Đã đối chiếu transcript
                      </span>
                    </div>
                    <p className="text-xs text-indigo-900 mt-1.5 leading-relaxed font-medium">
                      AI Tutor đã đọc và phân tích toàn bộ <strong>4:28 transcript</strong> để chuẩn bị{' '}
                      <strong>3 câu hỏi trắc nghiệm</strong> kiểm tra độ hiểu bài có đối chiếu căn cứ.
                    </p>
                  </div>
                </div>

                {/* Main CTA Button */}
                <div className="mt-5 space-y-2.5">
                  <button
                    onClick={onStartQuiz}
                    className="w-full bg-gradient-to-r from-blue-600 hover:from-blue-700 to-indigo-600 hover:to-indigo-700 text-white font-bold py-3 px-5 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center space-x-2 text-sm transition-all transform hover:-translate-y-0.5 cursor-pointer animate-pulse-subtle"
                  >
                    <span>Bắt đầu làm bài kiểm tra AI ngay</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  {/* Sub-actions */}
                  <div className="flex items-center justify-center space-x-3 pt-1">
                    <button
                      onClick={() => alert('Đang phát lại video từ 00:00')}
                      className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 font-medium py-1.5 px-3 rounded-lg hover:bg-slate-100 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Xem lại video</span>
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(TRANSCRIPT_TIMELINE, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'VinUni_Day03_Transcript.json';
                        a.click();
                      }}
                      className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 font-medium py-1.5 px-3 rounded-lg hover:bg-slate-100 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải bản ghi transcript</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Control Bar at Footer */}
            <div className="relative z-10 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 text-white flex flex-col space-y-2">
              <div className="w-full h-1 bg-white/30 rounded-full cursor-pointer overflow-hidden">
                <div className="bg-red-600 h-full w-full rounded-full"></div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <button className="hover:text-red-400 transition" title="Phát lại">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button className="hover:text-slate-300">
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-[11px] text-slate-200">4:28 / 4:28</span>
                </div>

                <div className="flex items-center space-x-3 text-slate-300">
                  <button className="hover:text-white" title="Phụ đề">
                    <Subtitles className="w-4 h-4" />
                  </button>
                  <button className="hover:text-white" title="Cài đặt">
                    <Settings className="w-4 h-4" />
                  </button>
                  <button className="hover:text-white" title="Toàn màn hình">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Video Reaction Bar */}
          <div className="mt-4 bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                  hasLiked ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Thích · {likes}</span>
              </button>

              <button
                onClick={handleDislike}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                  hasDisliked ? 'bg-slate-100 border-slate-300 text-slate-800' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
                <span>Không thích · {dislikes}</span>
              </button>
            </div>

            <span className="text-xs text-slate-400 font-medium">1 lượt hoàn thành gần nhất</span>
          </div>
        </div>
      </main>

      {/* Right Panel: Transcript & Tools */}
      <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 text-xs font-semibold text-slate-500">
          <button
            onClick={() => setActiveTab('transcript')}
            className={`flex-1 py-3 text-center flex items-center justify-center space-x-1 transition ${
              activeTab === 'transcript'
                ? 'border-b-2 border-blue-600 text-blue-700 bg-blue-50/30 font-bold'
                : 'hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Transcript</span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-3 text-center flex items-center justify-center space-x-1 transition ${
              activeTab === 'notes'
                ? 'border-b-2 border-blue-600 text-blue-700 bg-blue-50/30 font-bold'
                : 'hover:bg-slate-50'
            }`}
          >
            <Edit3 className="w-4 h-4 text-slate-400" />
            <span>Ghi chú</span>
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`flex-1 py-3 text-center flex items-center justify-center space-x-1 transition ${
              activeTab === 'files'
                ? 'border-b-2 border-blue-600 text-blue-700 bg-blue-50/30 font-bold'
                : 'hover:bg-slate-50'
            }`}
          >
            <Paperclip className="w-4 h-4 text-slate-400" />
            <span>Tài liệu</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'transcript' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs leading-relaxed">
              {/* AI Tutor Card at top of Transcript */}
              <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg shadow-xs">
                <div className="flex items-center space-x-1.5 text-amber-800 font-bold">
                  <span className="text-sm">✨</span>
                  <span>AI Đã Phân Tích Xong Bài</span>
                </div>
                <p className="text-[11px] text-amber-900 mt-1 leading-normal">
                  Bản ghi 4 phút 28 giây chứa trọng tâm về: <i>Khung 4 cấp độ AI Agent</i> và{' '}
                  <i>cơ chế tự chủ có kiểm chứng</i>.
                </p>
                <button
                  onClick={onStartQuiz}
                  className="mt-2 w-full text-center bg-amber-600 hover:bg-amber-700 text-white font-semibold py-1.5 px-2.5 rounded text-[11px] transition shadow-xs cursor-pointer"
                >
                  Vào kiểm tra ngay (3 câu)
                </button>
              </div>

              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                Dòng thời gian bài học
              </div>

              {filteredTimeline.map(item => (
                <div
                  key={item.id}
                  className={`p-2 rounded-lg transition border-l-2 ${
                    item.isImportant
                      ? 'bg-blue-50/70 border-blue-300 text-blue-950'
                      : 'hover:bg-slate-50 border-transparent text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className="text-blue-600 font-semibold cursor-pointer">
                      {item.timestamp}
                    </span>
                    {item.tag && (
                      <span
                        className={`text-[9px] px-1.5 rounded font-semibold ${
                          item.isImportant ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5">{item.text}</p>
                </div>
              ))}
            </div>

            {/* Transcript Search Footer */}
            <div className="p-2.5 border-t border-slate-200 bg-slate-50">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm trong transcript..."
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-700 placeholder:text-slate-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="flex-1 p-3 flex flex-col">
            <span className="text-xs font-semibold text-slate-700 mb-2">Ghi chú cá nhân</span>
            <textarea
              value={userNotes}
              onChange={e => setUserNotes(e.target.value)}
              className="w-full flex-1 text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 resize-none"
              placeholder="Ghi lại các ý trọng tâm trong bài học tại đây..."
            />
            <div className="mt-2 flex justify-end">
              <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đã tự động lưu
              </span>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="flex-1 p-3 space-y-2 text-xs">
            <div className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Slide-Day03-AI-Agent.pdf</p>
                <span className="text-[10px] text-slate-400">PDF • 4.2 MB</span>
              </div>
              <Download className="w-4 h-4 text-slate-500" />
            </div>
            <div className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Transcript-Day03-Full.txt</p>
                <span className="text-[10px] text-slate-400">TXT • 120 KB</span>
              </div>
              <Download className="w-4 h-4 text-slate-500" />
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};
