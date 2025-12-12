'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { updateLetters, addLetterLearned, addStars } from '@/store/sessionSlice';
import { Card, Button, Feedback } from '@/components/common';
import { useAudio } from '@/hooks/useAudio';

type Mode = 'explore' | 'quiz';
type LetterCase = 'uppercase' | 'lowercase' | 'both';

interface QuizState {
  targetLetter: string;
  options: string[];
  correctIndex: number;
  questionType: 'find-letter' | 'match-case';
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Simple phonetic sounds for each letter (child-friendly approximations)
const LETTER_SOUNDS: Record<string, string> = {
  A: 'ay', B: 'bee', C: 'see', D: 'dee', E: 'ee',
  F: 'eff', G: 'jee', H: 'aych', I: 'eye', J: 'jay',
  K: 'kay', L: 'ell', M: 'em', N: 'en', O: 'oh',
  P: 'pee', Q: 'cue', R: 'are', S: 'ess', T: 'tee',
  U: 'you', V: 'vee', W: 'double-you', X: 'ex', Y: 'why',
  Z: 'zee',
};

// Example words for each letter
const LETTER_WORDS: Record<string, string> = {
  A: 'apple', B: 'ball', C: 'cat', D: 'dog', E: 'elephant',
  F: 'fish', G: 'goat', H: 'hat', I: 'ice cream', J: 'jump',
  K: 'kite', L: 'lion', M: 'moon', N: 'nest', O: 'orange',
  P: 'pig', Q: 'queen', R: 'rabbit', S: 'sun', T: 'tree',
  U: 'umbrella', V: 'van', W: 'water', X: 'x-ray', Y: 'yellow',
  Z: 'zebra',
};

// Colors for each letter (cycling through theme colors)
const LETTER_COLORS = ['coral', 'sage', 'yellow', 'sky'] as const;
type LetterColor = typeof LETTER_COLORS[number];

// Static Tailwind class maps to ensure classes are included in production builds
const COLOR_CLASSES: Record<LetterColor, {
  gradient: string;
  text: string;
  textMuted: string;
  bgCurrent: string;
  bgLearned: string;
  textLearned: string;
}> = {
  coral: {
    gradient: 'bg-gradient-to-br from-coral/20 to-coral/10',
    text: 'text-coral',
    textMuted: 'text-coral/60',
    bgCurrent: 'bg-coral text-cream scale-110 shadow-soft',
    bgLearned: 'bg-coral/20 text-coral',
    textLearned: 'text-coral',
  },
  sage: {
    gradient: 'bg-gradient-to-br from-sage/20 to-sage/10',
    text: 'text-sage',
    textMuted: 'text-sage/60',
    bgCurrent: 'bg-sage text-cream scale-110 shadow-soft',
    bgLearned: 'bg-sage/20 text-sage',
    textLearned: 'text-sage',
  },
  yellow: {
    gradient: 'bg-gradient-to-br from-yellow/20 to-yellow/10',
    text: 'text-yellow',
    textMuted: 'text-yellow/60',
    bgCurrent: 'bg-yellow text-cream scale-110 shadow-soft',
    bgLearned: 'bg-yellow/20 text-yellow',
    textLearned: 'text-yellow',
  },
  sky: {
    gradient: 'bg-gradient-to-br from-sky/20 to-sky/10',
    text: 'text-sky',
    textMuted: 'text-sky/60',
    bgCurrent: 'bg-sky text-cream scale-110 shadow-soft',
    bgLearned: 'bg-sky/20 text-sky',
    textLearned: 'text-sky',
  },
};

export function LettersSection() {
  const dispatch = useAppDispatch();
  const { speak, clickSound, playSound } = useAudio();
  const lettersProgress = useAppSelector((state) => state.session.letters);

  const [mode, setMode] = useState<Mode>('explore');
  const [letterCase, setLetterCase] = useState<LetterCase>('uppercase');
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [streak, setStreak] = useState(0);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });

  const currentLetter = ALPHABET[currentLetterIndex];
  const displayLetter = letterCase === 'lowercase' ? currentLetter.toLowerCase() : currentLetter;
  const letterColor = LETTER_COLORS[currentLetterIndex % LETTER_COLORS.length];

  // Speak letter when it changes in explore mode
  useEffect(() => {
    if (mode === 'explore' && currentLetter) {
      const timer = setTimeout(() => {
        speak(`${currentLetter}! ${currentLetter} is for ${LETTER_WORDS[currentLetter]}!`);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentLetter, mode, speak]);

  const handleNextLetter = () => {
    clickSound();
    setCurrentLetterIndex((idx) => (idx + 1) % ALPHABET.length);
  };

  const handlePrevLetter = () => {
    clickSound();
    setCurrentLetterIndex((idx) => (idx - 1 + ALPHABET.length) % ALPHABET.length);
  };

  const handleLetterClick = (index: number) => {
    clickSound();
    setCurrentLetterIndex(index);
  };

  const handleSpeakLetter = () => {
    clickSound();
    speak(`${currentLetter}! ${LETTER_SOUNDS[currentLetter]}! ${currentLetter} is for ${LETTER_WORDS[currentLetter]}!`);
  };

  const generateQuiz = useCallback(() => {
    const questionType = Math.random() > 0.5 ? 'find-letter' : 'match-case';
    const targetIndex = Math.floor(Math.random() * ALPHABET.length);
    const targetLetter = ALPHABET[targetIndex];

    let options: string[];
    let correctIndex: number;

    if (questionType === 'find-letter') {
      // Find the letter among 4 options
      const otherLetters = ALPHABET.filter((l) => l !== targetLetter)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      options = [...otherLetters, targetLetter].sort(() => Math.random() - 0.5);
      correctIndex = options.indexOf(targetLetter);

      setTimeout(() => {
        speak(`Find the letter ${targetLetter}!`);
      }, 500);
    } else {
      // Match uppercase to lowercase
      const isUpperTarget = Math.random() > 0.5;
      const displayTarget = isUpperTarget ? targetLetter : targetLetter.toLowerCase();
      const correctOption = isUpperTarget ? targetLetter.toLowerCase() : targetLetter;

      const otherOptions = ALPHABET
        .filter((l) => l !== targetLetter)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((l) => (isUpperTarget ? l.toLowerCase() : l));

      options = [...otherOptions, correctOption].sort(() => Math.random() - 0.5);
      correctIndex = options.indexOf(correctOption);

      setTimeout(() => {
        speak(`Find the match for ${displayTarget}!`);
      }, 500);
    }

    setQuiz({ targetLetter, options, correctIndex, questionType });
    setFeedback(null);
  }, [speak]);

  const handleStartQuiz = () => {
    clickSound();
    setMode('quiz');
    setQuizScore({ correct: 0, total: 0 });
    setStreak(0);
    generateQuiz();
  };

  const handleQuizAnswer = (selectedIndex: number) => {
    if (!quiz || feedback) return;

    const isCorrect = selectedIndex === quiz.correctIndex;
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      playSound('correct');
      speak('Great job!');
      setStreak((s) => s + 1);
      setQuizScore((s) => ({ correct: s.correct + 1, total: s.total + 1 }));

      // Mark letter as learned
      dispatch(addLetterLearned(quiz.targetLetter));
      dispatch(updateLetters({
        questionsCorrect: lettersProgress.questionsCorrect + 1,
        questionsAttempted: lettersProgress.questionsAttempted + 1,
        bestStreak: Math.max(lettersProgress.bestStreak, streak + 1),
      }));

      // Award stars
      if ((streak + 1) % 5 === 0) {
        dispatch(addStars(1));
        playSound('celebrate');
      }
    } else {
      playSound('incorrect');
      speak(`That was ${quiz.options[selectedIndex]}. The answer is ${quiz.options[quiz.correctIndex]}.`);
      setStreak(0);
      setQuizScore((s) => ({ correct: s.correct, total: s.total + 1 }));
      dispatch(updateLetters({
        questionsAttempted: lettersProgress.questionsAttempted + 1,
      }));
    }

    // Move to next question after delay
    setTimeout(() => {
      generateQuiz();
    }, 2000);
  };

  const handleBackToExplore = () => {
    clickSound();
    setMode('explore');
    setQuiz(null);
    setFeedback(null);
  };

  return (
    <div className="space-y-8 animate-fade-slide-in">
      {/* Header */}
      <Card variant="elevated">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-chocolate">Letters & ABC</h2>
            <p className="text-chocolate-muted">Learn the alphabet!</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-sky">{lettersProgress.lettersLearned.length}</div>
              <div className="text-xs text-chocolate-muted">of 26 Letters</div>
            </div>
            {mode === 'explore' ? (
              <Button onClick={handleStartQuiz} variant="primary">
                Start Quiz
              </Button>
            ) : (
              <Button onClick={handleBackToExplore} variant="ghost">
                Back to Explore
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Case Toggle */}
      {mode === 'explore' && (
        <div className="flex justify-center gap-2">
          {(['uppercase', 'lowercase', 'both'] as const).map((caseOption) => (
            <button
              key={caseOption}
              onClick={() => {
                clickSound();
                setLetterCase(caseOption);
              }}
              className={`rounded-full px-4 py-2 font-body text-sm font-medium transition-all ${
                letterCase === caseOption
                  ? 'bg-sky text-cream shadow-soft'
                  : 'bg-paper text-chocolate hover:bg-sky/10'
              }`}
            >
              {caseOption === 'uppercase' ? 'ABC' : caseOption === 'lowercase' ? 'abc' : 'Aa'}
            </button>
          ))}
        </div>
      )}

      {mode === 'explore' ? (
        /* Explore Mode - Letter Display */
        <Card variant="elevated" className="text-center">
          <div className="space-y-8 py-8">
            {/* Letter Display */}
            <button
              key={currentLetter}
              onClick={handleSpeakLetter}
              className={`group mx-auto block rounded-3xl ${COLOR_CLASSES[letterColor].gradient} px-16 py-12 transition-all hover:scale-105 hover:shadow-lifted animate-bounceIn`}
            >
              <div className="flex items-center justify-center gap-4">
                {letterCase === 'both' ? (
                  <>
                    <span className={`font-display text-8xl font-bold ${COLOR_CLASSES[letterColor].text}`}>
                      {currentLetter}
                    </span>
                    <span className={`font-display text-6xl font-bold ${COLOR_CLASSES[letterColor].textMuted}`}>
                      {currentLetter.toLowerCase()}
                    </span>
                  </>
                ) : (
                  <span className={`font-display text-9xl font-bold ${COLOR_CLASSES[letterColor].text}`}>
                    {displayLetter}
                  </span>
                )}
              </div>
              <div className="mt-6 space-y-2">
                <p className="font-display text-2xl text-chocolate">
                  {currentLetter} is for <span className={`font-bold ${COLOR_CLASSES[letterColor].text}`}>{LETTER_WORDS[currentLetter]}</span>
                </p>
                <div className="flex items-center justify-center gap-2 text-chocolate-muted">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                  <span className="text-sm">Tap to hear</span>
                </div>
              </div>
            </button>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4">
              <Button onClick={handlePrevLetter} variant="ghost" size="lg">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
              </Button>
              <span className="font-body text-chocolate-muted">
                {currentLetterIndex + 1} of 26
              </span>
              <Button onClick={handleNextLetter} variant="ghost" size="lg">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
                </svg>
              </Button>
            </div>

            {/* Alphabet Grid */}
            <div className="mx-auto grid max-w-lg grid-cols-7 gap-2">
              {ALPHABET.map((letter, idx) => {
                const isLearned = lettersProgress.lettersLearned.includes(letter);
                const isCurrent = idx === currentLetterIndex;
                const color = LETTER_COLORS[idx % LETTER_COLORS.length];
                const colorClasses = COLOR_CLASSES[color];

                return (
                  <button
                    key={letter}
                    onClick={() => handleLetterClick(idx)}
                    className={`aspect-square rounded-lg font-display text-lg font-bold transition-all ${
                      isCurrent
                        ? colorClasses.bgCurrent
                        : isLearned
                        ? colorClasses.bgLearned
                        : 'bg-cream text-chocolate hover:scale-105'
                    }`}
                  >
                    {letterCase === 'lowercase' ? letter.toLowerCase() : letter}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      ) : (
        /* Quiz Mode */
        <Card variant="elevated" className="text-center">
          <div className="space-y-8 py-8">
            {/* Quiz Stats */}
            <div className="flex justify-center gap-8">
              <div>
                <div className="text-3xl font-bold text-sky">{quizScore.correct}</div>
                <div className="text-sm text-chocolate-muted">Correct</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-coral">{streak}</div>
                <div className="text-sm text-chocolate-muted">Streak</div>
              </div>
            </div>

            {quiz && (
              <>
                {/* Prompt */}
                <div className="space-y-4">
                  <p className="text-lg text-chocolate-muted">
                    {quiz.questionType === 'find-letter'
                      ? 'Find the letter:'
                      : 'Find the matching letter:'}
                  </p>
                  <button
                    onClick={() => speak(quiz.targetLetter)}
                    className="mx-auto flex items-center gap-2 rounded-full bg-sky/10 px-8 py-4 text-sky transition-all hover:bg-sky/20"
                  >
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                    </svg>
                    <span className="font-display text-5xl font-bold">
                      {quiz.targetLetter}
                    </span>
                  </button>
                </div>

                {/* Options */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {quiz.options.map((option, idx) => (
                    <button
                      key={`${option}-${idx}`}
                      onClick={() => handleQuizAnswer(idx)}
                      disabled={feedback !== null}
                      className={`rounded-2xl p-6 font-display text-4xl font-bold transition-all ${
                        feedback !== null
                          ? idx === quiz.correctIndex
                            ? 'bg-sage text-cream'
                            : feedback === 'incorrect' && idx === quiz.options.indexOf(option)
                            ? 'bg-coral/50 text-cream'
                            : 'bg-cream text-chocolate-muted'
                          : 'bg-paper text-chocolate shadow-soft hover:scale-105 hover:shadow-lifted active:scale-95'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {/* Feedback */}
                {feedback && (
                  <Feedback
                    type={feedback === 'correct' ? 'success' : 'error'}
                    message={feedback === 'correct' ? 'Great job!' : `The answer was "${quiz.options[quiz.correctIndex]}"`}
                  />
                )}
              </>
            )}
          </div>
        </Card>
      )}

      {/* Progress Bar */}
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between text-sm text-chocolate-muted mb-2">
          <span>Progress</span>
          <span>{lettersProgress.lettersLearned.length} / 26 letters</span>
        </div>
        <div className="h-3 rounded-full bg-cream-dark overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky to-sage transition-all duration-500"
            style={{ width: `${(lettersProgress.lettersLearned.length / 26) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
