import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { TaskRow } from '../../../components/TaskRow/TaskRow';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C50-ai-usage-and-credits.css';

/** Monthly credit use, in px of a 56px chart (Figma 83:3744) */
const USAGE = [11, 28, 19, 43, 56, 24, 32, 50, 15, 37, 30, 9];

const PACKS = [
  { id: 10, label: '10 credits', price: '$2.99' },
  { id: 40, label: '40 credits', price: '$9.99' },
  { id: 120, label: '120 credits', price: '$24.99' },
];

const ACTIVITY_NOTE = 'Quote searches count only when a quote arrives. Emergencies are always free.';
const PACK_NOTE = 'Bought credits never expire. Same price in the app and on the web.';

function UsageChart({ web = false }: { web?: boolean }) {
  return (
    <div className={['hc-c50-chart', web && 'hc-c50-chart--web'].filter(Boolean).join(' ')} role="img" aria-label="Credits used each month this year">
      {USAGE.map((h, i) => (
        <span key={i} className="hc-c50-chart__bar" style={{ height: `${(h / 56) * 100}%` }} />
      ))}
    </div>
  );
}

/**
 * C50 AI usage & credits — Figma mobile 218:19641, web 218:20976 (J1 Membership & credits step 4).
 * Variant "Free user" (B10 83:3726, dark 104:5549) renders with ?state=free.
 */
export default function AiUsageAndCredits(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [params] = useSearchParams();
  const free = params.get('state') === 'free';
  const [pack, setPack] = useState<number | null>(device === 'web' ? 40 : null);

  const activity = (web: boolean) => (
    <>
      <TaskRow
        title="AC repair · quote search"
        meta={web ? 'Nov 12 · 10 credits, counted when a quote arrived' : 'Nov 12 · 10 credits'}
      />
      <TaskRow title="Voice assistant · 6 min" meta="Nov 3 · 6 credits" />
    </>
  );

  const upgrade = (
    <>
      <p className="hc-small hc-muted">Need more credits?</p>
      <Button fullWidth onClick={() => flow.go('C28')}>
        Upgrade to buy credits
      </Button>
      <p className="hc-small hc-muted">Credit packs are for members. Members get 240 credits a year and can buy packs from $2.99.</p>
    </>
  );

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'AI usage & credits' }} tab="account">
        <div className="hc-c50-stack">
          <div className="hc-c50-row">
            <div className="hc-c50-card">
              <p className="hc-small hc-muted">{free ? 'Included this month' : 'Included balance'}</p>
              <p className="hc-large-bold">{free ? '0 of 20 left' : '132 credits'}</p>
            </div>
            <div className="hc-c50-card">
              <p className="hc-small hc-muted">Next +20</p>
              <p className="hc-large-bold">Dec 1</p>
            </div>
          </div>
          <div className="hc-c50-card">
            <p className="hc-small hc-muted">Usage this year · 108 credits used</p>
            <UsageChart />
            <p className="hc-small hc-muted">
              {free ? 'Free plan: 20 credits a month · members get 240 included / yr, rolls over to 300' : '240 included / yr, rolls over to 300'}
            </p>
          </div>
          {free ? (
            upgrade
          ) : (
            <>
              <p className="hc-small hc-muted">Buy credits</p>
              <div className="hc-c50-row" role="radiogroup" aria-label="Credit packs">
                {PACKS.map((p) => (
                  <button key={p.id} type="button" role="radio" aria-checked={pack === p.id} className="hc-c50-card" onClick={() => setPack(p.id)}>
                    <span className="hc-small hc-muted">{p.label}</span>
                    <span className="hc-large-bold">{p.price}</span>
                  </button>
                ))}
              </div>
              <p className="hc-small hc-muted">{PACK_NOTE}</p>
            </>
          )}
          <div>{activity(false)}</div>
          <p className="hc-small hc-muted">{ACTIVITY_NOTE}</p>
        </div>
      </MobileShell>
    );
  }

  const selected = PACKS.find((p) => p.id === pack) ?? PACKS[1];

  return (
    <WebShell nav="account">
      <div className="hc-c50-web">
        <header className="hc-c50-web__head">
          <h1 className="hc-h2">AI usage &amp; credits</h1>
          <p className="hc-medium hc-muted">240 included / yr, rolls over to 300 · emergencies are always free</p>
        </header>
        {!free && (
          <Banner tone="warning" title="You're out of included credits">
          Buy a pack below, or wait for your next 20 credits on Dec 1. Emergencies are always free.
          </Banner>
        )}
        <div className="hc-c50-web__cols">
          <section className="hc-c50-card hc-c50-card--gap">
            {free ? (
              upgrade
            ) : (
              <>
                <h2 className="hc-large-bold">Buy credits</h2>
                <div className="hc-c50-stack hc-c50-stack--tight" role="radiogroup" aria-label="Credit packs">
                  {PACKS.map((p) => (
                    <button key={p.id} type="button" role="radio" aria-checked={pack === p.id} className="hc-c50-pack" onClick={() => setPack(p.id)}>
                      <span>{p.label}</span>
                      <span>{p.price}</span>
                    </button>
                  ))}
                </div>
                <Button className="hc-c50-start" onClick={flow.goNext}>{`Buy ${selected.label} · ${selected.price}`}</Button>
                <p className="hc-small hc-muted">{PACK_NOTE}</p>
              </>
            )}
          </section>
          <section className="hc-c50-card hc-c50-card--gap">
            <h2 className="hc-large-bold">Usage this year · 108 credits used</h2>
            <UsageChart web />
            <p className="hc-small hc-muted">
              {free
                ? 'Free plan: 20 credits a month · members get 240 included / yr, rolls over to 300'
                : '240 included / yr, rolls over to 300 · quote search 10 credits, voice 1 a minute, video coach 3 a minute, chat 1 per ~5 messages'}
            </p>
            <div>{activity(true)}</div>
            <button type="button" className="hc-c50-link" disabled>
              See all activity
            </button>
          </section>
        </div>
      </div>
    </WebShell>
  );
}
