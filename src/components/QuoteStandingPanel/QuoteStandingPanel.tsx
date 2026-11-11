import type { ReactNode } from 'react';
import { Button } from '../Button/Button';
import { MetricRow } from '../MetricRow/MetricRow';
import './QuoteStandingPanel.css';

export type QuoteStandingState = 'standing' | 'below-floor' | 'locked' | 'final-lost' | 'final-won';
export type EngagementTier = 'Leading' | 'In the mix' | 'Trailing';

export type QuoteMetric = { label: ReactNode; value: ReactNode };

export type QuoteStandingPanelProps = {
  state: QuoteStandingState;
  /** Defaults: "Final standing" for final states, otherwise "Where your quote stands" */
  title?: ReactNode;
  /** Header pill. Defaults: Pro (info), Lost (danger), Won (success) */
  badge?: string;
  /** Line under the header (comparison note, below-floor message, or final outcome) */
  summary?: ReactNode;
  /** Relative standing rows. Locked shows these labels with hidden values. */
  metrics?: QuoteMetric[];
  /** Standing / Below floor: engagement section title */
  engagementTitle?: ReactNode;
  /** Standing / Below floor: engagement tier pill */
  engagementTier?: EngagementTier;
  /** Rows after the divider: engagement (Standing / Below floor) or views and messages (Final) */
  engagement?: QuoteMetric[];
  /** Standing / Below floor: Revise quote button */
  reviseLabel?: string;
  onRevise?: () => void;
  /** Small print under the button (Standing / Below floor) or under the rows (Final) */
  footnote?: ReactNode;
  /** Locked: upsell copy and action */
  upsellTitle?: ReactNode;
  upsellBody?: ReactNode;
  upgradeLabel?: string;
  onUpgrade?: () => void;
  upsellFinePrint?: ReactNode;
  className?: string;
};

const tierTone: Record<EngagementTier, string> = { Leading: 'success', 'In the mix': 'warning', Trailing: 'danger' };

const headerDefaults: Record<QuoteStandingState, { title: string; badge: string; tone: string }> = {
  standing: { title: 'Where your quote stands', badge: 'Pro', tone: 'info' },
  'below-floor': { title: 'Where your quote stands', badge: 'Pro', tone: 'info' },
  locked: { title: 'Where your quote stands', badge: 'Pro', tone: 'info' },
  'final-lost': { title: 'Final standing', badge: 'Lost', tone: 'danger' },
  'final-won': { title: 'Final standing', badge: 'Won', tone: 'success' },
};

/**
 * HC/Quote Standing Panel (Figma 191:936) — State Standing / Below floor / Locked / Final lost / Final won.
 * Vendor-side view of how a quote compares (#170). Values are relative only: never another vendor's identity or
 * exact figures. Locked (Free vendors) sends no data, so its preview shows labels with masked values.
 */
export function QuoteStandingPanel({
  state,
  title,
  badge,
  summary,
  metrics = [],
  engagementTitle = 'Homeowner engagement',
  engagementTier,
  engagement = [],
  reviseLabel = 'Revise quote',
  onRevise,
  footnote,
  upsellTitle,
  upsellBody,
  upgradeLabel = 'Upgrade to Pro',
  onUpgrade,
  upsellFinePrint,
  className,
}: QuoteStandingPanelProps) {
  const head = headerDefaults[state];
  const isFinal = state === 'final-lost' || state === 'final-won';
  const isLive = state === 'standing' || state === 'below-floor';
  const classes = ['hc-quote-standing', `hc-quote-standing--${state}`, className].filter(Boolean).join(' ');

  return (
    <section className={classes}>
      <div className="hc-quote-standing__header">
        <p className="hc-quote-standing__heading">{title ?? head.title}</p>
        <span className={`hc-quote-standing__pill hc-quote-standing__pill--${head.tone}`}>{badge ?? head.badge}</span>
      </div>

      {summary && <p className="hc-quote-standing__summary">{summary}</p>}

      {state === 'locked' ? (
        <>
          <div className="hc-quote-standing__preview" aria-hidden>
            {metrics.map((m, i) => (
              <MetricRow key={i} label={m.label} value="••••••" />
            ))}
          </div>
          <div className="hc-quote-standing__upsell">
            {upsellTitle && <p className="hc-quote-standing__upsell-title">{upsellTitle}</p>}
            {upsellBody && <p className="hc-quote-standing__note">{upsellBody}</p>}
            <Button fullWidth onClick={onUpgrade}>{upgradeLabel}</Button>
            {upsellFinePrint && <p className="hc-quote-standing__note">{upsellFinePrint}</p>}
          </div>
        </>
      ) : (
        <>
          {metrics.map((m, i) => (
            <MetricRow key={i} label={m.label} value={m.value} />
          ))}
          <hr className="hc-quote-standing__divider" />
          {isLive && engagementTier && (
            <div className="hc-quote-standing__header">
              <p className="hc-quote-standing__heading">{engagementTitle}</p>
              <span className={`hc-quote-standing__pill hc-quote-standing__pill--${tierTone[engagementTier]}`}>{engagementTier}</span>
            </div>
          )}
          {engagement.map((m, i) => (
            <MetricRow key={i} label={m.label} value={m.value} />
          ))}
          {isLive && (
            <>
              <hr className="hc-quote-standing__divider" />
              <Button variant="secondary" fullWidth onClick={onRevise}>{reviseLabel}</Button>
            </>
          )}
          {footnote && (isLive || isFinal) && <p className="hc-quote-standing__note">{footnote}</p>}
        </>
      )}
    </section>
  );
}
