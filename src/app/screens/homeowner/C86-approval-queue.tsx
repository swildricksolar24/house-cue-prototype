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
import { KnownVendorDialog, type KnownVendorTrade } from './_known-vendor-dialog';
import { ConversationDialog, tenantName, type JobMessage } from './_conversation-dialog';
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
  /** Review change: which pros Approve a known vendor lists */
  trade: KnownVendorTrade;
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
    trade: 'Plumbing',
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
    trade: 'Electrical',
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
    tenant: 'Douglas Needles · Unit 3',
    triage: 'Likely clogged drain hose; appliance repair',
    estimateDetail: '$140–$220 (routine ceiling $100)',
    photos: '1',
    urgency: 'soon',
    trade: 'Appliances',
    askDraft: 'Hi Douglas, is there still standing water in the dishwasher? A photo of the filter at the bottom would help.',
  },
];

/**
 * Review change: messages with the tenant about a job (Ask the tenant), shown in the job's details. Invented example:
 * the sink leak already has your question and Clara's reply with a photo. Sending a message with Ask the tenant adds it
 * here; a few seconds later the tenant's (canned) reply arrives. (Review change: no New reply tag on the rows.)
 */
type Message = JobMessage;
const INITIAL_THREADS: Record<string, Message[]> = {
  sink: [
    {
      from: 'you',
      text: 'Hi Clara, thanks for reporting the leak. Could you send a closer photo of the pipe under the sink (the P-trap)? It helps me get the right plumber.',
      time: 'Today 9:12 AM',
    },
    {
      from: 'tenant',
      text: 'Sure, here it is. It drips about once a minute, more when the dishwasher runs. There’s a towel under it for now.',
      time: 'Today 9:40 AM',
      attachment: 'Photo · under-sink.jpg',
    },
  ],
  // Review change: a long conversation (12 messages) to show the Conversation dialog scrolling
  outlet: [
    { from: 'you', text: 'Hi Goldie, please don’t use that outlet until it’s fixed. Which room is it in, and has the breaker tripped?', time: 'Yesterday 6:05 PM' },
    { from: 'tenant', text: 'It’s the one in the kitchen by the fridge. The breaker hasn’t tripped. We unplugged the toaster as soon as it sparked.', time: 'Yesterday 6:21 PM' },
    { from: 'you', text: 'Good call. Is the cover plate warm, or is there any burn mark around it?', time: 'Yesterday 6:24 PM' },
    { from: 'tenant', text: 'A little brown mark on the top-left corner of the plate. It’s not warm now. Photo attached.', time: 'Yesterday 6:40 PM', attachment: 'Photo · outlet-plate.jpg' },
    { from: 'you', text: 'Thanks, that helps. Can you switch off the kitchen breaker until the electrician comes? It should be labelled “Kitchen counters”.', time: 'Yesterday 6:45 PM' },
    { from: 'tenant', text: 'Done. The fridge is on a different circuit, so it’s still running.', time: 'Yesterday 7:02 PM' },
    { from: 'you', text: 'Perfect. I’m getting a quote from an electrician tonight. Are you home tomorrow morning?', time: 'Yesterday 7:05 PM' },
    { from: 'tenant', text: 'I leave at 8:30 but my partner is home all day.', time: 'Yesterday 7:18 PM' },
    { from: 'you', text: 'Great. What’s the best number for them, in case the electrician calls ahead?', time: 'Yesterday 7:20 PM' },
    { from: 'tenant', text: 'Same as mine is fine, I’ll pass it along. Should we stay off the other kitchen outlets too?', time: 'Yesterday 7:31 PM' },
    { from: 'you', text: 'Yes, please. They’re on the same breaker anyway. Thanks for being careful, Goldie.', time: 'Yesterday 7:34 PM' },
    { from: 'tenant', text: 'No problem. One more thing: it smelled a bit like burnt plastic this morning, but it’s gone now.', time: 'Today 7:48 AM' },
  ],
};
/** The first reply each tenant sends a few seconds after you ask (prototype only); later ones use FOLLOW_UPS */
const CANNED_REPLIES: Record<string, Omit<Message, 'from' | 'time'>> = {
  sink: { text: 'Tomorrow morning works. I’ll be home and will clear out the cabinet under the sink.' },
  outlet: { text: 'It’s the one in the kitchen by the fridge. The breaker hasn’t tripped, and we’ve stopped using it.' },
  dishwasher: { text: 'Yes, about an inch of water is still sitting in there. Photo of the filter attached.', attachment: 'Photo · dishwasher-filter.jpg' },
  'hvac-filters': { text: 'Unit 2: 10 AM–noon works. Unit 1 says after 1 PM is better. Unit 3 is fine any time.' },
  'smoke-alarms': { text: 'Thursday after 5 works, I’ll be home.' },
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
  /** Who Ask the tenant writes to, e.g. "Clara Clayton · Unit A" */
  tenant: string;
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
  // Review change: reports sent to a known vendor leave the queue; approving = the report whose dialog is open
  const [approved, setApproved] = useState<string[]>([]);
  const [approving, setApproving] = useState<Report | null>(null);
  /** Review change: the report whose Approve & get quotes dialog is open */
  const [quoting, setQuoting] = useState<Report | null>(null);
  /** Review change: the report whose Decline confirmation is open */
  const [declining, setDeclining] = useState<Report | null>(null);
  // Mobile: the card on top is the job waiting longest
  const [selectedId, setSelectedId] = useState(() => longestWaiting(reports)?.id ?? 'sink');
  const [params] = useSearchParams();
  /**
   * Web accordion: the job whose details are open. Review changes: on landing, the job waiting longest is open; a task
   * from the Portfolio's Upcoming maintenance card (?job=<task id>) opens that task instead
   */
  const [expandedId, setExpandedId] = useState<string | null>(() => params.get('job') ?? longestWaiting(reports)?.id ?? null);
  /** Review change: Ask the tenant dialog (who, about what, the drafted message) */
  const [asking, setAsking] = useState<{ id: string; tenant: string; title: string; draft: string } | null>(null);
  // Review change: each job's messages with the tenant, and which have a reply you haven't opened
  const [threads, setThreads] = useState<Record<string, Message[]>>(INITIAL_THREADS);
  const replyTimers = useRef<number[]>([]);
  useEffect(() => () => replyTimers.current.forEach((t) => window.clearTimeout(t)), []);
  /** Review change: the job whose Conversation dialog is open (the row's message icon, or View conversation) */
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
        if (talkingId.current === id) return;
        setNotice({ title: `${name} replied`, body: `${title}: “${reply.text}”` });
      }, REPLY_MS),
    );
    return name;
  };
  /** Review change: the last confirmation shown above the table (message sent, task done, quotes requested) */
  const [notice, setNotice] = useState<{ title: string; body: string } | null>(null);
  const [doneTasks, setDoneTasks] = useState<string[]>([]);

  // Review change: longest waiting first ("26 h" before "4 h"), on web and mobile
  const open = reports.filter((r) => !declined.includes(r.id) && !approved.includes(r.id)).sort((a, b) => waitingHours(b) - waitingHours(a));
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
      tenant: r.tenant,
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
          <Button size="small" variant="destructive" onClick={() => setDeclining(r)}>
            Decline
          </Button>
          <div className="hc-c86-details__group hc-c86-details__group--end">
            <Button size="small" variant="secondary" onClick={() => setAsking({ id: r.id, tenant: r.tenant, title: r.title, draft: r.askDraft })}>
              Ask the tenant
            </Button>
            <Button size="small" variant="secondary" onClick={() => setApproving(r)}>
              Approve a known vendor
            </Button>
            <Button size="small" onClick={() => setQuoting(r)}>
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
      tenant: t.tenant,
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
          <Button size="small" variant="secondary" onClick={() => setAsking({ id: t.id, tenant: t.tenant, title: t.title, draft: t.askDraft })}>
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

  return (
    <WebShell role="landlord" nav="jobs">
      <div className="hc-c86-web">
        <header className="hc-c86-web__head">
          <div className="hc-c86-web__title">
            {/* Review change: the page is titled Jobs (shown JOBS, like every page title); the table card below is
                the Approval queue */}
            <h1 className="hc-h2">Jobs</h1>
            <p className="hc-medium hc-muted">Tenant reports awaiting you or a manager with approve permission · first decision wins · then upcoming maintenance</p>
          </div>
          {/* Review change: the Approval rules button (and its dialog) is removed from the top of the page; each
              property's rules are set from its own page */}
        </header>
        {asking && (
          <AskTenantDialog
            tenant={asking.tenant}
            report={asking.title}
            draft={asking.draft}
            onSend={(message) => {
              const name = send(asking.id, asking.tenant, asking.title, message);
              setNotice({ title: `Message sent to ${name}`, body: 'Their reply shows in this job’s conversation (View conversation).' });
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
                body: `${r.property}${reason ? ` · ${reason}` : ''}.${tellTenant ? ` ${tenantName(r.tenant)} gets a message that it was declined.` : ''} It’s off the queue.`,
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
              setApproved((a) => [...a, r.id]);
              setNotice({
                title: `Getting quotes: ${r.title}`,
                body: `Your agent is asking ${pros} ${r.trade.toLowerCase()} pros near ${r.property}${sharePhotos ? ', with the photos' : ''}. Quotes due within ${deadline}; approved up to ${limit}.${tellTenant ? ` ${tenantName(r.tenant)} gets a text when a visit is booked.` : ''} It’s off the queue.`,
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
              setApproved((a) => [...a, r.id]);
              setNotice({
                title: `Approved: ${vendor} for ${r.title}`,
                body: `${r.property} · up to ${limit} · ${visit}.${tellTenant ? ` ${tenantName(r.tenant)} gets a text with the visit time.` : ''} It’s off the queue.`,
              });
              setApproving(null);
              setExpandedId(null);
            }}
            onCancel={() => setApproving(null)}
          />
        )}
        {/* Review change: the row's message icon (or View conversation in its details) opens the conversation */}
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
        {/* Review change: the display-only filter tags (All properties, Routine, Emergency, Oldest first) are removed;
            they didn't filter anything (the queue is always oldest first) */}
        {/* Review change: the rows are an accordion. Clicking a job (or Enter / Space on it) opens its details right
            under it: tenant, urgency, agent triage, estimate, photos, damage flag and the actions; clicking it again
            closes it. One job is open at a time and all start closed. This replaces the details card on the right, so
            the table uses the full width. */}
        {/* Review change: the table card's name */}
        <h2 id="hc-c86-queue" className="hc-large-bold hc-c86-queue-title">
          Approval queue
        </h2>
        {stateBlock() ?? (
          <div className="hc-c86-table" role="table" aria-labelledby="hc-c86-queue">
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
                    <span role="cell">{r.property}</span>
                    {/* Review change: the job shows as a tag: reports coloured by urgency (URGENCY), maintenance neutral;
                        hover names it */}
                    <span role="cell" className="hc-c86-table__job">
                      <span title={r.tag.title}>
                        <StatusPill label={r.label} tone={r.tag.tone} />
                      </span>
                      {/* Review change: no New reply tag; the message icon after View shows a job has a conversation */}
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
                      {/* Review change: a message icon after View when the job has a conversation with the tenant; it
                          opens the Conversation dialog. Jobs without one keep the space so the View buttons line up. */}
                      {thread.length > 0 ? (
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
                      ) : (
                        <span className="hc-c86-table__chat hc-c86-table__chat--none" aria-hidden />
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
                          {r.facts.map(([label, value]) => (
                            <div key={label} className="hc-c86-fact">
                              <dt className="hc-small hc-muted">{label}</dt>
                              <dd className="hc-medium">{value}</dd>
                            </div>
                          ))}
                        </dl>
                        {/* Review change: the conversation with the tenant isn't shown here; one button opens it in the
                            Conversation dialog (with how many messages and who wrote last) */}
                        {thread.length > 0 && (
                          <div className="hc-c86-thread">
                            <Button size="small" variant="secondary" leadingIcon="chat" onClick={() => openConversation(r)}>
                              View conversation
                            </Button>
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
            })}
          </div>
        )}
      </div>
      <AgentFab size="extended" to={screenPath('C09')} className="hc-c86-fab" />
    </WebShell>
  );
}
