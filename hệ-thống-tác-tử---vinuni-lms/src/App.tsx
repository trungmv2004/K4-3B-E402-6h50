/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ScreenMode, QuizQuestion, PublicQuizQuestion, GradedAnswer, FallbackAuditData, User } from './types';
import { COURSE_QUESTIONS, FALLBACK_AUDIT_DATA } from './data/courseData';
import { startQuiz, submitQuiz, completeLesson, markLectureViewed, fetchCurrentUser, logout } from './services/api';
import { TopBar } from './components/TopBar';
import { CourseSidebar } from './components/CourseSidebar';
import { ScreenVideoComplete } from './components/ScreenVideoComplete';
import { ScreenQuizTaking } from './components/ScreenQuizTaking';
import { ScreenRemediation } from './components/ScreenRemediation';
import { ScreenSafeFallback } from './components/ScreenSafeFallback';
import { AiTutorModal } from './components/AiTutorModal';
import { FeedbackModal } from './components/FeedbackModal';
import { LoginScreen } from './components/LoginScreen';
import { TeacherDashboard } from './components/TeacherDashboard';
import { ScreenLectureLibrary, Lecture } from './components/ScreenLectureLibrary';
import { Sparkles } from 'lucide-react';

// Dữ liệu demo tĩnh (COURSE_QUESTIONS) đã có sẵn đáp án/căn cứ, dùng để tái tạo màn hình
// chấm điểm y hệt bản dựng gốc khi người dùng bấm thẳng vào bộ chuyển màn hình ở TopBar
// mà chưa chạy qua luồng AI thật (video → bắt đầu quiz).
function buildDemoGradedAnswers(questions: QuizQuestion[]): GradedAnswer[] {
  return questions.map(q => {
    const selectedKey = q.userAnswer ?? null;
    return {
      questionId: q.id,
      selectedKey,
      isCorrect: selectedKey !== null && selectedKey === q.correctAnswer,
      confidence: q.groundingMatchPercent,
      needsReview: false,
      feedback: selectedKey === null
        ? 'Bạn chưa chọn đáp án cho câu hỏi này nên câu bị tính là sai.'
        : q.aiDiagnosticRemark ?? q.explanation ?? '',
      groundingSnippetId: q.groundingSnippetId ?? '',
      groundingQuote: q.groundingQuote,
      suggestedSnippetIds: [],
    };
  });
}

