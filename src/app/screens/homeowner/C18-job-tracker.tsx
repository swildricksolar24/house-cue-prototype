import { useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { ChangeOrderCard } from '../../../components/ChangeOrderCard/ChangeOrderCard';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { MetricRow } from '../../../components/MetricRow/MetricRow';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { TimelineStep, type TimelineStepState } from '../../../components/TimelineStep/TimelineStep';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C18-job-tracker.css';

/*
 * C18 Job tracker — Figma batch B4 (33:6).
 * Homeowner: J1 Job in progress step 2 (mobile 217:30955, web 217:31621) and Emergency step 2 (218:16083 / 218:16498, same frame).
 * Tenant: "Job tracker (tenant, status only)" J1 Tenant step 6 (272:34412 / 272:35524).
 * Branch states (?state=…): late (231:25599 / 242:17076), cancel-ask (231:25764, sheet), cancel-rebook (231:25925 / 242:17564),
 * change-order (231:26067 / 242:18084, dialog; also opens from Approve); tenant: costs (271:14297 / 271:14617).
 */

type Branch = 'default' | 'late' | 'cancel-ask' | 'cancel-rebook' | 'change-order' | 'costs';
const BRANCHES: Branch[] = ['late', 'cancel-ask', 'cancel-rebook', 'change-order', 'costs'];

type Step = { state: TimelineStepState; title: string; meta?: string };

const MOBILE_STEPS: Step[] = [
  { state: 'done', title: 'Booked', meta: 'Mon, Nov 10, 9:20 AM' },
  { state: 'done', title: 'Arrived', meta: '9:41 AM' },
  { state: 'current', title: 'In progress', meta: 'Started 9:50 AM' },
  { state: 'upcoming', title: 'Completed', meta: 'You’ll check the work and sign off' },
];

const WEB_STEPS: Step[] = [
  { state: 'done', title: 'Booked', meta: 'Mon, Nov 10, 9:20 AM · $189 held' },
  { state: 'done', title: 'Pro on the way', meta: 'Left at 9:05 AM' },
  { state: 'done', title: 'Arrived', meta: '9:41 AM' },
  { state: 'current', title: 'In progress', meta: 'Started 9:50 AM' },
  { state: 'upcoming', title: 'Parts needed', meta: 'Only if a part has to be ordered' },
  { state: 'upcoming', title: 'Completed', meta: 'You’ll check the work and sign off' },
];

const TENANT_STEPS: Step[] = [
  { state: 'done', title: 'Reported', meta: 'Nov 8 · you' },
  { state: 'done', title: 'Approved by landlord', meta: 'Nov 9 · Mesa Verde Holdings' },
  { state: 'current', title: 'Scheduled', meta: 'Thu Nov 13, 8–10 AM · Bluequail Air' },
  { state: 'upcoming', title: 'In progress' },
  { state: 'upcoming', title: 'Done', meta: 'You confirm the work is complete' },
];

function Timeline({ steps }: { steps: Step[] }) {
  return (
    <ol className="hc-c18-timeline">
      {steps.map((s) => (
        <TimelineStep key={s.title} state={s.state} title={s.title} meta={s.meta} />
      ))}
    </ol>
  );
}

function useBranch(): [Branch, (b: Branch) => void] {
  const [params] = useSearchParams();
  const raw = params.get('state') as Branch | null;
  return useState<Branch>(raw && BRANCHES.includes(raw) ? raw : 'default');
}

export default function JobTracker({ variant }: ScreenProps) {
  if (variant === 'Job tracker (tenant, status only)') return <TenantJobTracker />;
  return <HomeownerJobTracker />;
}

/* ---------------------------------------------------------------- homeowner */

function HomeownerJobTracker() {
  const { device } = usePrototype();
  const flow = useFlow();
  const [branch, setBranch] = useBranch();
  const [order, setOrder] = useState<'pending' | 'approved' | 'declined'>('pending');

  const banner =
    branch === 'late' ? (
      <Banner tone="warning" title="Running about 35 minutes late">
        Zephyrline HVAC’s new ETA is 9:45 AM. Want your agent to reschedule instead?
      </Banner>
    ) : branch === 'cancel-rebook' ? (
      <Banner tone="success" title="Rebooked automatically">
        Zephyrline HVAC cancelled. Within your spend rules, your agent booked Mesa Comfort Co. for $235, Fri 8–10 AM. You can
        cancel free until Thu 8 AM.
      </Banner>
    ) : null;

  const changeOrder =
    order === 'pending' ? (
      <ChangeOrderCard
        meta="From the pro · 10:05 AM"
        title="Replace the run capacitor (+$185)"
        body="The capacitor is failing. New total $374. Your payment hold goes up to match, and it still needs your OK."
        onApprove={() => setBranch('change-order')}
        onDecline={() => setOrder('declined')}
      />
    ) : null;

  const closeOverlay = () => setBranch('default');

  const approveDialog = branch === 'change-order' && (
    <div className="hc-c18-overlay hc-c18-overlay--center" onClick={closeOverlay}>
      <div
        className="hc-c18-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hc-c18-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="hc-c18-dialog-title" className="hc-h4">
          Approve change order: +$86
        </h2>
        <p className="hc-medium hc-muted">
          Run capacitor replacement. The new total, $374, is over your $300 cap, so it needs your OK. Your payment hold updates to
          $374.
        </p>
        <Button
          size="large"
          fullWidth
          onClick={() => {
            setOrder('approved');
            closeOverlay();
          }}
        >
          Approve $374
        </Button>
        <Button size="large" variant="secondary" fullWidth onClick={() => flow.go('C19')}>
          Ask a question
        </Button>
      </div>
    </div>
  );

  const cancelSheet = branch === 'cancel-ask' && (
    <div className={`hc-c18-overlay hc-c18-overlay--${device === 'mobile' ? 'bottom' : 'center'}`} onClick={closeOverlay}>
      <div
        className="hc-c18-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hc-c18-sheet-title"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="hc-c18-sheet__grabber" aria-hidden />
        <h2 id="hc-c18-sheet-title" className="hc-h4">
          Zephyrline HVAC cancelled Thu 8–10 AM
        </h2>
        <p className="hc-medium hc-muted">
          You asked to be asked first. Book the next-ranked quote: Mesa Comfort Co., $235, Fri 8–10 AM? It’s within your spend
          rules.
        </p>
        <Button size="large" fullWidth onClick={() => setBranch('cancel-rebook')}>
          Book Mesa Comfort Co.
        </Button>
        <Button size="large" variant="secondary" fullWidth onClick={closeOverlay}>
          Not now
        </Button>
      </div>
    </div>
  );

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'AC repair' }} tab="jobs" className="hc-c18-mobile">
        <div className="hc-c18-stack">
          {banner}
          <p className="hc-small hc-muted">Zephyrline HVAC · Thu, Nov 13</p>
          <Timeline steps={MOBILE_STEPS} />
          {changeOrder}
          <div className="hc-c18-row">
            <Button variant="secondary" onClick={flow.goNext}>
              Message
            </Button>
            <Button variant="secondary" onClick={() => flow.go('C32')}>
              Get help
            </Button>
          </div>
        </div>
        {approveDialog}
        {cancelSheet}
      </MobileShell>
    );
  }

  const held = order === 'approved' ? '$374' : order === 'declined' ? '$189' : '$189 (+$185 if you approve)';

  return (
    <WebShell nav="jobs">
      <div className="hc-c18-web">
        <header className="hc-c18-web__head">
          <h1 className="hc-h2">AC repair</h1>
          <StatusPill label="In progress" tone="warning" />
          <Button variant="secondary">Cancel job</Button>
        </header>
        {banner}
        <div className="hc-c18-web__cols">
          <section className="hc-c18-card hc-c18-web__main">
            <h2 className="hc-large-bold">Status</h2>
            <Timeline steps={WEB_STEPS} />
          </section>
          <aside className="hc-c18-web__side">
            {changeOrder}
            <section className="hc-c18-card">
              <DetailRow label="Pro" value="Zephyrline HVAC" />
              <DetailRow label="When" value="Thu, Nov 13, 8–10 AM" />
              <DetailRow label="Held on your card" value={held} />
              <DetailRow label="Who’s home" value="You" actionLabel="Edit" actionDisabled />
            </section>
            <Button variant="secondary" fullWidth onClick={flow.goNext}>
              Message the pro
            </Button>
          </aside>
        </div>
      </div>
      {approveDialog}
      {cancelSheet}
    </WebShell>
  );
}

