import { useState } from 'react';
import { ActionCard } from '../../../components/ActionCard/ActionCard';
import { AgentFab } from '../../../components/AgentFab/AgentFab';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { ListRow } from '../../../components/ListRow/ListRow';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';
import { StateBlock } from '../../../components/StateBlock/StateBlock';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { screenPath } from '../../prototype/journeys';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C86-approval-queue.css';

type Report = {
  id: string;
  title: string;
  /** Web table property cell */
  property: string;
  estimate: string;
  waiting: string;
  /** Mobile card meta / list title */
  mobileMeta: string;
  mobileTitle: string;
  mobileDescription: string;
  mobileBody: string;
  tenant: string;
  triage: string;
  estimateDetail: string;
  photos: string;
};

/** Tenant reports over the landlord's ceilings (Figma C86). Detail rows for the 2nd and 3rd report are prototype fill-ins. */
const reports: Report[] = [
  {
    id: 'sink',
    title: 'Kitchen sink leaking',
    property: '1418 E Roosevelt · A',
    estimate: '$180–$260',
    waiting: '26 h',
    mobileMeta: '1418 E Roosevelt · Unit A · Plumbing',
    mobileTitle: '1418 E Roosevelt · Unit A · Plumbing',
    mobileDescription: 'Kitchen sink leaking · est. $180–$260 · 26 h',
    mobileBody: 'Est. $180–$260 · over your $150 ceiling · waiting 26 h',
    tenant: 'Marisol Ortega · Unit A',
    triage: 'Slow leak at the P-trap; not urgent; plumber',
    estimateDetail: '$180–$260 (routine ceiling $150)',
    photos: '3 · video 1',
  },
  {
    id: 'outlet',
    title: 'Outlet sparks when used',
    property: '2207 N 9th Ave',
    estimate: '$120–$200',
    waiting: '4 h',
    mobileMeta: '2207 N 9th Ave · Electrical',
    mobileTitle: '2207 N 9th Ave · Electrical',
    mobileDescription: 'Outlet sparks when used · est. $120–$200 · 4 h',
    mobileBody: 'Est. $120–$200 · over your $100 ceiling · waiting 4 h',
    tenant: 'Priya H.',
    triage: 'Sparking outlet; stop using it; electrician',
    estimateDetail: '$120–$200 (routine ceiling $100)',
    photos: '2',
  },
  {
    id: 'dishwasher',
    title: 'Dishwasher won’t drain',
    property: '5602 E Pima · 3',
    estimate: '$140–$220',
    waiting: '1 h',
    mobileMeta: '5602 E Pima · Unit 3 · Appliances',
    mobileTitle: '5602 E Pima · Unit 3 · Appliances',
    mobileDescription: 'Dishwasher won’t drain · est. $140–$220 · 1 h',
    mobileBody: 'Est. $140–$220 · over your $100 ceiling · waiting 1 h',
    tenant: 'Unit 3 tenant',
    triage: 'Likely clogged drain hose; appliance repair',
    estimateDetail: '$140–$220 (routine ceiling $100)',
    photos: '1',
  },
];

const filters = ['All properties', 'Routine', 'Emergency', 'Oldest first'];

