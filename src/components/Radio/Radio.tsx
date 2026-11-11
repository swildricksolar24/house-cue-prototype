import type { InputHTMLAttributes, ReactNode } from 'react';
import './Radio.css';

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  label?: ReactNode;
  /** Error = 2px danger ring; show one message for the whole group */
  error?: boolean;
  className?: string;
};

/** HC/Radio (Figma 178:798) — Default, Checked, Disabled, Error. 24px ring in a 44px hit area; one choice from 2–5 short options. Group radios with a shared `name`. */
export function Radio({ label, error = false, className, disabled, ...props }: RadioProps) {
  const classes = ['hc-radio', error && 'hc-radio--error', disabled && 'hc-radio--disabled', className]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={classes}>
      <input {...props} type="radio" className="hc-radio__input" disabled={disabled} aria-invalid={error || undefined} />
      <span className="hc-radio__ring" aria-hidden />
      {label != null && <span className="hc-radio__label">{label}</span>}
    </label>
  );
}
