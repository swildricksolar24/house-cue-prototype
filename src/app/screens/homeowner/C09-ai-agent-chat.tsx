import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ActionCard } from '../../../components/ActionCard/ActionCard';
import { AgentCard } from '../../../components/AgentCard/AgentCard';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { PushCard } from '../../../components/PushCard/PushCard';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { TabBar } from '../../../components/TabBar/TabBar';
import { UserBubble } from '../../../components/UserBubble/UserBubble';
import { agent, currentHome, money, systems } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { homeownerPaths, landlordPaths } from '../../shells/navPaths';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C09-ai-agent-chat.css';

/**
 * Extra Figma state frames (B2, section 21:403), reachable with ?state=…:
 * - over-cap          "C09 / … / Over-cap approval" (242:6437 / 242:6685) — approval sheet over the chat
 * - vendor-cancelled  "C09 / … / Vendor cancelled — ask first" (242:6951 / 242:7199)
 * - tenant-report     "C09 / … / Tenant-report approval card" (269:7889 / 269:8178) — landlord role
 * - rental-emergency  "C09 / … / Rental emergency booked after 15 min" (271:7960 / 271:8247) — landlord role
 */
type C09State = 'default' | 'over-cap' | 'vendor-cancelled' | 'tenant-report' | 'rental-emergency';
const C09_STATES: C09State[] = ['over-cap', 'vendor-cancelled', 'tenant-report', 'rental-emergency'];

type Message = { id: number; from: 'user' | 'agent'; text: string };

const AGENT_REPLIES = [
  'Got it. I’ve added that to the brief so the pros have it.',
  'Thanks. I’ll keep that in mind and check with you before anything is booked.',
  'Noted. Want me to include that when I ask for quotes?',
];

const ac = systems.find((s) => s.id === 'ac') ?? systems[0];

const SHEETS: Record<'over-cap' | 'vendor-cancelled', { title: string; body: string; primary: string; reply: string }> = {
  'over-cap': {
    title: `Approve $412? It’s over your ${money(agent.spendCap)} cap`,
    body: 'Total out-of-pocket for AC repair: $374 job + $38 trip fee. Auto-book is on, but anything over your cap needs your OK.',
    primary: 'Approve $412 and book',
    reply: 'Done. I booked it for $412 and added it to your jobs.',
  },
  'vendor-cancelled': {
    title: 'Zephyrline HVAC cancelled Thu 8–10 AM',
    body: 'You asked to be asked first. Book the next-ranked quote: Mesa Comfort Co., $235, Fri 8–10 AM? It’s within your spend rules.',
    primary: 'Book Mesa Comfort Co.',
    reply: 'Booked Mesa Comfort Co. for Fri 8–10 AM. I’ll remind you the day before.',
  },
};

