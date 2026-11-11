import { useEffect, useRef, type InputHTMLAttributes, type ReactNode } from 'react';
import './Checkbox.css';

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  /** Label text; it wraps, and tapping it toggles the box */
  label?: ReactNode;
  /** Keep the label for screen readers only (e.g. inside HC/Consent Row) */
  hideLabel?: boolean;
  /** Parent "select all" with only some children selected */
  indeterminate?: boolean;
  /** Error = 2px danger box; pair it with an error message nearby */
  error?: boolean;
  className?: string;
};

/** HC/Checkbox (Figma 178:780) — Default, Checked, Indeterminate, Disabled, Error. 24px box in a 44px hit area; the whole row is the target. */
export function Checkbox({
  label,
  hideLabel = false,
  indeterminate = false,
  error = false,
  className,
  disabled,
  ...props
}: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const classes = [
    'hc-checkbox',
    indeterminate && 'hc-checkbox--indeterminate',
    error && 'hc-checkbox--error',
    hideLabel && 'hc-checkbox--bare',
    disabled && 'hc-checkbox--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={classes}>
      <input
        {...props}
        ref={ref}
        type="checkbox"
        className="hc-checkbox__input"
        disabled={disabled}
        aria-invalid={error || undefined}
        aria-checked={indeterminate ? 'mixed' : undefined}
      />
      <span className="hc-checkbox__box" aria-hidden />
      {label != null && <span className={hideLabel ? 'hc-checkbox__label hc-checkbox__label--hidden' : 'hc-checkbox__label'}>{label}</span>}
    </label>
  );
}
