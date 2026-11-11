import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AgentCard } from '../../../components/AgentCard/AgentCard';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { QuoteRow } from '../../../components/QuoteRow/QuoteRow';
import { TabBar } from '../../../components/TabBar/TabBar';
import { UserBubble } from '../../../components/UserBubble/UserBubble';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { homeownerPaths } from '../../shells/navPaths';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C74-request-thread.css';

const VENDOR = 'Saguaro Air Pros';

type Message = { id: number; from: 'user' | 'vendor' | 'agent'; text: string };

const initial: Message[] = [
  { id: 1, from: 'vendor', text: 'Hi! Is the outside unit making any clicking or humming sounds?' },
  { id: 2, from: 'user', text: 'No clicking, just warm air upstairs.' },
  { id: 3, from: 'agent', text: 'I’ve added the model and last service date to the brief so they have it.' },
];

const VENDOR_REPLIES = [
  'Thanks, that helps. Sounds like it could be the capacitor. I can take a look Friday morning.',
  'Got it. I’ll bring the parts for the Trane XR14 just in case.',
  'Thanks! I’ll update my quote if anything changes.',
];

/** C74 Request thread (homeowner) — Figma mobile 216:18941, web 216:20307 (J1 Request quotes step 4) */
export default function RequestThread(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [messages, setMessages] = useState<Message[]>(initial);
  const [draft, setDraft] = useState('');
  const [phoneShared, setPhoneShared] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const replyIndex = useRef(0);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  const send = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((m) => [...m, { id: Date.now(), from: 'user', text }]);
    setDraft('');
    const reply = VENDOR_REPLIES[replyIndex.current++ % VENDOR_REPLIES.length];
    window.setTimeout(() => setMessages((m) => [...m, { id: Date.now() + 1, from: 'vendor', text: reply }]), 700);
  };

  const thread = (
    <div className="hc-c74-thread">
      <Banner>Your phone number stays private unless you share it. Your agent sees this chat.</Banner>
      {messages.map((m) =>
        m.from === 'user' ? (
          <UserBubble key={m.id}>{m.text}</UserBubble>
        ) : (
          <AgentCard key={m.id} name={m.from === 'vendor' ? VENDOR : undefined}>
            {m.text}
          </AgentCard>
        ),
      )}
      <div ref={endRef} />
    </div>
  );

  const composer = (
    <form className="hc-c74-composer" onSubmit={send}>
      <input
        className="hc-c74-composer__input"
        placeholder="Message"
        aria-label={`Message ${VENDOR}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      {device === 'mobile' && (
        <button type="button" className="hc-c74-composer__mic" aria-label="Record a voice message" disabled>
          <span className="hc-c74-composer__mic-icon" aria-hidden />
        </button>
      )}
      <Button type="submit">Send</Button>
    </form>
  );

  if (device === 'mobile') {
    return (
      <MobileShell
        header={{ title: VENDOR }}
        bottom={
          <>
            {composer}
            <TabBar role="homeowner" active="jobs" paths={homeownerPaths} />
          </>
        }
      >
        {thread}
      </MobileShell>
    );
  }

  return (
    <WebShell nav="jobs">
      <div className="hc-c74-web">
        <header className="hc-c74-web__head">
          <h1 className="hc-h2">{VENDOR}</h1>
          <Button variant="secondary" onClick={() => setPhoneShared((s) => !s)}>
            {phoneShared ? 'Phone number shared' : 'Share my phone number'}
          </Button>
        </header>
        <div className="hc-c74-web__cols">
          <section className="hc-c74-card hc-c74-card--chat">
            {thread}
            {composer}
          </section>
          <aside className="hc-c74-card hc-c74-card--quote">
            <h2 className="hc-large-bold">Their quote</h2>
            <QuoteRow
              vendor={VENDOR}
              price="$165"
              trustScore={81}
              rating="★ 4.6 (58) · Licensed · Insured"
              reviews="HouseCue job reviews ★ 4.8 · 126 jobs"
              nearby="3 recent jobs within 2 miles"
              details="Earliest Fri, Nov 14 · 90-day warranty"
              onChoose={flow.goNext}
              onProfile={() => flow.go('C15')}
            />
          </aside>
        </div>
      </div>
    </WebShell>
  );
}
