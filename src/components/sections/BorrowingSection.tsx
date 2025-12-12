'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardTitle, CardContent, Button, AnswerFeedback, StepIcon } from '@/components/common';
import { StackedProblem, BorrowRow, Timeline, BorrowVisualization } from '@/components/math';
import { generateBorrowProblem } from '@/lib/problemGenerators';
import { calculateBorrowAdjustments, padNumber } from '@/lib/mathUtils';
import { useAudio } from '@/hooks/useAudio';
import type { Problem } from '@/types';

type Mode = 'demo' | 'practice';

interface DemoStep {
  label: string;
  description: string;
  narration: string;
}

const DEMO_STEPS: DemoStep[] = [
  { label: 'Start', description: 'Look at the problem', narration: 'Look at the problem!' },
  { label: 'Check', description: 'Can we subtract the ones?', narration: 'Can we subtract?' },
  { label: 'Borrow', description: 'Borrow from the tens', narration: 'Borrow from next door!' },
  { label: 'Ones', description: 'Subtract the ones', narration: 'Subtract the ones!' },
  { label: 'Tens', description: 'Subtract the tens', narration: 'Subtract the tens!' },
  { label: 'Hundreds', description: 'Subtract the hundreds', narration: 'Subtract the hundreds!' },
  { label: 'Done', description: 'Final answer!', narration: 'Done! Great job!' },
];

