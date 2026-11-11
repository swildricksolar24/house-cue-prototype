import { useState } from 'react';
import { Button } from '../../../components/Button/Button';
import { ImagePlaceholder } from '../../../components/ImagePlaceholder/ImagePlaceholder';
import { Input } from '../../../components/Input/Input';
import { ListRow } from '../../../components/ListRow/ListRow';
import { MetricRow } from '../../../components/MetricRow/MetricRow';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C65-shutoff-map.css';

type Shutoff = { id: string; title: string; how: string };

const WATER: Shutoff = { id: 'water', title: 'Water main · Garage, north wall', how: 'Turn clockwise · photo' };
const GAS: Shutoff = { id: 'gas', title: 'Gas meter and valve · Side yard', how: 'Quarter turn with a wrench' };
const BREAKER: Shutoff = { id: 'breaker', title: 'Breaker panel · Laundry', how: '18 circuits labelled' };
const SINK: Shutoff = { id: 'sink', title: 'Kitchen sink · Kitchen', how: 'Two valves under the sink' };

/** Mobile lists the breaker panel as a row; web gives it its own circuits card and lists the kitchen sink instead. */
const MOBILE_SHUTOFFS = [WATER, GAS, BREAKER];
const WEB_SHUTOFFS = [WATER, GAS, SINK];

type Circuit = { id: string; name: string; amps: string };

const CIRCUITS: Circuit[] = [
  { id: '1', name: 'Kitchen counters', amps: '20 A' },
  { id: '2', name: 'AC condenser', amps: '40 A' },
  { id: '3', name: 'Water heater', amps: '30 A' },
];

/**
 * C65 Shutoff map — Figma mobile 216:15844 (batch 211:54168), web 216:17919 (batch 211:54169).
 * J1 Home record & maintenance step 9. No Empty/Loading/Error frames are drawn for this screen.
 * "Add a shutoff" is the primary CTA (next step); "Edit circuits" toggles inline editing of the circuit labels.
 */
export default function ShutoffMap(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [circuits, setCircuits] = useState(CIRCUITS);
  const [editing, setEditing] = useState(false);

  const map = <ImagePlaceholder label="Floor plan with shutoff pins" />;
  const rows = (items: Shutoff[]) => items.map((s) => <ListRow key={s.id} title={s.title} description={s.how} />);

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Shutoff map' }} tab="home" background="page">
        <div className="hc-c65-content">
          {map}
          {rows(MOBILE_SHUTOFFS)}
          <div className="hc-c65-pills">
            <StatusPill label="Available offline" tone="success" />
          </div>
          <Button fullWidth onClick={flow.goNext}>
            Add a shutoff
          </Button>
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="home">
      <div className="hc-c65-web">
        <header className="hc-c65-web__head">
          <h1 className="hc-h2">Shutoff map</h1>
          <p className="hc-medium hc-muted">Water, gas and power shutoffs, pinned to rooms · available offline</p>
        </header>
        <div className="hc-c65-web__cols">
          <div className="hc-c65-web__main">
            {map}
            <section className="hc-c65-card">
              <h2 className="hc-large-bold">Shutoffs</h2>
              {rows(WEB_SHUTOFFS)}
            </section>
          </div>
          <aside className="hc-c65-web__side">
            <section className="hc-c65-card">
              <h2 className="hc-large-bold">Breaker panel · Laundry</h2>
              {circuits.map((c) =>
                editing ? (
                  <div key={c.id} className="hc-c65-circuit-edit">
                    <Input
                      label={`Circuit ${c.id}`}
                      value={c.name}
                      onValueChange={(name) => setCircuits((cs) => cs.map((x) => (x.id === c.id ? { ...x, name } : x)))}
                    />
                    <span className="hc-medium-semibold">{c.amps}</span>
                  </div>
                ) : (
                  <MetricRow key={c.id} label={`${c.id} · ${c.name}`} value={c.amps} />
                ),
              )}
            </section>
            <div className="hc-c65-actions">
              <Button onClick={flow.goNext}>Add a shutoff</Button>
              <Button variant="secondary" aria-pressed={editing} onClick={() => setEditing((e) => !e)}>
                {editing ? 'Save' : 'Edit circuits'}
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </WebShell>
  );
}
