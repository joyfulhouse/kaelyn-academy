'use client';

import { useState, useCallback } from 'react';
import { Card, CardTitle, CardContent, Button, AnswerFeedback, ProgressBar, StarDisplay } from '@/components/common';
import { generateProblem } from '@/lib/problemGenerators';
import { useAppDispatch } from '@/hooks/useRedux';
import { recordPracticeSession } from '@/store/sessionSlice';
import type { Problem, ProblemType, Difficulty } from '@/types';

type SessionState = 'setup' | 'active' | 'results';

const operatorSymbols: Record<ProblemType, string> = {
  addition: '+',
  subtraction: '−',
  multiplication: '×',
  division: '÷',
  mixed: '?',
};

export function PracticeSection() {
  const dispatch = useAppDispatch();
  const [sessionState, setSessionState] = useState<SessionState>('setup');

  // Setup options
  const [problemType, setProblemType] = useState<ProblemType>('mixed');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [problemCount, setProblemCount] = useState(10);

  // Session state
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [starsEarned, setStarsEarned] = useState(0);

  const startSession = useCallback(() => {
    const newProblems = Array.from({ length: problemCount }, () =>
      generateProblem(problemType, difficulty)
    );
    setProblems(newProblems);
    setCurrentIndex(0);
    setUserAnswer('');
    setIsCorrect(null);
    setResults([]);
    setStarsEarned(0);
    setSessionState('active');
  }, [problemType, difficulty, problemCount]);

  const checkAnswer = () => {
    const problem = problems[currentIndex];
    const correct = parseInt(userAnswer) === problem.answer;
    setIsCorrect(correct);
    setResults((prev) => [...prev, correct]);
  };

  const nextProblem = () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer('');
      setIsCorrect(null);
    } else {
      // Session complete
      finishSession();
    }
  };

  const finishSession = async () => {
    const answeredCorrect = results.filter(Boolean).length;
    const totalCount = problems.length || results.length;

    try {
      const result = await dispatch(
        recordPracticeSession({
          correct: answeredCorrect,
          total: totalCount,
          type: problemType,
        })
      ).unwrap();

      setStarsEarned(result.starsEarned);
    } catch {
      // Calculate stars locally if API fails
      const score = totalCount ? Math.round((answeredCorrect / totalCount) * 100) : 0;
      if (score >= 100) setStarsEarned(5);
      else if (score >= 80) setStarsEarned(4);
      else if (score >= 60) setStarsEarned(3);
      else if (score >= 40) setStarsEarned(2);
      else if (score >= 20) setStarsEarned(1);
    }

    setSessionState('results');
  };

  const currentProblem = problems[currentIndex];
  const correctCount = results.filter(Boolean).length;
  const totalAnswered = results.length;
  const totalCount = problems.length;
  const finalPercentage = totalCount ? Math.round((correctCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="elevated">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Practice</CardTitle>
            <p className="mt-1 font-body text-chocolate/70">
              Test your math skills and earn stars!
            </p>
          </div>
          {sessionState !== 'setup' && (
            <Button
              variant="ghost"
              onClick={() => setSessionState('setup')}
            >
              New Session
            </Button>
          )}
        </div>
      </Card>

      {sessionState === 'setup' && (
        <Card>
          <CardTitle>Session Settings</CardTitle>
          <CardContent className="mt-4 space-y-6">
            {/* Problem Type */}
            <div className="flex flex-col gap-2">
              <label className="font-body font-medium text-chocolate">
                Problem Type
              </label>
              <div className="flex flex-wrap gap-2">
                {(['addition', 'subtraction', 'multiplication', 'division', 'mixed'] as ProblemType[]).map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => setProblemType(type)}
                      className={`
                        rounded-xl px-4 py-2 font-display font-medium capitalize
                        transition-all duration-200
                        ${
                          problemType === type
                            ? 'bg-coral text-cream'
                            : 'bg-cream text-chocolate hover:bg-coral/20'
                        }
                      `}
                    >
                      {type}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Difficulty */}
            <div className="flex flex-col gap-2">
              <label className="font-body font-medium text-chocolate">
                Difficulty
              </label>
              <div className="flex flex-wrap gap-2">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`
                      rounded-xl px-4 py-2 font-display font-medium capitalize
                      transition-all duration-200
                      ${
                        difficulty === diff
                          ? 'bg-sage text-cream'
                          : 'bg-cream text-chocolate hover:bg-sage/20'
                      }
                    `}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Problem Count */}
            <div className="flex flex-col gap-2">
              <label className="font-body font-medium text-chocolate">
                Number of Problems
              </label>
              <div className="flex flex-wrap gap-2">
                {[5, 10, 15, 20].map((count) => (
                  <button
                    key={count}
                    onClick={() => setProblemCount(count)}
                    className={`
                      rounded-xl px-4 py-2 font-display font-medium
                      transition-all duration-200
                      ${
                        problemCount === count
                          ? 'bg-yellow text-chocolate'
                          : 'bg-cream text-chocolate hover:bg-yellow/20'
                      }
                    `}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={startSession} size="lg" className="w-full">
              Start Practice
            </Button>
          </CardContent>
        </Card>
      )}

      {sessionState === 'active' && currentProblem && (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center gap-6">
              {/* Progress */}
              <div className="w-full max-w-md">
                <div className="mb-2 flex justify-between font-body text-sm text-chocolate/70">
                  <span>
                    Problem {currentIndex + 1} of {problems.length}
                  </span>
                  <span>
                    {correctCount}/{totalAnswered} correct
                  </span>
                </div>
                <ProgressBar
                  value={currentIndex + 1}
                  max={problems.length}
                  color="coral"
                />
              </div>

              {/* Problem */}
              <div className="text-center">
                <p className="font-display text-4xl font-bold text-chocolate">
                  {currentProblem.num1} {operatorSymbols[currentProblem.type]}{' '}
                  {currentProblem.num2} = ?
                </p>
              </div>

              {/* Answer Input */}
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && userAnswer) {
                    if (isCorrect === null) {
                      checkAnswer();
                    } else {
                      nextProblem();
                    }
                  }
                }}
                disabled={isCorrect !== null}
                className="w-32 rounded-xl border-2 border-chocolate/20 bg-cream px-4 py-3 text-center font-display text-3xl font-bold text-chocolate outline-none focus:border-coral disabled:opacity-50"
                placeholder="?"
                autoFocus
              />

              {/* Feedback */}
              <AnswerFeedback
                isCorrect={isCorrect}
                correctAnswer={currentProblem.answer}
              />

              {/* Buttons */}
              <div className="flex gap-3">
                {isCorrect === null ? (
                  <Button onClick={checkAnswer} disabled={!userAnswer}>
                    Check Answer
                  </Button>
                ) : (
                  <Button onClick={nextProblem}>
                    {currentIndex < problems.length - 1
                      ? 'Next Problem'
                      : 'See Results'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {sessionState === 'results' && (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center gap-6 text-center">
              <h3 className="font-display text-3xl font-bold text-chocolate">
                Practice Complete!
              </h3>

              {/* Score */}
              <div className="rounded-2xl bg-cream px-8 py-6">
                <p className="font-display text-6xl font-bold text-coral">
                  {finalPercentage}
                  %
                </p>
                <p className="mt-2 font-body text-chocolate/70">
                  {correctCount} out of {problems.length} correct
                </p>
              </div>

              {/* Stars Earned */}
              <div className="flex flex-col items-center gap-2">
                <p className="font-body text-chocolate/70">Stars Earned</p>
                <StarDisplay count={starsEarned} size="lg" />
              </div>

              {/* Performance Message */}
              <p className="font-body text-lg text-chocolate">
                {starsEarned >= 5
                  ? 'Perfect! You&apos;re a math superstar!'
                  : starsEarned >= 4
                    ? 'Great job! Almost perfect!'
                    : starsEarned >= 3
                      ? 'Good work! Keep practicing!'
                      : starsEarned >= 2
                        ? 'Nice try! You&apos;re getting better!'
                        : 'Keep practicing, you&apos;ll improve!'}
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={startSession}>Practice Again</Button>
                <Button variant="ghost" onClick={() => setSessionState('setup')}>
                  Change Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
