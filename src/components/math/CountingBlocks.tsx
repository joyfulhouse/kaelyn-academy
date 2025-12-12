'use client';

import { useState, useEffect } from 'react';

interface CountingBlocksProps {
  num1: number;
  num2?: number;
  operation?: 'add' | 'subtract' | 'multiply' | 'divide' | null;
  maxBlocks?: number;
  interactive?: boolean;
  onCountChange?: (count: number) => void;
}

const COLORS = ['coral', 'sage', 'sky', 'yellow'];

export function CountingBlocks({
  num1,
  num2 = 0,
  operation = null,
  maxBlocks = 50,
  interactive = true,
  onCountChange,
}: CountingBlocksProps) {
  const [count, setCount] = useState(0);
  const [highlighted, setHighlighted] = useState<Set<number>>(new Set());

  // Reset when numbers change
  useEffect(() => {
    setCount(0);
    setHighlighted(new Set());
  }, [num1, num2, operation]);

  const displayNum1 = Math.min(num1, maxBlocks);
  const displayNum2 = num2 ? Math.min(num2, maxBlocks - displayNum1) : 0;

  const handleBlockClick = (index: number) => {
    if (!interactive) return;

    const newHighlighted = new Set(highlighted);
    if (newHighlighted.has(index)) {
      newHighlighted.delete(index);
    } else {
      newHighlighted.add(index);
    }
    setHighlighted(newHighlighted);
    setCount(newHighlighted.size);
    onCountChange?.(newHighlighted.size);
  };

  const handleCountAll = () => {
    const total = operation === 'add' ? displayNum1 + displayNum2 :
                  operation === 'subtract' ? Math.max(0, displayNum1 - displayNum2) :
                  displayNum1;
    const allIndices = new Set(Array.from({ length: total }, (_, i) => i));
    setHighlighted(allIndices);
    setCount(total);
    onCountChange?.(total);
  };

  const handleClear = () => {
    setHighlighted(new Set());
    setCount(0);
    onCountChange?.(0);
  };

  // Render blocks in rows of 10 (like a tens frame)
  const renderBlockGroup = (numBlocks: number, startIndex: number, color: string, crossed = false) => {
    const blocks = [];
    for (let i = 0; i < numBlocks; i++) {
      const globalIndex = startIndex + i;
      const isHighlighted = highlighted.has(globalIndex);
      const row = Math.floor(i / 10);
      const col = i % 10;

      blocks.push(
        <button
          key={globalIndex}
          onClick={() => handleBlockClick(globalIndex)}
          disabled={!interactive || crossed}
          className={`
            h-6 w-6 rounded transition-all duration-150 animate-blockAppear
            ${crossed
              ? 'bg-chocolate/10 opacity-50'
              : isHighlighted
              ? `bg-${color} scale-110 shadow-soft`
              : `bg-${color}/40 hover:bg-${color}/60`
            }
            ${interactive && !crossed ? 'cursor-pointer hover:scale-105' : ''}
          `}
          style={{
            gridRow: row + 1,
            gridColumn: col + 1,
            animationDelay: `${i * 0.03}s`,
          }}
          aria-label={`Block ${globalIndex + 1}${isHighlighted ? ' (counted)' : ''}`}
        >
          {crossed && (
            <svg className="h-full w-full text-coral/60" viewBox="0 0 24 24">
              <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="3" fill="none"/>
            </svg>
          )}
        </button>
      );
    }
    return blocks;
  };

  const renderDivisionGroups = () => {
    if (!num2 || num2 === 0) return null;

    const groups = Math.floor(num1 / num2);
    const remainder = num1 % num2;
    const groupElements = [];

    for (let g = 0; g < groups; g++) {
      groupElements.push(
        <div
          key={g}
          className="flex flex-wrap gap-1 rounded-lg border-2 border-dashed border-chocolate/20 p-2"
          style={{ maxWidth: '120px' }}
        >
          {Array.from({ length: num2 }, (_, i) => (
            <div
              key={i}
              className={`h-5 w-5 rounded bg-${COLORS[g % COLORS.length]}/60`}
            />
          ))}
        </div>
      );
    }

    if (remainder > 0) {
      groupElements.push(
        <div
          key="remainder"
          className="flex flex-wrap gap-1 rounded-lg border-2 border-dashed border-coral/30 p-2"
          style={{ maxWidth: '120px' }}
        >
          {Array.from({ length: remainder }, (_, i) => (
            <div key={i} className="h-5 w-5 rounded bg-coral/40" />
          ))}
          <span className="text-xs text-coral mt-1">left over</span>
        </div>
      );
    }

    return groupElements;
  };

  const renderMultiplicationGrid = () => {
    if (!num2) return null;

    const rows = Math.min(num1, 12);
    const cols = Math.min(num2, 12);

    return (
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${cols}, 1.5rem)` }}
      >
        {Array.from({ length: rows * cols }, (_, i) => {
          const row = Math.floor(i / cols);
          const isHighlighted = highlighted.has(i);
          return (
            <button
              key={i}
              onClick={() => handleBlockClick(i)}
              disabled={!interactive}
              className={`
                h-6 w-6 rounded transition-all animate-blockAppear
                ${isHighlighted
                  ? `bg-${COLORS[row % COLORS.length]} scale-105`
                  : `bg-${COLORS[row % COLORS.length]}/40 hover:bg-${COLORS[row % COLORS.length]}/60`
                }
                ${interactive ? 'cursor-pointer' : ''}
              `}
              style={{ animationDelay: `${i * 0.015}s` }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Count display */}
      <div className="flex items-center gap-4">
        <span className="font-display text-2xl font-bold text-chocolate">
          Count: <span className="text-sky">{count}</span>
        </span>
        {interactive && (
          <div className="flex gap-2">
            <button
              onClick={handleCountAll}
              className="rounded-full bg-sage/20 px-3 py-1 text-sm font-medium text-sage hover:bg-sage/30"
            >
              Count All
            </button>
            <button
              onClick={handleClear}
              className="rounded-full bg-coral/20 px-3 py-1 text-sm font-medium text-coral hover:bg-coral/30"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Blocks visualization */}
      {operation === 'multiply' ? (
        <div className="flex flex-col items-center gap-2">
          <div className="text-sm text-chocolate-muted">
            {num1} rows × {num2} columns = ?
          </div>
          {renderMultiplicationGrid()}
        </div>
      ) : operation === 'divide' ? (
        <div className="flex flex-col items-center gap-2">
          <div className="text-sm text-chocolate-muted">
            {num1} ÷ {num2} = {Math.floor(num1 / num2)} groups
            {num1 % num2 > 0 && ` with ${num1 % num2} left over`}
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {renderDivisionGroups()}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          {/* First number */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium text-coral">{num1}</span>
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: 'repeat(10, 1.5rem)' }}
            >
              {renderBlockGroup(displayNum1, 0, 'coral')}
            </div>
          </div>

          {/* Operation indicator */}
          {operation && displayNum2 > 0 && (
            <>
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl text-chocolate">
                  {operation === 'add' ? '+' : '−'}
                </span>
              </div>

              {/* Second number */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-medium text-sage">{num2}</span>
                <div
                  className="grid gap-1"
                  style={{ gridTemplateColumns: 'repeat(10, 1.5rem)' }}
                >
                  {operation === 'subtract'
                    ? renderBlockGroup(Math.min(displayNum2, displayNum1), 0, 'coral', true)
                    : renderBlockGroup(displayNum2, displayNum1, 'sage')
                  }
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Hint */}
      <p className="text-xs text-chocolate-muted text-center max-w-xs">
        {interactive
          ? 'Tap blocks to count them! Each tap adds or removes from your count.'
          : 'Count the blocks to find the answer.'}
      </p>
    </div>
  );
}
