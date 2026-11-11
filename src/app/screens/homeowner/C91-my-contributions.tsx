import { useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { ListRow } from '../../../components/ListRow/ListRow';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';
import { StatTile } from '../../../components/StatTile/StatTile';
import { StateBlock } from '../../../components/StateBlock/StateBlock';
import { StatusPill, type StatusTone } from '../../../components/StatusPill/StatusPill';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C91-my-contributions.css';

type Tab = 'recs' | 'guides';

type Rec = {
  id: string;
  name: string;
  status: string;
  tone: StatusTone;
  mobileMeta: string;
  webMeta: string;
  note?: string;
  action: 'Remove' | 'Withdraw';
};

const recommendations: Rec[] = [
  {
    id: 'zephyrline',
    name: 'Zephyrline HVAC',
    status: 'Counted',
    tone: 'success',
    mobileMeta: 'HVAC · Nov 10, 2026',
    webMeta: 'HVAC · recommended Nov 10, 2026',
    note: '“On time, explained the repair, fair price.”',
    action: 'Remove',
  },
  {
    id: 'saguaro',
    name: 'Saguaro Spark Electric',
    status: 'Waiting to join',
    tone: 'info',
    mobileMeta: 'Not on HouseCue yet · invited Nov 4',
    webMeta: 'Electrical · not on HouseCue yet · invited Nov 4',
    note: 'Held until they join, then it counts.',
    action: 'Withdraw',
  },
  {
    id: 'glasswing',
    name: 'Glasswing Pools',
    status: 'Counted',
    tone: 'success',
    mobileMeta: 'Pool care · Jun 2026',
    webMeta: 'Pool care · recommended Jun 2026',
    action: 'Remove',
  },
  {
    id: 'copperwick',
    name: 'Copperwick Pipe Co.',
    status: 'Under review',
    tone: 'warning',
    mobileMeta: 'Plumbing · Nov 9 · checking first',
    webMeta: 'Plumbing · recommended Nov 9',
    note: 'We check new recommendations for unusual patterns first.',
    action: 'Withdraw',
  },
];

type Suggestion = { id: string; title: string; status: string; tone: StatusTone; meta: string; note: string; pending?: boolean; webOnly?: boolean };

const suggestions: Suggestion[] = [
  {
    id: 'hvac-filter',
    title: 'Replace HVAC filter · step 2',
    status: 'Accepted · credited',
    tone: 'success',
    meta: 'Tip added · accepted Nov 3',
    note: 'Footnote on the step: “Thanks to Maria G.”',
  },
  {
    id: 'water-heater',
    title: 'Flush the water heater · step 4',
    status: 'Pending review',
    tone: 'warning',
    meta: 'Warning wording · sent Nov 7',
    note: 'Checked for safety by the Care Library agent; an admin decides next.',
    pending: true,
  },
  {
    id: 'dryer-vent',
    title: 'Clean the dryer vent · step 3',
    status: 'Declined',
    tone: 'neutral',
    meta: 'Text change · sent Oct 21',
    note: 'Reason: repeats the existing warning on step 2.',
    webOnly: true,
  },
  {
    id: 'gfci',
    title: 'Test GFCI outlets · step 1',
    status: 'Credit removed',
    tone: 'danger',
    meta: 'Accepted Sep 12 · step rewritten Oct 30',
    note: 'The step text changed, so your name was removed from its footnote.',
    webOnly: true,
  },
];

/**
 * C91 My contributions — Figma mobile 300:32137 / web 300:32932 (Recommendations) and mobile 300:32404 / web 300:33345
 * (variant "My contributions (guide suggestions)"); states 310:3662–310:6042 (empty, loading, error per tab).
 */
export default function MyContributions({ variant }: ScreenProps) {
  const { device, screenState } = usePrototype();
  const flow = useFlow();
  const [tab, setTab] = useState<Tab>(variant.includes('guide suggestions') ? 'guides' : 'recs');
  const [removed, setRemoved] = useState<string[]>([]);

  const isWeb = device === 'web';
  const recs = recommendations.filter((r) => !removed.includes(r.id));
  const guides = suggestions.filter((s) => !removed.includes(s.id) && (isWeb || !s.webOnly));
  const remove = (id: string) => setRemoved((r) => [...r, id]);
  const empty = screenState === 'empty';

  const segmented = (
    <div className="hc-c91-segmented" role="tablist" aria-label="Contribution type">
      {(
        [
          ['recs', 'Recommendations'],
          ['guides', 'Guide suggestions'],
        ] as const
      ).map(([key, label]) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={tab === key}
          className={['hc-c91-segment', tab === key && 'hc-c91-segment--selected'].filter(Boolean).join(' ')}
          onClick={() => setTab(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );

  const stats =
    tab === 'recs' ? (
      <div className="hc-c91-stats">
        <StatTile label="Counted" value={empty ? '0' : '2'} meta={empty ? 'nothing yet' : isWeb ? 'feeding reputation' : 'feed reputation'} />
        <StatTile label="Pending" value={empty ? '0' : '2'} meta={empty ? 'nothing yet' : isWeb ? 'waiting or in review' : '1 waiting · 1 review'} />
      </div>
    ) : (
      <div className="hc-c91-stats">
        <StatTile label="Credited" value={empty ? '0' : '1'} meta={empty ? 'nothing yet' : isWeb ? '1 step footnote' : 'footnote on 1 step'} />
        <StatTile label="Pending" value={empty ? '0' : '1'} meta={empty ? 'nothing yet' : 'admin decides'} />
      </div>
    );

  const stateBlock = () => {
    if (screenState === 'loading') {
      return (
        <div className="hc-c91-list">
          {Array.from({ length: 4 }, (_, i) => (
            <SkeletonCard key={i} label="Loading contributions" />
          ))}
        </div>
      );
    }
    if (screenState === 'empty') {
      return tab === 'recs' ? (
        <StateBlock title="No recommendations yet" body="Recommend a pro you’ve hired. It shows on their profile without your name." />
      ) : (
        <StateBlock title="No guide suggestions yet" body="Open any Care Library guide and choose Suggest a change on a step." />
      );
    }
    if (screenState === 'error') {
      return (
        <StateBlock
          kind="error"
          title="Couldn’t load your contributions"
          body="Check your connection and try again."
          actionLabel="Try again"
        />
      );
    }
    return null;
  };

  const recItems = (
    <div className="hc-c91-list">
      {recs.map((r) => (
        <article key={r.id} className={isWeb ? 'hc-c91-item hc-c91-item--web' : 'hc-c91-item hc-c91-item--rec'}>
          <div className="hc-c91-item__top">
            <h3 className="hc-c91-item__title">{r.name}</h3>
            <StatusPill label={r.status} tone={r.tone} />
          </div>
          {isWeb ? (
            <>
              <p className="hc-small hc-muted">{r.webMeta}</p>
              {r.note && <p className="hc-small">{r.note}</p>}
              <div className="hc-c91-item__actions">
                <Button variant="link" size="small" onClick={() => remove(r.id)}>
                  {r.action}
                </Button>
              </div>
            </>
          ) : (
            <div className="hc-c91-item__top">
              <p className="hc-small hc-muted hc-c91-grow">{r.mobileMeta}</p>
              <Button variant="link" onClick={() => remove(r.id)}>
                {r.action}
              </Button>
            </div>
          )}
        </article>
      ))}
    </div>
  );

  const guideItems = (
    <div className="hc-c91-list">
      {guides.map((s) => (
        <article key={s.id} className={isWeb ? 'hc-c91-item hc-c91-item--web' : 'hc-c91-item hc-c91-item--guide'}>
          <div className="hc-c91-item__top">
            <h3 className="hc-c91-item__title">{s.title}</h3>
            <StatusPill label={s.status} tone={s.tone} />
          </div>
          <p className="hc-small hc-muted">{s.meta}</p>
          <p className="hc-small">{s.note}</p>
          {s.pending && (
            <div className="hc-c91-item__actions">
              <Button variant="link" size={isWeb ? 'small' : 'medium'} onClick={() => flow.go('C12')}>
                Edit
              </Button>
              <Button variant="link" size={isWeb ? 'small' : 'medium'} onClick={() => remove(s.id)}>
                Withdraw
              </Button>
            </div>
          )}
        </article>
      ))}
    </div>
  );

  const items = tab === 'recs' ? recItems : guideItems;

  if (!isWeb) {
    const body = stateBlock();
    return (
      <MobileShell header={{ title: 'My contributions' }} tab="account" className={tab === 'recs' ? 'hc-c91-mobile--recs' : undefined}>
        {segmented}
        {body ?? (
          <>
            {stats}
            {items}
            {tab === 'recs' ? (
              <Button variant="link" className="hc-c91-view-guide" onClick={flow.goNext}>
                View guide: Replace HVAC filter ›
              </Button>
            ) : (
              <p className="hc-small hc-muted">Credit belongs to the accepted text: if that text changes later, your name comes off the footnote.</p>
            )}
          </>
        )}
      </MobileShell>
    );
  }

  return (
    <WebShell nav="account">
      <div className="hc-c91-web">
        <button type="button" className="hc-c91-back" onClick={() => flow.go('C34')}>
          ‹ Account
        </button>
        <header className="hc-c91-web__head">
          <div className="hc-c91-web__title">
            <h1 className="hc-h2">My contributions</h1>
            <p className="hc-medium hc-muted">Pros you recommended and changes you suggested to Care Library guides.</p>
          </div>
          <Button onClick={() => flow.go('C90')}>Recommend a pro</Button>
        </header>
        {segmented}
        <div className="hc-c91-web__cols">
          <div className="hc-c91-web__main">{stateBlock() ?? items}</div>
          <aside className="hc-c91-web__side">
            {stats}
            {tab === 'recs' ? (
              <>
                {!empty && (
                  <button type="button" className="hc-c91-row" onClick={flow.goNext}>
                    <ListRow title="View guide: Replace HVAC filter" description="Your tip is credited on step 2" />
                  </button>
                )}
                <section className="hc-c91-card">
                  <h2 className="hc-large-bold">How your recommendations count</h2>
                  <p className="hc-medium">• Counted: shown on the pro’s profile and quotes, and part of their Reputation score.</p>
                  <p className="hc-medium">• Waiting to join: the business was invited; it counts once they join.</p>
                  <p className="hc-medium">• Under review: checked for unusual patterns before it counts.</p>
                  <p className="hc-medium">• Not counted: removed by you or found to break the rules.</p>
                </section>
                <Banner tone="info">If you delete your account, counted recommendations keep counting without your name.</Banner>
              </>
            ) : (
              <>
                <section className="hc-c91-card">
                  <h2 className="hc-large-bold">How guide credits work</h2>
                  <p className="hc-medium">
                    • The Care Library agent checks each suggestion for safety and accuracy; an admin approves or declines.
                  </p>
                  <p className="hc-medium">• Accepted changes carry a footnote: “Thanks to Maria G.”</p>
                  <p className="hc-medium">• If the credited text is later changed, your name comes off that footnote.</p>
                </section>
                <Banner tone="info">Footnote credits show your first name and last initial only.</Banner>
              </>
            )}
          </aside>
        </div>
      </div>
    </WebShell>
  );
}
