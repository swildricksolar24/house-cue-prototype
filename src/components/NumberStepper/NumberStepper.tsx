import { useId, useState, type ReactNode } from 'react';
import './NumberStepper.css';

export type NumberStepperProps = {
  title: ReactNode;
  /** Range and default, e.g. "3–10 · default 5" */
  helper?: ReactNode;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
};

/** HC/Number Stepper (Figma 101:356) — title + helper with 44px − / + buttons. Buttons disable at the range ends. */
export function NumberStepper({
  title,
  helper,
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 99,
  step = 1,
  disabled = false,
  className,
}: NumberStepperProps) {
  const id = useId();
  const [inner, setInner] = useState(defaultValue ?? min);
  const current = value ?? inner;

  const set = (next: number) => {
    const clamped = Math.min(max, Math.max(min, next));
    if (clamped === current) return;
    if (value === undefined) setInner(clamped);
    onValueChange?.(clamped);
  };

  return (
    <div
      role="group"
      aria-labelledby={`${id}-title`}
      aria-describedby={helper ? `${id}-helper` : undefined}
      className={['hc-number-stepper', disabled && 'hc-number-stepper--disabled', className].filter(Boolean).join(' ')}
    >
      <div className="hc-number-stepper__text">
        <span id={`${id}-title`} className="hc-number-stepper__title">
          {title}
        </span>
        {helper && (
          <span id={`${id}-helper`} className="hc-number-stepper__helper">
            {helper}
          </span>
        )}
      </div>
      <div className="hc-number-stepper__controls">
        <button
          type="button"
          className="hc-number-stepper__button"
          aria-label="Decrease"
          disabled={disabled || current <= min}
          onClick={() => set(current - step)}
        >
          −
        </button>
        <output className="hc-number-stepper__value" aria-live="polite">
          {current}
        </output>
        <button
          type="button"
          className="hc-number-stepper__button"
          aria-label="Increase"
          disabled={disabled || current >= max}
          onClick={() => set(current + step)}
        >
          +
        </button>
      </div>
    </div>
  );
}
