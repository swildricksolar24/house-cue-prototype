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

/** The homeowner sign-up's three steps (shorter onboarding, Option A) */
export const ONBOARDING_STEPS = ['Account', 'Your home', 'Your agent'] as const;

/**
 * Review change: a labelled stepper for the homeowner onboarding (replaces "Step n of 3" + the progress bar on
 * Sign up, Your home and Your agent). Done steps show a check, the current one is filled, later ones are outlined;
 * the line between two steps fills once the first is done. Not in the HC library yet (no Stepper component).
 */
export function OnboardingStepper({ step }: { step: 1 | 2 | 3 }) {
  return (
    <ol className="hc-onb-stepper" aria-label={`Sign-up progress: step ${step} of ${ONBOARDING_STEPS.length}`}>
      {ONBOARDING_STEPS.map((label, i) => {
        const n = i + 1;
        const state = n < step ? 'done' : n === step ? 'current' : 'todo';
        return (
          <li key={label} className={`hc-onb-stepper__item hc-onb-stepper__item--${state}`} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="hc-onb-stepper__dot" aria-hidden>
              {state === 'done' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              ) : (
                n
              )}
            </span>
            <span className="hc-onb-stepper__label">
              {label}
              {state === 'done' && <span className="hc-visually-hidden"> (done)</span>}
            </span>
          </li>
        );
      })}
    </ol>
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
  showClose = true,
}: {
  title: string;
  children?: ReactNode;
  actions: ReactNode;
  onClose?: () => void;
  width?: number;
  /** Show a × close button in the top-right corner (needs onClose) */
  showClose?: boolean;
}) {
  return (
    <div className="hc-onb-dialog" onKeyDown={(e) => e.key === 'Escape' && onClose?.()}>
      <div className="hc-onb-dialog__scrim" onClick={onClose} aria-hidden />
      <div className="hc-onb-dialog__panel" role="dialog" aria-modal="true" aria-label={title} style={{ width }}>
        {showClose && onClose && (
          <button type="button" className="hc-onb-dialog__close" aria-label="Close" onClick={onClose} autoFocus>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
        <h2 className={`hc-h4${showClose && onClose ? ' hc-onb-dialog__title--with-close' : ''}`}>{title}</h2>
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
      disabled={!onClick}
    >
      {children}
    </button>
  );
}
