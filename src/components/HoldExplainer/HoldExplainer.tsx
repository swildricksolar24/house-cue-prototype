import type { ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import './HoldExplainer.css';

export type HoldExplainerProps = {
  title: ReactNode;
  /** Steps in order; numbers ("1.") are added automatically */
  steps: ReactNode[];
  className?: string;
};

/**
 * HC/Hold Explainer (Figma 29:123) — how the payment hold works (C17, C20, C30): authorize now, release 90% at
 * sign-off, 10% held 30 days. Legally reviewed copy pending, so the copy comes from the screen.
 */
export function HoldExplainer({ title, steps, className }: HoldExplainerProps) {
  return (
    <section className={['hc-hold-explainer', className].filter(Boolean).join(' ')}>
      <div className="hc-hold-explainer__header">
        <Icon name="shield" size={24} />
        <p className="hc-hold-explainer__title">{title}</p>
      </div>
      <ol className="hc-hold-explainer__steps">
        {steps.map((step, i) => (
          <li key={i} className="hc-hold-explainer__step">
            {step}
          </li>
        ))}
      </ol>
    </section>
  );
}
