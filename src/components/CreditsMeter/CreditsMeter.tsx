import type { ReactNode } from 'react';
import { Button } from '../Button/Button';
import './CreditsMeter.css';

export type CreditsMeterPlan = 'member' | 'free';
export type CreditsMeterSize = 'full' | 'compact';

export type CreditsMeterProps = {
  plan?: CreditsMeterPlan;
  /** Full card for the credits screen; Compact chip for headers and slots */
  size?: CreditsMeterSize;
  /** Balance text, e.g. "180 credits" */
  balance: ReactNode;
  /** Meter fill, 0–1 (Full only) */
  level?: number;
  /** Plan allowance line (Full). Defaults to the plan's rule from the Figma description. */
  allowance?: ReactNode;
  /** How credits are spent (Full) */
  note?: ReactNode;
  /** Button label (Full). Defaults: Member "Buy credits", Free "Upgrade to buy credits". */
  actionLabel?: string;
  /** Full: the Buy / Upgrade button. Compact: makes the chip a button. */
  onAction?: () => void;
  /** Router path for the action (prototype navigation) */
  actionTo?: string;
  label?: string;
  className?: string;
};

const defaults = {
  member: {
    allowance: '20 included each month (240 a year). Unused credits roll over up to 300. Bought credits never expire.',
    action: 'Buy credits',
  },
  free: { allowance: 'Free plan: 20 credits a month.', action: 'Upgrade to buy credits' },
};

const defaultNote = 'A quote search uses 10 credits, only when a quote arrives. Emergencies are always free.';

/**
 * HC/Credits Meter (Figma 93:376) — Plan Member/Free × Size Full/Compact. The single source for AI usage in the
 * homeowner app: Member buys credit packs (secondary button), Free can only upgrade (primary button).
 */
export function CreditsMeter({
  plan = 'member',
  size = 'full',
  balance,
  level = 0,
  allowance,
  note = defaultNote,
  actionLabel,
  onAction,
  actionTo,
  label = 'AI credits',
  className,
}: CreditsMeterProps) {
  if (size === 'compact') {
    const classes = ['hc-credits-meter', 'hc-credits-meter--compact', className].filter(Boolean).join(' ');
    const content = (
      <>
        <span className="hc-credits-meter__chip-label">{label}</span>
        <span className="hc-credits-meter__chip-balance">{balance}</span>
      </>
    );
    return onAction ? (
      <button type="button" className={classes} onClick={onAction}>
        {content}
      </button>
    ) : (
      <div className={classes}>{content}</div>
    );
  }

  const pct = Math.min(100, Math.max(0, level * 100));

  return (
    <section className={['hc-credits-meter', 'hc-credits-meter--full', className].filter(Boolean).join(' ')}>
      <div className="hc-credits-meter__header">
        <span className="hc-credits-meter__label">{label}</span>
        <span className="hc-credits-meter__balance">{balance}</span>
      </div>
      <div className="hc-credits-meter__track" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
        <span className="hc-credits-meter__fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="hc-credits-meter__text">{allowance ?? defaults[plan].allowance}</p>
      {note && <p className="hc-credits-meter__text">{note}</p>}
      <Button variant={plan === 'free' ? 'primary' : 'secondary'} fullWidth onClick={onAction} to={actionTo}>
        {actionLabel ?? defaults[plan].action}
      </Button>
    </section>
  );
}
