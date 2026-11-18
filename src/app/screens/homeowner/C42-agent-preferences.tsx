import { useState } from 'react';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { NumberStepper } from '../../../components/NumberStepper/NumberStepper';
import { SettingRow } from '../../../components/SettingRow/SettingRow';
import { StatusPill, type StatusTone } from '../../../components/StatusPill/StatusPill';
import { homeDevices, roomOrder } from '../../data/sample';
import { usePrototype } from '../../prototype/PrototypeContext';
import { EditDialog, type EditDialogProps } from '../../shells/EditDialog';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import { DeviceIcon } from './_c46-device-icon';
import './C42-agent-preferences.css';

const PRIORITIES = ['Lowest price', 'Balanced', 'Best quality'];

/**
 * Review change: urgency rules are per device, for every known device (data/sample.ts homeDevices), grouped by room
 * with the device's icon. They replace the three sample rules from the Figma frame (AC not cooling, Water leak, Pool
 * pump noise). Starting urgency comes from the kind of device.
 */
const defaultUrgency = (name: string) => {
  const n = name.toLowerCase();
  if (/leak|smoke|co alarm/.test(n)) return 'Emergency';
  if (/thermostat|garage door/.test(n)) return 'Same day';
  if (/plug|\blight\b|lamp/.test(n)) return 'Flexible'; // whole word "light": "floodlight" is a motion sensor
  return 'This week';
};
const URGENCY_TONE: Record<string, StatusTone> = { Emergency: 'danger', 'Same day': 'warning', 'This week': 'info', Flexible: 'neutral' };

/** Choices in the edit dialogs (review change) */
const URGENCY_LEVELS = ['Emergency', 'Same day', 'This week', 'Flexible'];
const ESTIMATE_TIMES = ['Weekdays 8–11 AM', 'Weekdays 12–5 PM', 'Weekday evenings 5–8 PM', 'Saturdays 9 AM–1 PM', 'Any time'];

type Editing = Omit<EditDialogProps, 'onCancel'>;

/**
 * C42 Agent preferences — Figma mobile 215:13230 (batch 211:6306), web 215:16463 (batch 211:6307). J1 Onboarding step 18.
 * Review change: every Edit opens an edit dialog (EditDialog): Estimate times (choice), Monthly budget (amount, optional)
 * and each urgency rule (Emergency / Same day / This week / Flexible). Estimate times' Edit used to jump to C43 Calendar
 * connect; budget and the urgency rules were disabled.
 */
export default function AgentPreferences(_: ScreenProps) {
  const { device } = usePrototype();
  const [quotes, setQuotes] = useState(5);
  const [priority, setPriority] = useState('Balanced');
  const [estimateTimes, setEstimateTimes] = useState(ESTIMATE_TIMES[0]);
  const [budget, setBudget] = useState('150');
  // Urgency per device id (review change)
  const [urgency, setUrgency] = useState<Record<string, string>>(() => Object.fromEntries(homeDevices.map((d) => [d.id, defaultUrgency(d.name)])));
  const [editing, setEditing] = useState<Editing | null>(null);
  const web = device === 'web';

  const edit = (e: Editing) =>
    setEditing({
      ...e,
      onSave: (v) => {
        e.onSave(v);
        setEditing(null);
      },
    });
  const dialog = editing && <EditDialog {...editing} onCancel={() => setEditing(null)} />;

  const editEstimateTimes = () =>
    edit({
      title: 'Edit estimate times',
      description: 'When pros can come by for estimates.',
      label: 'Estimate times',
      field: { kind: 'select', options: ESTIMATE_TIMES },
      value: estimateTimes,
      onSave: setEstimateTimes,
    });
  const editBudget = () =>
    edit({
      title: 'Edit monthly budget',
      description: 'Your agent warns you before going over it. Your spend cap is always the ceiling.',
      label: 'Monthly budget in $',
      field: { kind: 'number', placeholder: 'e.g. 150' },
      optional: true,
      value: budget,
      onSave: (v) => setBudget(v.replace(/[^0-9.]/g, '')),
    });
  const editUrgency = (id: string) => {
    const d = homeDevices.find((x) => x.id === id);
    if (!d) return;
    edit({
      title: `Edit urgency: ${d.name}`,
      description: `How fast your agent looks for a pro when the ${d.room.toLowerCase()} ${d.name.split(' · ')[0].toLowerCase()} reports a problem.`,
      label: 'Urgency',
      field: { kind: 'select', options: URGENCY_LEVELS },
      value: urgency[id],
      onSave: (v) => setUrgency((u) => ({ ...u, [id]: v })),
    });
  };

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
      <DetailRow label="Estimate times" value={estimateTimes} actionLabel="Edit" onAction={editEstimateTimes} />
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
        {dialog}
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
            <DetailRow label="Monthly budget (optional)" value={budget ? `$${budget}` : 'Not set'} actionLabel="Edit" onAction={editBudget} />
          </section>
          {/* Review change: the "By category" card (HVAC, Plumbing, Pool, Electrical, + Add a category) is removed */}
          <section className="hc-c42-card hc-c42-card--list hc-c42-card--side">
            <h2 className="hc-large-bold">Urgency rules</h2>
            {roomOrder.map((room) => {
              const devices = homeDevices.filter((d) => d.room === room);
              if (!devices.length) return null;
              return (
                <div key={room} className="hc-c42-urgency-room">
                  <h3 className="hc-c42-urgency-room__title">{room}</h3>
                  <ul className="hc-c42-urgency">
                    {devices.map((d) => (
                      <li key={d.id} className="hc-c42-urgency__row">
                        <DeviceIcon name={d.name} />
                        <span className="hc-c42-urgency__text">
                          <span className="hc-medium">{d.name}</span>
                          <StatusPill label={urgency[d.id]} tone={URGENCY_TONE[urgency[d.id]] ?? 'neutral'} />
                        </span>
                        <Button variant="secondary" size="tiny" onClick={() => editUrgency(d.id)} aria-label={`Edit urgency: ${d.name}, ${d.room}`}>
                          Edit
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            <p className="hc-small hc-muted">Anything not listed: This week.</p>
          </section>
        </div>
      </div>
      {dialog}
    </WebShell>
  );
}
