import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { DisclosureNote } from '../../../components/DisclosureNote/DisclosureNote';
import { PushCard } from '../../../components/PushCard/PushCard';
import { QuoteRow } from '../../../components/QuoteRow/QuoteRow';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { TimelineStep } from '../../../components/TimelineStep/TimelineStep';
import { useFlow } from '../../prototype/flow';
import { screenPath } from '../../prototype/journeys';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C14-quote-comparison.css';

/**
 * C14 Quote comparison — Figma mobile 217:29138, web 217:29928 (J1 Review & book step 1).
 * Branch states via ?state=: negotiating (231:25337), oon (230:40088), revised (#170 Disclosure + quote revised,
 * 193:10546 / 193:10785), declined (231:24540 / 242:13061).
 */

type Branch = 'default' | 'negotiating' | 'oon' | 'revised' | 'declined';
const BRANCHES: Branch[] = ['negotiating', 'oon', 'revised', 'declined'];

type Quote = {
  id: string;
  vendor: string;
  price: string;
  /** Trust score; omitted while verification is pending */
  trust?: number;
  /** Background check still running: warning pill, Choose disabled */
  pending?: boolean;
  oon?: boolean;
  updated?: boolean;
  rating: string;
  reviews: string;
  nearby?: string;
  details: string;
};

const SUMMARY = (inCount: string, median: string) =>
  `${inCount} quotes in · median ${median} · ranked by trust and price, weighted by your Balanced setting`;

const zephyrline: Quote = {
  id: 'zephyrline',
  vendor: 'Zephyrline HVAC',
  price: '$189',
  trust: 92,
  rating: 'Licensed · Insured',
  reviews: 'HouseCue job reviews ★ 4.8 · 126 jobs',
  nearby: '3 recent jobs within 2 miles',
  details: 'Earliest Thu, Nov 13 · 6% below the median of your quotes',
};
const saguaro: Quote = {
  id: 'saguaro',
  vendor: 'Saguaro Air Pros',
  price: '$165',
  trust: 81,
  rating: 'Licensed · Insured',
  reviews: 'HouseCue job reviews ★ 4.6 · 58 jobs',
  nearby: '1 recent job within 2 miles',
  details: 'Earliest Fri, Nov 14 · 18% below the median of your quotes',
};
const mesa: Quote = {
  id: 'mesa',
  vendor: 'Mesa Comfort Co.',
  price: '$215',
  trust: 77,
  rating: 'Licensed · Insured',
  reviews: 'HouseCue job reviews ★ 4.5 · 40 jobs',
  nearby: '2 recent jobs within 2 miles',
  details: 'Earliest Mon, Nov 17 · 14% above the median of your quotes · revised from $285',
};
const desertPeak: Quote = {
  id: 'desert-peak',
  vendor: 'Desert Peak Cooling',
  price: '$210',
  pending: true,
  rating: 'Licensed · Background check pending',
  reviews: 'New on HouseCue: no job reviews yet',
  details: 'Earliest Thu, Nov 13 · 5% above the median of your quotes · Book unlocks when the check clears',
};
const ocotillo: Quote = {
  id: 'ocotillo',
  vendor: 'Ocotillo Air Repair',
  price: '$175',
  trust: 64,
  oon: true,
  rating: 'Licensed · Insured',
  reviews: 'New on HouseCue: no job reviews yet',
  details: 'Earliest Wed, Nov 12 · 7% below the median of your quotes',
};

/** Mobile frames: 4 of 5 quotes in */
const mobileLists: Record<'default' | 'oon' | 'revised', { summary: string; quotes: Quote[] }> = {
  default: { summary: SUMMARY('4 of 5', '$200'), quotes: [zephyrline, saguaro, desertPeak] },
  oon: {
    summary: SUMMARY('4 of 5', '$182'),
    quotes: [
      { ...zephyrline, details: 'Earliest Thu, Nov 13 · 4% above the median of your quotes' },
      { ...ocotillo, details: 'Earliest Wed, Nov 12 · 4% below the median of your quotes' },
    ],
  },
  revised: {
    summary: SUMMARY('4 of 5', '$195'),
    quotes: [
      {
        ...zephyrline,
        price: '$179',
        updated: true,
        details: 'Updated 2 min ago: was $189 · Earliest Thu, Nov 20 · 8% below the median of your quotes',
      },
      { ...saguaro, details: 'Earliest Fri, Nov 14 · 15% below the median of your quotes' },
      { ...desertPeak, details: 'Earliest Thu, Nov 13 · 8% above the median of your quotes · Book unlocks when the check clears' },
    ],
  },
};

