import type { ButtonHTMLAttributes } from 'react';
import './Button.css';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Visual style */
  variant?: 'primary' | 'secondary';
};

/** Example component to show the folder layout; replace or extend it with the House Cue components. */
export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return <button className={['hc-button', `hc-button--${variant}`, className].filter(Boolean).join(' ')} {...props} />;
}