/* ---------------------------------------------------------------- tenant */

function TenantJobTracker() {
  const { device } = usePrototype();
  const [branch] = useBranch();
  const costs = branch === 'costs';

  if (device === 'mobile') {
    return (
      <MobileShell role="tenant" tab="jobs" header={{ title: 'Bedroom AC not cooling' }}>
        <div className="hc-c18-stack">
          <Timeline steps={costs ? TENANT_STEPS.filter((s) => s.title !== 'In progress') : TENANT_STEPS} />
          {costs ? (
            <>
              <MetricRow label="Approved price" value="$265.00" />
              <MetricRow label="Change orders" value="None" />
              <p className="hc-small hc-muted">Read-only. Your landlord pays; quotes aren’t shown.</p>
            </>
          ) : (
            <Banner tone="info">Status only: your landlord keeps prices private.</Banner>
          )}
        </div>
      </MobileShell>
    );
  }

  let side: ReactNode;
  if (costs) {
    side = (
      <section className="hc-c18-card hc-c18-card--compact">
        <h2 className="hc-large-bold">Cost</h2>
        <MetricRow label="Approved price" value="$265.00" />
        <MetricRow label="Change orders" value="None" />
        <MetricRow label="Paid by" value="Mesa Verde Holdings" />
        <p className="hc-small hc-muted">Read-only. Quote comparisons stay with your landlord (W54).</p>
      </section>
    );
  } else {
    side = (
      <>
        <section className="hc-c18-card hc-c18-card--compact">
          <h2 className="hc-large-bold">Visit</h2>
          <DetailRow label="Vendor" value="Bluequail Air Service" />
          <DetailRow label="Visit" value="Thu Nov 13, 8–10 AM" />
          <DetailRow label="Entry" value="Allowed when you’re out · lockbox" />
          <DetailRow label="Notice" value="Sent Nov 10 (2 days)" />
        </section>
        <Banner tone="info">Status only: your landlord keeps prices private (W54).</Banner>
      </>
    );
  }

  return (
    <WebShell role="tenant" nav="jobs">
      <div className="hc-c18-web">
        <header className="hc-c18-web__head">
          <h1 className="hc-h2">AC repair</h1>
          <StatusPill label="In progress" tone="warning" />
          <Button variant="secondary">Cancel job</Button>
        </header>
        <div className="hc-c18-web__cols">
          <div className="hc-c18-web__tenant-main">
            <Timeline steps={TENANT_STEPS} />
          </div>
          <aside className="hc-c18-web__side hc-c18-web__side--fill">{side}</aside>
        </div>
      </div>
    </WebShell>
  );
}
