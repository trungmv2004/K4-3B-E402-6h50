import React from 'react';
import { ScreenMode } from '../types';
import { Sparkles, ArrowLeft, Send, CheckCircle2, AlertTriangle, FileCheck, Layers, LogOut, LibraryBig } from 'lucide-react';

interface TopBarProps {
  currentScreen: ScreenMode;
  onSelectScreen: (screen: ScreenMode) => void;
  unlockedScreens: ScreenMode[];
  onOpenAiModal: () => void;
  onOpenFeedbackModal: () => void;
  studentName?: string;
  onBackToLibrary?: () => void;
  onLogout?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentScreen,
  onSelectScreen,
  unlockedScreens,
  onOpenAiModal,
  onOpenFeedbackModal,
  studentName,
  onBackToLibrary,
  onLogout
}) => {
  return (
    <header className="bg-white border-b border-slate-200 z-30 shrink-0 select-none shadow-xs">
      {/* Primary Top Header */}
      <div className="h-14 px-4 flex items-center justify-between">
        {/* Left Navigation Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (currentScreen === 'quiz-taking') onSelectScreen('video-completion');
              else if (currentScreen === 'remediation') onSelectScreen('quiz-taking');
              else if (currentScreen === 'fallback') onSelectScreen('video-completion');
            }}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-800 tracking-tight">Bài 3 · DAY03</h1>
            {currentScreen === 'remediation' && (
              <span className="text-xs bg-rose-50 text-rose-700 font-medium px-2 py-0.5 rounded border border-rose-200">
                Hệ Thống Tác Tử (AI Agent)
              </span>
            )}
            {currentScreen === 'fallback' && (
              <span className="text-xs px-2 py-0.5 rounded font-medium bg-amber-100 text-amber-800 border border-amber-200">
                Bước 4: Xử lý Ngoại lệ An toàn (AI Fallback)
              </span>
            )}
          </div>
        </div>

        {/* Center Progress Indicator */}
        <div className="hidden md:flex items-center gap-3 text-xs text-slate-600 font-medium">
          {currentScreen === 'video-completion' ? (
            <>
              <span className="text-emerald-700 font-semibold">19/19 bài (100%)</span>
              <div className="w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-full rounded-full transition-all duration-500"></div>
              </div>
            </>
          ) : (
            <>
              <span className="text-slate-500 font-semibold">0/19 bài</span>
              <div className="w-36 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    currentScreen === 'remediation' ? 'w-2/12 bg-rose-500' : 'w-1/12 bg-blue-600'
                  }`}
                ></div>
              </div>
            </>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* AI Tutor Prompt Button */}
          <button
            onClick={onOpenAiModal}
            className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-full border border-purple-200 transition-colors shadow-xs hover:shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
            <span>Đặt câu hỏi với AI</span>
          </button>

          {/* Feedback / Request */}
          <button
            onClick={onOpenFeedbackModal}
            className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Gửi yêu cầu</span>
          </button>

          {onBackToLibrary && (
            <button
              onClick={onBackToLibrary}
              title="Đổi bài giảng"
              className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors"
            >
              <LibraryBig className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Đổi bài giảng</span>
            </button>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              title="Đăng xuất"
              className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
            </button>
          )}

          {/* User Avatar */}
          <div
            className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-800 font-bold flex items-center justify-center text-xs ring-2 ring-white shadow-xs cursor-pointer"
            title={studentName ? `Học viên: ${studentName}` : 'Học viên'}
          >
            {studentName ? studentName.charAt(0).toUpperCase() : 'N'}
          </div>
        </div>
      </div>

      {/* Screen Switcher Bar for Quick Visual & Interaction Inspection */}
      <div className="bg-slate-50 border-t border-slate-200/80 px-4 py-1.5 flex items-center justify-between overflow-x-auto text-xs">
        <div className="flex items-center gap-1.5 shrink-0 text-slate-500 font-medium mr-2">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">4 Màn hình theo thiết kế:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto shrink-0 py-0.5">
          <button
            onClick={() => onSelectScreen('video-completion')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
              currentScreen === 'video-completion'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Màn 1: Hoàn thành Video & Modal AI</span>
          </button>

          {unlockedScreens.includes('quiz-taking') && (
            <button
              onClick={() => onSelectScreen('quiz-taking')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
                currentScreen === 'quiz-taking'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Màn 2: Làm trắc nghiệm AI</span>
            </button>
          )}

          {unlockedScreens.includes('remediation') && (
            <button
              onClick={() => onSelectScreen('remediation')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
                currentScreen === 'remediation'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Màn 3: Chấm điểm & Đối chiếu</span>
            </button>
          )}

          {unlockedScreens.includes('fallback') && (
            <button
              onClick={() => onSelectScreen('fallback')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
                currentScreen === 'fallback'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Màn 4: Ngoại lệ an toàn (AI Fallback)</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
