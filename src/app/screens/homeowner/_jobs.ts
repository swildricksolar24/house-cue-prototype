import type { StatusTone } from '../../../components/StatusPill/StatusPill';
import { portfolioTasks } from '../../data/sample';
import type { KnownVendorTrade } from './_known-vendor-dialog';
import type { JobMessage } from './_conversation-dialog';

/**
 * Review change: the portfolio's jobs (tenant reports, planned maintenance and the other jobs), their statuses and the
 * Jobs page's sections. Moved here from C86 Jobs so a property's page can list its jobs too (prototype data, invented).
 */
export type Urgency = 'urgent' | 'soon' | 'routine';
export const URGENCY: Record<Urgency, { label: string; tone: StatusTone }> = {
  urgent: { label: 'Urgent', tone: 'danger' },
  soon: { label: 'Soon', tone: 'warning' },
  routine: { label: 'Routine', tone: 'info' },
};

export type Report = {
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
export const reports: Report[] = [
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
  // Review change: a fourth report that starts Waiting on tenant (you asked Sam a question yesterday); when he replies
  // it's back in Awaiting Approval
  {
    id: 'fan',
    title: 'Ceiling fan buzzing',
    property: '1418 E Roosevelt · B',
    estimate: '$110–$170',
    waiting: '30 h',
    mobileMeta: '1418 E Roosevelt · Unit B · Electrical',
    mobileTitle: '1418 E Roosevelt · Unit B · Electrical',
    mobileDescription: 'Ceiling fan buzzing · est. $110–$170 · 30 h',
    mobileBody: 'Est. $110–$170 · over your $100 ceiling · waiting 30 h',
    tenant: 'Sam Baines · Unit B',
    triage: 'Likely loose wiring at the fan box; electrician',
    estimateDetail: '$110–$170 (routine ceiling $100)',
    photos: '1 · video 1',
    urgency: 'soon',
    trade: 'Electrical',
    askDraft: 'Hi Sam, does the buzzing happen with the light off too, or only when the fan runs?',
  },
];

/**
 * Review change: every job has a status, grouped into four sections down the page (Awaiting Approval, Active, Planned
 * maintenance, Closed). Buttons move a job between statuses instead of taking it off the page.
 */
export type Stage =
  | 'approval' | 'quotes-ready' | 'sign-off' | 'needs-access'
  | 'waiting-tenant' | 'quoting' | 'scheduled' | 'in-progress'
  | 'planned' | 'overdue'
  | 'done' | 'disputed' | 'declined';
export type Section = 'needs' | 'motion' | 'planned' | 'closed';
export const STAGES: Record<Stage, { label: string; tone: StatusTone; section: Section; order: number }> = {
  approval: { label: 'Needs approval', tone: 'warning', section: 'needs', order: 0 },
  'quotes-ready': { label: 'Quotes ready', tone: 'warning', section: 'needs', order: 1 },
  'sign-off': { label: 'Awaiting sign-off', tone: 'warning', section: 'needs', order: 2 },
  'needs-access': { label: 'Needs access', tone: 'warning', section: 'needs', order: 3 },
  'waiting-tenant': { label: 'Waiting on tenant', tone: 'neutral', section: 'motion', order: 0 },
  quoting: { label: 'Getting quotes', tone: 'info', section: 'motion', order: 1 },
  scheduled: { label: 'Scheduled', tone: 'info', section: 'motion', order: 2 },
  'in-progress': { label: 'In progress', tone: 'info', section: 'motion', order: 3 },
  overdue: { label: 'Overdue', tone: 'danger', section: 'planned', order: 0 },
  planned: { label: 'Planned', tone: 'neutral', section: 'planned', order: 1 },
  done: { label: 'Done · paid', tone: 'success', section: 'closed', order: 0 },
  disputed: { label: 'Disputed', tone: 'danger', section: 'closed', order: 1 },
  declined: { label: 'Declined', tone: 'neutral', section: 'closed', order: 2 },
};
export const SECTIONS: { id: Section; title: string; note: string; empty: string }[] = [
  { id: 'needs', title: 'Awaiting Approval', note: 'Approvals, quotes to pick, work to sign off and access problems', empty: 'You’re all caught up.' },
  { id: 'motion', title: 'Active', note: 'Waiting on a tenant, getting quotes, booked or being worked on', empty: 'No active jobs right now.' },
  // Review change: "Upcoming Maintenance" (moved here from the Portfolio page's card; was Planned maintenance)
  { id: 'planned', title: 'Upcoming Maintenance', note: 'DIY tasks across the portfolio, next 30 days', empty: 'Nothing due in the next 30 days.' },
  { id: 'closed', title: 'Recently Closed', note: 'Paid, disputed and declined jobs', empty: 'Nothing closed yet.' },
];

/** Review change: other jobs on the portfolio, one per status (invented names, vendors and amounts) */
export type OtherJob = { id: string; property: string; title: string; stage: Stage; cost: string; when: string; tenant: string; facts: [string, string][] };
export const OTHER_JOBS: OtherJob[] = [
  { id: 'roof', property: '5602 E Pima · 2', title: 'Roof leak over bedroom', stage: 'quotes-ready', cost: '$420–$610', when: 'Quotes in today', tenant: 'Gerald Strickland · Unit 2', facts: [['Quote', 'Desert Roof Co. · $420 · ★ 4.8 · Fri 9–11 AM'], ['Quote', 'Mesa Roofing · $515 · ★ 4.6 · Mon'], ['Quote', 'Copper State Roofing · $610 · ★ 4.7 · Tue'], ['Approved up to', '$650'], ['Tenant', 'Gerald Strickland · Unit 2'], ['Photos', '4']] },
  { id: 'faucet', property: '5602 E Pima · 1', title: 'Bathroom faucet drip', stage: 'sign-off', cost: '$165', when: 'Done yesterday', tenant: 'Lou Caruthers · Unit 1', facts: [['Pro', 'Sonoran Plumbing Co.'], ['Work', 'Replaced cartridge and seals'], ['Cost', '$165 · held until you sign off'], ['Tenant says', 'Fixed, no drip since'], ['Photos', '2 after photos']] },
  { id: 'water-heater', property: '812 S 4th Ave', title: 'Water heater pilot out', stage: 'needs-access', cost: '$95–$150', when: 'Visit missed today', tenant: 'Marvin B.', facts: [['Pro', 'Sonoran Plumbing Co.'], ['Problem', 'No one home for the 10–12 visit'], ['Tenant', 'Marvin B. · away until Fri'], ['Lockbox', 'None on file'], ['Next opening', 'Fri 1–3 PM']] },
  { id: 'paint', property: '3315 E Fairmount Ave', title: 'Turnover paint, 2 bed', stage: 'quoting', cost: 'Up to $1,800', when: 'Quotes due Nov 21', tenant: 'Vacant', facts: [['Pros asked', '3 painters near Phoenix'], ['Quotes in', '1 of 3'], ['Approved up to', '$1,800'], ['Access', 'Lockbox 4417']] },
  { id: 'ac', property: '1418 E Roosevelt · A', title: 'AC not cooling', stage: 'scheduled', cost: '$189', when: 'Thu Nov 20, 8–10 AM', tenant: 'Clara Clayton · Unit A', facts: [['Pro', 'Bluequail Air'], ['Visit', 'Thu Nov 20, 8–10 AM'], ['Approved', '$189 · held'], ['Tenant', 'Clara Clayton · told by text']] },
  { id: 'disposal', property: '2207 N 9th Ave', title: 'Garbage disposal jammed', stage: 'in-progress', cost: '$140', when: 'On site since 9:50 AM', tenant: 'Goldie W.', facts: [['Pro', 'Saguaro Appliance Repair'], ['Started', '9:50 AM · arrived 9:41'], ['Approved', '$140 · held'], ['Parts', 'None needed so far']] },
  { id: 'smoke-battery', property: '812 S 4th Ave', title: 'Smoke alarm chirping', stage: 'done', cost: '$85', when: 'Paid Nov 12', tenant: 'Marvin B.', facts: [['Pro', 'Camelback Electric'], ['Paid', '$85 · Nov 12 · Visa ending 4242'], ['Signed off by', 'You']] },
  { id: 'garage', property: '2207 N 9th Ave', title: 'Garage door spring', stage: 'disputed', cost: '$310', when: 'Frozen since Nov 6', tenant: 'Goldie W.', facts: [['Pro', 'Valley Fix-It'], ['Payment', '$310 frozen while the dispute is open'], ['Reason', 'Door still sticks after the repair']] },
  { id: 'repaint', property: '5602 E Pima · 3', title: 'Repaint bedroom', stage: 'declined', cost: '—', when: 'Declined Nov 10', tenant: 'Douglas Needles · Unit 3', facts: [['Reason', 'Not my responsibility under the lease'], ['Tenant told', 'Yes, by message']] },
  { id: 'drains', property: '3315 E Fairmount Ave', title: 'Clear roof drains', stage: 'overdue', cost: 'DIY', when: 'Was due Nov 15', tenant: 'Vacant', facts: [['Type', 'Planned maintenance · DIY'], ['Due', 'Nov 15 · 4 days ago'], ['Time', '~45 min'], ['Cost', '$0 · or hire a pro'], ['Access', 'Lockbox 4417']] },
];

/** A job as a property's page lists it: title, unit, status and its "when" line, as they start on the Jobs page */
export type JobSummary = { id: string; title: string; property: string; stage: Stage; when: string; tag: { tone: StatusTone; title: string }; hasThread: boolean };
export const portfolioJobs = (): JobSummary[] => [
  ...reports.map((r) => ({ id: r.id, title: r.title, property: r.property, stage: (r.id === 'fan' ? 'waiting-tenant' : 'approval') as Stage, when: r.id === 'fan' ? 'Asked 1 day ago' : r.waiting, tag: { tone: URGENCY[r.urgency].tone, title: URGENCY[r.urgency].label }, hasThread: !!INITIAL_THREADS[r.id] })),
  ...portfolioTasks.map((t) => ({ id: t.id, title: t.title, property: t.property, stage: 'planned' as Stage, when: t.due, tag: { tone: 'neutral' as StatusTone, title: 'Planned maintenance' }, hasThread: !!INITIAL_THREADS[t.id] })),
  ...OTHER_JOBS.map((j) => ({ id: j.id, title: j.title, property: j.property, stage: j.stage, when: j.when, tag: { tone: 'neutral' as StatusTone, title: STAGES[j.stage].label }, hasThread: !!INITIAL_THREADS[j.id] })),
];
/** "1418 E Roosevelt · A" → its address prefix "1418 E Roosevelt" and unit "A" */
export const jobPlace = (property: string) => {
  const [street, unit] = property.split(' · ');
  return { street, unit };
};

/** Review change: messages with the tenant about a job (Ask the tenant); moved here from C86 Jobs */
export const INITIAL_THREADS: Record<string, JobMessage[]> = {
  // Review change: the question Lou hasn't answered yet (the fan job is Waiting on tenant)
  fan: [{ from: 'you', text: 'Hi Sam, does the buzzing happen with the light off too, or only when the fan runs?', time: 'Yesterday 4:10 PM' }],
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