/** C09 AI agent chat — Figma mobile 216:18549, web 216:19664 (J1 Request quotes step 1) */
export default function AiAgentChat(_: ScreenProps) {
  const { device, screenState } = usePrototype();
  const flow = useFlow();
  const state: C09State = C09_STATES.includes(screenState as C09State) ? (screenState as C09State) : 'default';
  const landlord = state === 'tenant-report' || state === 'rental-emergency';

  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [cardDone, setCardDone] = useState<'approved' | 'rejected' | null>(null);
  const [sheetOpen, setSheetOpen] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const replyIndex = useRef(0);

  useEffect(() => {
    setSheetOpen(true);
  }, [state]);

  useEffect(() => {
    if (messages.length) endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [messages]);

  const addAgentReply = (text: string) => setMessages((m) => [...m, { id: Date.now() + 1, from: 'agent', text }]);

  const send = (e?: FormEvent) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((m) => [...m, { id: Date.now(), from: 'user', text }]);
    setDraft('');
    const reply = AGENT_REPLIES[replyIndex.current++ % AGENT_REPLIES.length];
    window.setTimeout(() => addAgentReply(reply), 600);
  };

  /* ---------- Thread content per state ---------- */
  let thread: ReactNode;
  if (state === 'tenant-report') {
    thread = (
      <>
        <AgentCard>
          Marisol (1418 E Roosevelt, Unit A) reported a kitchen sink leak. My estimate is $180–$260, over your $150 ceiling.
        </AgentCard>
        {cardDone ? null : (
          <ActionCard
            meta="Agent · 26 h ago"
            title="Approve this repair?"
            body="Slow leak at the P-trap, not urgent. 3 photos, 1 video. Plumber needed."
            approveLabel="Approve"
            editLabel="Ask tenant"
            rejectLabel="Decline"
            onApprove={() => {
              setCardDone('approved');
              addAgentReply('Approved. I’ll ask 3 plumbers for quotes and keep Marisol posted.');
            }}
            onEdit={() => addAgentReply('I asked Marisol for a closer photo of the P-trap. I’ll update you when she replies.')}
            onReject={() => {
              setCardDone('rejected');
              addAgentReply('Declined. I let Marisol know you’ll handle it another way.');
            }}
          />
        )}
        <p className="hc-small hc-muted">Also in Approvals (C86). First decision wins.</p>
      </>
    );
  } else if (state === 'rental-emergency') {
    thread = (
      <>
        <PushCard
          className="hc-c09-push"
          meta="HouseCue · 2:14 AM"
          title="Emergency at 2207 N 9th Ave"
          body="Priya reported no cooling, 96°F inside. Dispatch pings sent."
        />
        <AgentCard>
          No answer from you or Corinne in 15 minutes, so I booked Bluequail Air Service at $480, within your $600 emergency
          ceiling. ETA 2:55 AM.
        </AgentCard>
        <section className="hc-c09-booked">
          <div className="hc-c09-booked__head">
            <StatusPill label="Booked" tone="success" />
            <span className="hc-small hc-muted">Agent · 2:31 AM</span>
          </div>
          <p className="hc-medium-semibold">Emergency booked</p>
          <p className="hc-small">Bluequail Air Service · $480 total incl. after-hours surcharge · Priya will let them in.</p>
          <div className="hc-c09-booked__actions">
            <Button onClick={() => flow.go('C18')}>View job</Button>
            <Button variant="secondary" onClick={() => addAgentReply('Calling Priya now from your HouseCue number.')}>
              Call Priya
            </Button>
          </div>
        </section>
      </>
    );
  } else {
    thread = (
      <>
        <p className="hc-small hc-muted">Today 9:12 AM</p>
        <UserBubble>The AC is blowing warm air upstairs.</UserBubble>
        <AgentCard>
          Sorry about that. Your {ac.model} is {ac.age} old, and warm air upstairs is usually a refrigerant or capacitor issue.
          That needs a licensed pro.
        </AgentCard>
        {cardDone === 'rejected' ? null : (
          <ActionCard
            meta="Agent · now"
            title="Ask 5 pros for AC repair quotes"
            body={`I’ll email 5 licensed HVAC pros near ${currentHome.address} and collect quotes by 6 PM. Nothing is booked or paid without your OK.`}
            onApprove={flow.goNext}
            onEdit={flow.goNext}
            onReject={() => {
              setCardDone('rejected');
              addAgentReply('Okay, I won’t contact anyone. Tell me if you want to try something else first.');
            }}
          />
        )}
      </>
    );
  }

  const chat = (
    <div className="hc-c09-thread">
      {thread}
      {messages.map((m) =>
        m.from === 'user' ? <UserBubble key={m.id}>{m.text}</UserBubble> : <AgentCard key={m.id}>{m.text}</AgentCard>,
      )}
      <div ref={endRef} />
    </div>
  );

  const composer = (
    <form className="hc-c09-composer" onSubmit={send}>
      <input
        className="hc-c09-composer__input"
        placeholder="Message your agent"
        aria-label="Message your agent"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      {device === 'mobile' && (
        <button type="button" className="hc-c09-composer__mic" aria-label="Talk to your agent" disabled>
          <span className="hc-c09-composer__mic-icon" aria-hidden />
        </button>
      )}
      <Button type="submit">Send</Button>
    </form>
  );

  const sheetKey = state === 'over-cap' || state === 'vendor-cancelled' ? state : null;
  const sheet = sheetKey && sheetOpen && (
    <div className={`hc-c09-scrim hc-c09-scrim--${device}`} role="presentation" onClick={() => setSheetOpen(false)}>
      <div
        className={`hc-c09-sheet hc-c09-sheet--${device}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hc-c09-sheet-title"
        onClick={(e) => e.stopPropagation()}
      >
        {device === 'mobile' && <span className="hc-c09-sheet__handle" aria-hidden />}
        <h2 id="hc-c09-sheet-title" className="hc-h3">
          {SHEETS[sheetKey].title}
        </h2>
        <p className="hc-medium hc-muted">{SHEETS[sheetKey].body}</p>
        <div className="hc-c09-sheet__actions">
          <Button
            fullWidth={device === 'mobile'}
            onClick={() => {
              setSheetOpen(false);
              addAgentReply(SHEETS[sheetKey].reply);
            }}
          >
            {SHEETS[sheetKey].primary}
          </Button>
          <Button variant="secondary" fullWidth={device === 'mobile'} onClick={() => setSheetOpen(false)}>
            Not now
          </Button>
        </div>
      </div>
    </div>
  );

  if (device === 'mobile') {
    return (
      <div className="hc-c09-mobile">
        <MobileShell
          role={landlord ? 'landlord' : 'homeowner'}
          header={{ title: 'Agent', showBack: false }}
          bottom={
            <>
              {composer}
              {landlord ? (
                <TabBar role="landlord" active="portfolio" paths={landlordPaths} />
              ) : (
                <TabBar role="homeowner" active="agent" paths={homeownerPaths} />
              )}
            </>
          }
        >
          {chat}
        </MobileShell>
        {sheet}
      </div>
    );
  }

  return (
    <>
      {landlord ? (
        <WebShell role="landlord" nav="portfolio">
          <WebLayout chat={chat} composer={composer} onLog={() => flow.go('C10')} side={null} />
        </WebShell>
      ) : (
        <WebShell nav="agent">
          <WebLayout
            chat={chat}
            composer={composer}
            onLog={() => flow.go('C10')}
            side={
              <>
                <section className="hc-c09-card hc-c09-card--side">
                  <h2 className="hc-large-bold">About this item</h2>
                  <DetailRow label="Item" value={ac.name} />
                  <DetailRow label="Model" value={ac.model} />
                  <DetailRow label="Age" value={ac.age} />
                  <DetailRow label="Last service" value="Mar 12, 2025" />
                </section>
                <section className="hc-c09-card hc-c09-card--side">
                  <h2 className="hc-large-bold">Spending rules</h2>
                  <DetailRow
                    label="Booking cap"
                    value="$0 · every booking needs your OK"
                    actionLabel="Edit"
                    onAction={() => flow.go('C07')}
                  />
                </section>
              </>
            }
          />
        </WebShell>
      )}
      {sheet}
    </>
  );
}

function WebLayout({ chat, composer, side, onLog }: { chat: ReactNode; composer: ReactNode; side: ReactNode; onLog: () => void }) {
  return (
    <div className="hc-c09-web">
      <header className="hc-c09-web__head">
        <h1 className="hc-h2">Agent</h1>
        <Button variant="secondary" onClick={onLog}>
          Memory and log
        </Button>
      </header>
      <div className="hc-c09-web__cols">
        <section className="hc-c09-card hc-c09-card--chat">
          {chat}
          {composer}
        </section>
        {side && <aside className="hc-c09-web__side">{side}</aside>}
      </div>
    </div>
  );
}
