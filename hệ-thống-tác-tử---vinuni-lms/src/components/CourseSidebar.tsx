import React, { useState } from 'react';
import { ScreenMode } from '../types';
import { ChevronRight, ChevronDown, Video, Lightbulb, FileText, CheckCircle2, FlaskConical, X } from 'lucide-react';

interface CourseSidebarProps {
  currentScreen: ScreenMode;
  lectureTitle: string;
  onSelectScreen: (screen: ScreenMode) => void;
}

export const CourseSidebar: React.FC<CourseSidebarProps> = ({
  currentScreen,
  lectureTitle,
  onSelectScreen
}) => {
  const [isVideosOpen, setIsVideosOpen] = useState(true);
  const [isPracticeOpen, setIsPracticeOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white border-r border-slate-200 flex flex-col items-center py-4 space-y-4 shrink-0">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
          title="Mở rộng nội dung"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 select-none overflow-y-auto">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Nội dung bài học
        </span>
        <button
          onClick={() => setIsCollapsed(true)}
          className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100"
          title="Thu nhỏ thanh bên"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <nav className="p-2 space-y-1 text-xs">
        {/* Slides Accordion */}
        <div className="p-2.5 text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between cursor-pointer font-medium">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 text-xs">🗂</span>
            <span className="font-semibold text-slate-800">Slides</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Videos Accordion */}
        <div className="pt-1">
          <button
            onClick={() => setIsVideosOpen(!isVideosOpen)}
            className="w-full p-2 text-slate-800 font-semibold flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 text-xs">🎥</span>
              <span>Videos</span>
            </div>
            {isVideosOpen ? (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {isVideosOpen && (
            <div className="pl-2 space-y-1 mt-1">
              {/* Active / Current Video */}
              <div
                onClick={() => onSelectScreen('video-completion')}
                className={`p-2 rounded-lg cursor-pointer transition flex items-center justify-between ${
                  currentScreen === 'video-completion'
                    ? 'bg-sky-50/80 border border-sky-200 text-sky-900 font-medium'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100/60 font-medium'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  {currentScreen === 'video-completion' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Video className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                  <span className="truncate" title={lectureTitle}>{lectureTitle}</span>
                </div>
                {currentScreen === 'video-completion' ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded shrink-0">
                    Đã xong 4:41
                  </span>
                ) : currentScreen === 'quiz-taking' ? (
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded shrink-0">
                    Đã xem
                  </span>
                ) : (
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-1.5 py-0.5 rounded shrink-0">
                    Đang học
                  </span>
                )}
              </div>

              {/* Other videos */}
              <div className="flex items-center justify-between p-2 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer">
                <div className="flex items-center space-x-2 truncate">
                  <Video className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="truncate">Bên trong một AI Agent</span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">5 phút</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer">
                <div className="flex items-center space-x-2 truncate">
                  <Video className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="truncate">Phân Biệt Tool, API và MCP</span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">5 phút</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer">
                <div className="flex items-center space-x-2 truncate">
                  <Video className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="truncate">ReAct: Vòng lặp nghĩ, hành</span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">5 phút</span>
              </div>
            </div>
          )}
        </div>

        {/* Section: Chatbot vs ReAct Agent */}
        <div className="p-2.5 text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between cursor-pointer font-medium">
          <div className="flex items-center space-x-2">
            <FlaskConical className="w-3.5 h-3.5 text-cyan-600" />
            <span className="font-bold text-[11px] tracking-wide text-slate-700 uppercase">
              Chatbot vs ReAct Agent
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* KC & Luyện tập Group */}
        <div className="pt-2">
          <button
            onClick={() => setIsPracticeOpen(!isPracticeOpen)}
            className="w-full p-2 text-slate-800 font-semibold flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded-lg"
          >
            <span className="uppercase text-[11px] tracking-wide text-slate-500 font-bold">
              KC &amp; Luyện tập
            </span>
            {isPracticeOpen ? (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {isPracticeOpen && (
            <div className="pl-2 space-y-1 mt-1">
              <div className="flex items-center space-x-2 p-2 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Kiến thức trọng tâm</span>
              </div>

              {/* Dynamic Active Quiz Element matching the 4 screens */}
              {currentScreen === 'video-completion' && (
                <div
                  onClick={() => onSelectScreen('quiz-taking')}
                  className="flex items-center justify-between p-2 rounded-lg bg-amber-50/70 border border-amber-200/80 text-amber-900 cursor-pointer hover:bg-amber-100 transition"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="truncate font-semibold">Quiz kiểm tra AI</span>
                  </div>
                  <span className="text-[9px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded">
                    Sẵn sàng
                  </span>
                </div>
              )}

              {currentScreen === 'quiz-taking' && (
                <div
                  onClick={() => onSelectScreen('quiz-taking')}
                  className="flex items-center justify-between p-2 rounded-lg bg-blue-50/90 text-blue-700 font-medium border-l-2 border-blue-600 cursor-pointer"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="truncate font-bold">Quiz kiểm tra độ hiểu bài</span>
                  </div>
                  <span className="text-[10px] bg-blue-600 text-white font-medium px-1.5 py-0.5 rounded">
                    Đang làm
                  </span>
                </div>
              )}

              {currentScreen === 'remediation' && (
                <div
                  onClick={() => onSelectScreen('remediation')}
                  className="flex items-center justify-between p-2 rounded-lg bg-rose-50 text-rose-700 font-semibold border border-rose-200 cursor-pointer"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="truncate">Bước 3: Đối chiếu kết quả</span>
                  </div>
                  <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded">
                    Chưa đạt
                  </span>
                </div>
              )}

              {currentScreen === 'fallback' && (
                <div
                  onClick={() => onSelectScreen('fallback')}
                  className="flex items-center justify-between p-2 rounded-lg bg-amber-50 text-amber-900 font-semibold border border-amber-200 cursor-pointer"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="truncate">Kiểm tra &amp; Fallback</span>
                  </div>
                  <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">
                    Miễn thi
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-2 p-2 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer">
                <span className="text-slate-400 font-mono text-xs">🎯</span>
                <span>Luyện theo đề xuất</span>
              </div>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
};
