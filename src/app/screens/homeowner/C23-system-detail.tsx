import { useState } from 'react';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { ImagePlaceholder } from '../../../components/ImagePlaceholder/ImagePlaceholder';
import { Input } from '../../../components/Input/Input';
import { ListRow } from '../../../components/ListRow/ListRow';
import { TaskRow } from '../../../components/TaskRow/TaskRow';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C23-system-detail.css';

type Tab = 'History' | 'Warranty' | 'Documents' | 'Tasks' | 'Live data';

const history = [
  { title: 'AC tune-up', mobile: 'Mar 12, 2025 · Zephyrline HVAC · $149', web: 'Mar 12, 2025 · Zephyrline HVAC · $149 · Job' },
  { title: 'Filter replaced (DIY)', mobile: 'Jan 8, 2025 · photo added', web: 'Jan 8, 2025 · photo added · Task' },
  { title: 'Photo check-up: all good', web: 'Nov 2, 2024 · Check-up' },
  { title: 'Refrigerant top-up', web: 'Jul 20, 2023 · Zephyrline HVAC · $260 · Job' },
];

const upcoming = [
  { title: 'Replace HVAC filter', meta: 'Due Nov 28', tag: 'DIY' },
  { title: 'Clean condenser coils', meta: 'Due Dec 10', tag: 'Pro' },
];

/** C23 System detail (AC / heat pump) — Figma mobile 216:15205, web 216:16933 (J1 Home record step 3). No state frames on B2. */
export default function SystemDetail(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [tab, setTab] = useState<Tab>('History');
  const [editing, setEditing] = useState<string | null>(null);
  const [facts, setFacts] = useState({
    model: 'Trane XR14',
    age: '14 years · expected life 15–20',
    serial: 'XR14-•••-2291',
    installed: '2011 · 14 years old',
    life: '15–20 years (Care Library)',
    location: 'Side yard',
  });
  const [webEdit, setWebEdit] = useState(false);

  const tabs: Tab[] = device === 'mobile' ? ['History', 'Warranty', 'Documents', 'Tasks'] : ['History', 'Warranty', 'Documents', 'Tasks', 'Live data'];

  // History and Tasks switch in place; the other tabs open their own screens.
  const pick = (t: Tab) => {
    if (t === 'Warranty') flow.goNext(); // C25 Warranties and claims is the next J1 step
    else if (t === 'Documents') flow.go('C24');
    else if (t === 'Live data') flow.go('C46');
    else setTab(t);
  };

  const chips = (
    <div className="hc-c23-chips" role="group" aria-label="Sections">
      {tabs.map((t) => (
        <button key={t} type="button" className="hc-c23-chip" aria-pressed={tab === t} onClick={() => pick(t)}>
          {t}
        </button>
      ))}
    </div>
  );

  const historyRows = history
    .filter((h) => device === 'web' || h.mobile)
    .map((h) => <ListRow key={h.title} title={h.title} description={device === 'mobile' ? h.mobile : h.web} />);

  const taskRows = upcoming.map((t) => <TaskRow key={t.title} title={t.title} meta={t.meta} tag={t.tag} onClick={() => flow.go('C12')} />);

  const field = (key: keyof typeof facts, label: string) =>
    editing === key ? (
      <div className="hc-c23-edit" key={key}>
        <Input
          label={label}
          value={facts[key]}
          onValueChange={(v) => setFacts((f) => ({ ...f, [key]: v }))}
          onBlur={() => setEditing(null)}
          onKeyDown={(e) => e.key === 'Enter' && setEditing(null)}
          autoFocus
        />
      </div>
    ) : (
      <DetailRow key={key} label={label} value={facts[key]} onAction={() => setEditing(key)} />
    );

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'AC / heat pump' }} tab="home">
        <ImagePlaceholder label="Photo of the unit" height={120} />
        {field('model', 'Model')}
        {field('age', 'Age')}
        {chips}
        {tab === 'History' ? historyRows : <div>{taskRows}</div>}
      </MobileShell>
    );
  }

  const webField = (key: keyof typeof facts, label: string) =>
    webEdit ? (
      <div className="hc-c23-edit" key={key}>
        <Input label={label} value={facts[key]} onValueChange={(v) => setFacts((f) => ({ ...f, [key]: v }))} />
      </div>
    ) : (
      <DetailRow key={key} label={label} value={facts[key]} />
    );

  return (
    <WebShell nav="home">
      <div className="hc-c23-web">
        <button type="button" className="hc-c23-back" onClick={() => flow.go('C08')}>
          ‹ Home
        </button>
        <div className="hc-c23-web__head">
          <h1 className="hc-h2">AC / heat pump</h1>
          <Button variant="secondary" onClick={() => setWebEdit((e) => !e)}>
            {webEdit ? 'Done' : 'Edit'}
          </Button>
          <Button onClick={() => flow.go('C09')}>Ask the agent</Button>
        </div>
        <div className="hc-c23-web__cols">
          <section className="hc-c23-card hc-c23-web__facts">
            <ImagePlaceholder label="Photo of the unit" height={180} />
            {webField('model', 'Brand and model')}
            {webField('serial', 'Serial')}
            {webField('installed', 'Installed')}
            {webField('life', 'Expected life')}
            {webField('location', 'Location')}
            <DetailRow label="Warranty" value="Expired Mar 2021" />
          </section>
          <div className="hc-c23-web__main">
            {chips}
            {tab === 'History' && (
              <section className="hc-c23-card">
                <h2 className="hc-large-bold">History</h2>
                {historyRows}
              </section>
            )}
            <section className="hc-c23-card">
              <h2 className="hc-large-bold">Upcoming tasks</h2>
              {taskRows}
            </section>
          </div>
        </div>
      </div>
    </WebShell>
  );
}
