import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ActionCard } from '../../../components/ActionCard/ActionCard';
import { AgentFab } from '../../../components/AgentFab/AgentFab';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { ListRow } from '../../../components/ListRow/ListRow';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';
import { StateBlock } from '../../../components/StateBlock/StateBlock';
import { StatusPill, type StatusTone } from '../../../components/StatusPill/StatusPill';
import { portfolioTasks } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { screenPath } from '../../prototype/journeys';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import { ApprovalRulesDialog, DEFAULT_APPROVAL_RULES, type ApprovalRules } from './_approval-rules-dialog';
import { AskTenantDialog } from './_ask-tenant-dialog';
import './C86-approval-queue.css';

/**
 * Review change: report tags are coloured by how urgent the issue is. Urgent (red): a safety risk, act now (the
 * sparking outlet). Soon (amber): something stopped working, fix within days (the dishwasher). Routine (blue): no
 * risk, fix when convenient (the slow P-trap leak, "not urgent" in the agent's triage).
 */
type Urgency = 'urgent' | 'soon' | 'routine';
const URGENCY: Record<Urgency, { label: string; tone: StatusTone }> = {
  urgent: { label: 'Urgent', tone: 'danger' },
  soon: { label: 'Soon', tone: 'warning' },
  routine: { label: 'Routine', tone: 'info' },
};

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
  /** Review change: the message Ask the tenant starts with (the agent's draft for this report) */
  askDraft: string;
  /** Review change: how urgent the issue is; colours its tag in the table (URGENCY) */
  urgency: Urgency;
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
    tenant: 'Clara Clayton · Unit A',
    triage: 'Slow leak at the P-trap; not urgent; plumber',
    estimateDetail: '$180–$260 (routine ceiling $150)',
    photos: '3 · video 1',
    urgency: 'routine',
    askDraft: 'Hi Clara, thanks for reporting the leak. Could you send a closer photo of the pipe under the sink (the P-trap)? It helps me get the right plumber.',
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
    tenant: 'Goldie W.',
    triage: 'Sparking outlet; stop using it; electrician',
    estimateDetail: '$120–$200 (routine ceiling $100)',
    photos: '2',
    urgency: 'urgent',
    askDraft: 'Hi Goldie, please don’t use that outlet until it’s fixed. Which room is it in, and has the breaker tripped?',
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
    urgency: 'soon',
    askDraft: 'Hi, is there still standing water in the dishwasher? A photo of the filter at the bottom would help.',
  },
];

/** One row of the web jobs table (a tenant report or a maintenance task) and what its details show */
type JobRow = {
  id: string;
  property: string;
  /** The tag's text: the report or task */
  label: string;
  tag: { tone: StatusTone; title: string };
  estimate: string;
  /** Waiting (reports) or due date (maintenance) */
  when: string;
  facts: [string, string][];
  actions: ReactNode;
};

/** "26 h" → 26 (hours the report has been waiting) */
const waitingHours = (r: Report) => parseFloat(r.waiting) || 0;
/** Review change: the job waiting longest, which the queue lists first and opens on landing */
const longestWaiting = (list: Report[]) => [...list].sort((a, b) => waitingHours(b) - waitingHours(a))[0];

