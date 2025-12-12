'use client';

import { type HTMLAttributes, useEffect, useRef } from 'react';
import { useAudio } from '@/hooks/useAudio';
import { Confetti } from './Confetti';

type FeedbackType = 'success' | 'error' | 'info' | 'warning';

interface FeedbackProps extends HTMLAttributes<HTMLDivElement> {
  type: FeedbackType;
  message: string;
  show?: boolean;
  speakMessage?: boolean;
}

const typeStyles: Record<FeedbackType, { bg: string; text: string; icon: string }> = {
  success: {
    bg: 'bg-sage/20',
    text: 'text-sage',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  error: {
    bg: 'bg-coral/20',
    text: 'text-coral',
    icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  info: {
    bg: 'bg-sky/20',
    text: 'text-sky',
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  warning: {
    bg: 'bg-yellow/20',
    text: 'text-yellow',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  },
};

export function Feedback({
  type,
  message,
  show = true,
  speakMessage = false,
  className = '',
  ...props
}: FeedbackProps) {
  const { speak, playSound } = useAudio();
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    if (show && !hasPlayedRef.current) {
      hasPlayedRef.current = true;
      if (type === 'success') {
        playSound('correct');
      } else if (type === 'error') {
        playSound('incorrect');
      }
      if (speakMessage) {
        speak(message);
      }
    }
    if (!show) {
      hasPlayedRef.current = false;
    }
  }, [show, type, message, speakMessage, speak, playSound]);

  if (!show) return null;

  const styles = typeStyles[type];

  return (
    <>
      {type === 'success' && <Confetti count={40} />}
      <div
        className={`
          flex items-center gap-2 rounded-xl px-4 py-3 font-body
          animate-[fadeIn_0.3s_ease-out]
          ${styles.bg} ${styles.text}
          ${className}
        `}
        role="alert"
        {...props}
      >
        <svg
          className="h-5 w-5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={styles.icon} />
        </svg>
        <span className="font-medium">{message}</span>
      </div>
    </>
  );
}

// Simple success/error feedback for answers
interface AnswerFeedbackProps {
  isCorrect: boolean | null;
  correctAnswer?: number | string;
  showText?: boolean;
}

export function AnswerFeedback({ isCorrect, correctAnswer, showText = true }: AnswerFeedbackProps) {
  const { celebrateCorrect, encourageRetry } = useAudio();
  const hasPlayedRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (isCorrect !== null && hasPlayedRef.current !== isCorrect) {
      hasPlayedRef.current = isCorrect;
      if (isCorrect) {
        celebrateCorrect();
      } else {
        encourageRetry();
      }
    }
    if (isCorrect === null) {
      hasPlayedRef.current = null;
    }
  }, [isCorrect, celebrateCorrect, encourageRetry]);

  if (isCorrect === null) return null;

  if (isCorrect) {
    return (
      <>
        <Confetti count={40} />
        <div className="flex items-center gap-2 text-sage animate-celebrate">
          <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {showText && <span className="font-display font-bold">Correct!</span>}
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 text-coral animate-shake">
      <div className="flex items-center gap-2">
        <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {showText && <span className="font-display font-bold">Try again!</span>}
      </div>
      {showText && correctAnswer !== undefined && (
        <span className="text-sm text-chocolate/60">
          The answer was {correctAnswer}
        </span>
      )}
    </div>
  );
}
