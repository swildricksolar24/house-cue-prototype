import { useState, type ReactNode } from 'react';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import type { IconName } from '../../../components/Icon/Icon';
import { Input } from '../../../components/Input/Input';
import { ListRow } from '../../../components/ListRow/ListRow';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';
import { StateBlock } from '../../../components/StateBlock/StateBlock';
import { currentHome } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C10-agent-memory-and-activity-log.css';

type FactKey = 'year' | 'size' | 'pool' | 'quotes' | 'price' | 'hvac' | 'household';

const labels: Record<FactKey, string> = {
  year: 'Year built',
  size: 'Size',
  pool: 'Pool',
  quotes: 'Quotes per request',
  price: 'Price vs quality',
  hvac: 'Preferred for HVAC',
  household: 'Household',
};

const initialFacts: Record<FactKey, string> = {
  year: '1998',
  size: '1,850 sq ft',
  pool: 'Yes, in-ground',
  quotes: '5 (default)',
  price: 'Balanced',
  hvac: 'Zephyrline HVAC',
  household: '2 members',
};

/** Review change: entries about a job carry the screen its View job button opens (quotes C14, job tracker C18, Jobs C40) */
/**
 * Review change: activity is grouped by kind, each with its own colour-coded icon (C10 CSS): Quotes (blue, email),
 * Bookings (green, calendar), Calls (yellow, chat), Changes (neutral, review). Two more invented entries make the
 * groups read as groups.
 */
type ActivityGroup = 'Quotes' | 'Bookings' | 'Calls' | 'Changes';
const GROUPS: { name: ActivityGroup; icon: IconName; tone: string }[] = [
  { name: 'Quotes', icon: 'email', tone: 'quotes' },
  { name: 'Bookings', icon: 'calendar', tone: 'bookings' },
  { name: 'Calls', icon: 'chat', tone: 'calls' },
  { name: 'Changes', icon: 'review', tone: 'changes' },
];
const activity: { title: string; meta: string; group: ActivityGroup; job?: string }[] = [
  { title: 'Emailed 5 HVAC pros for quotes', meta: 'Today 9:14 AM · Email · View messages', group: 'Quotes', job: 'C14' },
  { title: 'Collected 3 quotes for AC repair', meta: 'Today 2:40 PM · Best value: Zephyrline HVAC, $374', group: 'Quotes', job: 'C14' },
  { title: 'Booking approved: $189 AC tune-up', meta: 'Yesterday · Zephyrline HVAC · You approved', group: 'Bookings', job: 'C18' },
  { title: 'Booked Fernhollow Pool Care for Nov 14', meta: 'Nov 3 · $95 · within your $300 cap', group: 'Bookings', job: 'C40' },
  { title: 'Called Fernhollow Pool Care to confirm a visit', meta: 'Nov 3 · Call, 2 min · Transcript', group: 'Calls', job: 'C40' },
  { title: 'Changed HVAC quote count from 5 to 7', meta: 'Nov 2 · You asked in chat', group: 'Changes' },
];

type Tab = 'Memory' | 'Activity';