export function BorrowingSection() {
  const { speak, playSound, clickSound } = useAudio();
  const [mode, setMode] = useState<Mode>('demo');
  const [problem, setProblem] = useState<Problem | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Demo state
  const [displayDigits, setDisplayDigits] = useState<number[]>([]);
  const [borrowed, setBorrowed] = useState<boolean[]>([]);
  const [receivedBorrow, setReceivedBorrow] = useState<boolean[]>([]);
  const [visibleAnswerDigits, setVisibleAnswerDigits] = useState<string[]>([]);
  const [borrowVizData, setBorrowVizData] = useState<{
    topDigit: number;
    bottomDigit: number;
    showBorrow: boolean;
    visible: boolean;
  } | null>(null);

  // Practice state
  const [practiceDisplayDigits, setPracticeDisplayDigits] = useState<number[]>([]);
  const [practiceBorrowed, setPracticeBorrowed] = useState<boolean[]>([]);
  const [practiceReceived, setPracticeReceived] = useState<boolean[]>([]);
  const [answerInputs, setAnswerInputs] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const totalLen = 3; // Always use 3 digits for borrowing problems

  const generateNewProblem = useCallback(() => {
    const newProblem = generateBorrowProblem();
    setProblem(newProblem);

    const num1Digits = padNumber(newProblem.num1, totalLen).split('').map(Number);

    // Demo state
    setDisplayDigits(num1Digits);
    setBorrowed(Array(totalLen).fill(false));
    setReceivedBorrow(Array(totalLen).fill(false));
    setVisibleAnswerDigits(Array(totalLen).fill(''));
    setCurrentStep(0);
    setBorrowVizData(null);

    // Practice state
    setPracticeDisplayDigits(num1Digits);
    setPracticeBorrowed(Array(totalLen).fill(false));
    setPracticeReceived(Array(totalLen).fill(false));
    setAnswerInputs(Array(totalLen).fill(''));
    setIsCorrect(null);
  }, []);

  useEffect(() => {
    generateNewProblem();
  }, [generateNewProblem]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Compute state for a given step
  const computeStateForStep = useCallback((targetStep: number, shouldSpeak = true) => {
    if (!problem) return;

    const { borrows, adjusted } = calculateBorrowAdjustments(problem.num1, problem.num2, totalLen);
    const answerStr = padNumber(problem.answer, totalLen);
    const originalDigits = padNumber(problem.num1, totalLen).split('').map(Number);
    const bottomDigits = padNumber(problem.num2, totalLen).split('').map(Number);

    // Initialize state
    let newDisplayDigits = [...originalDigits];
    const newBorrowed = Array(totalLen).fill(false) as boolean[];
    const newReceived = Array(totalLen).fill(false) as boolean[];
    const newAnswerDigits = Array(totalLen).fill('') as string[];
    let newBorrowVizData: typeof borrowVizData = null;

    if (targetStep >= 1) {
      const topDigit = originalDigits[totalLen - 1];
      const bottomDigit = bottomDigits[totalLen - 1];
      if (targetStep === 1) {
        newBorrowVizData = {
          topDigit,
          bottomDigit,
          showBorrow: false,
          visible: true,
        };
      }
    }

    if (targetStep >= 2) {
      if (borrows[totalLen - 1]) {
        newDisplayDigits = [...adjusted];
        newReceived[totalLen - 1] = true;
        // Mark ALL columns that were borrowed from (compare adjusted vs original)
        for (let k = 0; k < totalLen - 1; k++) {
          if (adjusted[k] < originalDigits[k]) {
            newBorrowed[k] = true;
          }
        }
        if (targetStep === 2) {
          newBorrowVizData = {
            topDigit: originalDigits[totalLen - 1],
            bottomDigit: bottomDigits[totalLen - 1],
            showBorrow: true,
            visible: true,
          };
        }
      } else {
        if (targetStep === 2) {
          newBorrowVizData = null;
        }
      }
    }

    if (targetStep >= 3) {
      newAnswerDigits[totalLen - 1] = answerStr[totalLen - 1];
      newDisplayDigits = [...adjusted];
      // Mark ALL columns that were borrowed from (compare adjusted vs original)
      for (let k = 0; k < totalLen - 1; k++) {
        if (adjusted[k] < originalDigits[k]) {
          newBorrowed[k] = true;
        }
      }
      if (borrows[totalLen - 2]) {
        newReceived[totalLen - 2] = true;
      }
      if (targetStep === 3) {
        newBorrowVizData = null;
      }
    }

    if (targetStep >= 4) {
      newAnswerDigits[totalLen - 2] = answerStr[totalLen - 2];
      if (targetStep === 4) {
        newBorrowVizData = null;
      }
    }

    if (targetStep >= 5) {
      newAnswerDigits[totalLen - 3] = answerStr[totalLen - 3];
      if (targetStep === 5) {
        newBorrowVizData = null;
      }
    }

    if (targetStep >= 6) {
      newBorrowVizData = null;
    }

    setDisplayDigits(newDisplayDigits);
    setBorrowed(newBorrowed);
    setReceivedBorrow(newReceived);
    setVisibleAnswerDigits(newAnswerDigits);
    setBorrowVizData(newBorrowVizData);
    setCurrentStep(targetStep);

    // Narrate the step
    if (shouldSpeak && DEMO_STEPS[targetStep]) {
      speak(DEMO_STEPS[targetStep].narration);
    }
  }, [problem, speak]);

  // Go to a specific step
  const goToStep = useCallback((targetStep: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      setIsPlaying(false);
    }
    computeStateForStep(targetStep);
  }, [computeStateForStep]);

  const handleModeChange = (newMode: Mode) => {
    clickSound();
    setMode(newMode);
    stopDemo();
    generateNewProblem();
    speak(newMode === 'demo' ? 'Demo mode! Watch and learn!' : 'Practice mode! Try it yourself!');
  };

  const playDemo = () => {
    if (!problem) return;
    clickSound();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    goToStep(0);
    setIsPlaying(true);

    let step = 0;
    intervalRef.current = setInterval(() => {
      step++;
      if (step >= DEMO_STEPS.length) {
        setIsPlaying(false);
        playSound('celebrate');
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        return;
      }
      computeStateForStep(step);
    }, 1500);
  };

  const stopDemo = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleBorrowClick = (receiverIndex: number) => {
    if (isCorrect !== null || receiverIndex === 0) return;

    const giverIndex = receiverIndex - 1;
    if (practiceDisplayDigits[giverIndex] <= 0) return;
    if (practiceReceived[receiverIndex]) return;

    if (!problem) return;
    const bottomDigits = padNumber(problem.num2, totalLen).split('').map(Number);

    if (practiceDisplayDigits[receiverIndex] >= bottomDigits[receiverIndex]) return;

    playSound('whoosh');
    speak('Borrow!');

    const newDisplayDigits = [...practiceDisplayDigits];
    const newBorrowed = [...practiceBorrowed];
    const newReceived = [...practiceReceived];

    newDisplayDigits[giverIndex] -= 1;
    newDisplayDigits[receiverIndex] += 10;
    newBorrowed[giverIndex] = true;
    newReceived[receiverIndex] = true;

    setPracticeDisplayDigits(newDisplayDigits);
    setPracticeBorrowed(newBorrowed);
    setPracticeReceived(newReceived);
  };

  const checkPracticeAnswer = () => {
    if (!problem) return;
    playSound('click');

    const expectedAnswer = padNumber(problem.answer, totalLen);
    const correct = answerInputs.join('') === expectedAnswer;

    setIsCorrect(correct);
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="elevated">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <CardTitle>Borrowing</CardTitle>
          <div className="flex gap-2">
            <button
              onClick={() => handleModeChange('demo')}
              className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 ${
                mode === 'demo' ? 'bg-coral text-cream scale-110' : 'bg-chocolate/10 text-chocolate/60 hover:bg-chocolate/20'
              }`}
              aria-label="Demo mode"
            >
              <StepIcon type="start" size="lg" />
            </button>
            <button
              onClick={() => handleModeChange('practice')}
              className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 ${
                mode === 'practice' ? 'bg-sage text-cream scale-110' : 'bg-chocolate/10 text-chocolate/60 hover:bg-chocolate/20'
              }`}
              aria-label="Practice mode"
            >
              <StepIcon type="check" size="lg" />
            </button>
          </div>
        </div>
      </Card>

      {mode === 'demo' ? (
        <div className="space-y-6">
          {/* Timeline - Clickable */}
          <Card>
            <CardContent>
              <Timeline
                steps={DEMO_STEPS}
                currentStep={currentStep}
                onStepClick={goToStep}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex flex-col items-center gap-6">
                {problem && (
                  <StackedProblem
                    num1={problem.num1}
                    num2={problem.num2}
                    operation="subtraction"
                    borrowRow={
                      <BorrowRow
                        originalDigits={padNumber(problem.num1, totalLen).split('').map(Number)}
                        displayDigits={displayDigits}
                        borrowed={borrowed}
                        receivedBorrow={receivedBorrow}
                      />
                    }
                    answer={visibleAnswerDigits}
                    interactive={false}
                  />
                )}

                {/* Borrow Visualization during demo */}
                {borrowVizData && borrowVizData.visible && (
                  <BorrowVisualization
                    topDigit={borrowVizData.topDigit}
                    bottomDigit={borrowVizData.bottomDigit}
                    showBorrow={borrowVizData.showBorrow}
                    visible={borrowVizData.visible}
                  />
                )}

                <div className="flex gap-3">
                  {isPlaying ? (
                    <Button variant="secondary" onClick={() => { clickSound(); stopDemo(); }} aria-label="Stop">
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="6" width="12" height="12" rx="1" />
                      </svg>
                    </Button>
                  ) : (
                    <>
                      <Button onClick={playDemo} aria-label="Play demo">
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </Button>
                      <Button variant="ghost" onClick={() => { clickSound(); generateNewProblem(); }} aria-label="New problem">
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                        </svg>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center gap-6">
              {/* Score as dots */}
              <div className="flex items-center gap-2">
                {Array.from({ length: score.total }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-3 w-3 rounded-full ${
                      i < score.correct ? 'bg-sage' : 'bg-coral/50'
                    }`}
                  />
                ))}
                {score.total === 0 && (
                  <div className="h-3 w-12 rounded-full bg-chocolate/10" />
                )}
              </div>

              {/* Visual hint: borrow icon */}
              <div className="flex items-center gap-2 text-chocolate/40">
                <StepIcon type="borrow" size="lg" />
                <span className="font-display text-sm">?</span>
              </div>

              {problem && (
                <StackedProblem
                  num1={problem.num1}
                  num2={problem.num2}
                  operation="subtraction"
                  borrowRow={
                    <BorrowRow
                      originalDigits={padNumber(problem.num1, totalLen).split('').map(Number)}
                      displayDigits={practiceDisplayDigits}
                      borrowed={practiceBorrowed}
                      receivedBorrow={practiceReceived}
                      interactive={isCorrect === null}
                      onBorrowClick={handleBorrowClick}
                      bottomDigits={padNumber(problem.num2, totalLen).split('').map(Number)}
                    />
                  }
                  answer={answerInputs}
                  onDigitChange={(i, v) => {
                    playSound('pop');
                    const newInputs = [...answerInputs];
                    newInputs[i] = v.replace(/[^0-9]/g, '').slice(-1);
                    setAnswerInputs(newInputs);
                  }}
                  interactive={isCorrect === null}
                />
              )}

              <AnswerFeedback isCorrect={isCorrect} showText={false} />

              <div className="flex gap-3">
                {isCorrect === null ? (
                  <Button
                    onClick={checkPracticeAnswer}
                    disabled={answerInputs.some((d) => d === '')}
                    size="lg"
                    aria-label="Check answer"
                  >
                    <StepIcon type="check" size="lg" />
                  </Button>
                ) : (
                  <Button onClick={() => { clickSound(); generateNewProblem(); }} size="lg" aria-label="Next problem">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
