'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { updateSightWords, addWordLearned, addStars } from '@/store/sessionSlice';
import { Card, Button, Feedback } from '@/components/common';
import { useAudio } from '@/hooks/useAudio';
import {
  type SightWordCurriculum,
  CURRICULA,
  getSightWordLevels,
  getWordsForLevel,
  getRandomWords,
  getLevelInfo,
  getTotalLevels,
} from '@/lib/sightWordLists';

type Mode = 'explore' | 'quiz';

interface QuizState {
  word: string;
  options: string[];
  correctIndex: number;
}

export function SightWordsSection() {
  const dispatch = useAppDispatch();
  const { speak, clickSound, playSound } = useAudio();
  const sightWordsProgress = useAppSelector((state) => state.session.sightWords);

  const [curriculum, setCurriculum] = useState<SightWordCurriculum>('dolch');
  const [mode, setMode] = useState<Mode>('explore');
  const [currentLevel, setCurrentLevel] = useState(sightWordsProgress.currentLevel || 1);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [streak, setStreak] = useState(0);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });

  const levels = getSightWordLevels(curriculum);
  const totalLevels = getTotalLevels(curriculum);
  const _levelInfo = getLevelInfo(currentLevel, curriculum);
  const levelWords = getWordsForLevel(currentLevel, curriculum);
  const currentWord = levelWords[currentWordIndex] || '';

  // Speak word when it changes in explore mode
  useEffect(() => {
    if (mode === 'explore' && currentWord) {
      const timer = setTimeout(() => {
        speak(currentWord);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentWord, mode, speak]);

  const handleCurriculumChange = (newCurriculum: SightWordCurriculum) => {
    if (newCurriculum === curriculum) return;
    clickSound();
    setCurriculum(newCurriculum);
    setCurrentLevel(1);
    setCurrentWordIndex(0);
    const config = CURRICULA.find((c) => c.id === newCurriculum);
    if (config) {
      speak(`${config.name}!`);
    }
  };

  const handleNextWord = () => {
    clickSound();
    if (currentWordIndex < levelWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      setCurrentWordIndex(0);
    }
  };

  const handlePrevWord = () => {
    clickSound();
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
    } else {
      setCurrentWordIndex(levelWords.length - 1);
    }
  };

  const handleSpeakWord = () => {
    clickSound();
    speak(currentWord);
  };

  const handleLevelChange = (newLevel: number) => {
    clickSound();
    setCurrentLevel(newLevel);
    setCurrentWordIndex(0);
    dispatch(updateSightWords({ currentLevel: newLevel }));
  };

  const generateQuiz = useCallback(() => {
    const correctWord = getRandomWords(1, 1, currentLevel, curriculum)[0];
    const distractors = getRandomWords(3, 1, currentLevel, curriculum).filter((w) => w !== correctWord);

    while (distractors.length < 3) {
      const fallback = getRandomWords(1, 1, 1, curriculum)[0];
      if (fallback !== correctWord && !distractors.includes(fallback)) {
        distractors.push(fallback);
      }
    }

    const options = [correctWord, ...distractors.slice(0, 3)].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correctWord);

    setQuiz({ word: correctWord, options, correctIndex });
    setFeedback(null);

    setTimeout(() => {
      speak(`Find the word: ${correctWord}`);
    }, 500);
  }, [currentLevel, curriculum, speak]);

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

      dispatch(addWordLearned(quiz.word));
      dispatch(updateSightWords({
        questionsCorrect: sightWordsProgress.questionsCorrect + 1,
        questionsAttempted: sightWordsProgress.questionsAttempted + 1,
        bestStreak: Math.max(sightWordsProgress.bestStreak, streak + 1),
      }));

      if ((streak + 1) % 5 === 0) {
        dispatch(addStars(1));
        playSound('celebrate');
      }
    } else {
      playSound('incorrect');
      speak(`That was ${quiz.options[selectedIndex]}. The word is ${quiz.word}.`);
      setStreak(0);
      setQuizScore((s) => ({ correct: s.correct, total: s.total + 1 }));
      dispatch(updateSightWords({
        questionsAttempted: sightWordsProgress.questionsAttempted + 1,
      }));
    }

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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-chocolate">Sight Words</h2>
            <p className="text-chocolate-muted">Learn words you see every day!</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-sage">{sightWordsProgress.wordsLearned.length}</div>
              <div className="text-xs text-chocolate-muted">Words Learned</div>
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

      {/* Curriculum Selector */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm font-medium text-chocolate-muted">Word List</span>
        <div className="flex gap-2">
          {CURRICULA.map((config) => (
            <button
              key={config.id}
              onClick={() => handleCurriculumChange(config.id)}
              className={`rounded-full px-5 py-2 font-body text-sm font-medium transition-all ${
                curriculum === config.id
                  ? 'bg-coral text-cream shadow-soft'
                  : 'bg-paper text-chocolate hover:bg-coral/10'
              }`}
              title={config.description}
            >
              {config.name}
            </button>
          ))}
        </div>
      </div>

      {/* Level Selector */}
      <div className="flex flex-wrap justify-center gap-2">
        {levels.map((level) => (
          <button
            key={level.level}
            onClick={() => handleLevelChange(level.level)}
            className={`rounded-full px-4 py-2 font-body text-sm font-medium transition-all ${
              currentLevel === level.level
                ? 'bg-sage text-cream shadow-soft'
                : 'bg-paper text-chocolate hover:bg-sage/10'
            }`}
          >
            {level.name}
          </button>
        ))}
      </div>

      {mode === 'explore' ? (
        /* Explore Mode - Flashcard Style */
        <Card variant="elevated" className="text-center">
          <div className="space-y-8 py-8">
            {/* Word Display */}
            <button
              key={currentWord}
              onClick={handleSpeakWord}
              className="group mx-auto block rounded-3xl bg-gradient-to-br from-sage/20 to-sage/10 px-16 py-12 transition-all hover:scale-105 hover:shadow-lifted animate-pop-in"
            >
              <span className="font-display text-7xl font-bold text-chocolate group-hover:text-sage">
                {currentWord}
              </span>
              <div className="mt-4 flex items-center justify-center gap-2 text-chocolate-muted">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
                <span className="text-sm">Tap to hear</span>
              </div>
            </button>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4">
              <Button onClick={handlePrevWord} variant="ghost" size="lg">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
              </Button>
              <span className="font-body text-chocolate-muted">
                {currentWordIndex + 1} of {levelWords.length}
              </span>
              <Button onClick={handleNextWord} variant="ghost" size="lg">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
                </svg>
              </Button>
            </div>

            {/* Word List Preview */}
            <div className="mx-auto flex max-w-md flex-wrap justify-center gap-2">
              {levelWords.map((word, idx) => (
                <button
                  key={word}
                  onClick={() => {
                    clickSound();
                    setCurrentWordIndex(idx);
                  }}
                  className={`rounded-lg px-3 py-1 text-sm transition-all ${
                    idx === currentWordIndex
                      ? 'bg-sage text-cream'
                      : sightWordsProgress.wordsLearned.includes(word)
                      ? 'bg-sage/20 text-sage'
                      : 'bg-cream text-chocolate hover:bg-sage/10'
                  }`}
                >
                  {word}
                </button>
              ))}
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
                <div className="text-3xl font-bold text-sage">{quizScore.correct}</div>
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
                <div className="space-y-2">
                  <p className="text-lg text-chocolate-muted">Find the word:</p>
                  <button
                    onClick={() => speak(quiz.word)}
                    className="mx-auto flex items-center gap-2 rounded-full bg-sage/10 px-6 py-3 text-sage transition-all hover:bg-sage/20"
                  >
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                    </svg>
                    <span className="font-display text-xl font-bold">{quiz.word}</span>
                  </button>
                </div>

                {/* Options */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {quiz.options.map((option, idx) => (
                    <button
                      key={option}
                      onClick={() => handleQuizAnswer(idx)}
                      disabled={feedback !== null}
                      className={`rounded-2xl p-6 font-display text-2xl font-bold transition-all ${
                        feedback !== null
                          ? idx === quiz.correctIndex
                            ? 'bg-sage text-cream'
                            : feedback === 'incorrect' && quiz.options.indexOf(option) === idx
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
                    message={feedback === 'correct' ? 'Great job!' : `The word was "${quiz.word}"`}
                  />
                )}
              </>
            )}
          </div>
        </Card>
      )}

      {/* Progress Indicator */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2">
          {Array.from({ length: totalLevels }).map((_, idx) => (
            <div
              key={idx}
              className={`h-2 w-8 rounded-full transition-all ${
                idx + 1 <= currentLevel ? 'bg-sage' : 'bg-cream-dark'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