/** C10 Agent memory and activity log — Figma mobile 216:15466, web 216:17367 (J1 Home record step 5). States 110:3844… on B2. */
export default function AgentMemory(_: ScreenProps) {
  const { device, screenState, setScreenState } = usePrototype();
  const flow = useFlow();
  const [tab, setTab] = useState<Tab>('Memory');
  const [facts, setFacts] = useState(initialFacts);
  const [editing, setEditing] = useState<FactKey | null>(null);
  const [draft, setDraft] = useState('');
  const log = activity;

  // Review change: Edit opens the field with Cancel / Save right under it, inside the card. Nothing changes until Save
  // (Enter saves, Esc cancels); Save is off while the field is empty or unchanged.
  const startEdit = (key: FactKey) => {
    setEditing(key);
    setDraft(facts[key]);
  };
  const cancelEdit = () => setEditing(null);
  const saveEdit = () => {
    if (!editing || !draft.trim()) return;
    setFacts((f) => ({ ...f, [editing]: draft.trim() }));
    setEditing(null);
  };

  const fact = (key: FactKey) =>
    editing === key ? (
      <div className="hc-c10-edit" key={key}>
        <Input
          label={labels[key]}
          value={draft}
          onValueChange={setDraft}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveEdit();
            if (e.key === 'Escape') cancelEdit();
          }}
          autoFocus
        />
        <div className="hc-c10-edit__actions">
          <Button variant="secondary" size="small" onClick={cancelEdit}>
            Cancel
          </Button>
          <Button size="small" onClick={saveEdit} disabled={!draft.trim() || draft.trim() === facts[key]}>
            Save
          </Button>
        </div>
      </div>
    ) : (
      <DetailRow key={key} label={labels[key]} value={facts[key]} onAction={() => startEdit(key)} />
    );

  /** First block of "what I know", replaced by the Empty / Loading / Error frame (later rows are hidden in those frames) */
  const stateFrame: ReactNode =
    screenState === 'loading' ? (
      <>
        <SkeletonCard label="Loading memory" />
        <SkeletonCard label="Loading memory" />
        <SkeletonCard label="Loading memory" />
      </>
    ) : screenState === 'empty' ? (
      <StateBlock
        title="No agent activity yet"
        body="What your agent does and remembers about your home shows up here."
        actionLabel="Ask the agent"
        onAction={() => flow.go('C09')}
      />
    ) : screenState === 'error' ? (
      <StateBlock
        kind="error"
        title="Couldn’t load agent activity"
        body="Check your connection and try again. Nothing was lost."
        actionLabel="Try again"
        onAction={() => setScreenState('default')}
      />
    ) : null;

  // Review change: a View job button on the right of each entry about a job
  const logRows = GROUPS.filter((g) => log.some((a) => a.group === g.name)).map((g) => (
    <section key={g.name} className="hc-c10-log-group" aria-labelledby={`hc-c10-log-${g.tone}`}>
      <h3 id={`hc-c10-log-${g.tone}`} className="hc-c10-log-group__title">
        {g.name}
      </h3>
      {log
        .filter((a) => a.group === g.name)
        .map((a) => (
          <div key={a.title} className="hc-c10-log-row">
            <ListRow title={a.title} description={a.meta} icon={g.icon} className={`hc-c10-log-row__item hc-c10-log-row__item--${g.tone}`} />
            {a.job && (
              <Button variant="secondary" size="small" className="hc-c10-log-row__job" onClick={() => flow.go(a.job!)}>
                View job
              </Button>
            )}
          </div>
        ))}
    </section>
  ));
  // Review change: Undo last change and Flag as wrong are gone from the log (wanted on the job itself instead)

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Memory and activity log' }} tab="agent">
        <div className="hc-c10-chips" role="group" aria-label="Show">
          {(['Memory', 'Activity'] as Tab[]).map((t) => (
            <button key={t} type="button" className="hc-c10-chip" aria-pressed={tab === t} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
        {tab === 'Memory' ? (
          <>
            <h2 className="hc-large-bold">Home</h2>
            {stateFrame ?? (
              <>
                {fact('year')}
                {fact('size')}
                <h2 className="hc-large-bold">Preferences</h2>
                {fact('quotes')}
                <h2 className="hc-large-bold">Pros</h2>
                {fact('hvac')}
              </>
            )}
          </>
        ) : (
          <>
            <div>{logRows}</div>
          </>
        )}
      </MobileShell>
    );
  }

  return (
    <WebShell nav="agent">
      <div className="hc-c10-web">
        <header className="hc-c10-web__head">
          <h1 className="hc-h2">Memory and activity log</h1>
          <p className="hc-medium hc-muted">Everything your agent knows about {currentHome.address}, and everything it did for you.</p>
        </header>
        <div className="hc-c10-web__cols">
          <section className="hc-c10-card hc-c10-web__know">
            <h2 className="hc-large-bold">What I know</h2>
            {stateFrame ?? (Object.keys(labels) as FactKey[]).map(fact)}
          </section>
          <section className="hc-c10-card hc-c10-web__log">
            <h2 className="hc-large-bold">Activity</h2>
            {logRows}
          </section>
        </div>
      </div>
    </WebShell>
  );
}
