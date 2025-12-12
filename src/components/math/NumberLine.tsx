'use client';

import { useEffect, useRef, useCallback, useReducer } from 'react';

interface NumberLineProps {
  min?: number;
  max?: number;
  start?: number;
  operation?: 'add' | 'subtract' | null;
  amount?: number;
  onPositionChange?: (position: number) => void;
  interactive?: boolean;
}

interface NumberLineState {
  position: number;
  hops: number[];
  animating: boolean;
  startKey: number; // tracks which start value this state was initialized from
}

type NumberLineAction =
  | { type: 'SET_POSITION'; position: number }
  | { type: 'ADD_HOP'; hop: number }
  | { type: 'CLEAR_HOPS' }
  | { type: 'SET_ANIMATING'; animating: boolean }
  | { type: 'RESET'; start: number };

function numberLineReducer(state: NumberLineState, action: NumberLineAction): NumberLineState {
  switch (action.type) {
    case 'SET_POSITION':
      return { ...state, position: action.position };
    case 'ADD_HOP':
      return { ...state, hops: [...state.hops, action.hop], position: action.hop };
    case 'CLEAR_HOPS':
      return { ...state, hops: [] };
    case 'SET_ANIMATING':
      return { ...state, animating: action.animating };
    case 'RESET':
      return { ...state, position: action.start, hops: [], startKey: action.start };
    default:
      return state;
  }
}

