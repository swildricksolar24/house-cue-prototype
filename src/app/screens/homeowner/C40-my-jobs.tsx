import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import type { IconName } from '../../../components/Icon/Icon';
import { ListRow } from '../../../components/ListRow/ListRow';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';
import { StateBlock } from '../../../components/StateBlock/StateBlock';
import { StatusPill, type StatusTone } from '../../../components/StatusPill/StatusPill';
import { TaskRow, type TaskRowTagTone } from '../../../components/TaskRow/TaskRow';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C40-my-jobs.css';

type Filter = 'upcoming' | 'active' | 'past';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'active', label: 'Active' },
  { key: 'past', label: 'Past' },
];

type JobTone = TaskRowTagTone | 'neutral';
type Job = {
  id: string;
  title: string;
  meta: string;
  /** Web copy where it differs from mobile */
  webMeta?: string;
  icon: IconName;
  tag: string;
  tone: JobTone;
  /** Screen the row opens */
  to?: string;
};

/** Jobs and requests from the Figma frames (mobile 211:11348, web 211:11349). Invented sample pros. */
const JOBS: Record<string, Job> = {
  ac: {
    id: 'ac',
    title: 'AC repair',
    meta: 'Zephyrline HVAC · Thu, Nov 13, 8–10 AM',
    webMeta: 'Zephyrline HVAC · Thu, Nov 13, 8–10 AM · $189 held',
    icon: 'service',
    tag: 'Booked',
    tone: 'success',
    to: 'C18',
  },
  garage: {
    id: 'garage',
    title: 'Garage door spring',
    meta: 'Larkspur Door Co. · today · in progress',
    icon: 'service',
    tag: 'In progress',
    tone: 'warning',
    to: 'C18',
  },
  quotes: {
    id: 'quotes',
    title: 'Getting quotes: water heater',
    meta: '3 of 5 in · window closes 6 PM',
    icon: 'search',
    tag: 'Quotes',
    tone: 'warning',
    to: 'C48',
  },
  estimate: {
    id: 'estimate',
    title: 'Estimate visit: pool pump',
    meta: 'Fernhollow Pool Care · Mon, Nov 17, 1 PM',
    webMeta: 'Mon, Nov 17, 1 PM · confirm by tonight',
    icon: 'calendar',
    tag: 'Estimate',
    tone: 'neutral',
    to: 'C49',
  },
  pool: {
    id: 'pool',
    title: 'Pool pump repair',
    meta: 'Feb 10, 2026 · $320 · you reviewed it',
    webMeta: 'Fernhollow Pool Care · Feb 10, 2026 · $320',
    icon: 'check',
    tag: 'Done',
    tone: 'success',
  },
  dryer: {
    id: 'dryer',
    title: 'Dryer vent cleaning',
    meta: 'Cancelled by the pro · hold released in full',
    icon: 'close',
    tag: 'Cancelled',
    tone: 'neutral',
  },
};

/** Mobile list per filter: Upcoming is the Figma frame (upcoming rows + a "Past" section) */
const MOBILE: Record<Filter, { rows: string[]; past?: string[] }> = {
  upcoming: { rows: ['ac', 'quotes', 'estimate'], past: ['pool'] },
  active: { rows: ['garage', 'quotes'] },
  past: { rows: ['pool', 'dryer'] },
};

/** Web "Jobs" card per filter (Upcoming = the Figma frame); the "Requests in progress" card stays */
const WEB_JOBS: Record<Filter, string[]> = {
  upcoming: ['ac', 'garage', 'pool', 'dryer'],
  active: ['garage'],
  past: ['pool', 'dryer'],
};
const WEB_REQUESTS = ['quotes', 'estimate'];

/** Tenant view, status only (Figma 269:15512 / 321:75712) */
const TENANT_JOBS: { title: string; meta: string; vendor: string; when: string; status: string; tone: StatusTone }[] = [
  {
    title: 'Bedroom AC not cooling',
    meta: 'Scheduled · Thu Nov 13, 8–10 AM · Bluequail Air',
    vendor: 'Bluequail Air Service',
    when: 'Thu Nov 13, 8–10 AM',
    status: 'Scheduled',
    tone: 'info',
  },
  {
    title: 'Kitchen sink leaking',
    meta: 'Awaiting landlord · reported Nov 8',
    vendor: '—',
    when: 'Reported Nov 8',
    status: 'Awaiting landlord',
    tone: 'warning',
  },
  {
    title: 'Bathroom fan noisy',
    meta: 'Done · Oct 28 · Copperwick Pipe Co.',
    vendor: 'Copperwick Pipe Co.',
    when: 'Oct 28',
    status: 'Done',
    tone: 'success',
  },
];

const TENANT_NOTE = 'Your landlord shows job status only. Prices and invoices aren’t shown.';

/** C40 My jobs — Figma mobile 211:11348, web 211:11349 (J1 Review & book step 5, Job in progress step 1).
 *  States: ?state=empty|loading|error (109:4106…109:4617), ?state=tenant (tenant view, status only, 272:35989 / 321:75712). */
