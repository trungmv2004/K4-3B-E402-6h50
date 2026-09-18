import React, { useEffect, useRef, useState } from 'react';
import { TranscriptSnippet } from '../types';
import { useSpeechNarration } from '../hooks/useSpeechNarration';
import {
  Check,
  Sparkles,
  ArrowRight,
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
  CheckCircle2,
  Play,
  Square
} from 'lucide-react';

// Tốc độ đọc trung bình dùng để ước lượng thời lượng và vị trí tua trên thanh thời gian
// khi phát bằng giọng đọc AI (không có mốc thời gian thật như video, xem courseData.ts).
const WORDS_PER_SECOND = 2.35;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

interface ScreenVideoCompleteProps {
  chapterTitle: string;
  transcript: TranscriptSnippet[];
  videoUrl?: string;
  onStartQuiz: () => void;
}

function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '--:--';
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export const ScreenVideoComplete: React.FC<ScreenVideoCompleteProps> = ({
  chapterTitle,
  transcript,
  videoUrl,
  onStartQuiz
}) => {
  const [likes, setLikes] = useState(1);
  const [hasLiked, setHasLiked] = useState(false);
  const [dislikes, setDislikes] = useState(0);
  const [hasDisliked, setHasDisliked] = useState(false);
  const [activeTab, setActiveTab] = useState<'transcript' | 'notes' | 'files'>('transcript');
  const [searchQuery, setSearchQuery] = useState('');
  const [userNotes, setUserNotes] = useState(
    'Ghi chú: ghi lại các ý trọng tâm trong bài học tại đây.'
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoDurationSeconds, setVideoDurationSeconds] = useState(0);

  const filteredTimeline = transcript.filter(item =>
    item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.timestamp.includes(searchQuery)
  );

  const narration = useSpeechNarration();
  const activeSnippet = transcript.find(s => s.id === narration.activeId);
  // Chỉ mở khoá nút "Bắt đầu làm bài kiểm tra AI" sau khi xem/nghe hết toàn bộ bài giảng một lần —
  // không tự khoá lại nếu người dùng xem/nghe lại sau khi đã hoàn thành.
  const [hasWatched, setHasWatched] = useState(false);

  // Ước lượng tổng thời lượng bài giảng khi phát bằng giọng đọc AI (không có video thật).
  const estimatedTotalSeconds =
    transcript.reduce((sum, s) => sum + countWords(s.text), 0) / WORDS_PER_SECOND;

  // Theo dõi thời gian trôi qua để vẽ thanh thời gian có thể tua, vì Web Speech API không
  // cho biết currentTime như thẻ <video> — tự tính từ mốc bắt đầu đoạn đang đọc + thời gian thực đã trôi.
  const playAnchorRef = useRef<{ startedAtMs: number; offsetSeconds: number } | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!narration.isPlaying) return;
    const tick = () => {
      if (!playAnchorRef.current) return;
      const elapsedSincePlay = (Date.now() - playAnchorRef.current.startedAtMs) / 1000;
      setElapsedSeconds(Math.min(playAnchorRef.current.offsetSeconds + elapsedSincePlay, estimatedTotalSeconds));
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [narration.isPlaying, estimatedTotalSeconds]);

  const playFromSeconds = (targetSeconds: number) => {
    let fromIndex = 0;
    for (let i = 0; i < transcript.length; i++) {
      if (transcript[i].seconds <= targetSeconds) fromIndex = i;
    }
    playAnchorRef.current = { startedAtMs: Date.now(), offsetSeconds: transcript[fromIndex]?.seconds ?? 0 };
    setElapsedSeconds(transcript[fromIndex]?.seconds ?? 0);
    narration.speak(transcript.slice(fromIndex), () => setHasWatched(true));
  };

  const toggleNarration = () => {
    if (narration.isPlaying) {
      narration.stop();
    } else {
      playFromSeconds(elapsedSeconds);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    playFromSeconds(ratio * estimatedTotalSeconds);
  };

  const durationLabel = videoUrl ? formatDuration(videoDurationSeconds) : formatDuration(estimatedTotalSeconds);
  const progressPercent = estimatedTotalSeconds > 0 ? Math.min(100, (elapsedSeconds / estimatedTotalSeconds) * 100) : 0;

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
          {/* Video Player Stage */}
          <div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-xl border border-slate-300 flex flex-col justify-end">
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="absolute inset-0 w-full h-full bg-black"
                onEnded={() => setHasWatched(true)}
                onLoadedMetadata={e => setVideoDurationSeconds(e.currentTarget.duration)}
              />
            ) : (
              <>
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

                {/* Watch-gate Overlay: hiện trước khi nghe hết bài giảng, chặn không cho vào quiz sớm */}
                {!hasWatched && (
                  <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-xs z-20 flex items-center justify-center p-4">
                    <div className="text-center max-w-sm">
                      {narration.isPlaying ? (
                        <>
                          <div className="w-16 h-16 mx-auto rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-4">
                            <Sparkles className="w-7 h-7 text-purple-300 animate-spin" />
                          </div>
                          <h3 className="text-white font-bold text-base">Đang phát bài giảng...</h3>
                          <p className="text-slate-300 text-xs mt-2 leading-relaxed italic min-h-[2.5em]">
                            {activeSnippet ? `"${activeSnippet.text}"` : ''}
                          </p>
                          <button
                            onClick={toggleNarration}
                            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                          >
                            <Square className="w-3.5 h-3.5" />
                            <span>Dừng</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={toggleNarration}
                            disabled={!narration.isSupported}
                            className="w-20 h-20 mx-auto rounded-full bg-white text-blue-700 flex items-center justify-center shadow-2xl hover:scale-105 transition-transform cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            <Play className="w-8 h-8 fill-blue-700 ml-1" />
                          </button>
                          <h3 className="text-white font-bold text-base mt-4">Xem video bài giảng để tiếp tục</h3>
                          <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">
                            Nghe hết bài giảng ({durationLabel}) để AI Tutor mở khoá bài kiểm tra hiểu bài.
                          </p>
                          {!narration.isSupported && (
                            <p className="text-amber-300 text-[11px] mt-2">
                              Trình duyệt này không hỗ trợ đọc giọng nói (Web Speech API).
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Video Control Bar at Footer — z-30 để nổi lên trên overlay chờ xem, luôn tua/bấm được */}
                <div className="relative z-30 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 text-white flex flex-col space-y-2">
                  {narration.isPlaying && activeSnippet && (
                    <div className="text-[11px] text-amber-200 italic truncate">
                      ▶ Đang đọc: "{activeSnippet.text}"
                    </div>
                  )}
                  <div
                    onClick={handleSeek}
                    title="Tua đến vị trí này"
                    className="group relative w-full h-1.5 bg-white/30 rounded-full cursor-pointer overflow-visible"
                  >
                    <div className="absolute inset-y-0 left-0 bg-red-600 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                    <div
                      className="absolute top-1/2 w-3 h-3 -mt-1.5 -ml-1.5 rounded-full bg-red-600 border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      style={{ left: `${progressPercent}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={toggleNarration}
                        disabled={!narration.isSupported}
                        className="hover:text-red-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        title={narration.isPlaying ? 'Dừng giọng đọc AI' : 'Nghe AI đọc transcript'}
                      >
                        {narration.isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button className="hover:text-slate-300">
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <span className="font-mono text-[11px] text-slate-200">{formatDuration(elapsedSeconds)} / {durationLabel}</span>
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
              </>
            )}
          </div>

          {/* Watch-gate hint for real uploaded videos (không che video, chỉ nhắc bên dưới) */}
          {videoUrl && !hasWatched && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5 text-xs text-amber-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Xem hết video để AI Tutor mở khoá bài kiểm tra hiểu bài.</span>
            </div>
          )}

          {/* Completion CTA — hiện ngay sau khi xem/nghe hết bài giảng */}
          {hasWatched && (
            <div className="mt-4 bg-white rounded-2xl p-5 shadow-xs border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Bạn đã xem xong video bài giảng!
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thời lượng đã học:{' '}
                    <span className="font-semibold text-slate-700">{durationLabel} / {durationLabel}</span> • Trạng thái:{' '}
                    <span className="text-emerald-600 font-bold">Hoàn thành 100%</span>
                  </p>
                </div>
              </div>

              <div className="mt-3.5 p-3.5 bg-gradient-to-br from-indigo-50/90 to-purple-50/90 rounded-xl border border-indigo-100 flex items-start space-x-3">
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
                    AI Tutor đã đọc và phân tích toàn bộ <strong>{chapterTitle}</strong> để chuẩn bị{' '}
                    <strong>câu hỏi trắc nghiệm</strong> kiểm tra độ hiểu bài có đối chiếu căn cứ.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                <button
                  onClick={onStartQuiz}
                  className="w-full bg-gradient-to-r from-blue-600 hover:from-blue-700 to-indigo-600 hover:to-indigo-700 text-white font-bold py-3 px-5 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center space-x-2 text-sm transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Bắt đầu làm bài kiểm tra AI ngay</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                <div className="flex items-center justify-center space-x-3 pt-1">
                  {!videoUrl && (
                    <>
                      <button
                        onClick={toggleNarration}
                        disabled={!narration.isSupported}
                        className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 font-medium py-1.5 px-3 rounded-lg hover:bg-slate-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        title={narration.isSupported ? undefined : 'Trình duyệt này không hỗ trợ Web Speech API'}
                      >
                        {narration.isPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{narration.isPlaying ? 'Dừng giọng đọc AI' : 'Nghe AI đọc transcript'}</span>
                      </button>
                      <span className="text-slate-300">•</span>
                    </>
                  )}
                  <button
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(transcript, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'transcript.json';
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
          )}

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

            <span className="text-xs text-slate-400 font-medium">{chapterTitle}</span>
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
                  <span>{hasWatched ? 'AI Đã Phân Tích Xong Bài' : 'AI Đang Chờ Bạn Xem Hết Bài Giảng'}</span>
                </div>
                <p className="text-[11px] text-amber-900 mt-1 leading-normal">
                  Bản ghi {durationLabel} của bài <i>{chapterTitle}</i>.
                </p>
                <button
                  onClick={onStartQuiz}
                  disabled={!hasWatched}
                  title={hasWatched ? undefined : 'Xem hết video bài giảng để mở khoá'}
                  className="mt-2 w-full text-center bg-amber-600 hover:bg-amber-700 text-white font-semibold py-1.5 px-2.5 rounded text-[11px] transition shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-amber-600"
                >
                  {hasWatched ? 'Vào kiểm tra ngay' : 'Xem hết video để mở khoá'}
                </button>
              </div>

              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                Dòng thời gian bài học
              </div>

              {filteredTimeline.map(item => {
                const isSpeaking = item.id === narration.activeId;
                return (
                  <div
                    key={item.id}
                    className={`p-2 rounded-lg transition border-l-2 ${
                      isSpeaking
                        ? 'bg-amber-50 border-amber-400 text-slate-900 shadow-xs'
                        : item.isImportant
                        ? 'bg-blue-50/70 border-blue-300 text-blue-950'
                        : 'hover:bg-slate-50 border-transparent text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className={`font-semibold cursor-pointer ${isSpeaking ? 'text-amber-700' : 'text-blue-600'}`}>
                        {isSpeaking ? '▶ ' : ''}{item.timestamp}
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
                );
              })}
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
                <p className="font-semibold text-slate-800">Slide-Bai-Giang.pdf</p>
                <span className="text-[10px] text-slate-400">PDF • 4.2 MB</span>
              </div>
              <Download className="w-4 h-4 text-slate-500" />
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};