/** C86 Approval queue — Figma mobile 272:32136, web 272:33084; states 263:4890/4949/5014 (mobile), 263:5082/5219/5368 (web) */
export default function ApprovalQueue(_: ScreenProps) {
  const { device, screenState } = usePrototype();
  const flow = useFlow();
  const [declined, setDeclined] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState('sink');

  const open = reports.filter((r) => !declined.includes(r.id));
  const selected = open.find((r) => r.id === selectedId) ?? open[0] ?? reports[0];
  const decline = (id: string) => {
    setDeclined((d) => [...d, id]);
    const next = open.find((r) => r.id !== id);
    if (next) setSelectedId(next.id);
  };

  const stateBlock = () => {
    if (screenState === 'loading') {
      return (
        <div className="hc-c86-stack">
          {Array.from({ length: 3 }, (_, i) => (
            <SkeletonCard key={i} label="Loading approvals" />
          ))}
        </div>
      );
    }
    if (screenState === 'empty' || (screenState === 'default' && open.length === 0)) {
      return (
        <StateBlock
          title="You’re all caught up"
          body="Tenant reports over your ceilings will appear here."
          actionLabel="Get started"
          onAction={() => flow.go('C79')}
        />
      );
    }
    if (screenState === 'error') {
      return (
        <StateBlock
          kind="error"
          title="Could not load approvals"
          body="Check your connection and try again. Your data is safe."
          actionLabel="Try again"
          onAction={() => undefined}
        />
      );
    }
    return null;
  };

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Approvals', showBack: false }} role="landlord" tab="jobs">
        <p className="hc-medium hc-muted">3 tenant reports over your ceilings · all properties</p>
        {stateBlock() ?? (
          <>
            {/* HC/Action Card always renders three buttons; Figma shows two, so the third (Reject) is hidden in CSS */}
            <ActionCard
              className="hc-c86-action"
              meta={selected.mobileMeta}
              title={selected.title}
              body={selected.mobileBody}
              approveLabel="Approve & get quotes"
              editLabel="Decline"
              onApprove={flow.goNext}
              onEdit={() => decline(selected.id)}
            />
            <div>
              {open
                .filter((r) => r.id !== selected.id)
                .map((r) => (
                  <button key={r.id} type="button" className="hc-c86-row" onClick={() => setSelectedId(r.id)}>
                    <ListRow title={r.mobileTitle} description={r.mobileDescription} icon="schedule" />
                  </button>
                ))}
            </div>
          </>
        )}
        <AgentFab to={screenPath('C09')} className="hc-c86-fab hc-c86-fab--mobile" />
      </MobileShell>
    );
  }

  return (
    <WebShell role="landlord" nav="jobs">
      <div className="hc-c86-web">
        <header className="hc-c86-web__head">
          <div className="hc-c86-web__title">
            <h1 className="hc-h2">Approval queue</h1>
            <p className="hc-medium hc-muted">Tenant reports awaiting you or a manager with approve permission · first decision wins</p>
          </div>
          <Button variant="secondary" onClick={() => flow.go('C81')}>
            Approval rules
          </Button>
        </header>
        <div className="hc-c86-chips">
          {filters.map((f) => (
            <StatusPill key={f} label={f} tone="neutral" />
          ))}
        </div>
        <div className="hc-c86-web__cols">
          <div className="hc-c86-web__main">
            {stateBlock() ?? (
              <div className="hc-c86-table" role="table" aria-label="Reports awaiting approval">
                <div className="hc-c86-table__row hc-c86-table__row--head" role="row">
                  <span role="columnheader">Report</span>
                  <span role="columnheader">Property</span>
                  <span role="columnheader">Estimate</span>
                  <span role="columnheader">Waiting</span>
                </div>
                {open.map((r) => (
                  <div
                    key={r.id}
                    role="row"
                    tabIndex={0}
                    aria-selected={r.id === selected.id}
                    className={['hc-c86-table__row', 'hc-c86-table__row--link', r.id === selected.id && 'hc-c86-table__row--selected']
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => setSelectedId(r.id)}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedId(r.id)}
                  >
                    <span role="cell" className="hc-medium-semibold">
                      {r.title}
                    </span>
                    <span role="cell">{r.property}</span>
                    <span role="cell">{r.estimate}</span>
                    <span role="cell">{r.waiting}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <aside className="hc-c86-web__side">
            <section className="hc-c86-card">
              <h2 className="hc-large-bold">{selected.title}</h2>
              <DetailRow label="Tenant" value={selected.tenant} />
              <DetailRow label="Agent triage" value={selected.triage} />
              <DetailRow label="Estimate" value={selected.estimateDetail} />
              <DetailRow label="Photos" value={selected.photos} />
              <DetailRow label="Damage flag" value="None" />
              <Button fullWidth onClick={flow.goNext}>
                Approve &amp; get quotes
              </Button>
              <Button fullWidth variant="secondary" onClick={flow.goNext}>
                Approve a known vendor
              </Button>
              <div className="hc-c86-buttons">
                <Button variant="tertiary" onClick={() => flow.go('C09')}>
                  Ask the tenant
                </Button>
                <Button variant="destructive" onClick={() => decline(selected.id)}>
                  Decline
                </Button>
              </div>
            </section>
          </aside>
        </div>
      </div>
      <AgentFab size="extended" to={screenPath('C09')} className="hc-c86-fab" />
    </WebShell>
  );
}
