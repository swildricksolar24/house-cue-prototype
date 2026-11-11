import { Button } from '../../../components/Button/Button';
import { ListRow } from '../../../components/ListRow/ListRow';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';
import { StateBlock } from '../../../components/StateBlock/StateBlock';
import { currentHome } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C63-rooms-materials.css';

type Room = { id: string; name: string; floor: string; walls: string; items: number; summary: string };

const ROOMS: Room[] = [
  { id: 'kitchen', name: 'Kitchen', floor: 'Porcelain tile', walls: 'Swiss Coffee', items: 6, summary: 'Porcelain tile · quartz counters · 6 items' },
  { id: 'living', name: 'Living room', floor: 'Oak', walls: 'Swiss Coffee', items: 2, summary: 'Oak floor · 2 items' },
  { id: 'primary', name: 'Primary bedroom', floor: 'Carpet', walls: 'Pale gray', items: 1, summary: 'Carpet · 1 item' },
  { id: 'hall-bath', name: 'Hall bath', floor: 'Ceramic tile', walls: 'White semi-gloss', items: 3, summary: 'Tile · 3 items' },
  { id: 'garage', name: 'Garage', floor: 'Concrete', walls: '—', items: 4, summary: 'Concrete · 4 items' },
];

/**
 * C63 Rooms and materials (list) — Figma mobile 215:12617 (batch 211:38894), web 215:15484 (batch 211:38895).
 * States: Empty 111:13329, Loading 111:13413, Error 111:13507 (+ web 111:13591/13697/13813). J1 Onboarding step 13.
 * Tapping a room opens C64 Room detail (next step).
 */
export default function RoomsMaterials(_: ScreenProps) {
  const { device, screenState } = usePrototype();
  const flow = useFlow();
  const openRoom = flow.goNext;

  const state =
    screenState === 'empty' ? (
      <StateBlock title="No rooms yet" body="Add rooms to track materials and finishes." actionLabel="Add a room" onAction={openRoom} />
    ) : screenState === 'error' ? (
      <StateBlock kind="error" title="Couldn’t load rooms" body="Check your connection and try again. Nothing was lost." actionLabel="Try again" onAction={() => {}} />
    ) : screenState === 'loading' ? (
      <div className="hc-c63-stack">
        <SkeletonCard label="Loading rooms" />
        <SkeletonCard label="Loading rooms" />
        <SkeletonCard label="Loading rooms" />
      </div>
    ) : null;

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Rooms' }} tab="home">
        <div className="hc-c63-list">
          {state ??
            ROOMS.map((r) => (
              <button key={r.id} type="button" className="hc-c63-row" onClick={openRoom}>
                <ListRow title={r.name} description={r.summary} />
              </button>
            ))}
          <div className="hc-c63-actions">
            <Button variant="secondary" onClick={openRoom}>
              Add a room
            </Button>
          </div>
          {!state && (
            <button type="button" className="hc-c63-link">
              Record a video walkthrough
            </button>
          )}
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="home">
      <div className="hc-c63-web">
        <header className="hc-c63-web__head">
          <div>
            <h1 className="hc-h2">Rooms and materials</h1>
            <p className="hc-medium hc-muted">{currentHome.address} · 3 bed, 2 bath · suggested from your home’s size</p>
          </div>
          <Button variant="secondary">Video walkthrough</Button>
          <Button onClick={openRoom}>Add a room</Button>
        </header>
        <div className="hc-c63-table" role="table" aria-label="Rooms">
          <div className="hc-c63-table__head" role="row">
            <span role="columnheader">Room</span>
            <span role="columnheader">Floor</span>
            <span role="columnheader">Walls</span>
            <span role="columnheader">Items</span>
          </div>
          {state ??
            ROOMS.map((r) => (
              <button key={r.id} type="button" className="hc-c63-table__row" role="row" onClick={openRoom}>
                <span role="cell" className="hc-medium-semibold">
                  {r.name}
                </span>
                <span role="cell">{r.floor}</span>
                <span role="cell">{r.walls}</span>
                <span role="cell">{r.items}</span>
              </button>
            ))}
        </div>
      </div>
    </WebShell>
  );
}