export default function MyJobs(_: ScreenProps) {
  const { device, screenState, setScreenState } = usePrototype();
  const flow = useFlow();
  const [params] = useSearchParams();
  const [tenant] = useState(params.get('state') === 'tenant');
  const [filter, setFilter] = useState<Filter>('upcoming');

  const open = (code?: string) => {
    if (!code) return undefined;
    // Stay inside the journey when the next step is the screen the row opens (Job in progress → C18)
    return () => (flow.journey.steps[flow.index + 1]?.code === code ? flow.goNext() : flow.go(code));
  };

  const row = (id: string, web = false) => {
    const j = JOBS[id];
    return (
      <TaskRow
        key={id}
        title={j.title}
        meta={web ? j.webMeta ?? j.meta : j.meta}
        icon={j.icon}
        tag={j.tag}
        tagTone={j.tone === 'neutral' ? 'info' : j.tone}
        className={j.tone === 'neutral' ? 'hc-c40-row--neutral' : undefined}
        onClick={open(j.to)}
      />
    );
  };

  const chips = (
    <div className="hc-c40-chips" role="radiogroup" aria-label="Show jobs">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          type="button"
          role="radio"
          aria-checked={filter === f.key}
          className={['hc-c40-chip', filter === f.key && 'hc-c40-chip--selected'].filter(Boolean).join(' ')}
          onClick={() => setFilter(f.key)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );

  const empty = (
    <StateBlock
      title="No jobs yet"
      body="Jobs you request or book show up here."
      actionLabel="Request a service"
      onAction={() => flow.go('C13')}
    />
  );
  const error = (
    <StateBlock
      kind="error"
      title="Couldn’t load your jobs"
      body="Check your connection and try again. Nothing was lost."
      actionLabel="Try again"
      onAction={() => setScreenState('default')}
    />
  );
  const loading = (
    <>
      <SkeletonCard label="Loading jobs" />
      <SkeletonCard label="Loading jobs" />
      <SkeletonCard label="Loading jobs" />
    </>
  );
  const stateContent = screenState === 'empty' ? empty : screenState === 'error' ? error : screenState === 'loading' ? loading : null;

  /* ---------------- Tenant view (status only) ---------------- */
  if (tenant) {
    const pills = (
      <div className="hc-c40-pills">
        <StatusPill label="Upcoming" tone="info" />
        <StatusPill label="Active" tone="success" />
        <StatusPill label="Past" tone="neutral" />
      </div>
    );

    if (device === 'mobile') {
      return (
        <MobileShell role="tenant" tab="jobs" header={{ title: 'Jobs', showBack: false }}>
          {pills}
          <div>
            {TENANT_JOBS.map((j) => (
              <ListRow key={j.title} title={j.title} description={j.meta} />
            ))}
          </div>
          <Banner tone="info">{TENANT_NOTE}</Banner>
        </MobileShell>
      );
    }

    return (
      <WebShell role="tenant" nav="jobs">
        <div className="hc-c40-web">
          <header className="hc-c40-web__head">
            <h1 className="hc-h2">Jobs</h1>
            <div className="hc-c40-web__chips">{chips}</div>
            <Button onClick={() => flow.go('C13')}>New request</Button>
          </header>
          {pills}
          <div className="hc-c40-table-wrap">
            <table className="hc-c40-table">
              <thead>
                <tr>
                  <th scope="col">Job</th>
                  <th scope="col">Vendor</th>
                  <th scope="col">When</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {TENANT_JOBS.map((j) => (
                  <tr key={j.title}>
                    <th scope="row">{j.title}</th>
                    <td>{j.vendor}</td>
                    <td>{j.when}</td>
                    <td>
                      <StatusPill label={j.status} tone={j.tone} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Banner tone="info">{TENANT_NOTE}</Banner>
        </div>
      </WebShell>
    );
  }

  /* ---------------- Homeowner ---------------- */
  if (device === 'mobile') {
    const list = MOBILE[filter];
    return (
      <MobileShell tab="jobs" header={{ title: 'My jobs', showBack: false }}>
        {chips}
        {stateContent ?? (
          <>
            <div>{list.rows.map((id) => row(id))}</div>
            {list.past && (
              <>
                <h2 className="hc-large-bold">Past</h2>
                <div>{list.past.map((id) => row(id))}</div>
              </>
            )}
          </>
        )}
      </MobileShell>
    );
  }

  return (
    <WebShell nav="jobs">
      <div className="hc-c40-web">
        <header className="hc-c40-web__head">
          <h1 className="hc-h2">My jobs</h1>
          <div className="hc-c40-web__chips">{chips}</div>
          <Button onClick={() => flow.go('C13')}>New request</Button>
        </header>
        <div className="hc-c40-web__cols">
          <section className="hc-c40-card hc-c40-web__main">
            <h2 className="hc-large-bold">Jobs</h2>
            {stateContent ? <div className="hc-c40-stack">{stateContent}</div> : <div>{WEB_JOBS[filter].map((id) => row(id, true))}</div>}
          </section>
          <section className="hc-c40-card hc-c40-web__side">
            <h2 className="hc-large-bold">Requests in progress</h2>
            <div>{WEB_REQUESTS.map((id) => row(id, true))}</div>
          </section>
        </div>
      </div>
    </WebShell>
  );
}
