import { evaluateEvidence, friendlyAiMessage, generateQuizQuestions } from './gemini';
import { getVideo, loadVideos, transcribeVideoWithGemini, updateVideo } from './videos';
import type { VideoRecord } from './videos';

export function isBusy(video: VideoRecord): boolean {
  return video.status === 'transcribing' || video.status === 'quiz_generating';
}

// Bước 1: AI nghe video lấy transcript.
export async function transcribeStep(id: string): Promise<VideoRecord | undefined> {
  const video = getVideo(id);
  if (!video) throw new Error('Không tìm thấy video.');
  updateVideo(id, { status: 'transcribing', errorMessage: undefined });
  try {
    const transcript = await transcribeVideoWithGemini(video);
    return updateVideo(id, { status: 'transcribed', transcript });
  } catch (err) {
    const message = friendlyAiMessage(err) ?? (err instanceof Error ? err.message : 'Không thể trích transcript từ video.');
    updateVideo(id, { status: 'transcribe_failed', errorMessage: message });
    throw err;
  }
}

// Bước 2: đánh giá căn cứ rồi sinh quiz. Quiz sinh ra ở trạng thái "chờ duyệt", giảng viên phát hành sau.
export async function quizStep(id: string) {
  const video = getVideo(id);
  if (!video) throw new Error('Không tìm thấy video.');
  if (!video.transcript || video.transcript.length === 0) {
    throw new Error('Video này chưa có transcript, hãy trích transcript trước.');
  }
  updateVideo(id, { status: 'quiz_generating', errorMessage: undefined });
  try {
    const evaluation = await evaluateEvidence(video.transcript);
    if (!evaluation.sufficientEvidence) {
      const updated = updateVideo(id, {
        status: 'insufficient_evidence',
        evidenceScore: evaluation.evidenceScore,
        wordCount: evaluation.wordCount,
        errorMessage: evaluation.reasoning,
      });
      return { video: updated, sufficientEvidence: false as const, reasoning: evaluation.reasoning };
    }
    const questions = await generateQuizQuestions(video.title, video.transcript, evaluation.evidenceScore);
    const updated = updateVideo(id, {
      status: 'quiz_review',
      quiz: questions,
      evidenceScore: evaluation.evidenceScore,
      wordCount: evaluation.wordCount,
    });
    return { video: updated, sufficientEvidence: true as const };
  } catch (err) {
    const message = friendlyAiMessage(err) ?? (err instanceof Error ? err.message : 'Không thể sinh quiz từ video này.');
    updateVideo(id, { status: 'quiz_failed', errorMessage: message });
    throw err;
  }
}

// Chạy nền sau khi tải lên: trích transcript → sinh quiz. Lỗi được ghi vào trạng thái video để giảng viên thử lại.
export async function runPipeline(id: string): Promise<void> {
  try {
    await transcribeStep(id);
    await quizStep(id);
  } catch (err) {
    console.error('[pipeline]', id, err instanceof Error ? err.message : err);
  }
}

// Máy chủ khởi động lại giữa chừng thì tác vụ nền đã mất; đưa video về trạng thái lỗi để giảng viên bấm chạy lại.
export function recoverInterruptedJobs(): void {
  for (const video of loadVideos()) {
    if (video.status === 'transcribing') {
      updateVideo(video.id, {
        status: 'transcribe_failed',
        errorMessage: 'Máy chủ khởi động lại khi đang trích transcript. Hãy bấm "Trích transcript" để chạy lại.',
      });
    } else if (video.status === 'quiz_generating') {
      updateVideo(video.id, {
        status: 'quiz_failed',
        errorMessage: 'Máy chủ khởi động lại khi đang sinh quiz. Hãy bấm "Sinh Quiz" để chạy lại.',
      });
    }
  }
}
