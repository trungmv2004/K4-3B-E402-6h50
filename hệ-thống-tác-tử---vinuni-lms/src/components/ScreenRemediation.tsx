import React, { useState, useRef } from 'react';
import { COURSE_QUESTIONS, TRANSCRIPT_TIMELINE } from '../data/courseData';
import { 
  AlertCircle, 
  Check, 
  X, 
  Play, 
  RotateCcw, 
  Sparkles, 
  Search, 
  FileText, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface ScreenRemediationProps {
  onRetakeQuiz: () => void;
  onGoToFallback: () => void;
}

export const ScreenRemediation: React.FC<ScreenRemediationProps> = ({
  onRetakeQuiz,
  onGoToFallback
}) => {
  const [activeTimestamp, setActiveTimestamp] = useState('03:15');
  const [highlightedSnippetId, setHighlightedSnippetId] = useState('t-5');
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [isMiniPlaying, setIsMiniPlaying] = useState(false);
  const activeSnippetRef = useRef<HTMLDivElement>(null);

  const jumpToTime = (timestamp: string, snippetId: string) => {
    setActiveTimestamp(timestamp);
    setHighlightedSnippetId(snippetId);
    if (activeSnippetRef.current) {
      activeSnippetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const filteredSnippets = TRANSCRIPT_TIMELINE.filter(item =>
    item.text.toLowerCase().includes(transcriptSearch.toLowerCase()) ||
    item.title.toLowerCase().includes(transcriptSearch.toLowerCase()) ||
    item.timestamp.includes(transcriptSearch)
  );

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
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md">
              !
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-amber-900">66.7%</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900 uppercase tracking-wide">
                  Chưa Đạt
                </span>
                <span className="text-xs text-amber-700 font-medium">(Đúng 2/3 câu)</span>
              </div>
              <p className="text-xs md:text-sm text-amber-800 mt-1">
                Bạn cần đạt tối thiểu <strong className="font-bold text-amber-950">70.0% (3/3 câu)</strong>{' '}
                để tự động mở khóa bài giảng tiếp theo theo chuẩn đào tạo VinUni AI in Action.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => alert('Tiêu chí mở khóa: Trả lời đúng tối thiểu 70% các câu hỏi trắc nghiệm sinh từ transcript.')}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-xs transition cursor-pointer"
            >
              Xem lại tiêu chí
            </button>
            <button
              onClick={() => jumpToTime('03:15', 't-5')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded-lg text-xs font-semibold text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Khắc phục lỗ hổng [03:15]</span>
            </button>
          </div>
        </div>

        {/* AI Tutor Adaptive Diagnostic Feedback */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-xl p-4 md:p-5 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>Chẩn đoán nhận thức thích ứng từ AI Tutor</span>
          </div>
          <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
            "Bạn đã nắm vững nền tảng ở{' '}
            <span className="text-emerald-400 font-semibold">Mức 1 (Trả lời theo kịch bản)</span> và{' '}
            <span className="text-emerald-400 font-semibold">Mức 2 (Trợ lý hội thoại)</span>. Tuy nhiên,
            bạn đang bị <strong>nhầm lẫn ranh giới tự chủ</strong> giữa{' '}
            <span className="text-rose-300 underline font-medium">Mức 3 (Phản ứng với yêu cầu)</span> và{' '}
            <span className="text-rose-300 underline font-medium">Mức 4 (Theo đuổi mục tiêu)</span>. Ở
            Mức 4, tác tử có khả năng tự phân tách kế hoạch và bền bỉ thích nghi mà không cần người dùng
            can thiệp từng bước."
          </p>
        </div>

        {/* Detailed Questions Comparison List */}
        <div className="space-y-4">
          
          {/* Question 1: Correct */}
          <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
                <h3 className="text-xs md:text-sm font-bold text-slate-800">
                  Câu 1: Đặc trưng cơ bản nhất của Chatbot Mức 1 là gì?
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
                  A. Tuân theo cây quyết định cứng &amp; kịch bản viết sẵn
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Đáp án chuẩn:</span>
                <span className="text-slate-700 font-semibold ml-1">
                  A. Tuân theo cây quyết định cứng &amp; kịch bản viết sẵn
                </span>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-400">Chứng minh từ bài giảng:</span>
              <button
                onClick={() => jumpToTime('01:10', 't-2')}
                className="inline-flex items-center gap-1 font-mono text-[11px] bg-slate-100 text-indigo-600 px-2 py-0.5 rounded hover:underline cursor-pointer"
              >
                ⏱ [01:10] Video Bài 3
              </button>
              <span className="truncate text-slate-500 text-[11px] italic">
                "Mức 1 chỉ dựa trên rule-based, nói sao làm vậy..."
              </span>
            </div>
          </div>

          {/* Question 2: Correct */}
          <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
                <h3 className="text-xs md:text-sm font-bold text-slate-800">
                  Câu 2: Trợ lý hội thoại Mức 2 nâng cấp hơn Mức 1 ở điểm cốt lõi nào?
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
                  C. Khả năng ghi nhớ ngữ cảnh ngắn hạn và xử lý ngôn ngữ tự nhiên (NLP)
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Đáp án chuẩn:</span>
                <span className="text-slate-700 font-semibold ml-1">
                  C. Khả năng ghi nhớ ngữ cảnh ngắn hạn và xử lý ngôn ngữ tự nhiên (NLP)
                </span>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-400">Chứng minh từ bài giảng:</span>
              <button
                onClick={() => jumpToTime('02:40', 't-4')}
                className="inline-flex items-center gap-1 font-mono text-[11px] bg-slate-100 text-indigo-600 px-2 py-0.5 rounded hover:underline cursor-pointer"
              >
                ⏱ [02:40] Video Bài 3
              </button>
              <span className="truncate text-slate-500 text-[11px] italic">
                "Ở mức 2, mô hình LLM tham gia phân tích ý định thay cho keyword..."
              </span>
            </div>
          </div>

          {/* Question 3: INCORRECT - CORE REMEDIATION */}
          <div className="bg-rose-50/70 border-2 border-rose-300 rounded-xl p-4 md:p-5 shadow-xs relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-rose-600"></div>
            
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center">
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </span>
                <h3 className="text-xs md:text-sm font-bold text-rose-950">
                  Câu 3 (SAI - CẦN ÔN TẬP): Sự khác nhau bản chất giữa Tác tử Mức 3 (Phản ứng) và Mức 4
                  (Theo đuổi mục tiêu) là gì?
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 shrink-0">
                0.0 Điểm
              </span>
            </div>

            {/* Comparison Grid */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-rose-200">
                <div className="text-rose-600 font-bold uppercase tracking-wider text-[10px] mb-1">
                  ❌ Lựa chọn của bạn:
                </div>
                <p className="text-slate-700 font-medium">
                  B. Mức 3 không gọi được Tool API bên ngoài, chỉ Mức 4 mới có khả năng tích hợp Tool.
                </p>
                <div className="mt-2 text-[11px] text-rose-700 bg-rose-50 p-2 rounded">
                  <strong>Nhận xét AI:</strong> Không chính xác! Mức 3 hoàn toàn đã gọi được Tool/API,
                  nhưng việc gọi này chỉ xảy ra phản xạ tức thì sau mỗi prompt của người dùng.
                </div>
              </div>

              <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-300">
                <div className="text-emerald-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                  ✅ Đáp án chuẩn xác:
                </div>
                <p className="text-slate-800 font-semibold">
                  D. Mức 4 có khả năng tự hoạch định nhiều bước (Multi-step Planning) và tự sửa sai theo
                  đuổi mục tiêu lớn mà không cần mớm lệnh liên tục.
                </p>
                <div className="mt-2 text-[11px] text-emerald-800 bg-white/80 p-2 rounded border border-emerald-200">
                  <strong>Cốt lõi lý thuyết:</strong> "Phạm vi tự chủ không phải là bảng xếp hạng chất
                  lượng; nó là mức độ trao quyền hành động cho Agent."
                </div>
              </div>
            </div>

            {/* Core Remediation Box */}
            <div className="mt-4 bg-white rounded-xl border border-rose-300 p-4 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    Mốc thời gian cần xem lại trong video bài giảng:
                  </span>
                  <span className="font-mono text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                    [03:15 - 04:00]
                  </span>
                </div>

                <button
                  onClick={() => jumpToTime('03:15', 't-5')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Xem ngay đoạn video [03:15]</span>
                </button>
              </div>

              {/* Exact Instructor Transcript Quote */}
              <div className="mt-3">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Trích đoạn Transcript nguyên văn giảng viên (VinUni Instructor):</span>
                  <span className="text-indigo-600 lowercase font-normal italic">
                    đã khớp độ tin cậy 99.4%
                  </span>
                </div>
                <blockquote className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border-l-4 border-rose-500 italic leading-relaxed">
                  "...Các bạn lưu ý thật kỹ điểm này:{' '}
                  <strong className="text-rose-900 bg-rose-100 px-1">
                    Mức 3 phản ứng với yêu cầu
                  </strong>{' '}
                  là khi bạn bảo nó kiểm tra thời tiết thì nó mới gọi API thời tiết. Còn khi bước sang{' '}
                  <strong className="text-rose-900 bg-rose-100 px-1">
                    Mức 4 theo đuổi mục tiêu
                  </strong>
                  , chúng ta giao một đề bài trừu tượng như 'Hãy tối ưu lịch trình bay và tự đặt vé', Agent
                  sẽ tự lập vòng lặp ReAct, tự thử lại khi gặp lỗi mà không cần con người mớm lệnh từng bước..."
                </blockquote>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer Buttons */}
        <div className="mt-2 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Chỉ cần ôn lại 45 giây video mốc{' '}
            <span className="font-mono font-bold text-slate-700">[03:15]</span> để hoàn thành điều kiện
            mở khóa.
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
              <span>Làm lại bài kiểm tra (AI sinh đề mới)</span>
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
          <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">
            Auto-sync
          </span>
        </div>

        {/* Mini Player Frame mimicking Day 03 Slide */}
        <div className="bg-slate-900 border-b border-slate-200 p-2 shrink-0">
          <div className="relative aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex flex-col justify-between p-3 text-white shadow-inner">
            <div className="flex justify-between items-start text-[10px]">
              <span className="text-rose-400 font-bold uppercase tracking-wider">
                NGÀY 03 · HỆ THỐNG TÁC TỬ
              </span>
              <span className="text-slate-400">• VinUni · AI in Action 20K</span>
            </div>

            {/* Slide Content Mockup matching image */}
            <div className="my-auto text-center">
              <h4 className="text-xs font-bold text-white mb-1.5">Nói đã kiểm tra có chứng minh đã làm?</h4>
              <div className="inline-block bg-rose-700 text-white text-[9px] px-2 py-0.5 rounded-full font-bold mb-2">
                KHUNG GIẢNG DẠY CỦA KHÓA HỌC
              </div>

              <div className="grid grid-cols-4 gap-1 text-[8px] max-w-xs mx-auto">
                <div className="border border-blue-400/40 bg-blue-950/40 p-1 rounded">
                  <span className="block font-bold text-blue-300">MỨC 1</span>
                  <span className="text-[7px] text-slate-300">Kịch bản</span>
                </div>
                <div className="border border-blue-400/40 bg-blue-950/40 p-1 rounded">
                  <span className="block font-bold text-blue-300">MỨC 2</span>
                  <span className="text-[7px] text-slate-300">Trợ lý</span>
                </div>
                <div className="border-2 border-rose-500 bg-rose-950/80 p-1 rounded shadow-lg ring-2 ring-rose-400/50 scale-105 transform">
                  <span className="block font-bold text-rose-300">MỨC 3</span>
                  <span className="text-[7px] text-rose-100">Phản ứng</span>
                </div>
                <div className="border-2 border-rose-500 bg-rose-950/80 p-1 rounded shadow-lg ring-2 ring-rose-400/50 scale-105 transform">
                  <span className="block font-bold text-rose-300">MỨC 4</span>
                  <span className="text-[7px] text-rose-100">Mục tiêu</span>
                </div>
              </div>
            </div>

            {/* Video Progress Bar at 03:15 / 04:28 */}
            <div className="w-full">
              <div className="flex justify-between text-[9px] text-slate-300 font-mono mb-1">
                <span className="text-rose-400 font-bold">{activeTimestamp}</span>
                <span>04:28</span>
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
                    <span className="text-rose-800 font-bold text-[10px] uppercase">
                      Trọng tâm câu 3
                    </span>
                  </div>
                  <p className="leading-relaxed font-medium">
                    <span className="bg-rose-200 text-rose-950 px-1 rounded font-semibold">
                      "Bốn mức này giúp xem hệ thống được tự làm đến đâu trong khóa học."
                    </span>{' '}
                    Mức 3 phản ứng với yêu cầu nghĩa là người dùng hỏi gì, bot tra cứu công cụ đó. Nó
                    không tự đặt ra lộ trình tiếp theo.
                  </p>
                </div>
              );
            }

            return (
              <div
                key={snippet.id}
                onClick={() => jumpToTime(snippet.timestamp, snippet.id)}
                className={`p-2.5 rounded-lg transition cursor-pointer ${
                  snippet.tag?.includes('Mức 4')
                    ? 'bg-rose-50/70 border border-rose-200 text-slate-800'
                    : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className="text-indigo-600 font-bold">{snippet.timestamp}</span>
                  {snippet.tag && (
                    <span className="text-slate-400 text-[10px] font-semibold">{snippet.tag}</span>
                  )}
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