export function NumberLine({
  min = 0,
  max = 20,
  start = 0,
  operation = null,
  amount = 0,
  onPositionChange,
  interactive = true,
}: NumberLineProps) {
  const [state, dispatch] = useReducer(numberLineReducer, {
    position: start,
    hops: [],
    animating: false,
    startKey: start,
  });

  const { position, hops, animating, startKey } = state;

  // Store callbacks in refs to avoid effect dependency issues
  const onPositionChangeRef = useRef(onPositionChange);

  // Sync callback ref with prop changes
  useEffect(() => {
    onPositionChangeRef.current = onPositionChange;
  }, [onPositionChange]);

  // Reset when start prop changes - tracked via startKey in reducer state
  useEffect(() => {
    if (start !== startKey) {
      dispatch({ type: 'RESET', start });
    }
  }, [start, startKey]);

  // Memoized position change handler
  const notifyPositionChange = useCallback((newPos: number) => {
    onPositionChangeRef.current?.(newPos);
  }, []);

  // Animate hops when operation and amount are provided
  useEffect(() => {
    if (!operation || amount <= 0 || animating) return;

    let cancelled = false;

    const runAnimation = async () => {
      dispatch({ type: 'SET_ANIMATING', animating: true });
      dispatch({ type: 'CLEAR_HOPS' });

      const direction = operation === 'add' ? 1 : -1;
      let currentPos = position;

      for (let i = 0; i < amount; i++) {
        if (cancelled) break;
        await new Promise(resolve => setTimeout(resolve, 300));
        currentPos += direction;
        currentPos = Math.max(min, Math.min(max, currentPos));
        dispatch({ type: 'ADD_HOP', hop: currentPos });
        notifyPositionChange(currentPos);
      }

      if (!cancelled) {
        dispatch({ type: 'SET_ANIMATING', animating: false });
      }
    };

    runAnimation();

    return () => {
      cancelled = true;
    };
  }, [operation, amount, position, min, max, notifyPositionChange, animating]);

  const handleNumberClick = (num: number) => {
    if (!interactive || animating) return;
    dispatch({ type: 'CLEAR_HOPS' });
    dispatch({ type: 'SET_POSITION', position: num });
    onPositionChange?.(num);
  };

  const handleJump = (direction: 'left' | 'right') => {
    if (animating) return;
    const newPos = direction === 'right'
      ? Math.min(max, position + 1)
      : Math.max(min, position - 1);

    if (newPos !== position) {
      dispatch({ type: 'ADD_HOP', hop: newPos });
      onPositionChange?.(newPos);
    }
  };

  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const lineWidth = numbers.length * 40; // 40px per number

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex flex-col items-center gap-4 min-w-fit px-4">
        {/* Jump buttons */}
        {interactive && (
          <div className="flex gap-4">
            <button
              onClick={() => handleJump('left')}
              disabled={position <= min || animating}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-coral text-cream transition-all hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
              aria-label="Jump left (subtract 1)"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
            <div className="flex items-center gap-2 rounded-full bg-cream px-4 py-2">
              <span className="font-display text-xl font-bold text-chocolate">{position}</span>
            </div>
            <button
              onClick={() => handleJump('right')}
              disabled={position >= max || animating}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-sage text-cream transition-all hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
              aria-label="Jump right (add 1)"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
              </svg>
            </button>
          </div>
        )}

        {/* Hop arcs visualization */}
        <div className="relative h-8" style={{ width: lineWidth }}>
          {hops.map((hopTo, idx) => {
            const hopFrom = idx === 0 ? start : hops[idx - 1];
            const fromX = (hopFrom - min) * 40 + 20;
            const toX = (hopTo - min) * 40 + 20;
            const direction = toX > fromX ? 1 : -1;
            const arcWidth = Math.abs(toX - fromX);
            const arcHeight = 24;

            return (
              <svg
                key={idx}
                className="absolute top-0 overflow-visible"
                style={{
                  left: Math.min(fromX, toX),
                  width: arcWidth,
                  height: arcHeight,
                }}
              >
                <path
                  d={`M ${direction > 0 ? 0 : arcWidth} ${arcHeight} Q ${arcWidth / 2} 0 ${direction > 0 ? arcWidth : 0} ${arcHeight}`}
                  fill="none"
                  stroke={operation === 'add' ? '#7B9E87' : '#E8998D'}
                  strokeWidth="2"
                  className="animate-drawPath"
                />
                {/* Arrow head */}
                <circle
                  cx={direction > 0 ? arcWidth : 0}
                  cy={arcHeight - 2}
                  r="4"
                  fill={operation === 'add' ? '#7B9E87' : '#E8998D'}
                  className="animate-fadeIn"
                />
              </svg>
            );
          })}
        </div>

        {/* Number line */}
        <div className="relative" style={{ width: lineWidth }}>
          {/* Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-chocolate/20 rounded-full" />

          {/* Tick marks and numbers */}
          <div className="flex">
            {numbers.map((num) => {
              const isPosition = num === position;
              const isStart = num === start && operation;
              const isHop = hops.includes(num);

              return (
                <div
                  key={num}
                  className="flex w-10 flex-col items-center"
                >
                  {/* Tick mark */}
                  <div
                    className={`h-3 w-0.5 transition-all ${
                      isPosition ? 'bg-sky h-5' :
                      isHop ? 'bg-sage h-4' :
                      isStart ? 'bg-coral h-4' :
                      'bg-chocolate/30'
                    }`}
                  />

                  {/* Number */}
                  <button
                    onClick={() => handleNumberClick(num)}
                    disabled={!interactive}
                    className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full font-display text-sm font-bold transition-all ${
                      isPosition
                        ? `bg-sky text-cream scale-125 shadow-soft ${animating ? 'animate-hop' : ''}`
                        : isStart && operation
                        ? 'bg-coral/20 text-coral'
                        : isHop
                        ? 'bg-sage/20 text-sage'
                        : interactive
                        ? 'text-chocolate/60 hover:bg-cream hover:text-chocolate'
                        : 'text-chocolate/60'
                    }`}
                  >
                    {num}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        {operation && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-coral/50" />
              <span className="text-chocolate-muted">Start</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-sky" />
              <span className="text-chocolate-muted">Now</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4 text-sage" viewBox="0 0 24 24">
                <path d="M2 12 Q12 2 22 12" fill="none" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span className="text-chocolate-muted">Hop</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
