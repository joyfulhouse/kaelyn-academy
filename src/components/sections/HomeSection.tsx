'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { setActiveSection } from '@/store/navigationSlice';
import { Card, StepIcon } from '@/components/common';
import { useAudio } from '@/hooks/useAudio';
import type { SectionId, StepIconType } from '@/types';

interface ModuleCard {
  id: SectionId;
  iconType: StepIconType;
  narration: string;
  color: string;
  bgColor: string;
}

// Math modules
const mathModules: ModuleCard[] = [
  {
    id: 'number-places',
    iconType: 'hundreds',
    narration: 'Number Places! Learn ones, tens, and hundreds!',
    color: 'text-coral',
    bgColor: 'bg-coral',
  },
  {
    id: 'stacked-math',
    iconType: 'add',
    narration: 'Stacked Math! Add and subtract!',
    color: 'text-sage',
    bgColor: 'bg-sage',
  },
  {
    id: 'carry-over',
    iconType: 'carry',
    narration: 'Carry Over! Learn to carry numbers up!',
    color: 'text-yellow',
    bgColor: 'bg-yellow',
  },
  {
    id: 'borrowing',
    iconType: 'borrow',
    narration: 'Borrowing! Learn to borrow from next door!',
    color: 'text-sky',
    bgColor: 'bg-sky',
  },
  {
    id: 'multiplication',
    iconType: 'multiply',
    narration: 'Multiplication! Times tables are fun!',
    color: 'text-coral',
    bgColor: 'bg-coral',
  },
  {
    id: 'division',
    iconType: 'divide',
    narration: 'Division! Share and divide equally!',
    color: 'text-sage',
    bgColor: 'bg-sage',
  },
  {
    id: 'practice',
    iconType: 'check',
    narration: 'Practice! Test your skills!',
    color: 'text-yellow',
    bgColor: 'bg-yellow',
  },
];

// Reading modules
const readingModules: ModuleCard[] = [
  {
    id: 'sight-words',
    iconType: 'word',
    narration: 'Sight Words! Learn words you see every day!',
    color: 'text-sage',
    bgColor: 'bg-sage',
  },
  {
    id: 'letters',
    iconType: 'letter',
    narration: 'Letters! Learn A-B-C and letter sounds!',
    color: 'text-sky',
    bgColor: 'bg-sky',
  },
  {
    id: 'phonics',
    iconType: 'phonics',
    narration: 'Phonics! Learn to sound out words!',
    color: 'text-coral',
    bgColor: 'bg-coral',
  },
];

