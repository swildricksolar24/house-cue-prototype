import type { HTMLAttributes } from 'react';
import './StatusPill.css';

export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export type StatusPillProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  /** Free text, e.g. "Paid", "Pending review" */
  label: string;
  /** Defaults to the tone the "one tone per label" guidance assigns to `label` (see `toneForLabel`) */
  tone?: StatusTone;
};

// Guidance frame "HC/Status Pill — one tone per label" (Figma 352:132295), applied file-wide Nov 10.
const SUCCESS = [
  'done', 'completed', 'done in app', 'paid', 'confirmed', 'booked', 'active', 'verified', 'approved',
  'passed', 'match', 'won', 'connected',
];
const WARNING = [
  'pending', 'pending review', 'under review', 'held', 'hold', 'payment held', 'invite pending', 'invited',
  'proposal sent', 'in progress', 'expiring',
];
const DANGER = [
  'payment failed', 'failed', 'credit removed', 'removed', 'rejected', 'reject', 'frozen', 'overdue', 'disputed', 'lost',
];
const INFO = ['new', 'pro', 'diy', 'senior', 'finance'];
const NEUTRAL = [
  'cancelled', 'canceled', 'voided', 'declined', 'draft', 'not connected', 'owner', 'co-owner', 'member',
  'veteran-owned', 'spanish-speaking', '24/7',
];

/**
 * Tone for a status label, per the Figma guidance: Success = finished or good; Warning = waiting or needs attention;
 * Danger = failed or removed; Info = informational counts, scores and team tags; Neutral = closed, descriptive, roles.
 * Countdown timers and fraud risk scores are toned by threshold by the caller, so pass `tone` for those.
 */
export function toneForLabel(label: string): StatusTone {
  const key = label.trim().toLowerCase();
  if (NEUTRAL.includes(key)) return 'neutral';
  if (SUCCESS.includes(key)) return 'success';
  if (DANGER.includes(key) || key.startsWith('rejected')) return 'danger';
  if (WARNING.includes(key) || key.startsWith('awaiting')) return 'warning';
  if (INFO.includes(key) || /^(trust|revised)\b/.test(key) || /^\d+ replied$/.test(key)) return 'info';
  return 'neutral';
}

/** HC/Status Pill (Figma 261:1037) — Tone Neutral / Info / Success / Warning / Danger; label is free text. */
export function StatusPill({ label, tone, className, ...props }: StatusPillProps) {
  const t = tone ?? toneForLabel(label);
  return (
    <span {...props} className={['hc-status-pill', `hc-status-pill--${t}`, className].filter(Boolean).join(' ')}>
      {label}
    </span>
  );
}
