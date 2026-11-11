import { useState, type ReactNode } from 'react';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
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

const activity = [
  { title: 'Emailed 5 HVAC pros for quotes', meta: 'Today 9:14 AM · Email · View messages' },
  { title: 'Booking approved: $189 AC tune-up', meta: 'Yesterday · Zephyrline HVAC · You approved' },
  { title: 'Called Fernhollow Pool Care to confirm a visit', meta: 'Nov 3 · Call, 2 min · Transcript' },
  { title: 'Changed HVAC quote count from 5 to 7', meta: 'Nov 2 · You asked in chat · Undo available' },
];

type Tab = 'Memory' | 'Activity';

/** C10 Agent memory and activity log — Figma mobile 216:15466, web 216:17367 (J1 Home record step 5). States 110:3844… on B2. */
export default function AgentMemory(_: ScreenProps) {
  const { device, screenState, setScreenState } = usePrototype();
  const flow = useFlow();
  const [tab, setTab] = useState<Tab>('Memory');
  const [facts, setFacts] = useState(initialFacts);
  const [editing, setEditing] = useState<FactKey | null>(null);
  const [log, setLog] = useState(activity);

  const fact = (key: FactKey) =>
    editing === key ? (
      <div className="hc-c10-edit" key={key}>
        <Input
          label={labels[key]}
          value={facts[key]}
          onValueChange={(v) => setFacts((f) => ({ ...f, [key]: v }))}
          onBlur={() => setEditing(null)}
          onKeyDown={(e) => e.key === 'Enter' && setEditing(null)}
          autoFocus
        />
      </div>
    ) : (
      <DetailRow key={key} label={labels[key]} value={facts[key]} onAction={() => setEditing(key)} />
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

  const logRows = log.map((a) => <ListRow key={a.title} title={a.title} description={a.meta} />);
  const logActions = (
    <div className="hc-c10-actions">
      <Button variant="secondary" disabled={log.length < activity.length} onClick={() => setLog((l) => l.slice(0, -1))}>
        Undo last change
      </Button>
      <Button variant="secondary" onClick={() => flow.go('C09')}>
        Flag as wrong
      </Button>
    </div>
  );

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Memory and log' }} tab="agent">
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
            {logActions}
          </>
        )}
      </MobileShell>
    );
  }

  return (
    <WebShell nav="agent">
      <div className="hc-c10-web">
        <header className="hc-c10-web__head">
          <h1 className="hc-h2">Memory and log</h1>
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
            {logActions}
          </section>
        </div>
      </div>
    </WebShell>
  );
}
