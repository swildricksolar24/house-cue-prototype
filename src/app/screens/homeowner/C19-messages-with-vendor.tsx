import { useState, type FormEvent } from 'react';
import { AgentCard } from '../../../components/AgentCard/AgentCard';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { ImagePlaceholder } from '../../../components/ImagePlaceholder/ImagePlaceholder';
import { TimelineStep } from '../../../components/TimelineStep/TimelineStep';
import { UserBubble } from '../../../components/UserBubble/UserBubble';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C19-messages-with-vendor.css';

/*
 * C19 Messages with vendor — Figma batch B4 (33:346). J1 Job in progress step 3 (mobile 217:31111, web 217:31819) and
 * Emergency step 3 (218:16170 / 218:16609, same frame). No state frames drawn.
 */

const VENDOR = 'Zephyrline HVAC';

export default function MessagesWithVendor(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState<string[]>([]);

  const send = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setSent((s) => [...s, text]);
    setDraft('');
  };

  const thread = (
    <div className="hc-c19-thread">
      <AgentCard name={VENDOR}>On my way, about 12 minutes out.</AgentCard>
      <UserBubble>Great, the side gate is open.</UserBubble>
      <AgentCard name={VENDOR}>Found it: the run capacitor is failing. Photo below. I sent you a change order.</AgentCard>
      <ImagePlaceholder label="Photo from the pro" height={device === 'mobile' ? 118 : 160} />
      <AgentCard>That part fits your Trane XR14, and $185 is in the usual range.</AgentCard>
      {sent.map((m, i) => (
        <UserBubble key={i}>{m}</UserBubble>
      ))}
    </div>
  );

  const composer = (
    <form className="hc-c19-composer" onSubmit={send}>
      <input
        className="hc-c19-composer__input"
        aria-label="Message"
        placeholder="Message"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      {device === 'mobile' && (
        <button type="button" className="hc-c19-composer__voice" aria-label="Voice message">
          <span className="hc-c19-composer__mic" aria-hidden />
        </button>
      )}
      <Button type="submit">Send</Button>
    </form>
  );

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: VENDOR }} tab="jobs" padding="none">
        <div className="hc-c19-mobile">
          {thread}
          <div className="hc-c19-mobile__composer">{composer}</div>
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="jobs">
      <div className="hc-c19-web">
        <h1 className="hc-h2">Messages with {VENDOR}</h1>
        <div className="hc-c19-web__cols">
          <section className="hc-c19-card hc-c19-web__chat">
            {thread}
            {composer}
          </section>
          <aside className="hc-c19-web__side">
            <section className="hc-c19-card hc-c19-card--side">
              <h2 className="hc-large-bold">This job</h2>
              <ol className="hc-c19-steps">
                <TimelineStep state="current" title="In progress" meta="Started 9:50 AM" />
              </ol>
              <DetailRow label="Change order" value="+$185 · waiting for you" actionLabel="Review" onAction={() => flow.go('C18')} />
            </section>
            <Banner tone="info" title="Pay only in HouseCue">
              Your hold, warranty and dispute help only cover payments made in the app.
            </Banner>
          </aside>
        </div>
      </div>
    </WebShell>
  );
}
