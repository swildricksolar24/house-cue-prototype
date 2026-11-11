import { useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { ImagePlaceholder } from '../../../components/ImagePlaceholder/ImagePlaceholder';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';
import { StateBlock } from '../../../components/StateBlock/StateBlock';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { TimelineStep } from '../../../components/TimelineStep/TimelineStep';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C31-issues-and-disputes.css';

/**
 * C31 Issues and disputes — Figma mobile 218:16840, web 218:17471 (J1 Warranty / dispute, step 2).
 * States (?state=…): empty 110:9704 / 110:9975, loading 110:9791 / 110:10089, error 110:9888 / 110:10213.
 * Local UI state: "Appeal to a person" opens the appeal-fee sheet (242:18412 / 242:18626); paying shows the
 * appeal outcome (242:18916 / 242:19094). "Branch: Dispute opened" (231:26198) is the default frame.
 */

type Filter = 'open' | 'closed';

const PRO_STATUS = 'Waiting on the pro';

export default function IssuesAndDisputes(_: ScreenProps) {
  const { device, screenState, setScreenState } = usePrototype();
  const flow = useFlow();
  const web = device === 'web';
  const [filter, setFilter] = useState<Filter>('open');
  const [appealOpen, setAppealOpen] = useState(false);
  const [appealed, setAppealed] = useState(false);

  const chips = (
    <div className="hc-c31-chips" role="radiogroup" aria-label="Filter issues">
      {(['open', 'closed'] as const).map((f) => (
        <button
          key={f}
          type="button"
          role="radio"
          aria-checked={filter === f}
          className={['hc-c31-chip', filter === f && 'hc-c31-chip--selected'].filter(Boolean).join(' ')}
          onClick={() => setFilter(f)}
        >
          {f === 'open' ? 'Open' : 'Closed'}
        </button>
      ))}
    </div>
  );

  const outcome = appealed && (
    <Banner tone="success" title="Appeal upheld in part">
      A person changed the ruling: $180 is refunded to your card. Your $250 appeal fee is refunded in full.
    </Banner>
  );

  const appealStep = (
    <button type="button" className="hc-c31-step-link" onClick={() => setAppealOpen(true)}>
      Appeal to a person
    </button>
  );

  const timeline = (
    <ol className="hc-c31-timeline">
      <TimelineStep state="done" title="Opened" meta="Nov 12 · 4 photos added" />
      <TimelineStep state="current" title="Pro responds" meta={web ? 'Due Nov 15 · they can offer a fix' : 'Due Nov 15'} />
      <TimelineStep state="upcoming" title="AI ruling" meta={web ? 'Based on both sides’ evidence' : 'Both sides’ evidence'} />
      <TimelineStep state="upcoming" title={appealStep} meta="Optional" />
    </ol>
  );

  // The list area below the case card: timeline by default, or the Empty / Loading / Error frame
  const empty = (
    <StateBlock title="No issues reported" body="If something goes wrong with a job, report it here." />
  );
  let list = timeline;
  if (screenState === 'loading') {
    list = (
      <div className="hc-c31-skeletons">
        <SkeletonCard label="Loading issues" />
        <SkeletonCard label="Loading issues" />
        <SkeletonCard label="Loading issues" />
      </div>
    );
  } else if (screenState === 'error') {
    list = (
      <StateBlock
        kind="error"
        title="Couldn’t load issues and disputes"
        body="Check your connection and try again. Nothing was lost."
        onAction={() => setScreenState('default')}
      />
    );
  } else if (screenState === 'empty' || filter === 'closed') {
    list = empty;
  }

  const appealDialog = appealOpen && (
    <div
      className={`hc-c31-overlay hc-c31-overlay--${web ? 'center' : 'bottom'}`}
      onClick={(e) => e.target === e.currentTarget && setAppealOpen(false)}
      onKeyDown={(e) => e.key === 'Escape' && setAppealOpen(false)}
    >
      <div className="hc-c31-sheet" role="dialog" aria-modal="true" aria-labelledby="hc-c31-sheet-title">
        <span className="hc-c31-sheet__grabber" aria-hidden />
        <h2 id="hc-c31-sheet-title" className="hc-h4">
          Appeal to a person
        </h2>
        <p className="hc-medium hc-muted">
          A person reviews the AI ruling. You’re disputing $640, so the appeal fee is $250, refunded in full if the
          appeal is upheld or partly upheld. Under $500 there’s no fee.
        </p>
        <Button
          size="large"
          fullWidth
          autoFocus
          onClick={() => {
            setAppealOpen(false);
            setAppealed(true);
          }}
        >
          Pay $250 and appeal
        </Button>
        <Button variant="secondary" size="large" fullWidth onClick={() => setAppealOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );

  if (!web) {
    return (
      <MobileShell header={{ title: 'Issues' }} tab="jobs" padding="none">
        <div className="hc-c31-mobile">
          {outcome}
          {chips}
          <section className="hc-c31-card hc-c31-card--compact">
            <h2 className="hc-medium-semibold">Garage door spring</h2>
            <p className="hc-small hc-muted">Larkspur Door Co. · incomplete work</p>
            <div>
              <StatusPill label={PRO_STATUS} tone="warning" />
            </div>
            <DetailRow label="You asked for" value="Partial refund, $120" />
          </section>
          {list}
          <Button variant="secondary" fullWidth onClick={flow.goNext}>
            Add evidence
          </Button>
        </div>
        {appealDialog}
      </MobileShell>
    );
  }

  return (
    <WebShell nav="jobs">
      <div className="hc-c31-web">
        <header className="hc-c31-web__head">
          <h1 className="hc-h2">Issues and disputes</h1>
          <Button onClick={flow.goNext}>Report a new issue</Button>
        </header>
        {outcome}
        <div className="hc-c31-web__cols">
          <section className="hc-c31-card hc-c31-web__main">
            <div className="hc-c31-web__title-row">
              <h2 className="hc-large-bold">Garage door spring · Larkspur Door Co.</h2>
              <StatusPill label={PRO_STATUS} tone="warning" />
            </div>
            <DetailRow label="Issue" value="Incomplete work: one spring replaced, the other still loose" />
            <DetailRow label="You asked for" value="Partial refund, $120" />
            <DetailRow label="Held funds" value="$310 frozen until this is settled" />
            {list}
            <div className="hc-c31-photos">
              {[1, 2, 3, 4].map((n) => (
                <ImagePlaceholder key={n} label="Photo" height={100} />
              ))}
            </div>
          </section>
          <aside className="hc-c31-web__side">
            <section className="hc-c31-card">
              <h2 className="hc-large-bold">If you disagree with the ruling</h2>
              <p className="hc-small">
                A person can review it. Appeals cost $250, refunded if you win, and are free when less than $500 is in
                dispute. This one would be free ($120 in dispute).
              </p>
            </section>
            <Banner tone="warning" title="Need help now?">
              For safety or conduct problems on site, contact support and mark it urgent.
            </Banner>
          </aside>
        </div>
      </div>
      {appealDialog}
    </WebShell>
  );
}
