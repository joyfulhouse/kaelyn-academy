'use client';

import { useMemo } from 'react';
import { DigitInput } from '@/components/common';
import { padNumber } from '@/lib/mathUtils';

type Operation = 'addition' | 'subtraction';

interface StackedProblemProps {
  num1: number;
  num2: number;
  operation: Operation;
  showAnswer?: boolean;
  answer?: string[];
  carryRow?: React.ReactNode;
  borrowRow?: React.ReactNode;
  onDigitChange?: (index: number, value: string) => void;
  digitStates?: ('default' | 'correct' | 'incorrect' | 'highlighted')[];
  interactive?: boolean;
  activeColumn?: number | null;
}

const operatorSymbols: Record<Operation, string> = {
  addition: '+',
  subtraction: '−',
};

export function StackedProblem({
  num1,
  num2,
  operation,
  showAnswer = false,
  answer = [],
  carryRow,
  borrowRow,
  onDigitChange,
  digitStates = [],
  interactive = true,
  activeColumn = null,
}: StackedProblemProps) {
  const correctAnswer = operation === 'addition' ? num1 + num2 : num1 - num2;

  // Calculate padding length based on answer
  const totalLength = useMemo(() => {
    return Math.max(
      num1.toString().length,
      num2.toString().length,
      correctAnswer.toString().length
    );
  }, [num1, num2, correctAnswer]);

  const paddedNum1 = padNumber(num1, totalLength);
  const paddedNum2 = padNumber(num2, totalLength);
  const paddedAnswer = padNumber(correctAnswer, totalLength);

  return (
    <div className="inline-flex flex-col items-end font-display text-3xl font-bold">
      {/* Carry row (for addition) */}
      {carryRow && <div className="mb-1 mr-0">{carryRow}</div>}

      {/* Top number (may show borrow adjustments) */}
      {borrowRow ? (
        <div className="flex">{borrowRow}</div>
      ) : (
        <div className="flex">
          {paddedNum1.split('').map((digit, i) => {
            // Hide leading zeros
            const isLeadingZero = digit === '0' && i < totalLength - num1.toString().length;
            return (
              <div
                key={`num1-${i}`}
                className={`flex h-12 w-12 items-center justify-center text-chocolate transition-all duration-200 ${
                  activeColumn === i ? 'rounded-lg bg-sky/20' : ''
                }`}
              >
                {isLeadingZero ? '' : digit}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom number with operator */}
      <div className="flex items-center border-b-4 border-chocolate pb-2">
        <span className="mr-2 text-coral">{operatorSymbols[operation]}</span>
        {paddedNum2.split('').map((digit, i) => {
          // Hide leading zeros
          const isLeadingZero = digit === '0' && i < totalLength - num2.toString().length;
          return (
            <div
              key={`num2-${i}`}
              className={`flex h-12 w-12 items-center justify-center text-chocolate transition-all duration-200 ${
                activeColumn === i ? 'rounded-lg bg-sky/20' : ''
              }`}
            >
              {isLeadingZero ? '' : digit}
            </div>
          );
        })}
      </div>

      {/* Answer row */}
      <div className="mt-2 flex">
        {showAnswer ? (
          // Show the correct answer
          paddedAnswer.split('').map((digit, i) => (
            <div
              key={`answer-${i}`}
              className="flex h-12 w-12 items-center justify-center text-sage"
            >
              {digit}
            </div>
          ))
        ) : onDigitChange ? (
          // Interactive or checked input boxes - show DigitInput when there's a change handler
          Array.from({ length: totalLength }).map((_, i) => {
            const state = digitStates[i] || 'default';
            return (
              <DigitInput
                key={`input-${i}`}
                value={answer[i] || ''}
                onChange={(e) => onDigitChange?.(i, e.target.value)}
                error={state === 'incorrect'}
                success={state === 'correct'}
                highlighted={state === 'highlighted'}
                disabled={!interactive}
                className="mx-0.5"
              />
            );
          })
        ) : (
          // Demo mode: show answer digits as they're revealed, or placeholder if not yet revealed
          Array.from({ length: totalLength }).map((_, i) => (
            <div
              key={`placeholder-${i}-${answer[i] || 'empty'}`}
              className={`mx-0.5 flex h-14 w-12 items-center justify-center rounded-xl border-2 font-display text-2xl transition-all duration-300 ${
                answer[i]
                  ? 'border-sage bg-sage/10 text-sage animate-pop-in'
                  : 'border-dashed border-chocolate/20 text-chocolate/30'
              }`}
            >
              {answer[i] || '?'}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
