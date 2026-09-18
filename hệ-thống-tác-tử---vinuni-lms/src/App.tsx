/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScreenMode } from './types';
import { TopBar } from './components/TopBar';
import { CourseSidebar } from './components/CourseSidebar';
import { ScreenVideoComplete } from './components/ScreenVideoComplete';
import { ScreenQuizTaking } from './components/ScreenQuizTaking';
import { ScreenRemediation } from './components/ScreenRemediation';
import { ScreenSafeFallback } from './components/ScreenSafeFallback';
import { AiTutorModal } from './components/AiTutorModal';
import { FeedbackModal } from './components/FeedbackModal';

export default function App() {
  // Initial state is 'quiz-taking' or 'video-completion'
  // User can switch between all 4 screens directly via the top switcher or natural flow
  const [currentScreen, setCurrentScreen] = useState<ScreenMode>('quiz-taking');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  return (
    <div className="bg-[#f8fafc] text-slate-800 font-sans antialiased h-screen flex flex-col overflow-hidden">
      {/* TopBar with Navigation and Direct Screen Switcher */}
      <TopBar
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenFeedbackModal={() => setIsFeedbackModalOpen(true)}
      />

      {/* Main Layout: Course Sidebar + Active Screen View */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Course Curriculum Sidebar */}
        <CourseSidebar
          currentScreen={currentScreen}
          onSelectScreen={setCurrentScreen}
        />

        {/* Dynamic Screen Component */}
        {currentScreen === 'video-completion' && (
          <ScreenVideoComplete
            onStartQuiz={() => setCurrentScreen('quiz-taking')}
          />
        )}

        {currentScreen === 'quiz-taking' && (
          <ScreenQuizTaking
            onSubmitQuiz={() => setCurrentScreen('remediation')}
            onPrevScreen={() => setCurrentScreen('video-completion')}
          />
        )}

        {currentScreen === 'remediation' && (
          <ScreenRemediation
            onRetakeQuiz={() => setCurrentScreen('quiz-taking')}
            onGoToFallback={() => setCurrentScreen('fallback')}
          />
        )}

        {currentScreen === 'fallback' && (
          <ScreenSafeFallback
            onUnlockNextLesson={() => {
              alert('Chúc mừng! Bạn đã hoàn thành Bài 3 (Miễn thi an toàn) và mở khóa Bài 4: Phân biệt Tool, API và MCP.');
              setCurrentScreen('video-completion');
            }}
          />
        )}
      </div>

      {/* Interactive Modals */}
      <AiTutorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </div>
  );
}
