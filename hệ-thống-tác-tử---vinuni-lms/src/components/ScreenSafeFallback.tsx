import React, { useState } from 'react';
import { FallbackAuditData } from '../types';
import {
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  UploadCloud, 
  MessageSquare, 
  Info, 
  ThumbsUp, 
  ThumbsDown, 
  FileText, 
  Edit3, 
  Paperclip,
  Send
} from 'lucide-react';

interface ScreenSafeFallbackProps {
  auditData: FallbackAuditData;
  onUnlockNextLesson: () => void;
  onScanSlides?: () => void;
}

export const ScreenSafeFallback: React.FC<ScreenSafeFallbackProps> = ({
  auditData,
  onUnlockNextLesson,
  onScanSlides
}) => {
  const [likes, setLikes] = useState(1);
  const [hasLiked, setHasLiked] = useState(false);
  const [dislikes, setDislikes] = useState(0);
  const [hasDisliked, setHasDisliked] = useState(false);
  const [unlockedSuccess, setUnlockedSuccess] = useState(false);
  const [taQuestion, setTaQuestion] = useState('');
  const [taMessages, setTaMessages] = useState<Array<{ sender: 'user' | 'ta'; text: string }>>([]);

  const handleBypassClick = () => {
    setUnlockedSuccess(true);
    setTimeout(() => {
      onUnlockNextLesson();
    }, 1500);
  };

  const handleSendTaQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taQuestion.trim()) return;
    const userQ = taQuestion;
    setTaMessages(prev => [...prev, { sender: 'user', text: userQ }]);
    setTaQuestion('');

    setTimeout(() => {
      setTaMessages(prev => [
        ...prev,
        {
          sender: 'ta',
          text: 'Chào bạn! Cơ chế Graceful Fallback của VinUni bảo vệ bạn khỏi hiện tượng ảo giác (hallucination) khi video ngắn dưới 300 từ. Bạn đã được cộng điểm chuyên cần đầy đủ!'
        }
      ]);
    }, 800);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Center Fallback Scenario Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex flex-col items-center bg-slate-50">
        <div className="max-w-4xl w-full space-y-6">
          
          {/* Top Stage Breadcrumb */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                {auditData.phase}
              </span>
              <span>{auditData.stageName}</span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              {auditData.systemStatus}
            </span>
          </div>

          {/* Safe AI Fallback Notice Banner */}
          <section className="bg-amber-50 border-2 border-amber-300/80 rounded-xl p-5 shadow-xs relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-100 rounded-full opacity-50 pointer-events-none"></div>

            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase font-bold tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
                    Quy tắc An toàn Đào tạo
                  </span>
                  <span className="text-xs text-amber-700 font-medium">
                    Bảo vệ học viên khỏi câu hỏi suy diễn/ảo giác
                  </span>
                </div>

                <h1 className="text-lg md:text-xl font-bold text-slate-900 leading-tight">
                  AI Tutor: Không đủ dữ liệu transcript tin cậy để tạo câu hỏi kiểm tra chuẩn xác
                </h1>

                <p className="text-sm text-slate-600 leading-relaxed">
                  Video này chủ yếu đóng vai trò giới thiệu ngắn hoặc tổng kết chuyển tiếp. Để ngăn chặn
                  rủi ro AI tự sinh kiến thức sai lệch (hallucination), hệ thống đã kích hoạt chế độ{' '}
                  <strong className="text-slate-800 font-semibold">
                    Bỏ qua An toàn (Graceful Fallback)
                  </strong>{' '}
                  mà không làm ảnh hưởng điểm số của bạn.
                </p>
              </div>
            </div>
          </section>

          {/* Algorithm Transparency Metrics Card */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400" />
              Chỉ số Minh bạch Thuật toán (Evidence Quality Gate)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Metric 1 */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Độ dài Transcript thực</span>
                  <div className="text-xl font-bold text-red-600 mt-1">
                    {auditData.wordCount} từ
                  </div>
                </div>
                <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span>Ngưỡng tối thiểu:</span>
                  <span className="font-semibold text-slate-700">
                    {auditData.minWordThreshold} từ
                  </span>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Điểm bằng chứng (Evidence)</span>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                      Chưa đạt
                    </span>
                  </div>
                  <div className="text-xl font-bold text-amber-600 mt-1">
                    {auditData.evidenceScore}%{' '}
                    <span className="text-xs text-slate-400 font-normal">
                      / Yêu cầu {auditData.evidenceRequired}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${auditData.evidenceScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-emerald-800 font-medium">Chế độ áp dụng tự động</span>
                  <div className="text-lg font-bold text-emerald-700 mt-1">
                    {auditData.appliedMode}
                  </div>
                </div>
                <div className="text-xs text-emerald-700 mt-2 pt-2 border-t border-emerald-200/80 font-medium">
                  ✓ {auditData.academicBenefit}
                </div>
              </div>
            </div>
          </section>

          {/* Student Action Center Box */}
          <section className="bg-white border-2 border-indigo-200 rounded-xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Lựa chọn tối ưu học tập
                </span>
                <h3 className="text-base font-bold text-slate-800">
                  Không cần dừng lại, tiếp tục nhịp độ học tập ngay
                </h3>
                <p className="text-xs text-slate-500">
                  Hệ thống đã tự động lưu trạng thái hoàn thành bài học này vào tiến độ khóa học của bạn.
                </p>
              </div>

              {/* Main Button */}
              <button
                onClick={handleBypassClick}
                disabled={unlockedSuccess}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-white font-semibold text-sm shadow-sm transition-all shrink-0 cursor-pointer ${
                  unlockedSuccess
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                }`}
              >
                {unlockedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đã mở khóa thành công!</span>
                  </>
                ) : (
                  <>
                    <span>Bỏ qua quiz &amp; Mở khóa bài tiếp theo</span>
                    <span className="bg-blue-500 text-[10px] text-white px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                      Khuyên dùng
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">Hoặc bạn muốn:</span>
              <button
                onClick={() => {
                  if (onScanSlides) onScanSlides();
                  else alert('Đang quét OCR tài liệu Slide Day 03 để bổ sung câu hỏi kiểm tra...');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                <span>Quét tài liệu slide bổ sung để tạo câu hỏi</span>
              </button>

              <button
                onClick={() => alert('Biểu mẫu gửi phản hồi đến Ban Đào tạo VinUni đã sẵn sàng')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                <span>Gửi phản hồi cho ban đào tạo</span>
              </button>
            </div>
          </section>

          {/* Actual Transcript Segment (Audit Log) */}
          <section className="bg-slate-900 text-slate-200 rounded-xl p-4 md:p-5 shadow-inner">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Trích đoạn Transcript thực tế (Cơ sở quyết định Fallback)
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Total words: 110 · Density Score: 0.12
              </span>
            </div>

            <div className="mt-3 font-mono text-xs leading-relaxed text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <p className="italic text-slate-400">{auditData.transcriptSample}</p>
            </div>

            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
              <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>{auditData.aiReasoning}</span>
            </div>
          </section>

          {/* Bottom Feedback Reaction */}
          <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setLikes(likes + (hasLiked ? -1 : 1));
                  setHasLiked(!hasLiked);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border transition cursor-pointer ${
                  hasLiked ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Thích · {likes}</span>
              </button>

              <button
                onClick={() => {
                  setDislikes(dislikes + (hasDisliked ? -1 : 1));
                  setHasDisliked(!hasDisliked);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border transition cursor-pointer ${
                  hasDisliked ? 'bg-slate-100 border-slate-300 text-slate-800' : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>Không thích · {dislikes}</span>
              </button>
            </div>

            <span>0 lượt xem</span>
          </div>
        </div>
      </main>

      {/* Right Sidebar: Next Lesson & Roadmap & TA Assistant */}
      <aside className="w-80 bg-white border-l border-slate-200 hidden lg:flex flex-col shrink-0">
        {/* Right Header Navigation */}
        <div className="grid grid-cols-3 border-b border-slate-200 text-center text-xs py-2 bg-slate-50 text-slate-600 font-medium">
          <button className="flex flex-col items-center gap-1 hover:text-blue-600 cursor-pointer">
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Transcript</span>
          </button>
          <button className="flex flex-col items-center gap-1 hover:text-blue-600 cursor-pointer">
            <Edit3 className="w-4 h-4 text-slate-500" />
            <span>Ghi chú</span>
          </button>
          <button className="flex flex-col items-center gap-1 hover:text-blue-600 cursor-pointer">
            <Paperclip className="w-4 h-4 text-slate-500" />
            <span>Tài liệu</span>
          </button>
        </div>

        {/* Scrollable Assistant Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
          {/* Next Lesson Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                Bài tiếp theo đã sẵn sàng
              </span>
              <span className="text-slate-500 text-[11px]">5 phút</span>
            </div>
            <h4 className="font-bold text-slate-800 text-sm">
              Bài 4 · Phân biệt Tool, API và MCP
            </h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Nắm chắc cơ chế kết nối ngoại vi cho Agent với đầy đủ bài tập và quiz tự động chất lượng cao.
            </p>
            <button
              onClick={handleBypassClick}
              className="w-full mt-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <span>Chuyển sang Bài 4</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Weekly Roadmap Tracker */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Lộ trình tuần này: DAY03
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">1. Khung lý thuyết AI Agent</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">2. 4 Mức độ tự chủ</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-semibold">
                <span className="w-4 h-4 rounded-full border-2 border-blue-600 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                </span>
                <span>3. Từ Chatbot đến AI Agent (Fallback)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-slate-500">
                <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0"></span>
                <span>4. Phân Biệt Tool, API và MCP</span>
              </div>
            </div>
          </div>

          {/* Assistant Q&A Box */}
          <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px]">
                TA
              </div>
              <div>
                <div className="font-bold text-slate-800">Trợ giảng trực tuyến</div>
                <div className="text-[10px] text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span> Phản hồi
                  dưới 5 phút
                </div>
              </div>
            </div>

            <p className="text-slate-500 text-[11px]">
              Có câu hỏi về cơ chế kích hoạt Safe Fallback hoặc các mức độ tự chủ?
            </p>

            {taMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg text-[11px] ${
                  msg.sender === 'user'
                    ? 'bg-blue-50 text-blue-900 ml-4'
                    : 'bg-purple-50 text-purple-950 mr-4 border border-purple-100'
                }`}
              >
                {msg.text}
              </div>
            ))}

            <form onSubmit={handleSendTaQuestion} className="relative mt-2">
              <input
                type="text"
                value={taQuestion}
                onChange={e => setTaQuestion(e.target.value)}
                placeholder="Nhập câu hỏi tại đây..."
                className="w-full text-xs rounded-lg border border-slate-200 pr-8 py-1.5 pl-2.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 text-slate-400 hover:text-blue-600 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </div>
  );
};