export function HomeSection() {
  const dispatch = useAppDispatch();
  const { speak, clickSound } = useAudio();
  const userName = useAppSelector((state) => state.session.userName);
  const totalStars = useAppSelector((state) => state.session.totalStars);
  const lessonsCompleted = useAppSelector((state) => state.session.lessonsCompleted);
  const activeSubject = useAppSelector((state) => state.navigation.activeSubject);

  // Get modules for current subject
  const modules = activeSubject === 'math' ? mathModules : readingModules;
  const subjectLabel = activeSubject === 'math' ? 'math' : 'reading';

  // Greet on mount or subject change
  useEffect(() => {
    const timer = setTimeout(() => {
      speak(`Hi ${userName}! Let's learn ${subjectLabel}!`);
    }, 500);
    return () => clearTimeout(timer);
  }, [userName, speak, subjectLabel]);

  const handleModuleClick = (module: ModuleCard) => {
    clickSound();
    speak(module.narration);
    // Short delay to let narration start before navigation
    setTimeout(() => {
      dispatch(setActiveSection(module.id));
    }, 300);
  };

  return (
    <div className="space-y-8">
      {/* Hero Card - Visual with minimal text */}
      <Card variant="elevated" className="bg-gradient-to-br from-paper to-cream">
        <div className="flex flex-col items-center gap-6">
          {/* Animated mascot illustration */}
          <div className="relative">
            <svg viewBox="0 0 200 160" fill="none" className="h-40 w-52">
              {/* Shadow */}
              <ellipse cx="100" cy="145" rx="80" ry="10" fill="#E8DDD4" />
              {/* Board */}
              <rect x="60" y="80" width="80" height="60" rx="8" fill="#8FBC8F" />
              <rect x="65" y="85" width="70" height="45" rx="4" fill="#F5F5F5" />
              {/* Math on board - just visual symbols */}
              <circle cx="82" cy="107" r="6" fill="#FF7F6B" />
              <text x="96" y="112" fill="#4A3728" style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '18px', fontWeight: 600 }}>+</text>
              <circle cx="110" cy="107" r="6" fill="#7EB5D6" />
              <text x="124" y="112" fill="#4A3728" style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '18px', fontWeight: 600 }}>=</text>
              <circle cx="78" cy="118" r="3" fill="#FFD93D" />
              <circle cx="86" cy="118" r="3" fill="#FFD93D" />
              <circle cx="94" cy="118" r="3" fill="#FFD93D" />
              {/* Character */}
              <circle cx="50" cy="60" r="25" fill="#FF7F6B" className="animate-pulse" />
              <circle cx="50" cy="58" r="16" fill="#FFF8F0" />
              <circle cx="44" cy="54" r="3" fill="#4A3728" />
              <circle cx="56" cy="54" r="3" fill="#4A3728" />
              <path d="M42 64Q50 72 58 64" stroke="#4A3728" strokeWidth="2" fill="none" />
              {/* Star */}
              <circle cx="150" cy="50" r="20" fill="#FFD93D" />
              <path d="M150 35L152 42L160 42L154 47L156 54L150 49L144 54L146 47L140 42L148 42Z" fill="#FFF8F0" />
            </svg>
          </div>

          {/* Stats - Visual only with icons */}
          <div className="flex flex-wrap justify-center gap-6">
            {/* Stars earned */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow/20">
                <svg className="h-8 w-8 text-yellow" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
              <span className="font-display text-2xl font-bold text-chocolate">{totalStars}</span>
            </div>

            {/* Lessons completed */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage/20">
                <svg className="h-8 w-8 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-display text-2xl font-bold text-chocolate">{lessonsCompleted.length}</span>
            </div>

            {/* Module count - visual indicator */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky/20">
                <div className="grid grid-cols-2 gap-1">
                  <div className="h-3 w-3 rounded bg-sky" />
                  <div className="h-3 w-3 rounded bg-sky" />
                  <div className="h-3 w-3 rounded bg-sky" />
                  <div className="h-3 w-3 rounded bg-sky" />
                </div>
              </div>
              <span className="font-display text-2xl font-bold text-chocolate">{modules.length}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Module Grid - Large touch targets, icon-focused */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {modules.map((module, index) => {
          const isCompleted = lessonsCompleted.includes(module.id);
          return (
            <button
              key={module.id}
              onClick={() => handleModuleClick(module)}
              style={{ animationDelay: `${index * 0.1}s` }}
              className={`
                group relative flex flex-col items-center justify-center gap-3 rounded-2xl p-6
                shadow-soft transition-all duration-200
                hover:-translate-y-1 hover:scale-105 hover:shadow-lifted
                active:scale-95 animate-blockAppear opacity-0
                ${module.bgColor} text-cream
              `}
              aria-label={module.narration}
            >
              {/* Completion indicator */}
              {isCompleted && (
                <div className="absolute right-2 top-2">
                  <svg className="h-6 w-6 text-cream/80" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </div>
              )}

              {/* Large icon */}
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 transition-transform group-hover:scale-110">
                <StepIcon type={module.iconType} size="lg" className="h-12 w-12" />
              </div>

              {/* Visual indicator dots based on module type */}
              <div className="flex gap-1">
                {module.id === 'number-places' && (
                  <>
                    <div className="h-3 w-3 rounded-full bg-cream/60" />
                    <div className="h-3 w-3 rounded-full bg-cream/60" />
                    <div className="h-3 w-3 rounded-full bg-cream/60" />
                  </>
                )}
                {module.id === 'stacked-math' && (
                  <>
                    <div className="h-2 w-6 rounded bg-cream/60" />
                    <div className="mx-1 h-2 w-2 rounded-full bg-cream/60" />
                    <div className="h-2 w-6 rounded bg-cream/60" />
                  </>
                )}
                {module.id === 'carry-over' && (
                  <svg className="h-4 w-8 text-cream/60" viewBox="0 0 32 16" fill="currentColor">
                    <path d="M16 0l6 8h-4v8h-4v-8h-4l6-8z" />
                  </svg>
                )}
                {module.id === 'borrowing' && (
                  <svg className="h-4 w-8 text-cream/60" viewBox="0 0 32 16" fill="currentColor">
                    <path d="M16 16l-6-8h4V0h4v8h4l-6 8z" />
                  </svg>
                )}
                {module.id === 'multiplication' && (
                  <svg className="h-4 w-4 text-cream/60" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                )}
                {module.id === 'division' && (
                  <svg className="h-4 w-6 text-cream/60" viewBox="0 0 24 16" fill="currentColor">
                    <circle cx="12" cy="3" r="2" />
                    <rect x="4" y="7" width="16" height="2" rx="1" />
                    <circle cx="12" cy="13" r="2" />
                  </svg>
                )}
                {module.id === 'practice' && (
                  <>
                    <div className="h-2 w-2 rounded-full bg-cream/60" />
                    <div className="h-2 w-2 rounded-full bg-cream/60" />
                    <div className="h-2 w-2 rounded-full bg-cream/60" />
                    <div className="h-2 w-2 rounded-full bg-cream/60" />
                    <div className="h-2 w-2 rounded-full bg-cream/60" />
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick start hint - animated arrow pointing to modules */}
      <div className="flex items-center justify-center gap-2 text-chocolate/40">
        <svg className="h-6 w-6 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </div>
    </div>
  );
}
