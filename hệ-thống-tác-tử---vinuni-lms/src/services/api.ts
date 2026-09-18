import {
  ChatMessage,
  ClassReport,
  LectureProgress,
  PublicQuizQuestion,
  QuizQuestion,
  StartQuizResult,
  SubmitQuizResult,
  TranscriptSnippet,
  User,
  VideoRecord,
} from '../types';

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Yêu cầu tới ${url} thất bại (HTTP ${res.status}).`);
  }

  return res.json() as Promise<T>;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Yêu cầu tới ${url} thất bại (HTTP ${res.status}).`);
  }
  return res.json() as Promise<T>;
}

export function startQuiz(
  source: { videoId: string } | { lectureId: string; chapterTitle: string; transcript: TranscriptSnippet[] }
) {
  return postJson<StartQuizResult>('/api/quiz/start', source);
}

export function submitQuiz(quizId: string, questions: PublicQuizQuestion[]) {
  return postJson<SubmitQuizResult>('/api/quiz/submit', {
    quizId,
    answers: questions.map(q => ({ questionId: q.id, selectedKey: q.userAnswer ?? null })),
  });
}

export function tutorChat(transcript: TranscriptSnippet[], history: ChatMessage[], message: string) {
  return postJson<{ reply: string }>('/api/tutor/chat', { transcript, history, message });
}

// ---- Auth ----
export async function login(email: string, password: string) {
  const { user } = await postJson<{ user: User }>('/api/auth/login', { email, password });
  return user;
}

export async function logout() {
  await postJson('/api/auth/logout', {});
}

export async function fetchCurrentUser(): Promise<User | null> {
  const res = await fetch('/api/auth/me');
  if (!res.ok) return null;
  const data = (await res.json()) as { user: User };
  return data.user;
}

// ---- Videos (giáo viên upload, AI nghe video lấy transcript rồi sinh quiz) ----
export async function listVideos(): Promise<VideoRecord[]> {
  const { videos } = await getJson<{ videos: VideoRecord[] }>('/api/videos');
  return videos;
}

export async function getVideoRecord(id: string): Promise<VideoRecord> {
  const { video } = await getJson<{ video: VideoRecord }>(`/api/videos/${id}`);
  return video;
}

export async function uploadVideo(title: string, file: File): Promise<VideoRecord> {
  const form = new FormData();
  form.append('title', title);
  form.append('video', file);
  const res = await fetch('/api/videos', { method: 'POST', body: form });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || 'Tải video lên thất bại.');
  }
  const data = (await res.json()) as { video: VideoRecord };
  return data.video;
}

export async function transcribeVideo(id: string): Promise<VideoRecord> {
  const { video } = await postJson<{ video: VideoRecord }>(`/api/videos/${id}/transcribe`, {});
  return video;
}

export async function markVideoAsIntro(id: string): Promise<VideoRecord> {
  const { video } = await postJson<{ video: VideoRecord }>(`/api/videos/${id}/mark-intro`, {});
  return video;
}

export async function generateQuizForVideo(id: string): Promise<VideoRecord> {
  const result = await postJson<{ video: VideoRecord; sufficientEvidence: boolean; reasoning?: string }>(
    `/api/videos/${id}/generate-quiz`,
    {}
  );
  return result.video;
}

// ---- Tiến độ học ----
export async function fetchProgress(): Promise<LectureProgress[]> {
  const { progress } = await getJson<{ progress: LectureProgress[] }>('/api/progress');
  return progress;
}

export async function completeLesson(lectureId: string): Promise<void> {
  await postJson('/api/progress/complete', { lectureId });
}

export async function markLectureViewed(lectureId: string): Promise<void> {
  await postJson('/api/progress/view', { lectureId });
}

// ---- Giảng viên: báo cáo lớp và duyệt quiz ----
export function fetchClassReport() {
  return getJson<ClassReport>('/api/teacher/report');
}

async function sendJson<T>(method: 'PUT', url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Yêu cầu tới ${url} thất bại (HTTP ${res.status}).`);
  }
  return res.json() as Promise<T>;
}

export async function saveQuizEdits(id: string, quiz: QuizQuestion[]): Promise<VideoRecord> {
  const { video } = await sendJson<{ video: VideoRecord }>('PUT', `/api/videos/${id}/quiz`, { quiz });
  return video;
}

export async function publishQuiz(id: string): Promise<VideoRecord> {
  const { video } = await postJson<{ video: VideoRecord }>(`/api/videos/${id}/publish`, {});
  return video;
}

export async function unpublishQuiz(id: string): Promise<VideoRecord> {
  const { video } = await postJson<{ video: VideoRecord }>(`/api/videos/${id}/unpublish`, {});
  return video;
}
