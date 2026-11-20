import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
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
import { AskTenantDialog } from './_ask-tenant-dialog';
import { DeclineDialog } from './_decline-dialog';
import { GetQuotesDialog } from './_get-quotes-dialog';
import { KnownVendorDialog } from './_known-vendor-dialog';
import { INITIAL_THREADS, OTHER_JOBS, reports, SECTIONS, STAGES, URGENCY, type OtherJob, type Report, type Section, type Stage } from './_jobs';
import { ConversationDialog, tenantName, type JobMessage } from './_conversation-dialog';
import './C86-approval-queue.css';

/**
 * Review change: report tags are coloured by how urgent the issue is. Urgent (red): a safety risk, act now (the
 * sparking outlet). Soon (amber): something stopped working, fix within days (the dishwasher). Routine (blue): no
 * risk, fix when convenient (the slow P-trap leak, "not urgent" in the agent's triage).
 */

/**
 * Review change: messages with the tenant about a job (Ask the tenant), shown in the job's details. Invented example:
 * the sink leak already has your question and Clara's reply with a photo. Sending a message with Ask the tenant adds it
 * here; a few seconds later the tenant's (canned) reply arrives. (Review change: no New reply tag on the rows.)
 */
type Message = JobMessage;
/** The first reply each tenant sends a few seconds after you ask (prototype only); later ones use FOLLOW_UPS */
const CANNED_REPLIES: Record<string, Omit<Message, 'from' | 'time'>> = {
  sink: { text: 'Tomorrow morning works. I’ll be home and will clear out the cabinet under the sink.' },
  outlet: { text: 'It’s the one in the kitchen by the fridge. The breaker hasn’t tripped, and we’ve stopped using it.' },
  dishwasher: { text: 'Yes, about an inch of water is still sitting in there. Photo of the filter attached.', attachment: 'Photo · dishwasher-filter.jpg' },
  'hvac-filters': { text: 'Unit 2: 10 AM–noon works. Unit 1 says after 1 PM is better. Unit 3 is fine any time.' },
  'smoke-alarms': { text: 'Thursday after 5 works, I’ll be home.' },
  fan: { text: 'Only when the fan runs on high. On low it’s quiet, and the light is fine.' },
  'water-heater': { text: 'I’m back Friday. 1–3 PM works, or I can leave a key with my neighbor in 2B.' },
};
/** Replies to your later messages on the same job, in turn */
const FOLLOW_UPS: Omit<Message, 'from' | 'time'>[] = [
  { text: 'Okay, sounds good. Thanks for the update.' },
  { text: 'That works for me. Just text me before anyone comes over.' },
  { text: 'Will do, thanks!' },
];
/** How long the tenant takes to "reply" in the prototype */
const REPLY_MS = 4000;
const nowLabel = () => `Today ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;

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
  /** Review change: the job's status (and so its section) */
  stage: Stage;
  /** Who Ask the tenant writes to, e.g. "Clara Clayton · Unit A" */
  tenant: string;
};

/** "26 h" → 26 (hours the report has been waiting) */
const waitingHours = (r: Report) => parseFloat(r.waiting) || 0;
/** Review change: the job waiting longest, which the queue lists first and opens on landing */
const longestWaiting = (list: Report[]) => [...list].sort((a, b) => waitingHours(b) - waitingHours(a))[0];

/** C86 Approval queue — Figma mobile 272:32136, web 272:33084; states 263:4890/4949/5014 (mobile), 263:5082/5219/5368 (web) */
export default function ApprovalQueue(_: ScreenProps) {
  return <JobsBoard />;
}

/**
 * Review change: the Jobs page's sections and job rows, with everything they do (open a job's details, its actions,
 * the Ask / Approve / Get quotes / Decline dialogs, conversations, the confirmation banner). The Jobs page shows it for
 * every property; a property's page shows it `embedded` for that property only (`match` picks the jobs by their
 * Property cell), without the page around it and without empty sections.
 */
export function JobsBoard({
  match,
  embedded = false,
  placeLabel,
}: {
  match?: (property: string) => boolean;
  embedded?: boolean;
  /** Review change: on a property's page the first column shows the unit ("Unit A") instead of the address */
  placeLabel?: { header: string; cell: (property: string) => string };
}) {
  const { device, screenState } = usePrototype();
  const flow = useFlow();
  /**
   * Review change: every job's status (tenant reports start Needs approval, Sam's fan report Waiting on tenant,
   * maintenance Planned, the other jobs as listed), and a short "when" line that changes with it
   */
  const [stages, setStages] = useState<Record<string, Stage>>(() => ({
    ...Object.fromEntries(reports.map((r) => [r.id, r.id === 'fan' ? 'waiting-tenant' : 'approval'])),
    ...Object.fromEntries(portfolioTasks.map((t) => [t.id, 'planned'])),
    ...Object.fromEntries(OTHER_JOBS.map((j) => [j.id, j.stage])),
  }));
  const [whenNotes, setWhenNotes] = useState<Record<string, string>>({ fan: 'Asked 1 day ago' });
  const move = (id: string, stage: Stage, when?: string) => {
    setStages((s) => ({ ...s, [id]: stage }));
    if (when) setWhenNotes((w) => ({ ...w, [id]: when }));
  };
  // approving = the report whose Approve a known vendor dialog is open
  const [approving, setApproving] = useState<Report | null>(null);
  /** Review change: the report whose Approve & get quotes dialog is open */
  const [quoting, setQuoting] = useState<Report | null>(null);
  /** Review change: the report whose Decline confirmation is open */
  const [declining, setDeclining] = useState<Report | null>(null);
  // Mobile: the card on top is the job waiting longest
  const [selectedId, setSelectedId] = useState(() => longestWaiting(reports)?.id ?? 'sink');
  const [params] = useSearchParams();
  /**
   * Web accordion: the job whose details are open. Review changes: on landing every job is closed (the longest-waiting
   * job is still listed first); a task from the Portfolio's Upcoming maintenance card (?job=<task id>) opens that task
   */
  const [expandedId, setExpandedId] = useState<string | null>(() => params.get('job'));
  /** Review change: Ask the tenant dialog (who, about what, the drafted message) */
  const [asking, setAsking] = useState<{ id: string; tenant: string; title: string; draft: string } | null>(null);
  // Review change: each job's messages with the tenant, and which have a reply you haven't opened
  const [threads, setThreads] = useState<Record<string, Message[]>>(INITIAL_THREADS);
  const replyTimers = useRef<number[]>([]);
  useEffect(() => () => replyTimers.current.forEach((t) => window.clearTimeout(t)), []);
  /** Review change: the job whose Conversation dialog is open (the row's message icon) */
  const [talking, setTalking] = useState<{ id: string; tenant: string; title: string } | null>(null);
  const talkingId = useRef<string | null>(null);
  talkingId.current = talking?.id ?? null;
  /** Jobs whose tenant is "writing" a reply */
  const [typing, setTyping] = useState<string[]>([]);
  /** How many replies each tenant has sent this visit (picks the canned reply) */
  // The outlet job's seeded conversation already had Goldie's first answer, so her next reply is a follow-up
  const replyCount = useRef<Record<string, number>>({ outlet: 1 });

  const openConversation = (job: { id: string; tenant: string; label: string }) => {
    setTalking({ id: job.id, tenant: job.tenant, title: job.label });
  };

  /**
   * Review change: your message joins the job's conversation; in the prototype the tenant replies a few seconds later
   * (canned reply). If you're not in that conversation, a notice names who replied.
   */
  const send = (id: string, tenant: string, title: string, message: string) => {
    setThreads((t) => ({ ...t, [id]: [...(t[id] ?? []), { from: 'you', text: message, time: nowLabel() }] }));
    const n = replyCount.current[id] ?? 0;
    replyCount.current[id] = n + 1;
    const reply = n === 0 && CANNED_REPLIES[id] ? CANNED_REPLIES[id] : FOLLOW_UPS[(n - (CANNED_REPLIES[id] ? 1 : 0)) % FOLLOW_UPS.length];
    const name = /^Units?\b/.test(tenant) ? 'The tenants' : tenantName(tenant);
    setTyping((t) => [...t, id]);
    replyTimers.current.push(
      window.setTimeout(() => {
        setTyping((t) => t.filter((x) => x !== id));
        setThreads((t) => ({ ...t, [id]: [...(t[id] ?? []), { from: 'tenant', ...reply, time: nowLabel() }] }));
        // Review change: a report waiting on the tenant goes back to Awaiting Approval once they reply; a missed visit gets
        // rebooked for the time the tenant gave
        setStages((s) => (s[id] === 'waiting-tenant' ? { ...s, [id]: 'approval' } : s[id] === 'needs-access' ? { ...s, [id]: 'scheduled' } : s));
        setWhenNotes((w) => ({ ...w, [id]: id === 'water-heater' ? 'Fri Nov 21, 1–3 PM' : 'Replied just now' }));
        if (talkingId.current === id) return;
        setNotice({ title: `${name} replied`, body: `${title}: “${reply.text}”` });
      }, REPLY_MS),
    );
    return name;
  };
  /** Review change: the last confirmation shown above the table (message sent, task done, quotes requested) */
  const [notice, setNotice] = useState<{ title: string; body: string } | null>(null);
  /** Review change: Closed starts collapsed */
  const [showClosed, setShowClosed] = useState(false);

  // Review change: longest waiting first ("26 h" before "4 h"), on web and mobile; only reports that need approval
  const open = reports.filter((r) => stages[r.id] === 'approval').sort((a, b) => waitingHours(b) - waitingHours(a));
  const tasks = portfolioTasks;

  // A task opened from the Portfolio card scrolls into view
  useEffect(() => {
    const job = params.get('job');
    if (job) document.getElementById(`hc-c86-row-${job}`)?.scrollIntoView({ block: 'center' });
  }, [params]);

  /**
   * Review change: the buttons in a job's details depend on its status. Each one moves the job to its next status (and
   * section) and confirms in the banner; prototype only, nothing is sent or charged.
   */
  const note = (title: string, body: string) => setNotice({ title, body });
  /**
   * Review change: when a job already has messages with the tenant, its "Ask the tenant" button becomes
   * "View conversation" and opens the Conversation dialog instead of starting a new question
   */
  const askOrView = (id: string, tenant: string, title: string, draft: string) =>
    (threads[id] ?? []).length > 0 ? (
      <Button size="small" variant="secondary" onClick={() => openConversation({ id, tenant, label: title })}>
        View conversation
      </Button>
    ) : (
      <Button size="small" variant="secondary" onClick={() => setAsking({ id, tenant, title, draft })}>
        Ask the tenant
      </Button>
    );
  const stageActions = (id: string, title: string, property: string, tenant: string, askDraft?: string, isReport = false): ReactNode => {
    const who = tenantName(tenant);
    const ask = askDraft ? askOrView(id, tenant, title, askDraft) : null;
    const end = (...children: ReactNode[]) => (
      <div className="hc-c86-details__group hc-c86-details__group--end">
        {children.map((c, i) => (
          <Fragment key={i}>{c}</Fragment>
        ))}
      </div>
    );
    switch (stages[id]) {
      case 'quotes-ready':
        return end(
          <Button key="more" size="small" variant="secondary" onClick={() => { move(id, 'quoting', 'Quotes due in 48 h'); note(`Asking for more quotes: ${title}`, `Your agent is asking 2 more pros near ${property}.`); }}>
            Ask for more quotes
          </Button>,
          <Button key="book" size="small" onClick={() => { move(id, 'scheduled', 'Fri Nov 21, 9–11 AM'); note(`Booked: Desert Roof Co. for ${title}`, `${property} · $420 · Fri Nov 21, 9–11 AM. The tenant gets a text with the visit time.`); }}>
            Book Desert Roof Co. · $420
          </Button>,
        );
      case 'sign-off':
        return (
          <>
            <Button size="small" variant="secondary" onClick={() => { move(id, 'disputed', 'Disputed today'); note(`Problem reported: ${title}`, `${property}. The $165 payment is frozen while you and the pro sort it out.`); }}>
              Report a problem
            </Button>
            {end(
              <Button key="ok" size="small" onClick={() => { move(id, 'done', 'Paid today'); note(`Signed off: ${title}`, `${property}. $165 released to Sonoran Plumbing Co.`); }}>
                Confirm done
              </Button>,
            )}
          </>
        );
      case 'needs-access':
        return end(
          ask,
          <Button key="resched" size="small" onClick={() => { move(id, 'scheduled', 'Fri Nov 21, 1–3 PM'); note(`Rescheduled: ${title}`, `${property} · Fri Nov 21, 1–3 PM. ${who} gets a text with the new time.`); }}>
            Reschedule
          </Button>,
        );
      case 'waiting-tenant':
        return end(
          <Button key="nudge" size="small" variant="secondary" onClick={() => { send(id, tenant, title, 'Just checking in, when you have a second: does it buzz on low speed too?'); note(`Nudge sent to ${who}`, 'Their reply shows in this job’s conversation; the job moves back to Awaiting Approval.'); }}>
            Nudge
          </Button>,
        );
      case 'quoting':
        return end(
          <Button key="cancel" size="small" variant="secondary" onClick={() => { move(id, 'declined', 'Cancelled today'); note(`Quote request cancelled: ${title}`, `${property}. The pros are told you no longer need quotes.`); }}>
            Cancel request
          </Button>,
        );
      case 'scheduled':
        return end(
          <Button key="msg" size="small" variant="secondary" onClick={() => note(`Message sent to the pro: ${title}`, 'Their reply shows in your messages.')}>
            Message pro
          </Button>,
          <Button key="resched" size="small" variant="secondary" onClick={() => note(`Asked for new times: ${title}`, 'The pro will offer other visit windows; the tenant is told once one is picked.')}>
            Reschedule
          </Button>,
        );
      case 'in-progress':
        return end(
          <Button key="msg" size="small" variant="secondary" onClick={() => note(`Message sent to the pro: ${title}`, 'Their reply shows in your messages.')}>
            Message pro
          </Button>,
          <Button key="track" size="small" variant="secondary" onClick={() => note(`Live tracker: ${title}`, 'Arrived 9:41 AM · work started 9:50 AM · no parts needed so far.')}>
            View live tracker
          </Button>,
        );
      case 'done':
        return end(
          <Button key="rcpt" size="small" variant="secondary" onClick={() => note(`Receipt: ${title}`, `${property}. Saved to the property’s documents.`)}>
            View receipt
          </Button>,
        );
      case 'disputed':
        return end(
          <Button key="disp" size="small" variant="secondary" onClick={() => note(`Dispute: ${title}`, 'Open with the pro. HouseCue support replies within 1 business day; the payment stays frozen until it’s settled.')}>
            View dispute
          </Button>,
        );
      case 'declined':
        return isReport
          ? end(
              <Button key="reopen" size="small" variant="secondary" onClick={() => { move(id, 'approval'); note(`Reopened: ${title}`, 'It’s back in Awaiting Approval.'); }}>
                Reopen
              </Button>,
            )
          : null;
      case 'planned':
      case 'overdue':
        return end(
          ask,
          <Button key="pro" size="small" variant="secondary" onClick={() => { move(id, 'quoting', 'Quotes due in 48 h'); note(`Getting quotes: ${title}`, `Your agent is asking pros near ${property}. Quotes show here as they come in.`); }}>
            Hire a pro
          </Button>,
          <Button key="done" size="small" onClick={() => { move(id, 'done', 'Done today'); note(`Marked done: ${title}`, `${property}. Logged on the property.`); }}>
            Mark done
          </Button>,
        );
      default:
        return null;
    }
  };

  /** The Needs approval buttons (unchanged): Decline on the left; Ask the tenant, Approve a known vendor, Approve & get quotes */
  const approvalActions = (r: Report) => (
    <>
      <Button size="small" variant="destructive" onClick={() => setDeclining(r)}>
        Decline
      </Button>
      <div className="hc-c86-details__group hc-c86-details__group--end">
        {askOrView(r.id, r.tenant, r.title, r.askDraft)}
        <Button size="small" variant="secondary" onClick={() => setApproving(r)}>
          Approve a known vendor
        </Button>
        <Button size="small" onClick={() => setQuoting(r)}>
          Approve &amp; get quotes
        </Button>
      </div>
    </>
  );

  /** Review change: every job on the portfolio as a row: tenant reports, planned maintenance and the other jobs */
  const jobRows: JobRow[] = [
    ...reports.map<JobRow>((r) => ({
      id: r.id,
      property: r.property,
      label: r.title,
      tag: { tone: URGENCY[r.urgency].tone, title: URGENCY[r.urgency].label },
      stage: stages[r.id],
      estimate: r.estimate,
      when: stages[r.id] === 'approval' ? r.waiting : (whenNotes[r.id] ?? r.waiting),
      tenant: r.tenant,
      facts: [
        ['Tenant', r.tenant],
        ['Urgency', URGENCY[r.urgency].label],
        ['Agent triage', r.triage],
        ['Estimate', r.estimateDetail],
        ['Photos', r.photos],
        ['Damage flag', 'None'],
      ],
      actions: stages[r.id] === 'approval' ? approvalActions(r) : stageActions(r.id, r.title, r.property, r.tenant, r.askDraft, true),
    })),
    ...tasks.map<JobRow>((t) => ({
      id: t.id,
      property: t.property,
      label: t.title,
      tag: { tone: 'neutral', title: 'Planned maintenance' },
      stage: stages[t.id],
      estimate: 'DIY',
      when: whenNotes[t.id] ?? t.due,
      tenant: t.tenant,
      facts: [
        ['Type', 'Planned maintenance · DIY'],
        ['Units', t.units],
        ['Due', t.due.replace(/^Due /, '')],
        ['Time', t.time],
        ['Cost', t.cost],
        ['Access', t.access],
      ],
      actions: stageActions(t.id, t.title, t.property, t.tenant, t.askDraft),
    })),
    ...OTHER_JOBS.map<JobRow>((j) => ({
      id: j.id,
      property: j.property,
      label: j.title,
      tag: { tone: 'neutral', title: STAGES[j.stage].label },
      stage: stages[j.id],
      estimate: j.cost,
      when: whenNotes[j.id] ?? j.when,
      tenant: j.tenant,
      facts: j.facts,
      actions: stageActions(
        j.id,
        j.title,
        j.property,
        j.tenant,
        j.id === 'water-heater' ? 'Hi Marvin, the plumber couldn’t get in today to relight the water heater. When can they come back?' : undefined,
      ),
    })),
  ];
  /** Rows in a section: by status order, then the reports waiting longest first */
  const rowsIn = (section: Section) =>
    jobRows
      .filter((r) => !match || match(r.property))
      .filter((r) => STAGES[r.stage].section === section)
      .sort((a, b) => STAGES[a.stage].order - STAGES[b.stage].order || (parseFloat(b.when) || 0) - (parseFloat(a.when) || 0));
  const selected = open.find((r) => r.id === selectedId) ?? open[0] ?? reports[0];
  const decline = (id: string) => {
    move(id, 'declined', 'Declined today');
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
    // Review change: on the web an empty Awaiting Approval shows its own line, so the other sections stay
    if (screenState === 'empty' || (device === 'mobile' && screenState === 'default' && open.length === 0)) {
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

  if (device === 'mobile' && !embedded) {
    return (
      // Review change: titled Jobs (was Approvals), with the Approval queue as the section under it
      <MobileShell header={{ title: 'Jobs', showBack: false }} role="landlord" tab="jobs">
        <h2 className="hc-large-bold hc-c86-queue-title">Approval queue</h2>
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

  /** One job row and its details (accordion), used by every section */
  const renderRow = (r: JobRow) => {
              const isOpen = r.id === expandedId;
              const toggle = () => setExpandedId(isOpen ? null : r.id);
              const thread = threads[r.id] ?? [];
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
                    <span role="cell">{placeLabel ? placeLabel.cell(r.property) : r.property}</span>
                    {/* Review change: the job shows as a tag: reports coloured by urgency (URGENCY), maintenance neutral;
                        hover names it */}
                    <span role="cell" className="hc-c86-table__job">
                      <span title={r.tag.title}>
                        <StatusPill label={r.label} tone={r.tag.tone} />
                      </span>
                    </span>
                    {/* Review change: the job's status */}
                    <span role="cell">
                      <StatusPill label={STAGES[r.stage].label} tone={STAGES[r.stage].tone} />
                    </span>
                    <span role="cell" className="hc-c86-table__when">{r.when}</span>
                    {/* Review change: no View column; clicking the row (or Enter / Space) opens and closes its details. The
                        message icon is the last column, on the right, for jobs with a conversation */}
                    <span role="cell" className="hc-c86-table__chat-cell">
                      {thread.length > 0 && (
                        <Button
                          size="tiny"
                          variant="secondary"
                          icon="chat"
                          className="hc-c86-table__chat"
                          aria-label={`Conversation with ${tenantName(r.tenant)} (${thread.length} ${thread.length === 1 ? 'message' : 'messages'})`}
                          title="View conversation"
                          onClick={(e) => {
                            e.stopPropagation();
                            openConversation(r);
                          }}
                        />
                      )}
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
                          {r.facts.map(([label, value], i) => (
                            <div key={`${label}-${i}`} className="hc-c86-fact">
                              <dt className="hc-small hc-muted">{label}</dt>
                              <dd className="hc-medium">{value}</dd>
                            </div>
                          ))}
                        </dl>
                        {/* Review change: no View conversation button here (the row's message icon opens it); just how
                            many messages and who wrote last */}
                        {thread.length > 0 && (
                          <div className="hc-c86-thread">
                            <span className="hc-small hc-muted">
                              {thread.length} {thread.length === 1 ? 'message' : 'messages'} with {tenantName(r.tenant)}
                              {typing.includes(r.id) ? ' · typing…' : ` · last ${thread[thread.length - 1].time.replace(/^Today /, '')}`}
                            </span>
                          </div>
                        )}
                        <div className="hc-c86-details__actions">{r.actions}</div>
                      </div>
                    </div>
                  </div>
                </Fragment>
              );
  };

  const dialogs = (
    <>
          {asking && (
            <AskTenantDialog
              tenant={asking.tenant}
              report={asking.title}
              draft={asking.draft}
              onSend={(message) => {
                const name = send(asking.id, asking.tenant, asking.title, message);
                // Review change: a report you asked about waits on the tenant (Active) until they reply
                if (stages[asking.id] === 'approval') move(asking.id, 'waiting-tenant', 'Asked just now');
                setNotice({ title: `Message sent to ${name}`, body: 'Their reply shows in this job’s conversation (the message icon on its row).' });
                setAsking(null);
              }}
              onCancel={() => setAsking(null)}
            />
          )}
          {/* Review change: Decline asks first; confirming takes the report off the queue */}
          {declining && (
            <DeclineDialog
              job={declining.title}
              property={declining.property}
              tenant={/^Units?/.test(declining.tenant) ? 'the tenant' : tenantName(declining.tenant).split(' ')[0]}
              onDecline={({ reason, tellTenant }) => {
                const r = declining;
                decline(r.id);
                setNotice({
                  title: `Declined: ${r.title}`,
                  body: `${r.property}${reason ? ` · ${reason}` : ''}.${tellTenant ? ` ${tenantName(r.tenant)} gets a message that it was declined.` : ''} It’s under Recently Closed.`,
                });
                setDeclining(null);
                setExpandedId(null);
              }}
              onCancel={() => setDeclining(null)}
            />
          )}
          {/* Review change: Approve & get quotes opens its dialog; approving takes the report off the queue */}
          {quoting && (
            <GetQuotesDialog
              job={quoting.title}
              property={quoting.property}
              trade={quoting.trade}
              estimate={quoting.estimate}
              photos={quoting.photos}
              tenant={/^Units?/.test(quoting.tenant) ? 'the tenant' : tenantName(quoting.tenant).split(' ')[0]}
              onApprove={({ pros, deadline, limit, sharePhotos, tellTenant }) => {
                const r = quoting;
                // Review change: moves to Active · Getting quotes (was taken off the page)
                move(r.id, 'quoting', `Quotes due within ${deadline}`);
                setNotice({
                  title: `Getting quotes: ${r.title}`,
                  body: `Your agent is asking ${pros} ${r.trade.toLowerCase()} pros near ${r.property}${sharePhotos ? ', with the photos' : ''}. Quotes due within ${deadline}; approved up to ${limit}.${tellTenant ? ` ${tenantName(r.tenant)} gets a text when a visit is booked.` : ''} It’s now in Active.`,
                });
                setQuoting(null);
                setExpandedId(null);
              }}
              onCancel={() => setQuoting(null)}
            />
          )}
          {/* Review change: Approve a known vendor opens its dialog; approving takes the report off the queue */}
          {approving && (
            <KnownVendorDialog
              job={approving.title}
              property={approving.property}
              trade={approving.trade}
              estimate={approving.estimate}
              tenant={/^Units?/.test(approving.tenant) ? 'the tenant' : tenantName(approving.tenant).split(' ')[0]}
              onApprove={({ vendor, limit, visit, tellTenant }) => {
                const r = approving;
                // Review change: moves to Active · Scheduled for the pro's visit (was taken off the page)
                move(r.id, 'scheduled', visit.charAt(0).toUpperCase() + visit.slice(1));
                setNotice({
                  title: `Approved: ${vendor} for ${r.title}`,
                  body: `${r.property} · up to ${limit} · ${visit}.${tellTenant ? ` ${tenantName(r.tenant)} gets a text with the visit time.` : ''} It’s now in Active.`,
                });
                setApproving(null);
                setExpandedId(null);
              }}
              onCancel={() => setApproving(null)}
            />
          )}
          {/* Review change: the row's message icon opens the conversation */}
          {talking && (
            <ConversationDialog
              tenant={talking.tenant}
              job={talking.title}
              messages={threads[talking.id] ?? []}
              typing={typing.includes(talking.id)}
              onSend={(message) => send(talking.id, talking.tenant, talking.title, message)}
              onClose={() => setTalking(null)}
            />
          )}
          {notice && (
            <Banner tone="success" title={notice.title}>
              {notice.body}
            </Banner>
          )}
    </>
  );
  const sections = (
    <>
          {/* Review change: the display-only filter tags (All properties, Routine, Emergency, Oldest first) are removed;
              they didn't filter anything (the queue is always oldest first) */}
          {/* Review change: the rows are an accordion. Clicking a job (or Enter / Space on it) opens its details right
              under it: tenant, urgency, agent triage, estimate, photos, damage flag and the actions; clicking it again
              closes it. One job is open at a time and all start closed. This replaces the details card on the right, so
              the table uses the full width. */}
          {/* Review change: the jobs in four sections down the page (Awaiting Approval, Active, Upcoming Maintenance, Recently Closed),
              each the same table with a Status column; Closed starts collapsed */}
          {stateBlock() ??
            SECTIONS.map((sec) => {
              const rows = rowsIn(sec.id);
              if (embedded && rows.length === 0) return null;
              const collapsed = sec.id === 'closed' && !showClosed;
              return (
                <section key={sec.id} className="hc-c86-section" aria-labelledby={`hc-c86-sec-${sec.id}`}>
                  <div className="hc-c86-section__head">
                    <h2 id={`hc-c86-sec-${sec.id}`} className="hc-large-bold hc-c86-queue-title">
                      {sec.title} <span className="hc-c86-section__count">{rows.length}</span>
                    </h2>
                    <span className="hc-small hc-muted hc-c86-section__note">{sec.note}</span>
                    {sec.id === 'closed' && rows.length > 0 && (
                      <Button size="tiny" variant="secondary" aria-expanded={showClosed} onClick={() => setShowClosed((v) => !v)}>
                        {showClosed ? 'Hide' : `Show ${rows.length}`}
                      </Button>
                    )}
                  </div>
                  {collapsed ? null : rows.length === 0 ? (
                    <p className="hc-medium hc-muted hc-c86-section__empty">{sec.empty}</p>
                  ) : (
                    <div className="hc-c86-table" role="table" aria-labelledby={`hc-c86-sec-${sec.id}`}>
                      {/* Review change: no column header row on a property's page (embedded) */}
                      {!embedded && (
                        <div className="hc-c86-table__row hc-c86-table__row--head" role="row">
                          <span role="columnheader">Property</span>
                          <span role="columnheader">Job</span>
                          <span role="columnheader">Status</span>
                          <span role="columnheader">When</span>
                          <span role="columnheader" aria-label="Conversation" />
                        </div>
                      )}
                      {rows.map(renderRow)}
                    </div>
                  )}
                </section>
              );
            })}
    </>
  );
  if (embedded) {
    // Review change: on a property's page the jobs are one stacked list (no status section titles), in the Jobs page's
    // order: Awaiting Approval, Active, Upcoming Maintenance, then Recently Closed
    const all = SECTIONS.flatMap((sec) => rowsIn(sec.id));
    return (
      <div className="hc-c86-embedded">
        {dialogs}
        {stateBlock() ??
          (all.length > 0 && (
            <div className="hc-c86-table" role="table" aria-label="Jobs">
              {/* Review change: one header row at the top of the stacked list */}
              <div className="hc-c86-table__row hc-c86-table__row--head" role="row">
                <span role="columnheader">{placeLabel?.header ?? 'Property'}</span>
                <span role="columnheader">Job</span>
                <span role="columnheader">Status</span>
                <span role="columnheader">When</span>
                <span role="columnheader" aria-label="Conversation" />
              </div>
              {all.map(renderRow)}
            </div>
          ))}
      </div>
    );
  }

  return (
    <WebShell role="landlord" nav="jobs">
      <div className="hc-c86-web">
        <header className="hc-c86-web__head">
          <div className="hc-c86-web__title">
            {/* Review change: the page is titled Jobs (shown JOBS, like every page title); the table card below is
                the Approval queue */}
            <h1 className="hc-h2">Jobs</h1>
            <p className="hc-medium hc-muted">Every job on your properties, from new tenant reports to paid work · first decision wins</p>
          </div>
          {/* Review change: the Approval rules button (and its dialog) is removed from the top of the page; each
              property's rules are set from its own page */}
        </header>
        {dialogs}
        {sections}
      </div>
      <AgentFab size="extended" to={screenPath('C09')} className="hc-c86-fab" />
    </WebShell>
  );
}
