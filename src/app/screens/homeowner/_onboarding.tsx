import type { ReactNode } from 'react';
import './_onboarding.css';

/**
 * Helpers shared by the J1 onboarding screens (C02–C07, C41, X05, X08). Not a screen: the registry only picks up
 * files named <CODE>-<slug>.tsx. The web "Step n of 6" header + progress bar inside the centred card has no HC
 * component yet (reported as a library gap).
 */

/** "Step n of N" + 4px progress bar used at the top of web onboarding cards */
export function WebStepHeader({ step, total = 6 }: { step: number; total?: number }) {
  return (
    <>
      <p className="hc-small hc-muted">
        Step {step} of {total}
      </p>
      <div
        className="hc-onb-progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={step}
        aria-label={`Step ${step} of ${total}`}
      >
        <div className="hc-onb-progress__fill" style={{ width: `${(step / total) * 100}%` }} />
      </div>
    </>
  );
}

/** Centred white card on the web onboarding page (Figma "body" > "card": 40 padding, 16 gap, radius 16) */
export function WebCard({ width = 560, children, className }: { width?: number; children: ReactNode; className?: string }) {
  return (
    <section className={['hc-onb-card', className].filter(Boolean).join(' ')} style={{ width }}>
      {children}
    </section>
  );
}

/**
 * Modal dialog over a 25% scrim (Figma "Scrim" + "Dialog": 24 padding, 12 gap, radius 20). No HC/Dialog component
 * exists yet (reported as a library gap). Uses position: fixed, which pins to the phone frame on mobile.
 */
export function Dialog({
  title,
  children,
  actions,
  onClose,
  width = 342,
}: {
  title: string;
  children?: ReactNode;
  actions: ReactNode;
  onClose?: () => void;
  width?: number;
}) {
  return (
    <div className="hc-onb-dialog" onKeyDown={(e) => e.key === 'Escape' && onClose?.()}>
      <div className="hc-onb-dialog__scrim" onClick={onClose} aria-hidden />
      <div className="hc-onb-dialog__panel" role="dialog" aria-modal="true" aria-label={title} style={{ width }}>
        <h2 className="hc-h4">{title}</h2>
        {children}
        <div className="hc-onb-dialog__actions">{actions}</div>
      </div>
    </div>
  );
}

/** Text button in link colour (underlined in Figma) */
export function TextLink({
  children,
  onClick,
  align = 'center',
  underline = true,
}: {
  children: ReactNode;
  onClick?: () => void;
  align?: 'left' | 'center';
  underline?: boolean;
}) {
  return (
    <button
      type="button"
      className={`hc-onb-text-link hc-onb-text-link--${align}${underline ? ' hc-onb-text-link--underline' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
