import type { ReactNode } from 'react';

/**
 * Review change: an icon for each Plan task (C11), drawn for the task's appliance instead of the generic "tasks" icon.
 * The HC icon set has none of these, so they're simple 24px outline drawings (currentColor), in the same style as the
 * room and device icons (_c63-room-icon.tsx, _c46-device-icon.tsx). Shown in TaskRow's tile via `customIcon`.
 * Not a screen: the registry only picks up files named <CODE>-<slug>.tsx.
 */
export type TaskIconKind = 'dryer' | 'hvac-filter' | 'ac-unit' | 'pool' | 'outlet' | 'water-heater' | 'roof';

const PATHS: Record<TaskIconKind, ReactNode> = {
  // Dryer: front-loading drum with controls on top
  dryer: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M5 7h14M8 5h.01M11 5h.01" />
      <circle cx="12" cy="14" r="4" />
    </>
  ),
  // Air filter: a frame with pleats
  'hvac-filter': (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 4v16M12 4v16M16 4v16" />
    </>
  ),
  // AC condenser: a box with a fan
  'ac-unit': (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 7v10M7 12h10" />
    </>
  ),
  // Pool: ladder over water
  pool: (
    <>
      <path d="M8 14V5.5a1.5 1.5 0 0 1 3 0M14 14V5.5a1.5 1.5 0 0 1 3 0M8 9h6" />
      <path d="M3 17c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1M3 21c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1" />
    </>
  ),
  // Outlet: a wall plate with two slots and a ground
  outlet: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M10 8v2.5M14 8v2.5M12 15v1" />
    </>
  ),
  // Water heater: a tank with a flame
  'water-heater': (
    <>
      <rect x="6" y="3" width="12" height="16" rx="3" />
      <path d="M9 21h6M12 8.5c1.2 1.4 2 2.4 2 3.5a2 2 0 0 1-4 0c0-1.1.8-2.1 2-3.5Z" />
    </>
  ),
  // Roof: a roof line over the house
  roof: (
    <>
      <path d="M2 12.5 12 4l10 8.5" />
      <path d="M5 10.5V20h14v-9.5M10 20v-5h4v5" />
    </>
  ),
};

export function TaskIcon({ kind }: { kind: TaskIconKind }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {PATHS[kind]}
    </svg>
  );
}
