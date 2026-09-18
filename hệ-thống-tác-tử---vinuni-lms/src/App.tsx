/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ScreenMode, QuizQuestion, GradedAnswer, FallbackAuditData, User } from './types';
import { COURSE_QUESTIONS, FALLBACK_AUDIT_DATA } from './data/courseData';
import { generateQuiz, gradeAnswer, fetchCurrentUser, logout } from './services/api';
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
    const selectedKey = q.userAnswer ?? q.correctAnswer;
    return {
      questionId: q.id,
      selectedKey,
      isCorrect: selectedKey === q.correctAnswer,
      confidence: q.groundingMatchPercent,
      needsReview: false,
      feedback: q.aiDiagnosticRemark ?? q.explanation ?? '',
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
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(COURSE_QUESTIONS);
  const [gradedAnswers, setGradedAnswers] = useState<GradedAnswer[]>(() =>
    buildDemoGradedAnswers(COURSE_QUESTIONS)
  );
  const [fallbackAudit, setFallbackAudit] = useState<FallbackAuditData>(FALLBACK_AUDIT_DATA);

  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState<string | null>(null);

  const handleStartQuiz = async () => {
    // Video do giáo viên tải lên đã được sinh quiz sẵn từ trước — không cần gọi AI lại lần nữa.
    if (lecture.quiz && lecture.quiz.length > 0) {
      setQuizQuestions(lecture.quiz);
      setCurrentScreen('quiz-taking');
      return;
    }

    setIsGeneratingQuiz(true);
    setAiStatusMessage(null);
    try {
      const result = await generateQuiz(lecture.chapterTitle, lecture.transcript);
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
        setCurrentScreen('fallback');
      } else {
        setQuizQuestions(result.questions);
        setCurrentScreen('quiz-taking');
      }
    } catch (err) {
      setAiStatusMessage(
        err instanceof Error
          ? `${err.message} Đang dùng bộ câu hỏi demo ngoại tuyến thay thế.`
          : 'Không thể kết nối AI Tutor. Đang dùng bộ câu hỏi demo ngoại tuyến thay thế.'
      );
      setQuizQuestions(COURSE_QUESTIONS);
      setCurrentScreen('quiz-taking');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSubmitQuiz = async (answeredQuestions: QuizQuestion[]) => {
    setIsGrading(true);
    setAiStatusMessage(null);
    try {
      const results = await Promise.all(
        answeredQuestions.map(async (q): Promise<GradedAnswer> => {
          const selectedKey = q.userAnswer ?? q.correctAnswer;
          const graded = await gradeAnswer(q, selectedKey, lecture.transcript);
          return { questionId: q.id, selectedKey, ...graded };
        })
      );
      setQuizQuestions(answeredQuestions);
      setGradedAnswers(results);
    } catch (err) {
      setAiStatusMessage(
        err instanceof Error
          ? `${err.message} Đang hiển thị kết quả theo đáp án chuẩn ngoại tuyến.`
          : 'Không thể chấm bài qua AI lúc này. Đang hiển thị kết quả theo đáp án chuẩn ngoại tuyến.'
      );
      setQuizQuestions(answeredQuestions);
      setGradedAnswers(buildDemoGradedAnswers(answeredQuestions));
    } finally {
      setIsGrading(false);
      setCurrentScreen('remediation');
    }
  };

  const isBusy = isGeneratingQuiz || isGrading;

  return (
    <div className="bg-[#f8fafc] text-slate-800 font-sans antialiased h-screen flex flex-col overflow-hidden">
      <TopBar
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
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
        <CourseSidebar currentScreen={currentScreen} onSelectScreen={setCurrentScreen} />

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
            questions={quizQuestions}
            gradedAnswers={gradedAnswers}
            transcript={lecture.transcript}
            onRetakeQuiz={() => setCurrentScreen('quiz-taking')}
            onGoToFallback={() => setCurrentScreen('fallback')}
          />
        )}

        {currentScreen === 'fallback' && (
          <ScreenSafeFallback
            auditData={fallbackAudit}
            onUnlockNextLesson={() => {
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
