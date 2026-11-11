import { useState } from 'react';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';
import { StateBlock } from '../../../components/StateBlock/StateBlock';
import { StatusPill, type StatusTone } from '../../../components/StatusPill/StatusPill';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C45-email-import-review.css';

type Doc = {
  id: string;
  title: string;
  type: string;
  tone: StatusTone;
  from: string;
  date: string;
  amount: string;
  item: string;
  /** Mobile card lines */
  meta: string;
  suggestion: string;
  /** Web action */
  action: string;
};

const DOCS: Doc[] = [
  { id: 'wh', title: 'Water heater warranty', type: 'Warranty', tone: 'info', from: 'Retailer', date: 'Mar 3, 2024', amount: '—', item: 'Water heater', meta: 'Retailer · Mar 3, 2024', suggestion: 'Suggested item: Water heater', action: 'Keep' },
  { id: 'ac', title: 'AC service invoice', type: 'Invoice', tone: 'neutral', from: 'HVAC company', date: 'Jun 12, 2026', amount: '$189', item: 'New: Heat pump', meta: 'HVAC company · Jun 12, 2026 · $189', suggestion: 'Suggests a new item: Heat pump', action: 'Add item' },
  { id: 'dw', title: 'Dishwasher receipt', type: 'Receipt', tone: 'success', from: 'Retailer', date: 'Jan 8, 2025', amount: '$749', item: 'Dishwasher', meta: '', suggestion: '', action: 'Keep' },
  { id: 'pest', title: 'Pest control contract', type: 'Contract', tone: 'warning', from: 'Service co.', date: 'Feb 1, 2026', amount: '$39/mo', item: '—', meta: '', suggestion: '', action: 'Link' },
];

const FILTERS = ['Warranties · 3', 'Receipts · 8', 'Invoices · 2'];

/**
 * C45 Email import review — Figma mobile 215:13499 (batch 211:38862), web 215:16954 (batch 211:38863).
 * States: Empty 111:11476, Loading 111:11536, Error 111:11606 (+ web 111:11666/11801/11946). J1 Onboarding step 21.
 * Keep / Add item / Ignore resolve a document locally; Done goes to the next step.
 */
export default function EmailImportReview(_: ScreenProps) {
  const { device, screenState } = usePrototype();
  const flow = useFlow();
  const [filter, setFilter] = useState(FILTERS[0]);
  const [resolved, setResolved] = useState<Record<string, 'kept' | 'ignored'>>({});
  const kept = 9 + Object.values(resolved).filter((r) => r === 'kept').length;
  const resolve = (id: string, r: 'kept' | 'ignored') => setResolved((s) => ({ ...s, [id]: r }));

  const state =
    screenState === 'empty' ? (
      <StateBlock title="Nothing to review" body="Documents found in your email show up here for you to keep or skip." />
    ) : screenState === 'error' ? (
      <StateBlock kind="error" title="Couldn’t load documents to review" body="Check your connection and try again. Nothing was lost." actionLabel="Try again" onAction={() => {}} />
    ) : screenState === 'loading' ? (
      <>
        <SkeletonCard label="Loading documents" />
        <SkeletonCard label="Loading documents" />
        <SkeletonCard label="Loading documents" />
      </>
    ) : null;

  if (device === 'mobile') {
    const cards = DOCS.slice(0, 2).filter((d) => !resolved[d.id]);
    return (
      <MobileShell header={{ title: 'Found in your email' }} bottom={<BottomActions primaryLabel={`Done · ${kept} kept`} onPrimary={flow.goNext} />}>
        <div className="hc-c45-content">
          <div className="hc-c45-chips" role="radiogroup" aria-label="Document type">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={filter === f}
                className={['hc-c45-chip', filter === f && 'hc-c45-chip--selected'].filter(Boolean).join(' ')}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          {state ??
            cards.map((d) => (
              <article key={d.id} className="hc-c45-card">
                <div className="hc-c45-card__row">
                  <h2 className="hc-large-bold">{d.title}</h2>
                  <StatusPill label={d.type} tone={d.tone} />
                </div>
                <p className="hc-small hc-muted">{d.meta}</p>
                <p className="hc-small hc-muted">{d.suggestion}</p>
                <div className="hc-c45-card__actions">
                  {d.id === 'wh' ? (
                    <>
                      <Button onClick={() => resolve(d.id, 'kept')}>Keep</Button>
                      <Button variant="secondary" onClick={() => resolve(d.id, 'kept')}>
                        Link to item
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => resolve(d.id, 'kept')}>Add item</Button>
                  )}
                  <Button variant="secondary" onClick={() => resolve(d.id, 'ignored')}>
                    Ignore
                  </Button>
                </div>
              </article>
            ))}
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="home">
      <div className="hc-c45-web">
        <header className="hc-c45-web__head">
          <div>
            <h1 className="hc-h2">Found in your email</h1>
            <p className="hc-medium hc-muted">13 documents · choose what to keep</p>
          </div>
          <Button variant="secondary" onClick={() => DOCS.forEach((d) => resolve(d.id, 'kept'))}>
            Keep all suggested
          </Button>
          <Button onClick={flow.goNext}>Done</Button>
        </header>
        <div className="hc-c45-table" role="table" aria-label="Documents found">
          <div className="hc-c45-table__head" role="row">
            {['Document', 'Type', 'From', 'Date', 'Amount', 'Suggested item', 'Action'].map((h) => (
              <span key={h} role="columnheader">
                {h}
              </span>
            ))}
          </div>
          {state ? (
            <div className="hc-c45-table__state">{state}</div>
          ) : (
            DOCS.map((d) => (
              <div key={d.id} className="hc-c45-table__row" role="row">
                <span role="cell" className="hc-medium-semibold">
                  {d.title}
                </span>
                <span role="cell">
                  <StatusPill label={d.type} tone={d.tone} />
                </span>
                <span role="cell">{d.from}</span>
                <span role="cell">{d.date}</span>
                <span role="cell">{d.amount}</span>
                <span role="cell">{d.item}</span>
                <span role="cell">
                  {resolved[d.id] ? (
                    <StatusPill label="Kept" tone="success" />
                  ) : (
                    <Button variant="secondary" onClick={() => resolve(d.id, 'kept')}>
                      {d.action}
                    </Button>
                  )}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </WebShell>
  );
}