/** Web frames: 5 of 5 quotes in */
const webLists: Record<'default' | 'revised', { summary: string; median: string; quotes: Quote[] }> = {
  default: {
    summary: SUMMARY('5 of 5', '$189'),
    median: '$189',
    quotes: [
      { ...zephyrline, rating: 'Licensed · Insured · Top performer', details: 'Earliest Thu, Nov 13 · At the median of your quotes' },
      { ...saguaro, details: 'Earliest Fri, Nov 14 · 13% below the median of your quotes' },
      mesa,
      {
        ...desertPeak,
        rating: 'Background check pending',
        details: 'Earliest Thu, Nov 13 · 11% above the median of your quotes · Book unlocks when the check clears',
      },
      ocotillo,
    ],
  },
  revised: {
    summary: SUMMARY('5 of 5', '$179'),
    median: '$179',
    quotes: [
      {
        ...zephyrline,
        price: '$179',
        updated: true,
        rating: 'Licensed · Insured · Top performer',
        details: 'Updated 2 min ago: was $189 · Earliest Thu, Nov 20 · At the median of your quotes',
      },
      { ...saguaro, details: 'Earliest Fri, Nov 14 · 8% below the median of your quotes' },
      {
        ...mesa,
        updated: true,
        details: 'Updated yesterday: was $285 · Earliest Mon, Nov 17 · 20% above the median of your quotes',
      },
      {
        ...desertPeak,
        rating: 'Background check pending',
        details: 'Earliest Thu, Nov 13 · 17% above the median of your quotes · Book unlocks when the check clears',
      },
      { ...ocotillo, details: 'Earliest Wed, Nov 12 · 2% below the median of your quotes' },
    ],
  },
};

const DECLINED_TITLE = 'Desert Peak Cooling declined';
const DECLINED_BODY = 'They can’t take this job, so their quote is removed. Your agent is asking more pros so you still get at least 3 quotes.';

const NEGOTIATING_TITLE = 'Your agent is negotiating';
const NEGOTIATING_BODY =
  'Mesa Comfort Co. quoted $285, 51% above the median of your other quotes ($189). Your agent asked for a better price, within your $300 limit for heating and cooling.';
const negotiatedQuote: Quote = {
  ...mesa,
  rating: 'Revised quote · replaces the $285 quote',
  details: 'Earliest Mon, Nov 17 · 1-year warranty · same scope · 14% above the median',
};
const negotiationSteps = [
  { state: 'done' as const, title: 'Quote received: $285', meta: 'Tue 9:40 AM' },
  { state: 'done' as const, title: 'Agent asked for a better price', meta: 'Tue 9:42 AM · email to the vendor' },
  { state: 'done' as const, title: 'Vendor revised to $215', meta: 'Tue 1:15 PM' },
  { state: 'current' as const, title: 'You approve the final price', meta: 'Nothing is booked until you do' },
];
const NEGOTIATION_NOTE = 'Your agent never accepts a price for you. If you do nothing, no booking is made and the quote expires in 48 hours.';

const PUSH = {
  meta: 'HouseCue · now',
  title: 'Zephyrline HVAC changed their quote',
  body: 'Now $179 (was $189). Earliest start moved to Thu, Nov 20. Tap to compare.',
};

const HOW_WE_RANK =
  'A weighted blend of trust (license, insurance, background check, reviews, complaints, warranty record) and price. Your Balanced setting weights trust 70% and price 30%. No pro pays for placement.';

function useBranch() {
  const [params] = useSearchParams();
  const raw = params.get('state') as Branch | null;
  const fromUrl: Branch = raw && BRANCHES.includes(raw) ? raw : 'default';
  const [branch, setBranch] = useState<Branch>(fromUrl);
  useEffect(() => setBranch(fromUrl), [fromUrl]);
  return [branch, setBranch] as const;
}

