import React, { useEffect, useState } from 'react';
import {
  UploadCloud,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  BookmarkCheck,
  Eye,
  Loader2,
  LogOut,
  Video as VideoIcon,
} from 'lucide-react';
import { User, VideoRecord } from '../types';
import {
  generateQuizForVideo,
  listVideos,
  logout,
  markVideoAsIntro,
  transcribeVideo,
  unpublishQuiz,
  uploadVideo,
} from '../services/api';
import { QuizEditor } from './QuizEditor';
import { ClassReportView } from './ClassReportView';

interface TeacherDashboardProps {
  user: User;
  onLoggedOut: () => void;
}

const STATUS_LABEL: Record<VideoRecord['status'], { text: string; className: string }> = {
  uploaded: { text: 'Đã tải lên · Chưa trích transcript', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  transcribing: { text: 'AI đang nghe video...', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  transcribed: { text: 'Đã có transcript · Chưa sinh quiz', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  transcribe_failed: { text: 'Trích transcript thất bại', className: 'bg-rose-50 text-rose-700 border-rose-200' },
  insufficient_evidence: { text: 'Video giới thiệu — học viên được miễn quiz', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  quiz_generating: { text: 'AI đang sinh quiz...', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  quiz_review: { text: 'Quiz chờ duyệt — học viên chưa thấy', className: 'bg-violet-50 text-violet-700 border-violet-200' },
  quiz_ready: { text: 'Đã sẵn sàng cho học viên', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  quiz_failed: { text: 'Sinh quiz thất bại', className: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onLoggedOut }) => {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [busyVideoId, setBusyVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'lectures' | 'report'>('lectures');

  const refresh = async () => {
    try {
      const data = await listVideos();
      setVideos(data.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được danh sách video.');
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // Pipeline chạy nền sau khi tải lên: tự cập nhật danh sách khi còn video đang được AI xử lý.
  const hasRunningJob = videos.some(
    v =>
      v.status === 'transcribing' ||
      v.status === 'quiz_generating' ||
      (v.status === 'uploaded' && Date.now() - new Date(v.createdAt).getTime() < 60_000)
  );
  useEffect(() => {
    if (!hasRunningJob) return;
    const timer = setInterval(refresh, 4000);
    return () => clearInterval(timer);
  }, [hasRunningJob]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      await uploadVideo(title || file.name, file);
      setTitle('');
      setFile(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tải video lên thất bại.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTranscribe = async (id: string) => {
    setBusyVideoId(id);
    setError(null);
    try {
      await transcribeVideo(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không trích được transcript.');
      await refresh();
    } finally {
      setBusyVideoId(null);
    }
  };

  const handleGenerateQuiz = async (id: string) => {
    setBusyVideoId(id);
    setError(null);
    try {
      await generateQuizForVideo(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không sinh được quiz.');
      await refresh();
    } finally {
      setBusyVideoId(null);
    }
  };

  const handleUnpublish = async (id: string) => {
    setBusyVideoId(id);
    setError(null);
    try {
      await unpublishQuiz(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không rút được quiz về bản nháp.');
    } finally {
      setBusyVideoId(null);
    }
  };

  const handleMarkIntro = async (id: string) => {
    setBusyVideoId(id);
    setError(null);
    try {
      await markVideoAsIntro(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không đánh dấu được video giới thiệu.');
    } finally {
      setBusyVideoId(null);
    }
  };

  return (
    <div className="h-screen w-full overflow-y-auto bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-sm font-bold text-slate-800">Bảng điều khiển Giáo viên</h1>
          <p className="text-xs text-slate-500">Xin chào, {user.name}</p>
        </div>
        <button
          onClick={async () => {
            await logout();
            onLoggedOut();
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất</span>
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        {error && (
          <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</div>
        )}

        <div className="flex items-center gap-1 border-b border-slate-200">
          {([
            { id: 'lectures', label: 'Bài giảng', icon: VideoIcon },
            { id: 'report', label: 'Kết quả lớp', icon: BarChart3 },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 -mb-px transition cursor-pointer ${
                tab === t.id
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'report' && <ClassReportView />}

        {tab === 'lectures' && (
        <>
        {/* Upload Form */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
            <UploadCloud className="w-4 h-4 text-blue-600" />
            Tải video bài giảng lên
          </h2>
          <p className="text-[11px] text-slate-400 -mt-2 mb-3">
            Sau khi tải lên, AI tự động trích transcript rồi sinh quiz. Quiz được để ở trạng thái chờ duyệt để bạn kiểm tra trước khi phát hành.
          </p>
          <form onSubmit={handleUpload} className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Tên bài giảng (vd: Bài 4 - Phân biệt Tool, API và MCP)"
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="file"
              accept="video/*"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:text-xs file:font-semibold hover:file:bg-blue-100"
            />
            <button
              type="submit"
              disabled={!file || isUploading}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
            >
              {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
              <span>{isUploading ? 'Đang tải lên...' : 'Tải lên'}</span>
            </button>
          </form>
        </section>

        {/* Video List */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-800">Video đã tải lên ({videos.length})</h2>

          {isLoadingList && <p className="text-xs text-slate-400">Đang tải danh sách...</p>}
          {!isLoadingList && videos.length === 0 && (
            <p className="text-xs text-slate-400">Chưa có video nào. Tải lên video đầu tiên ở trên.</p>
          )}

          {videos.map(video => {
            const statusInfo = STATUS_LABEL[video.status];
            const isBusy = busyVideoId === video.id;
            const isExpanded = expandedId === video.id;

            return (
              <div key={video.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                      <VideoIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-800 truncate">{video.title}</h3>
                      <p className="text-[11px] text-slate-400">
                        {video.uploadedByName} · {new Date(video.createdAt).toLocaleString('vi-VN')}
                      </p>
                      <span
                        className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.className}`}
                      >
                        {(video.status === 'transcribing' || video.status === 'quiz_generating') && (
                          <Loader2 className="inline w-3 h-3 animate-spin mr-1 -mt-0.5" />
                        )}
                        {statusInfo.text}
                      </span>
                      {video.errorMessage && (video.status === 'transcribe_failed' || video.status === 'quiz_failed') && (
                        <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> {video.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {(video.status === 'uploaded' || video.status === 'transcribe_failed') && (
                      <button
                        onClick={() => handleTranscribe(video.id)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                        <span>Trích transcript</span>
                      </button>
                    )}
                    {(video.status === 'transcribed' ||
                      video.status === 'insufficient_evidence' ||
                      video.status === 'quiz_failed') && (
                      <button
                        onClick={() => handleGenerateQuiz(video.id)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 disabled:opacity-50 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        <span>Sinh Quiz</span>
                      </button>
                    )}
                    {video.status === 'quiz_review' && (
                      <button
                        onClick={() => setExpandedId(video.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Duyệt quiz</span>
                      </button>
                    )}
                    {(video.status === 'uploaded' ||
                      video.status === 'transcribed' ||
                      video.status === 'transcribe_failed' ||
                      video.status === 'quiz_failed' ||
                      video.status === 'quiz_review' ||
                      video.status === 'quiz_ready') && (
                      <button
                        onClick={() => handleMarkIntro(video.id)}
                        disabled={isBusy}
                        title="Học viên xem video xong sẽ được miễn quiz và cộng điểm chuyên cần"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        <BookmarkCheck className="w-3 h-3" />
                        <span>Video giới thiệu</span>
                      </button>
                    )}
                    {(video.transcript || video.quiz) && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : video.id)}
                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      >
                        {isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                    <video
                      controls
                      src={`/uploads/videos/${video.filename}`}
                      className="w-full max-w-md rounded-lg border border-slate-200"
                    />

                    {video.transcript && (
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                          Transcript ({video.wordCount ?? '?'} từ, độ tin cậy {video.evidenceScore ?? '?'}%)
                        </h4>
                        <div className="max-h-48 overflow-y-auto space-y-1.5 bg-slate-50 rounded-lg p-2.5">
                          {video.transcript.map(s => (
                            <div key={s.id} className="text-xs text-slate-700">
                              <span className="font-mono text-indigo-600 font-semibold mr-1.5">[{s.timestamp}]</span>
                              {s.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {video.quiz && video.status === 'quiz_review' && (
                      <QuizEditor
                        key={`${video.id}-${video.status}`}
                        video={video}
                        onChanged={refresh}
                        onError={setError}
                      />
                    )}

                    {video.quiz && video.status !== 'quiz_review' && (
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Quiz đã phát hành ({video.quiz.length} câu) — học viên có thể làm bài này
                        </h4>
                        <div className="space-y-2">
                          {video.quiz.map(q => (
                            <div key={q.id} className="text-xs bg-slate-50 rounded-lg p-2.5">
                              <p className="font-semibold text-slate-800">
                                Câu {q.questionNumber}: {q.title}
                              </p>
                              <p className="text-emerald-700 mt-1">
                                Đáp án đúng: {q.correctAnswer}. {q.options.find(o => o.key === q.correctAnswer)?.text}
                              </p>
                            </div>
                          ))}
                        </div>
                        {video.status === 'quiz_ready' && (
                          <button
                            onClick={() => handleUnpublish(video.id)}
                            disabled={isBusy}
                            className="mt-2 text-[11px] font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 disabled:opacity-50 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            Rút về bản nháp để sửa
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </section>
        </>
        )}
      </main>
    </div>
  );
};
