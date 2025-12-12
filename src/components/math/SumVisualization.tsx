'use client';

interface SumVisualizationProps {
  digit1: number;
  digit2: number;
  carry?: number;
  showSplit?: boolean;
  visible?: boolean;
}

/**
 * Visual bubble showing the sum of digits with dots.
 * When sum >= 10, shows the split: "10 goes up, X stays"
 */
export function SumVisualization({
  digit1,
  digit2,
  carry = 0,
  showSplit = false,
  visible = true,
}: SumVisualizationProps) {
  if (!visible) return null;

  const sum = digit1 + digit2 + carry;
  const resultDigit = sum % 10;
  const willCarry = sum >= 10;

  return (
    <div className="rounded-2xl bg-cream/90 p-4 shadow-medium backdrop-blur-sm animate-fadeIn">
      {/* Equation */}
      <div className="mb-3 text-center font-display text-lg">
        <span className="rounded bg-coral/20 px-2 py-1 text-coral">{digit1}</span>
        <span className="mx-1 text-chocolate">+</span>
        <span className="rounded bg-sage/20 px-2 py-1 text-sage">{digit2}</span>
        {carry > 0 && (
          <>
            <span className="mx-1 text-chocolate">+</span>
            <span className="rounded bg-yellow/20 px-2 py-1 text-yellow">1</span>
          </>
        )}
        <span className="mx-2 text-chocolate">=</span>
        <span className="font-bold text-chocolate">{sum}</span>
      </div>

      {/* Dots visualization */}
      <div className="flex flex-wrap justify-center gap-1 mb-3">
        {Array.from({ length: sum }).map((_, i) => (
          <div
            key={i}
            className={`
              h-4 w-4 rounded-full transition-all duration-300
              ${showSplit && willCarry
                ? i < 10
                  ? 'bg-yellow scale-90 animate-pulse-scale' // Carry dots
                  : 'bg-sage' // Stays dots
                : 'bg-coral' // Default color
              }
            `}
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>

      {/* Split explanation */}
      {showSplit && willCarry && (
        <div className="text-center font-body text-sm">
          <span className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-yellow" />
            <span className="text-yellow font-bold">10 goes up</span>
          </span>
          <span className="mx-2 text-chocolate/60">•</span>
          <span className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-sage" />
            <span className="text-sage font-bold">{resultDigit} stays</span>
          </span>
        </div>
      )}

      {/* No carry message */}
      {showSplit && !willCarry && (
        <div className="text-center font-body text-sm text-chocolate/70">
          Less than 10, no carry needed!
        </div>
      )}
    </div>
  );
}

interface BorrowVisualizationProps {
  topDigit: number;
  bottomDigit: number;
  showBorrow?: boolean;
  visible?: boolean;
}

/**
 * Visual bubble showing the borrow operation with dots.
 * Shows "We can't take X from Y!" and the borrow process.
 */
export function BorrowVisualization({
  topDigit,
  bottomDigit,
  showBorrow = false,
  visible = true,
}: BorrowVisualizationProps) {
  if (!visible) return null;

  const needsBorrow = topDigit < bottomDigit;
  const newTopDigit = needsBorrow ? topDigit + 10 : topDigit;

  return (
    <div className="rounded-2xl bg-cream/90 p-4 shadow-medium backdrop-blur-sm animate-fadeIn">
      {/* Problem */}
      <div className="mb-3 text-center font-display text-lg">
        <span className="rounded bg-coral/20 px-2 py-1 text-coral">{topDigit}</span>
        <span className="mx-1 text-chocolate">−</span>
        <span className="rounded bg-sage/20 px-2 py-1 text-sage">{bottomDigit}</span>
        <span className="mx-2 text-chocolate">=</span>
        {needsBorrow && !showBorrow ? (
          <span className="font-bold text-coral">?</span>
        ) : (
          <span className="font-bold text-chocolate">{newTopDigit - bottomDigit}</span>
        )}
      </div>

      {/* Original dots */}
      <div className="flex flex-wrap justify-center gap-1 mb-3">
        {/* Original dots */}
        {Array.from({ length: topDigit }).map((_, i) => (
          <div
            key={`orig-${i}`}
            className="h-4 w-4 rounded-full bg-coral"
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}

        {/* Borrowed dots (show when showBorrow is true and needs borrow) */}
        {showBorrow && needsBorrow && (
          <>
            <div className="mx-2 flex items-center font-display text-xl text-chocolate">+</div>
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={`borrow-${i}`}
                className="h-4 w-4 rounded-full bg-yellow animate-slide-in-left"
                style={{ animationDelay: `${i * 30}ms` }}
              />
            ))}
          </>
        )}
      </div>

      {/* Explanation */}
      {needsBorrow && !showBorrow && (
        <div className="text-center font-body text-sm text-coral">
          We only have <span className="font-bold">{topDigit}</span> but need to take away{' '}
          <span className="font-bold">{bottomDigit}</span>!
        </div>
      )}

      {showBorrow && needsBorrow && (
        <div className="text-center font-body text-sm">
          <span className="text-yellow font-bold">Borrow 10</span>
          <span className="text-chocolate/70"> from next door! </span>
          <span className="text-chocolate">{topDigit} + 10 = </span>
          <span className="text-sage font-bold">{newTopDigit}</span>
        </div>
      )}

      {!needsBorrow && (
        <div className="text-center font-body text-sm text-chocolate/70">
          {topDigit} is enough to subtract {bottomDigit}. No borrow needed!
        </div>
      )}
    </div>
  );
}