export default function QuoteComparison(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const navigate = useNavigate();
  const [branch, setBranch] = useBranch();
  // Disclosure note: shown the first time quotes are seen (#170 frame), info icon afterwards
  const [noteOpen, setNoteOpen] = useState(branch === 'revised');
  const [pushOpen, setPushOpen] = useState(branch === 'revised');
  useEffect(() => {
    setNoteOpen(branch === 'revised');
    setPushOpen(branch === 'revised');
  }, [branch]);

  const choose = (q: Quote) => {
    if (q.oon) navigate(`${screenPath('C16')}?state=oon`);
    else flow.go('C16');
  };
  const profile = (q: Quote) => {
    if (q.pending) navigate(`${screenPath('C15')}?state=pending`);
    else flow.goNext();
  };

  const row = (q: Quote, className?: string) => (
    <QuoteRow
      key={q.id}
      className={[q.pending && 'hc-c14-locked', className].filter(Boolean).join(' ') || undefined}
      network={q.oon ? 'out-of-network' : 'in-network'}
      vendor={q.vendor}
      price={q.price}
      updated={q.updated}
      trustScore={q.trust}
      rating={
        q.pending ? (
          <span className="hc-c14-trust">
            <StatusPill label="Verification pending" tone="warning" />
            <span>{q.rating}</span>
          </span>
        ) : (
          q.rating
        )
      }
      reviews={q.reviews}
      nearby={q.nearby}
      details={q.details}
      onChoose={q.pending ? undefined : () => choose(q)}
      onProfile={() => profile(q)}
    />
  );

  const infoButton = <DisclosureNote variant="info-icon" onOpen={() => setNoteOpen(true)} />;
  const note = noteOpen && <DisclosureNote onDismiss={() => setNoteOpen(false)} />;
  const summary = (text: string, size: 'small' | 'medium') => (
    <div className="hc-c14-summary">
      <p className={`hc-${size} hc-muted`}>{text}</p>
      {!noteOpen && infoButton}
    </div>
  );

  const timeline = (
    <ol className="hc-c14-timeline">
      {negotiationSteps.map((s) => (
        <TimelineStep key={s.title} state={s.state} title={s.title} meta={s.meta} />
      ))}
    </ol>
  );

  // ───────────── Mobile ─────────────
  if (device === 'mobile') {
    if (branch === 'negotiating') {
      return (
        <MobileShell
          header={{ title: 'Quotes for AC repair' }}
          bottom={
            <BottomActions
              primaryLabel="Approve $235"
              onPrimary={() => flow.go('C16')}
              secondaryLabel="Keep the original $285"
              onSecondary={() => setBranch('default')}
            />
          }
          className="hc-c14-mobile"
        >
          <Banner tone="info" title={NEGOTIATING_TITLE}>
            {NEGOTIATING_BODY}
          </Banner>
          {row(negotiatedQuote)}
          {timeline}
          <p className="hc-small hc-muted">{NEGOTIATION_NOTE}</p>
        </MobileShell>
      );
    }

    const list = mobileLists[branch === 'oon' || branch === 'revised' ? branch : 'default'];
    return (
      <MobileShell header={{ title: 'Quotes: AC repair' }} tab="plan" className="hc-c14-mobile">
        {branch === 'declined' && (
          <Banner tone="info" title={DECLINED_TITLE}>
            {DECLINED_BODY}
          </Banner>
        )}
        {branch === 'oon' ? <p className="hc-small hc-muted">{list.summary}</p> : summary(list.summary, 'small')}
        {list.quotes.map((q) => row(q))}
        {note}
        {pushOpen && (
          <button type="button" className="hc-c14-push hc-c14-push--mobile" onClick={() => setPushOpen(false)}>
            <PushCard {...PUSH} />
          </button>
        )}
      </MobileShell>
    );
  }

  // ───────────── Web ─────────────
  const web = webLists[branch === 'revised' ? 'revised' : 'default'];
  const side = (
    <aside className="hc-c14-web__side">
      <section className="hc-c14-card">
        <h2 className="hc-large-bold">Member extras</h2>
        <DetailRow label="Price check" value={`Each quote vs the median of your quotes (${web.median})`} />
        <DetailRow label="Permit" value="Permit check · coming soon" />
        <DetailRow label="Rebates" value="Rebate check · coming soon" />
      </section>
      <section className="hc-c14-card hc-c14-card--rank">
        <h2 className="hc-large-bold">How we rank</h2>
        <p className="hc-small hc-muted">
          {HOW_WE_RANK} <span className="hc-c14-method">Read the published method →</span>
        </p>
      </section>
    </aside>
  );

  const head = (title: string, text: string) => (
    <header className="hc-c14-web__head">
      <div className="hc-c14-web__title">
        <h1 className="hc-h2">{title}</h1>
        {summary(text, 'medium')}
      </div>
      <Button variant="secondary" onClick={() => flow.go('C48')}>
        Get more quotes
      </Button>
      <Button variant="secondary">Decline all</Button>
    </header>
  );

  if (branch === 'negotiating') {
    return (
      <WebShell nav="plan">
        <div className="hc-c14-web">
          {head('Quotes for AC repair', SUMMARY('5 of 5', '$189'))}
          <div className="hc-c14-web__cols">
            <div className="hc-c14-web__main">
              <Banner tone="info" title={NEGOTIATING_TITLE}>
                {NEGOTIATING_BODY}
              </Banner>
              <div className="hc-c14-web__pair">
                {row(negotiatedQuote)}
                <section className="hc-c14-card">{timeline}</section>
              </div>
              <p className="hc-small hc-muted">{NEGOTIATION_NOTE}</p>
              <div className="hc-c14-web__actions">
                <Button onClick={() => flow.go('C16')}>Approve $235</Button>
                <Button variant="secondary" onClick={() => setBranch('default')}>
                  Keep the original $285
                </Button>
              </div>
            </div>
            {side}
          </div>
        </div>
      </WebShell>
    );
  }

  const grid: ReactNode[] = web.quotes.map((q) => row(q, q.oon ? 'hc-c14-wide' : undefined));

  return (
    <WebShell nav="plan">
      <div className="hc-c14-web">
        {head('Quotes for AC repair', web.summary)}
        {branch === 'declined' && (
          <Banner tone="info" title={DECLINED_TITLE}>
            {DECLINED_BODY}
          </Banner>
        )}
        <div className="hc-c14-web__cols">
          <div className="hc-c14-web__main">
            <div className="hc-c14-web__grid">{grid}</div>
            {note}
          </div>
          {side}
        </div>
      </div>
      {pushOpen && (
        <button type="button" className="hc-c14-push hc-c14-push--web" onClick={() => setPushOpen(false)}>
          <PushCard {...PUSH} />
        </button>
      )}
    </WebShell>
  );
}
