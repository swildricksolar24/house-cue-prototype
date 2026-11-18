import { useState } from 'react';
import { Button } from '../../../components/Button/Button';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';
import { StateBlock } from '../../../components/StateBlock/StateBlock';
import { currentHome } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { FormDialog } from '../../shells/EditDialog';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import { RoomIcon } from './_c63-room-icon';
import './C63-rooms-materials.css';

// Review change: no Walls (column and dialog field removed)
type Room = { id: string; name: string; floor: string; items: number; summary: string };

const ROOMS: Room[] = [
  { id: 'kitchen', name: 'Kitchen', floor: 'Porcelain tile', items: 6, summary: 'Porcelain tile · quartz counters · 6 items' },
  { id: 'living', name: 'Living room', floor: 'Oak', items: 2, summary: 'Oak floor · 2 items' },
  { id: 'primary', name: 'Primary bedroom', floor: 'Carpet', items: 1, summary: 'Carpet · 1 item' },
  { id: 'hall-bath', name: 'Hall bath', floor: 'Ceramic tile', items: 3, summary: 'Tile · 3 items' },
  { id: 'garage', name: 'Garage', floor: 'Concrete', items: 4, summary: 'Concrete · 4 items' },
];

/** Floor choices in the Add a room dialog (review change) */
const FLOORS = ['Carpet', 'Ceramic tile', 'Concrete', 'Hardwood', 'Laminate', 'Oak', 'Porcelain tile', 'Vinyl plank', 'Other'];

/**
 * C63 Rooms and materials (list) — Figma mobile 215:12617 (batch 211:38894), web 215:15484 (batch 211:38895).
 * States: Empty 111:13329, Loading 111:13413, Error 111:13507 (+ web 111:13591/13697/13813). J1 Onboarding step 13.
 * Tapping a room opens C64 Room detail (next step).
 * Review change: Add a room opens a dialog (FormDialog: room name, floor) instead of going to C64; the new room is added
 * to the list with 0 items.
 * Review change: each room has an Edit button at the right of its row (web table and mobile list) that opens the same
 * dialog filled in ("Edit <room>"). Rows aren't one big button any more: the room name opens C64.
 * Review change: each room has an icon on the left (RoomIcon, picked from its name), and Walls is removed everywhere.
 */
export default function RoomsMaterials(_: ScreenProps) {
  const { device, screenState } = usePrototype();
  const flow = useFlow();
  const openRoom = flow.goNext;
  const [rooms, setRooms] = useState(ROOMS);
  const [adding, setAdding] = useState(false);
  const addRoom = () => setAdding(true);
  const [editing, setEditing] = useState<Room | null>(null);
  const roomFields = [
    { key: 'name', label: 'Room name', field: { kind: 'text' as const, placeholder: 'e.g. Guest bedroom' } },
    { key: 'floor', label: 'Floor', field: { kind: 'select' as const, options: FLOORS } },
  ];
  const editDialog = editing && (
    <FormDialog
      title={`Edit ${editing.name}`}
      description="Change the room's name or floor. Its items stay with it."
      fields={roomFields}
      values={{ name: editing.name, floor: FLOORS.includes(editing.floor) ? editing.floor : 'Other' }}
      onSave={(v) => {
        setRooms((list) =>
          list.map((r) =>
            r.id === editing.id
              ? {
                  ...r,
                  name: v.name,
                  floor: v.floor,
                  // Keep the fuller description unless the floor changed
                  summary: v.floor === r.floor ? r.summary : `${v.floor} · ${r.items} ${r.items === 1 ? 'item' : 'items'}`,
                }
              : r,
          ),
        );
        setEditing(null);
      }}
      onCancel={() => setEditing(null)}
    />
  );
  const editButton = (r: Room) => (
    <Button variant="secondary" size="tiny" className="hc-c63-edit" onClick={() => setEditing(r)} aria-label={`Edit ${r.name}`}>
      Edit
    </Button>
  );
  const addDialog = adding && (
    <FormDialog
      title="Add a room"
      description="Track its materials and finishes. You can add items to it later."
      fields={roomFields}
      values={{ name: '', floor: '' }}
      submitLabel="Add room"
      onSave={(v) => {
        setRooms((list) => [
          ...list,
          { id: `room-${list.length + 1}`, name: v.name, floor: v.floor, items: 0, summary: `${v.floor} · 0 items` },
        ]);
        setAdding(false);
      }}
      onCancel={() => setAdding(false)}
    />
  );

  const state =
    screenState === 'empty' ? (
      <StateBlock title="No rooms yet" body="Add rooms to track materials and finishes." actionLabel="Add a room" onAction={addRoom} />
    ) : screenState === 'error' ? (
      <StateBlock kind="error" title="Couldn’t load rooms" body="Check your connection and try again. Nothing was lost." actionLabel="Try again" />
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
            rooms.map((r) => (
              <div key={r.id} className="hc-c63-row-wrap">
                <button type="button" className="hc-c63-row" onClick={openRoom}>
                  <RoomIcon name={r.name} />
                  <span className="hc-c63-row__text">
                    <span className="hc-medium-semibold">{r.name}</span>
                    <span className="hc-small hc-muted">{r.summary}</span>
                  </span>
                </button>
                {editButton(r)}
              </div>
            ))}
          <div className="hc-c63-actions">
            <Button variant="secondary" onClick={addRoom}>
              Add a room
            </Button>
          </div>
          {!state && (
            <button type="button" className="hc-c63-link" disabled>
              Record a video walkthrough
            </button>
          )}
        </div>
        {addDialog}
        {editDialog}
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
          <Button onClick={addRoom}>Add a room</Button>
        </header>
        <div className="hc-c63-table" role="table" aria-label="Rooms">
          <div className="hc-c63-table__head" role="row">
            <span role="columnheader">Room</span>
            <span role="columnheader">Floor</span>
            {/* Review change: "Items" → "Connected items" */}
            <span role="columnheader">Connected items</span>
            <span role="columnheader" className="hc-c63-sr">
              Actions
            </span>
          </div>
          {state ??
            rooms.map((r) => (
              <div key={r.id} className="hc-c63-table__row" role="row">
                <span role="cell" className="hc-c63-table__room">
                  <RoomIcon name={r.name} />
                  <button type="button" className="hc-c63-table__name" onClick={openRoom}>
                    {r.name}
                  </button>
                </span>
                <span role="cell">{r.floor}</span>
                <span role="cell">{r.items}</span>
                <span role="cell" className="hc-c63-table__edit">
                  {editButton(r)}
                </span>
              </div>
            ))}
        </div>
      </div>
      {addDialog}
      {editDialog}
    </WebShell>
  );
}
