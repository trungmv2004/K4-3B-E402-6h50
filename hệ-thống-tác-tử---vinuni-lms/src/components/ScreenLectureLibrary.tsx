import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, LogOut, PlayCircle, Sparkles } from 'lucide-react';
import { LectureProgress, TranscriptSnippet, User, VideoRecord } from '../types';
import { fetchProgress, listVideos, logout } from '../services/api';
import { TRANSCRIPT_TIMELINE } from '../data/courseData';

export interface Lecture {
  id: string;
  chapterTitle: string;
  transcript: TranscriptSnippet[];
  videoUrl?: string;
  videoId?: string; // có giá trị với video giảng viên tải lên → quiz được cấp từ máy chủ
  // Có giá trị khi video không đủ căn cứ để sinh quiz (video giới thiệu/chuyển tiếp) → học viên được miễn thi.
  bypass?: { wordCount: number; evidenceScore: number; reasoning: string };
}

interface ScreenLectureLibraryProps {
  user: User;
  onSelectLecture: (lecture: Lecture) => void;
  onLoggedOut: () => void;
}

const DEMO_LECTURE: Lecture = {
  id: 'demo-day03',
  chapterTitle: 'Hệ Thống Tác Tử & Các Mức Độ Tự Chủ (Bài giảng mẫu)',
  transcript: TRANSCRIPT_TIMELINE,
};

const ProgressBadge: React.FC<{ progress?: LectureProgress }> = ({ progress }) => {
  if (!progress) return null;
  if (progress.completed) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full shrink-0">
        <CheckCircle2 className="w-3 h-3" /> Đã hoàn thành
      </span>
    );
  }
  if (progress.attempts > 0) {
    return (
      <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-full shrink-0">
        Cao nhất {progress.bestScorePercent}% · {progress.attempts} lần
      </span>
    );
  }
  return null;
};

export const ScreenLectureLibrary: React.FC<ScreenLectureLibraryProps> = ({
  user,
  onSelectLecture,
  onLoggedOut,
}) => {
  const [uploadedLectures, setUploadedLectures] = useState<VideoRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progressByLecture, setProgressByLecture] = useState<Record<string, LectureProgress>>({});

  useEffect(() => {
    fetchProgress()
      .then(list => setProgressByLecture(Object.fromEntries(list.map(p => [p.lectureId, p]))))
      .catch(() => setProgressByLecture({}));
    listVideos()
      .then(videos => setUploadedLectures(videos.filter(v => v.status === 'quiz_ready' || v.status === 'insufficient_evidence')))
      .catch(() => setUploadedLectures([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="h-screen w-full overflow-y-auto bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-sm font-bold text-slate-800">Chọn bài giảng để học</h1>
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

      <main className="max-w-3xl mx-auto p-4 md:p-8 space-y-4">
        {/* Built-in demo lecture, always available */}
        <button
          onClick={() => onSelectLecture(DEMO_LECTURE)}
          className="w-full text-left bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-4 shadow-xs transition flex items-center justify-between gap-3 cursor-pointer group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800 truncate">{DEMO_LECTURE.chapterTitle}</h3>
                <ProgressBadge progress={progressByLecture[DEMO_LECTURE.id]} />
              </div>
              <p className="text-[11px] text-slate-400">Bài giảng mẫu · AI đọc transcript bằng giọng nói</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition shrink-0" />
        </button>

        {isLoading && <p className="text-xs text-slate-400 px-1">Đang tải danh sách bài giảng...</p>}

        {!isLoading && uploadedLectures.length === 0 && (
          <p className="text-xs text-slate-400 px-1">
            Chưa có bài giảng nào do giáo viên tải lên và sinh quiz xong.
          </p>
        )}

        {uploadedLectures.map(video => {
          const isBypass = video.status === 'insufficient_evidence';
          return (
            <button
              key={video.id}
              onClick={() =>
                onSelectLecture({
                  id: video.id,
                  chapterTitle: video.title,
                  transcript: video.transcript ?? [],
                  videoUrl: `/uploads/videos/${video.filename}`,
                  videoId: video.id,
                  bypass: isBypass
                    ? {
                        wordCount: video.wordCount ?? 0,
                        evidenceScore: video.evidenceScore ?? 0,
                        reasoning: video.errorMessage ?? 'Transcript không đủ căn cứ kiến thức để sinh câu hỏi kiểm tra.',
                      }
                    : undefined,
                })
              }
              className={`w-full text-left bg-white border border-slate-200 rounded-xl p-4 shadow-xs transition flex items-center justify-between gap-3 cursor-pointer group ${
                isBypass ? 'hover:border-amber-300' : 'hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isBypass ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  <PlayCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-800 truncate">{video.title}</h3>
                    <ProgressBadge progress={progressByLecture[video.id]} />
                  </div>
                  {isBypass ? (
                    <p className="text-[11px] text-amber-700">
                      Do {video.uploadedByName} tải lên · Video giới thiệu/chuyển tiếp, không cần làm quiz
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-500" />
                      Do {video.uploadedByName} tải lên · {video.quizCount ?? 0} câu hỏi AI sinh
                    </p>
                  )}
                </div>
              </div>
              <ArrowRight
                className={`w-4 h-4 text-slate-300 transition shrink-0 ${
                  isBypass ? 'group-hover:text-amber-600' : 'group-hover:text-emerald-600'
                }`}
              />
            </button>
          );
        })}
      </main>
    </div>
  );
};
