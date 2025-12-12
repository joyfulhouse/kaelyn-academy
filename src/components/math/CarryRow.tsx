'use client';

interface CarryRowProps {
  carries: (boolean | number | string)[];
  animated?: boolean;
  interactive?: boolean;
  onCarryClick?: (index: number) => void;
}

export function CarryRow({
  carries,
  animated = false,
  interactive = false,
  onCarryClick,
}: CarryRowProps) {
  return (
    <div className="flex">
      {carries.map((carry, i) => {
        const showCarry = carry === true || carry === 1 || carry === '1';
        const isClickable = interactive && onCarryClick;

        return (
          <div
            key={`carry-${i}`}
            className={`
              flex h-8 w-12 items-center justify-center
              font-display text-lg font-bold
              ${showCarry ? 'text-coral' : 'text-transparent'}
              ${animated && showCarry ? 'animate-carryUp' : ''}
              ${isClickable ? 'cursor-pointer hover:bg-coral/10 rounded-lg transition-colors' : ''}
            `}
            onClick={() => isClickable && onCarryClick(i)}
          >
            {showCarry ? '1' : ''}
          </div>
        );
      })}
    </div>
  );
}

// Interactive carry input for practice mode
interface CarryInputRowProps {
  length: number;
  values: string[];
  expectedCarries: boolean[];
  onCarryChange: (index: number, value: string) => void;
  showValidation?: boolean;
}

export function CarryInputRow({
  length,
  values,
  expectedCarries,
  onCarryChange,
  showValidation = false,
}: CarryInputRowProps) {
  return (
    <div className="flex">
      {Array.from({ length }).map((_, i) => {
        const expected = expectedCarries[i];
        const value = values[i] || '';
        const isCorrect = showValidation && value === (expected ? '1' : '');
        const isIncorrect = showValidation && value !== '' && value !== (expected ? '1' : '');

        return (
          <div key={`carry-input-${i}`} className="relative mx-0.5">
            <input
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={value}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || val === '1') {
                  onCarryChange(i, val);
                }
              }}
              className={`
                h-8 w-12 rounded-lg border-2 text-center font-display text-lg font-bold
                outline-none transition-all duration-200
                ${
                  isCorrect
                    ? 'border-sage bg-sage/10 text-sage'
                    : isIncorrect
                      ? 'border-coral bg-coral/10 text-coral'
                      : 'border-chocolate/20 bg-cream text-coral'
                }
                focus:border-coral focus:ring-2 focus:ring-coral/20
              `}
              placeholder=""
            />
          </div>
        );
      })}
    </div>
  );
}
