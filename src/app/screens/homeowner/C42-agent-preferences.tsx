import { useState } from 'react';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { ListRow } from '../../../components/ListRow/ListRow';
import { NumberStepper } from '../../../components/NumberStepper/NumberStepper';
import { SettingRow } from '../../../components/SettingRow/SettingRow';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C42-agent-preferences.css';

const PRIORITIES = ['Lowest price', 'Balanced', 'Best quality'];

/** Invented sample categories and pros from the Figma frame */
const CATEGORIES = [
  { title: 'HVAC', description: '7 quotes · Best quality · cap $300 · prefers Zephyrline HVAC' },
  { title: 'Plumbing', description: 'Default · leaks are Same day' },
  { title: 'Pool', description: 'Default' },
  { title: 'Electrical', description: 'Default · pro only' },
];

const URGENCY = [
  { label: 'AC not cooling', value: 'Emergency' },
  { label: 'Water leak', value: 'Same day' },
  { label: 'Pool pump noise', value: 'This week' },
];

/**
 * C42 Agent preferences — Figma mobile 215:13230 (batch 211:6306), web 215:16463 (batch 211:6307). J1 Onboarding step 18.
 * Estimate times → Change goes to C43 Calendar connect (the next step).
 */
export default function AgentPreferences(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [quotes, setQuotes] = useState(5);
  const [priority, setPriority] = useState('Balanced');
  const web = device === 'web';

  const general = (
    <>
      <h2 className="hc-large-bold">For all categories</h2>
      <NumberStepper
        title="Quotes per request"
        helper="3–10 · default 5. Your agent contacts twice this many pros."
        value={quotes}
        onValueChange={setQuotes}
        min={3}
        max={10}
      />
      <h3 className="hc-medium-semibold">Price vs quality</h3>
      <div className="hc-c42-chips" role="radiogroup" aria-label="Price vs quality">
        {PRIORITIES.map((p) => (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={priority === p}
            className={['hc-c42-chip', priority === p && 'hc-c42-chip--selected'].filter(Boolean).join(' ')}
            onClick={() => setPriority(p)}
          >
            {p}
          </button>
        ))}
      </div>
      <DetailRow label="Estimate times" value="Weekdays 8–11 AM" actionLabel="Change" onAction={flow.goNext} />
      <SettingRow title="Include pros I’ve used" description={web ? 'Ask them for quotes too' : 'Ask them too'} defaultChecked />
      <SettingRow
        title="Price negotiation"
        description={
          web
            ? 'On: your agent asks for a better price when a quote is more than 20% above the median of your quotes. You approve the final price.'
            : 'Asks for a better price above the median. You approve.'
        }
        defaultChecked
      />
      <SettingRow
        title="Auto-accept free estimates"
        description={web ? 'Off: your agent asks you before accepting a free estimate visit.' : 'Off: asks you first'}
      />
    </>
  );

  if (!web) {
    return (
      <MobileShell header={{ title: 'Agent preferences' }} tab="agent">
        <div className="hc-c42-content">{general}</div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="agent">
      <div className="hc-c42-web">
        <header className="hc-c42-web__head">
          <h1 className="hc-h2">Agent preferences</h1>
          <p className="hc-medium hc-muted">Your agent follows these when it asks pros for quotes. Your spend cap is always the ceiling.</p>
        </header>
        <div className="hc-c42-web__cols">
          <section className="hc-c42-card hc-c42-card--main">
            {general}
            <DetailRow label="Monthly budget (optional)" value="$150" actionLabel="Change" onAction={() => {}} />
          </section>
          <section className="hc-c42-card hc-c42-card--list">
            <h2 className="hc-large-bold">By category</h2>
            {CATEGORIES.map((c) => (
              <ListRow key={c.title} title={c.title} description={c.description} />
            ))}
            <button type="button" className="hc-c42-link">
              + Add a category
            </button>
          </section>
          <section className="hc-c42-card hc-c42-card--list hc-c42-card--side">
            <h2 className="hc-large-bold">Urgency rules</h2>
            {URGENCY.map((u) => (
              <DetailRow key={u.label} label={u.label} value={u.value} actionLabel="Change" onAction={() => {}} />
            ))}
            <p className="hc-small hc-muted">Anything not listed: This week.</p>
          </section>
        </div>
      </div>
    </WebShell>
  );
}
