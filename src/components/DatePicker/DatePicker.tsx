import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import '../Input/Input.css';
import './DatePicker.css';

export type DatePickerProps = {
  label: ReactNode;
  hideLabel?: boolean;
  /** The chosen day as YYYY-MM-DD, or '' for none */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Shown (muted) while no day is chosen */
  placeholder?: string;
  helper?: ReactNode;
  /** Error text; switches to the Error state */
  error?: ReactNode;
  disabled?: boolean;
  /** "Today" for the calendar's marker and the month it opens on (default: the real today) */
  today?: Date;
  className?: string;
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const pad = (n: number) => String(n).padStart(2, '0');

/** Date → "2026-12-01" */
export const toIsoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** "2026-12-01" → a local Date (or null) */
export const fromIsoDate = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
};
/** "2026-12-01" → "Dec 1, 2026" */
export const formatIsoDate = (iso: string) => {
  const d = fromIsoDate(iso);
  return d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
};
/** "Dec 1, 2026" (or "December 1, 2026") → "2026-12-01"; '' if it isn't a date */
export const parseDisplayDate = (text: string) => {
  const d = new Date(text);
  return Number.isNaN(d.getTime()) || !/\d{4}/.test(text) ? '' : toIsoDate(d);
};

/**
 * HC/Date Picker (review change, no Figma frame yet) — the HC/Input field as a button showing the chosen day ("Dec 1,
 * 2026") with a calendar icon; it opens a month calendar under it: ‹ › for the month, today ringed, the chosen day
 * filled. Arrow keys move a day (↑↓ a week), Page Up / Down a month, Enter or Space picks, Esc or a click outside closes.
 */
export function DatePicker({ label, hideLabel = false, value = '', onValueChange, placeholder = 'Choose a date', helper, error, disabled, today = new Date(), className }: DatePickerProps) {
  const id = useId();
  const fieldId = `hc-date-${id}`;
  const helperId = helper ? `${fieldId}-helper` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const chosen = fromIsoDate(value);
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState<Date>(chosen ?? today);
  const root = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  // Close on a click outside
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);
  // Keep keyboard focus on the focused day while open
  useEffect(() => {
    if (open) grid.current?.querySelector<HTMLButtonElement>(`[data-day="${toIsoDate(focus)}"]`)?.focus();
  }, [open, focus]);

  const openCalendar = () => {
    setFocus(chosen ?? today);
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  const pick = (d: Date) => {
    onValueChange?.(toIsoDate(d));
    close();
  };
  const move = (days: number, months = 0) => {
    const d = new Date(focus.getFullYear(), focus.getMonth() + months, focus.getDate() + days);
    setFocus(d);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    const keys: Record<string, () => void> = {
      ArrowLeft: () => move(-1),
      ArrowRight: () => move(1),
      ArrowUp: () => move(-7),
      ArrowDown: () => move(7),
      PageUp: () => move(0, -1),
      PageDown: () => move(0, 1),
      Escape: close,
    };
    const run = keys[e.key];
    if (run) {
      e.preventDefault();
      // Esc closes the calendar only, not a dialog it sits in
      e.stopPropagation();
      run();
    }
  };

  const year = focus.getFullYear();
  const month = focus.getMonth();
  const first = new Date(year, month, 1).getDay();
  const daysIn = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [...Array.from({ length: first }, () => null), ...Array.from({ length: daysIn }, (_, i) => new Date(year, month, i + 1))];
  const same = (a: Date | null, b: Date | null) => !!a && !!b && toIsoDate(a) === toIsoDate(b);

  const classes = ['hc-input', 'hc-date-picker', error && 'hc-input--error', disabled && 'hc-input--disabled', className].filter(Boolean).join(' ');
  return (
    <div className={classes} ref={root}>
      <label htmlFor={fieldId} className={hideLabel ? 'hc-input__label hc-input__label--hidden' : 'hc-input__label'}>
        {label}
      </label>
      <button
        ref={trigger}
        id={fieldId}
        type="button"
        className="hc-input__field hc-date-picker__field"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={error ? true : undefined}
        aria-describedby={[helperId, errorId].filter(Boolean).join(' ') || undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openCalendar())}
      >
        <span className={chosen ? 'hc-date-picker__value' : 'hc-date-picker__value hc-date-picker__value--placeholder'}>{chosen ? formatIsoDate(value) : placeholder}</span>
        <Icon name="calendar" size={20} className="hc-input__icon" />
      </button>
      {open && (
        <div className="hc-date-picker__popover" role="dialog" aria-label="Choose a date" onKeyDown={onKeyDown}>
          <div className="hc-date-picker__head">
            <button type="button" className="hc-date-picker__nav hc-date-picker__nav--prev" aria-label="Previous month" onClick={() => move(0, -1)} />
            <span className="hc-date-picker__month" aria-live="polite">
              {MONTHS[month]} {year}
            </span>
            <button type="button" className="hc-date-picker__nav hc-date-picker__nav--next" aria-label="Next month" onClick={() => move(0, 1)} />
          </div>
          <div className="hc-date-picker__grid" role="grid" ref={grid}>
            {DAYS.map((d) => (
              <span key={d} className="hc-date-picker__dow" role="columnheader" aria-hidden>
                {d}
              </span>
            ))}
            {cells.map((d, i) =>
              d ? (
                <button
                  key={i}
                  type="button"
                  role="gridcell"
                  data-day={toIsoDate(d)}
                  tabIndex={same(d, focus) ? 0 : -1}
                  aria-selected={same(d, chosen)}
                  aria-label={formatIsoDate(toIsoDate(d))}
                  className={['hc-date-picker__day', same(d, chosen) && 'is-chosen', same(d, today) && 'is-today'].filter(Boolean).join(' ')}
                  onClick={() => pick(d)}
                >
                  {d.getDate()}
                </button>
              ) : (
                <span key={i} aria-hidden />
              ),
            )}
          </div>
          <div className="hc-date-picker__foot">
            <button type="button" className="hc-date-picker__link" onClick={() => pick(today)}>
              Today
            </button>
            {chosen && (
              <button
                type="button"
                className="hc-date-picker__link"
                onClick={() => {
                  onValueChange?.('');
                  close();
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
      {helper && (
        <p id={helperId} className="hc-input__helper">
          {helper}
        </p>
      )}
      {error && (
        <p id={errorId} className="hc-input__error">
          {error}
        </p>
      )}
    </div>
  );
}
