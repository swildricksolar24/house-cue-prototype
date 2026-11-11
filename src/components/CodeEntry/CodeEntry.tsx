import { useState, type ReactNode } from 'react';
import { Input } from '../Input/Input';
import './CodeEntry.css';

export type CodeEntryProps = {
  label?: ReactNode;
  helper?: ReactNode;
  /** Error text; switches the field to the Error state */
  error?: ReactNode;
  /** Number of digits (default 6) */
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called once the code reaches `length` digits */
  onComplete?: (code: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  name?: string;
  id?: string;
  className?: string;
};

/** HC/Code Entry (Figma 92:22977) — one HC/Input Type=Password-less code field (Large) so OS one-time-code autofill and paste work. */
export function CodeEntry({
  label = 'Enter the code we emailed you',
  helper = '6 digits · expires in 10 minutes',
  error,
  length = 6,
  value,
  defaultValue,
  onValueChange,
  onComplete,
  disabled,
  autoFocus,
  name = 'code',
  id,
  className,
}: CodeEntryProps) {
  const [inner, setInner] = useState(defaultValue ?? '');
  const current = value ?? inner;

  const handle = (raw: string) => {
    // Digits only, so a pasted "123 456" or "123-456" still works
    const digits = raw.replace(/\D/g, '').slice(0, length);
    if (value === undefined) setInner(digits);
    onValueChange?.(digits);
    if (digits.length === length && digits !== current) onComplete?.(digits);
  };

  return (
    <Input
      className={['hc-code-entry', className].filter(Boolean).join(' ')}
      type="code"
      size="large"
      label={label}
      helper={helper}
      error={error}
      value={current}
      onValueChange={handle}
      placeholder={Array.from({ length }, () => '•').join(' ')}
      maxLength={length * 2}
      disabled={disabled}
      autoFocus={autoFocus}
      name={name}
      id={id}
    />
  );
}