/** C86 Approval queue — Figma mobile 272:32136, web 272:33084; states 263:4890/4949/5014 (mobile), 263:5082/5219/5368 (web) */
export default function ApprovalQueue(_: ScreenProps) {
  const { device, screenState } = usePrototype();
  const flow = useFlow();
  const [declined, setDeclined] = useState<string[]>([]);
  // Mobile: the card on top is the job waiting longest
  const [selectedId, setSelectedId] = useState(() => longestWaiting(reports)?.id ?? 'sink');
  const [params] = useSearchParams();
  /**
   * Web accordion: the job whose details are open. Review changes: on landing, the job waiting longest is open; a task
   * from the Portfolio's Upcoming maintenance card (?job=<task id>) opens that task instead
   */
  const [expandedId, setExpandedId] = useState<string | null>(() => params.get('job') ?? longestWaiting(reports)?.id ?? null);
  const [editingRules, setEditingRules] = useState(false);
  const [rules, setRules] = useState<ApprovalRules>(DEFAULT_APPROVAL_RULES);
  const [rulesSaved, setRulesSaved] = useState(false);
  /** Review change: Ask the tenant dialog (who, about what, the drafted message) */
  const [asking, setAsking] = useState<{ tenant: string; title: string; draft: string } | null>(null);
  /** Review change: the last confirmation shown above the table (message sent, task done, quotes requested) */
  const [notice, setNotice] = useState<{ title: string; body: string } | null>(null);
  const [doneTasks, setDoneTasks] = useState<string[]>([]);

  // Review change: longest waiting first ("26 h" before "4 h"), on web and mobile
  const open = reports.filter((r) => !declined.includes(r.id)).sort((a, b) => waitingHours(b) - waitingHours(a));
  const tasks = portfolioTasks.filter((t) => !doneTasks.includes(t.id));

  // A task opened from the Portfolio card scrolls into view
  useEffect(() => {
    const job = params.get('job');
    if (job) document.getElementById(`hc-c86-row-${job}`)?.scrollIntoView({ block: 'center' });
  }, [params]);

  /**
   * Review change: the jobs table lists tenant reports (longest waiting first) and then the portfolio's upcoming DIY
   * maintenance (Portfolio's Upcoming maintenance card), each with its own details and buttons.
   */
  const jobRows: JobRow[] = [
    ...open.map<JobRow>((r) => ({
      id: r.id,
      property: r.property,
      label: r.title,
      tag: { tone: URGENCY[r.urgency].tone, title: URGENCY[r.urgency].label },
      estimate: r.estimate,
      when: r.waiting,
      facts: [
        ['Tenant', r.tenant],
        // Review change: the urgency behind the tag's colour, spelled out
        ['Urgency', URGENCY[r.urgency].label],
        ['Agent triage', r.triage],
        ['Estimate', r.estimateDetail],
        ['Photos', r.photos],
        ['Damage flag', 'None'],
      ],
      // Review changes: Decline alone on the left (like the red remove buttons in the app's dialogs); on the right,
      // least to most important: Ask the tenant (outlined, opens its dialog), Approve a known vendor, Approve & get quotes
      actions: (
        <>
          <Button size="small" variant="destructive" onClick={() => decline(r.id)}>
            Decline
          </Button>
          <div className="hc-c86-details__group hc-c86-details__group--end">
            <Button size="small" variant="secondary" onClick={() => setAsking({ tenant: r.tenant, title: r.title, draft: r.askDraft })}>
              Ask the tenant
            </Button>
            <Button size="small" variant="secondary" onClick={flow.goNext}>
              Approve a known vendor
            </Button>
            <Button size="small" onClick={flow.goNext}>
              Approve &amp; get quotes
            </Button>
          </div>
        </>
      ),
    })),
    ...tasks.map<JobRow>((t) => ({
      id: t.id,
      property: t.property,
      label: t.title,
      tag: { tone: 'neutral', title: 'Planned maintenance' },
      estimate: 'DIY',
      when: t.due,
      facts: [
        ['Type', 'Planned maintenance · DIY'],
        ['Units', t.units],
        ['Due', t.due.replace(/^Due /, '')],
        ['Time', t.time],
        ['Cost', t.cost],
        ['Access', t.access],
      ],
      // Maintenance: Ask the tenant (access), Hire a pro, Mark done
      actions: (
        <div className="hc-c86-details__group hc-c86-details__group--end">
          <Button size="small" variant="secondary" onClick={() => setAsking({ tenant: t.tenant, title: t.title, draft: t.askDraft })}>
            Ask the tenant
          </Button>
          <Button
            size="small"
            variant="secondary"
            onClick={() =>
              setNotice({ title: `Getting quotes: ${t.title}`, body: `Your agent is asking pros near ${t.property}. Quotes show here as they come in.` })
            }
          >
            Hire a pro
          </Button>
          <Button
            size="small"
            onClick={() => {
              setDoneTasks((d) => [...d, t.id]);
              setNotice({ title: `Marked done: ${t.title}`, body: `${t.property} · ${t.units}. It’s off the list and logged on the property.` });
            }}
          >
            Mark done
          </Button>
        </div>
      ),
    })),
  ];
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
            <p className="hc-medium hc-muted">Tenant reports awaiting you or a manager with approve permission · first decision wins · then upcoming maintenance</p>
          </div>
          {/* Review change: opens the Approval rules dialog over the queue (was C81 Property rules) */}
          <Button variant="secondary" onClick={() => setEditingRules(true)}>
            Approval rules
          </Button>
        </header>
        {editingRules && (
          <ApprovalRulesDialog
            rules={rules}
            onSave={(r) => {
              setRules(r);
              setEditingRules(false);
              setRulesSaved(true);
            }}
            onCancel={() => setEditingRules(false)}
            onPropertyRules={() => flow.go('C81')}
          />
        )}
        {rulesSaved && (
          <Banner tone="success" title="Approval rules saved">
            Routine ceiling ${rules.routine} · emergency ceiling ${rules.emergency} · emergency rules {rules.emergencyRules ? 'on' : 'off'}
          </Banner>
        )}
        {asking && (
          <AskTenantDialog
            tenant={asking.tenant}
            report={asking.title}
            draft={asking.draft}
            onSend={(message) => {
              setNotice({ title: `Message sent to ${asking.tenant.split(' · ')[0]}`, body: `“${message}” Their reply will show on this job.` });
              setAsking(null);
            }}
            onCancel={() => setAsking(null)}
          />
        )}
        {notice && (
          <Banner tone="success" title={notice.title}>
            {notice.body}
          </Banner>
        )}
        {/* Review change: the display-only filter tags (All properties, Routine, Emergency, Oldest first) are removed;
            they didn't filter anything (the queue is always oldest first) */}
        {/* Review change: the rows are an accordion. Clicking a job (or Enter / Space on it) opens its details right
            under it: tenant, urgency, agent triage, estimate, photos, damage flag and the actions; clicking it again
            closes it. One job is open at a time and all start closed. This replaces the details card on the right, so
            the table uses the full width. */}
        {stateBlock() ?? (
          <div className="hc-c86-table" role="table" aria-label="Jobs: reports awaiting approval and upcoming maintenance">
            <div className="hc-c86-table__row hc-c86-table__row--head" role="row">
              {/* Review change: Property is the first column, Report second (was Report, Property) */}
              <span role="columnheader">Property</span>
              {/* Review change: "Job" and "Waiting / due" (was Report, Waiting), since maintenance is listed too */}
              <span role="columnheader">Job</span>
              <span role="columnheader">Estimate</span>
              <span role="columnheader">Waiting / due</span>
              <span role="columnheader" aria-label="Details" />
            </div>
            {jobRows.map((r) => {
              const isOpen = r.id === expandedId;
              const toggle = () => setExpandedId(isOpen ? null : r.id);
              return (
                <Fragment key={r.id}>
                  <div
                    role="row"
                    tabIndex={0}
                    aria-expanded={isOpen}
                    aria-controls={`hc-c86-details-${r.id}`}
                    id={`hc-c86-row-${r.id}`}
                    className={['hc-c86-table__row', 'hc-c86-table__row--link', isOpen && 'hc-c86-table__row--open'].filter(Boolean).join(' ')}
                    onClick={toggle}
                    onKeyDown={(e) => {
                      if (e.target !== e.currentTarget || (e.key !== 'Enter' && e.key !== ' ')) return;
                      e.preventDefault();
                      toggle();
                    }}
                  >
                    <span role="cell">{r.property}</span>
                    {/* Review change: the job shows as a tag: reports coloured by urgency (URGENCY), maintenance neutral;
                        hover names it */}
                    <span role="cell" title={r.tag.title}>
                      <StatusPill label={r.label} tone={r.tag.tone} />
                    </span>
                    <span role="cell">{r.estimate}</span>
                    <span role="cell">{r.when}</span>
                    {/* Review change: a View button opens the details (Hide closes them); was a small ▾ */}
                    <span role="cell" className="hc-c86-table__toggle">
                      <Button
                        size="tiny"
                        variant={isOpen ? 'primary' : 'secondary'}
                        aria-expanded={isOpen}
                        aria-controls={`hc-c86-details-${r.id}`}
                        aria-label={`${isOpen ? 'Hide' : 'View'} details: ${r.label}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggle();
                        }}
                      >
                        {isOpen ? 'Hide' : 'View'}
                      </Button>
                    </span>
                  </div>
                  {/* Review change: the details are always rendered so View / Hide can animate them open and closed
                      (height slides, content fades); while closed they're hidden from screen readers and can't be
                      tabbed into */}
                  <div
                    role="row"
                    id={`hc-c86-details-${r.id}`}
                    className={['hc-c86-details', isOpen && 'hc-c86-details--open'].filter(Boolean).join(' ')}
                    aria-hidden={!isOpen}
                    inert={!isOpen}
                  >
                    <div role="cell" className="hc-c86-details__clip">
                      <div className="hc-c86-details__body">
                        {/* Review change: each detail is its own small card (label over value), three across */}
                        <dl className="hc-c86-details__facts">
                          {r.facts.map(([label, value]) => (
                            <div key={label} className="hc-c86-fact">
                              <dt className="hc-small hc-muted">{label}</dt>
                              <dd className="hc-medium">{value}</dd>
                            </div>
                          ))}
                        </dl>
                        <div className="hc-c86-details__actions">{r.actions}</div>
                      </div>
                    </div>
                  </div>
                </Fragment>
              );
            })}
          </div>
        )}
      </div>
      <AgentFab size="extended" to={screenPath('C09')} className="hc-c86-fab" />
    </WebShell>
  );
}
