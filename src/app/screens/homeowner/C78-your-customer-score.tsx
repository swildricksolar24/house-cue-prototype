import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AgentFab } from '../../../components/AgentFab/AgentFab';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { ListRow } from '../../../components/ListRow/ListRow';
import { useFlow } from '../../prototype/flow';
import { screenPath } from '../../prototype/journeys';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C78-your-customer-score.css';

/**
 * Score views drawn on batch B10 next to the main frame, opened with `?view=`:
 * - default: score visible to pros
 * - `flag-off`: "Vendors don't see your score yet" (126:12177 / 126:12315) — score shown, vendor visibility flag off
 * - `new`: "New customer" (119:5131) — fewer than 3 rated jobs
 * - `landlord`: "Landlord note" (270:19546 / 270:19822) — landlord account score
 */
type View = 'default' | 'flag-off' | 'new' | 'landlord';
const VIEWS: View[] = ['default', 'flag-off', 'new', 'landlord'];

const TIPS = [
  'Give pros clear access at the agreed time.',
  'Reply to messages and keep appointments.',
  'Cancel outside the pro’s cancellation window.',
  'Keep a working card on file so sign-off charges go through.',
];
const DOES_NOT_COUNT = 'Disputes you raise · Chargebacks · Reviews you write · Your plan, home or neighborhood';

/** C78 Your customer score — Figma mobile 217:32429, web 217:33118 (J1 Payment & review step 4). */
export default function YourCustomerScore({ variant }: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [params] = useSearchParams();
  const fromParam = params.get('view') as View | null;
  const view: View = fromParam && VIEWS.includes(fromParam) ? fromParam : /landlord/i.test(variant) ? 'landlord' : 'default';
  const [showTips, setShowTips] = useState(false);
  const web = device === 'web';
  const landlord = view === 'landlord';

  const scoreCard = (
    <section className="hc-c78-card">
      <p className="hc-c78-eyebrow">{landlord ? 'Your landlord account score' : 'Your customer score'}</p>
      {view === 'new' ? (
        <>
          <p className="hc-h4">Building your score</p>
          <ScoreBar value={1 / 3} />
          <p className="hc-medium-semibold">1 of 3 jobs rated</p>
          <p className="hc-small hc-muted">Until 3 jobs are rated, pros see “New customer” instead of a number.</p>
        </>
      ) : (
        <>
          <p className="hc-c78-value">
            <span className="hc-h2">82</span>
            <span className="hc-medium hc-muted">out of 100</span>
          </p>
          <ScoreBar value={0.82} />
          <p className="hc-medium-semibold">
            {view === 'flag-off'
              ? 'Vendors don’t see your score yet. We’re collecting ratings now and will tell you before pros can see it.'
              : landlord
                ? 'Vendors see it on rental jobs.'
                : 'Pros see this one number, nothing else.'}
          </p>
          {web && <p className="hc-small hc-muted">Based on 7 rated jobs · updated Nov 6</p>}
        </>
      )}
    </section>
  );

  const feeds = (
    <section className="hc-c78-card">
      <h2 className="hc-large-bold">What feeds your score</h2>
      {web && <p className="hc-small hc-muted">Only you see this list. No individual rating, job or pro is shown.</p>}
      <ListRow title="Pros’ private ratings after each job" description="Access, communication and payment, 1–5 each" />
      <ListRow
        title="Platform events"
        description={landlord ? 'Late cancellations, no-shows, late payments and tenant access' : 'Late cancellations, no-shows and late payments'}
      />
      {landlord && !web && (
        <p className="hc-medium hc-muted">
          Doesn’t count: disputes you raise, chargebacks, reviews you write, your plan, home or neighborhood.
        </p>
      )}
    </section>
  );

  const doesNotCount = (
    <section className="hc-c78-card">
      <h2 className="hc-large-bold">What doesn’t count</h2>
      <p className="hc-medium hc-muted">{DOES_NOT_COUNT}</p>
    </section>
  );

  const tipsList = TIPS.map((t) => (
    <p key={t} className="hc-medium hc-muted">
      • {t}
    </p>
  ));

  if (!web) {
    return (
      <MobileShell
        role={landlord ? 'landlord' : 'homeowner'}
        header={{ title: 'Your customer score' }}
        tab="account"
        className="hc-c78-mobile"
      >
        {scoreCard}
        {feeds}
        {!landlord && doesNotCount}
        {view !== 'new' && (
          <div>
            <DetailRow
              label="How to improve"
              value="4 tips"
              actionLabel={showTips ? 'Hide' : 'View'}
              onAction={() => setShowTips((s) => !s)}
            />
            {showTips && <div className="hc-c78-tips">{tipsList}</div>}
          </div>
        )}
        {landlord && <AgentFab to={screenPath('C09')} className="hc-c78-fab" />}
      </MobileShell>
    );
  }

  return (
    <WebShell role={landlord ? 'landlord' : 'homeowner'} nav="account">
      <div className="hc-c78-web">
        <header className="hc-c78-web__head">
          <h1 className="hc-h2">Your customer score</h1>
          <p className="hc-medium hc-muted">Pros see one overall number before they quote. Only you see what feeds it.</p>
        </header>
        <div className="hc-c78-web__cols">
          <div className="hc-c78-web__main">
            {scoreCard}
            {feeds}
          </div>
          <div className="hc-c78-web__side">
            {doesNotCount}
            <section className="hc-c78-card">
              <h2 className="hc-large-bold">How to improve</h2>
              {tipsList}
            </section>
            <Banner tone="info" title="No appeal">
              If something looks wrong, like a cancellation that wasn’t yours, contact support and we’ll check the record.
            </Banner>
            <div>
              <Button variant="secondary" onClick={() => flow.go('C32')}>
                Contact support
              </Button>
            </div>
          </div>
        </div>
      </div>
      {landlord && <AgentFab size="extended" to={screenPath('C09')} className="hc-c78-fab" />}
    </WebShell>
  );
}

function ScoreBar({ value }: { value: number }) {
  return (
    <div className="hc-c78-bar" role="presentation">
      <div className="hc-c78-bar__fill" style={{ width: `${Math.round(value * 100)}%` }} />
    </div>
  );
}
