import { useState } from 'react';
import { AgentCard } from '../../../components/AgentCard/AgentCard';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { ConsentRow } from '../../../components/ConsentRow/ConsentRow';
import { Icon, type IconName } from '../../../components/Icon/Icon';
import { SettingRow } from '../../../components/SettingRow/SettingRow';
import { openLegal } from '../../data/legal';
import { money } from '../../data/sample';
import { useDemoActions } from '../../prototype/DemoTools';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import { OnboardingStepper, WebCard } from './_onboarding';
import { SpendLimit } from './_spend-limit';
import './C06-agent-intro.css';

const GREETING = 'Hi, I’m your HouseCue agent. I keep track of your home and handle the legwork with pros.';

const abilities: { title: string; description: string; icon: IconName }[] = [
  { title: 'Finds pros and asks for quotes', description: 'I email pros first, and text or call once they reply.', icon: 'search' },
  { title: 'Schedules estimates and jobs', description: 'Around the times you tell me you’re free.', icon: 'calendar' },
  { title: 'Books and pays only with your OK', description: 'Up to the limit you set below.', icon: 'shield' },
];

/**
 * C06 Agent intro and permissions — Figma mobile 215:12102, web 215:14669.
 *
 * Review change (shorter onboarding, Option A; prototype Figma file "HouseCue — Prototype", page Onboarding, frame
 * "A5. Your agent"): onboarding is 3 steps (Account · Home · Agent) and this is step 3. It merges the agent intro with
 * the one decision from C07 that matters up front, the spending limit (+ auto-book), and the agent-contact consent
 * that used to be on C41. The other rules start at their defaults and live in C07 / Agent preferences (C42).
 * Finish setup needs the agent-contact consent (it's required to request quotes) and goes to Home (C08).
 */
export default function AgentIntro(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const mobile = device === 'mobile';

  // Same starting values as C07: mobile $0 / auto-book off, web $300 / auto-book on
  const [limit, setLimit] = useState(mobile ? 0 : 300);
  const [autoBook, setAutoBook] = useState(!mobile);
  const [contact, setContact] = useState(false);

  useDemoActions([{ label: 'Use Demo Account', onClick: () => setContact(true) }]);

  // The abilities as cards (earlier review change; Figma draws list rows), stacked now that there are three
  const list = (
    <ul className="hc-c06-cards hc-c06-cards--stack">
      {abilities.map((a) => (
        <li key={a.title} className="hc-c06-card">
          <span className="hc-c06-card__icon">
            <Icon name={a.icon} size={24} />
          </span>
          <span className="hc-c06-card__text">
            <span className="hc-medium-semibold">{a.title}</span>
            <span className="hc-small hc-muted">{a.description}</span>
          </span>
        </li>
      ))}
    </ul>
  );

  const spend = (
    <>
      <h2 className="hc-h4">How much can I spend without asking?</h2>
      <SpendLimit value={limit} onChange={setLimit} />
      <SettingRow
        title="Auto-book within my limit"
        description={autoBook ? `On: I book quotes up to ${money(limit)} and tell you right away.` : 'Off: I always ask you first.'}
        checked={autoBook}
        onCheckedChange={setAutoBook}
      />
      <ConsentRow
        checked={contact}
        onChange={(e) => setContact(e.target.checked)}
        linkLabel="Needed to request quotes · Learn more"
        onLinkClick={() => openLegal('terms')}
      >
        Let my HouseCue agent call, text and email pros for me
      </ConsentRow>
      <p className="hc-small hc-muted">
        Quotes per request, price negotiation, free estimates and what happens if a pro cancels start with our defaults. Change
        them any time in Agent preferences.
      </p>
    </>
  );

  if (mobile) {
    return (
      <MobileShell
        className="hc-onb-mobile"
        // Back skips the X05 location prompt (a branch of C04) and returns to the address step
        header={{ title: 'Your agent', onBack: () => flow.go('C04') }}
        bottom={<BottomActions primaryLabel="Finish setup" onPrimary={flow.goNext} primaryDisabled={!contact} />}
      >
        <OnboardingStepper step={3} />
        <AgentCard>{GREETING}</AgentCard>
        {list}
        {spend}
      </MobileShell>
    );
  }

  return (
    <WebShell layout="onboarding" className="hc-onb-web">
      <WebCard>
        <OnboardingStepper step={3} />
        <AgentCard>{GREETING}</AgentCard>
        {list}
        {spend}
        <div className="hc-onb-actions">
          <Button fullWidth onClick={flow.goNext} disabled={!contact}>
            Finish setup
          </Button>
        </div>
      </WebCard>
    </WebShell>
  );
}
