import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { ListRow } from '../../../components/ListRow/ListRow';
import { currentHome } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C64-room-detail.css';

const SIZE = '12 × 14 ft';

const FLOOR = { label: 'Floor', value: 'Porcelain tile 12×24 · 2019' };
const WALLS = { label: 'Walls', value: 'Swiss Coffee · eggshell' };
const COUNTERS = { label: 'Countertops', value: 'Quartz · 2019' };
const CABINETS = { label: 'Cabinets', value: 'Shaker, painted' };

const ITEMS = [
  { title: 'Dishwasher', description: '2021 · warranty to 2026' },
  { title: 'Refrigerator', description: '2019' },
  { title: 'Range hood', description: '2019' },
];

function KeyValues({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl className="hc-c64-kv">
      {rows.map((r) => (
        <div key={r.label} className="hc-c64-kv__row">
          <dt className="hc-medium hc-muted">{r.label}</dt>
          <dd className="hc-medium-semibold">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** C64 Room detail — Figma mobile 215:12712 (batch 211:38896), web 215:15651 (batch 211:38897). J1 Onboarding step 14. */
export default function RoomDetail(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Kitchen' }} bottom={<BottomActions primaryLabel="Add contents" onPrimary={flow.goNext} />}>
        <div className="hc-c64-content">
          <KeyValues rows={[{ label: 'Size', value: SIZE }, FLOOR, WALLS, COUNTERS, CABINETS]} />
          <h2 className="hc-medium-semibold">Items in this room</h2>
          {ITEMS.map((i) => (
            <ListRow key={i.title} title={i.title} description={i.description} />
          ))}
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="home">
      <div className="hc-c64-web">
        <header className="hc-c64-web__head">
          <div>
            <h1 className="hc-h2">Kitchen</h1>
            <p className="hc-medium hc-muted">
              {currentHome.address} · {SIZE}
            </p>
          </div>
          <Button onClick={flow.goNext}>Add contents</Button>
        </header>
        <div className="hc-c64-web__cols">
          <section className="hc-c64-card">
            <h2 className="hc-large-bold">Materials</h2>
            <KeyValues rows={[FLOOR, WALLS, { label: 'Ceiling', value: 'Flat white' }, COUNTERS, CABINETS, { label: 'Windows', value: 'Dual-pane vinyl' }]} />
            <p className="hc-small hc-muted">Paint codes are saved for touch-ups and quotes.</p>
          </section>
          <section className="hc-c64-card">
            <h2 className="hc-large-bold">Items and contents</h2>
            {[...ITEMS, { title: 'Dining table (contents)', description: 'For insurance inventory' }].map((i) => (
              <ListRow key={i.title} title={i.title} description={i.description} />
            ))}
          </section>
        </div>
      </div>
    </WebShell>
  );
}