function StudentApp({ user, lecture, onBackToLibrary, onLoggedOut }: {
  user: User;
  lecture: Lecture;
  onBackToLibrary: () => void;
  onLoggedOut: () => void;
}) {
  const [currentScreen, setCurrentScreen] = useState<ScreenMode>('video-completion');

  // Ghi nhận học viên đã mở bài giảng này để giảng viên thấy trong báo cáo lớp.
  useEffect(() => {
    markLectureViewed(lecture.id).catch(() => {});
  }, [lecture.id]);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Câu hỏi đang làm (không có đáp án) và phiên làm bài do máy chủ giữ; quizId = null là chế độ demo ngoại tuyến.
  const [quizQuestions, setQuizQuestions] = useState<PublicQuizQuestion[]>(COURSE_QUESTIONS);
  const [quizId, setQuizId] = useState<string | null>(null);
  // Câu hỏi kèm đáp án chuẩn và căn cứ — chỉ có sau khi máy chủ chấm bài.
  const [revealedQuestions, setRevealedQuestions] = useState<QuizQuestion[]>(COURSE_QUESTIONS);
  const [gradedAnswers, setGradedAnswers] = useState<GradedAnswer[]>(() =>
    buildDemoGradedAnswers(COURSE_QUESTIONS)
  );
  const [fallbackAudit, setFallbackAudit] = useState<FallbackAuditData>(FALLBACK_AUDIT_DATA);

  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState<string | null>(null);

  // Các màn chỉ được mở khi học viên đã hoàn thành màn trước (màn 1 → 2 → 3 → 4).
  const [unlockedScreens, setUnlockedScreens] = useState<ScreenMode[]>(['video-completion']);

  const advanceTo = (screen: ScreenMode) => {
    setUnlockedScreens(prev => (prev.includes(screen) ? prev : [...prev, screen]));
    setCurrentScreen(screen);
  };

  const handleSelectScreen = (screen: ScreenMode) => {
    if (unlockedScreens.includes(screen)) {
      setCurrentScreen(screen);
    } else if (screen === 'quiz-taking' && currentScreen === 'video-completion') {
      // Nút "Quiz kiểm tra AI" ở thanh bên chính là bước hoàn thành màn 1.
      handleStartQuiz();
    }
  };

  const handleStartQuiz = async () => {
    // Giáo viên đã chạy đánh giá căn cứ và video không đủ → miễn thi, không gọi AI lại.
    if (lecture.bypass) {
      setFallbackAudit({
        ...FALLBACK_AUDIT_DATA,
        wordCount: lecture.bypass.wordCount,
        evidenceScore: lecture.bypass.evidenceScore,
        transcriptSample: lecture.transcript.map(s => s.text).join(' '),
        aiReasoning: `AI Reasoning: ${lecture.bypass.reasoning}`,
      });
      advanceTo('fallback');
      return;
    }

    setIsGeneratingQuiz(true);
    setAiStatusMessage(null);
    try {
      const result = await startQuiz(
        lecture.videoId
          ? { videoId: lecture.videoId }
          : { lectureId: lecture.id, chapterTitle: lecture.chapterTitle, transcript: lecture.transcript }
      );
      if (result.sufficientEvidence === false) {
        setFallbackAudit({
          phase: 'Giai đoạn 3.4',
          stageName: 'Xác thực tính nguyên vẹn dữ liệu transcript',
          systemStatus: 'Hệ thống giám sát chất lượng LLM đang hoạt động',
          wordCount: result.wordCount,
          minWordThreshold: result.minWordThreshold,
          evidenceScore: result.evidenceScore,
          evidenceRequired: result.evidenceRequired,
          appliedMode: 'Bypass Pass (Miễn thi)',
          academicBenefit: 'Được cộng đủ điểm chuyên cần',
          transcriptSample: result.transcriptSample,
          aiReasoning: `AI Reasoning: ${result.reasoning}`,
        });
        advanceTo('fallback');
      } else {
        setQuizId(result.quizId);
        setQuizQuestions(result.questions);
        advanceTo('quiz-taking');
      }
    } catch (err) {
      setAiStatusMessage(
        err instanceof Error
          ? `${err.message} Đang dùng bộ câu hỏi demo ngoại tuyến thay thế.`
          : 'Không thể kết nối AI Tutor. Đang dùng bộ câu hỏi demo ngoại tuyến thay thế.'
      );
      setQuizId(null);
      setQuizQuestions(COURSE_QUESTIONS.map(({ userAnswer, ...q }) => q));
      advanceTo('quiz-taking');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSubmitQuiz = async (answeredQuestions: PublicQuizQuestion[]) => {
    setIsGrading(true);
    setAiStatusMessage(null);
    try {
      if (quizId) {
        // Máy chủ chấm bài rồi mới trả đáp án chuẩn và căn cứ.
        const graded = await submitQuiz(quizId, answeredQuestions);
        setRevealedQuestions(graded.questions);
        setGradedAnswers(graded.results);
      } else {
        // Chế độ demo ngoại tuyến: dữ liệu demo tĩnh có sẵn đáp án nên chấm tại chỗ.
        const answerById = new Map(answeredQuestions.map(q => [q.id, q.userAnswer]));
        const demo = COURSE_QUESTIONS.map(q => ({ ...q, userAnswer: answerById.get(q.id) }));
        setRevealedQuestions(demo);
        setGradedAnswers(buildDemoGradedAnswers(demo));
      }
      setQuizQuestions(answeredQuestions);
      advanceTo('remediation');
    } catch (err) {
      // Không chấm được (mất kết nối, phiên hết hạn...) thì giữ học viên ở màn làm bài để nộp lại.
      setAiStatusMessage(
        err instanceof Error
          ? err.message
          : 'Không thể chấm bài lúc này. Vui lòng thử nộp lại.'
      );
    } finally {
      setIsGrading(false);
    }
  };

  // Làm lại bài: xoá đáp án đã chọn và cờ "xem lại" của lượt trước để học viên bắt đầu từ bài trắng.
  const handleRetakeQuiz = () => {
    setQuizQuestions(prev =>
      prev.map(({ userAnswer, isFlaggedForReview, ...rest }) => rest)
    );
    setAiStatusMessage(null);
    advanceTo('quiz-taking');
  };

  const isBusy = isGeneratingQuiz || isGrading;

  return (
    <div className="bg-[#f8fafc] text-slate-800 font-sans antialiased h-screen flex flex-col overflow-hidden">
      <TopBar
        currentScreen={currentScreen}
        onSelectScreen={handleSelectScreen}
        unlockedScreens={unlockedScreens}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenFeedbackModal={() => setIsFeedbackModalOpen(true)}
        studentName={user.name}
        onBackToLibrary={onBackToLibrary}
        onLogout={onLoggedOut}
      />

      {aiStatusMessage && (
        <div className="shrink-0 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs px-4 py-1.5 flex items-center justify-between">
          <span>{aiStatusMessage}</span>
          <button onClick={() => setAiStatusMessage(null)} className="font-semibold hover:underline cursor-pointer">
            Đóng
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        <CourseSidebar
          currentScreen={currentScreen}
          lectureTitle={lecture.chapterTitle}
          onSelectScreen={handleSelectScreen}
        />

        {currentScreen === 'video-completion' && (
          <ScreenVideoComplete
            chapterTitle={lecture.chapterTitle}
            transcript={lecture.transcript}
            videoUrl={lecture.videoUrl}
            onStartQuiz={handleStartQuiz}
          />
        )}

        {currentScreen === 'quiz-taking' && (
          <ScreenQuizTaking
            questions={quizQuestions}
            onSubmitQuiz={handleSubmitQuiz}
            onPrevScreen={() => setCurrentScreen('video-completion')}
          />
        )}

        {currentScreen === 'remediation' && (
          <ScreenRemediation
            questions={revealedQuestions}
            gradedAnswers={gradedAnswers}
            transcript={lecture.transcript}
            onRetakeQuiz={handleRetakeQuiz}
            onCompleteLesson={async () => {
              await completeLesson(lecture.id).catch(() => {});
              alert('Chúc mừng! Bạn đã hoàn thành bài học và có thể chọn bài giảng tiếp theo trong thư viện.');
              onBackToLibrary();
            }}
          />
        )}

        {currentScreen === 'fallback' && (
          <ScreenSafeFallback
            auditData={fallbackAudit}
            lectureTitle={lecture.chapterTitle}
            onUnlockNextLesson={async () => {
              // Video giới thiệu được miễn thi thì ghi nhận hoàn thành; bài demo tĩnh sẽ bị máy chủ từ chối và bỏ qua.
              await completeLesson(lecture.id).catch(() => {});
              alert('Chúc mừng! Bạn đã hoàn thành bài học (Miễn thi an toàn) và có thể quay lại thư viện bài giảng.');
              onBackToLibrary();
            }}
          />
        )}

        {isBusy && (
          <div className="absolute inset-0 z-40 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl px-6 py-5 flex items-center gap-3 max-w-sm">
              <Sparkles className="w-5 h-5 text-purple-600 animate-spin shrink-0" />
              <p className="text-sm font-semibold text-slate-800">
                {isGeneratingQuiz
                  ? 'AI Tutor đang đọc transcript và soạn câu hỏi kiểm tra hiểu bài...'
                  : 'AI đang đối chiếu từng câu trả lời với transcript...'}
              </p>
            </div>
          </div>
        )}
      </div>

      <AiTutorModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} transcript={lecture.transcript} />
      <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [lecture, setLecture] = useState<Lecture | null>(null);

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .finally(() => setAuthChecked(true));
  }, []);

  const handleLoggedOut = async () => {
    await logout().catch(() => {});
    setUser(null);
    setLecture(null);
  };

  if (!authChecked) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Sparkles className="w-6 h-6 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLoggedIn={setUser} />;
  }

  if (user.role === 'teacher') {
    return <TeacherDashboard user={user} onLoggedOut={handleLoggedOut} />;
  }

  if (!lecture) {
    return (
      <ScreenLectureLibrary user={user} onSelectLecture={setLecture} onLoggedOut={handleLoggedOut} />
    );
  }

  return (
    <StudentApp
      user={user}
      lecture={lecture}
      onBackToLibrary={() => setLecture(null)}
      onLoggedOut={handleLoggedOut}
    />
  );
}
