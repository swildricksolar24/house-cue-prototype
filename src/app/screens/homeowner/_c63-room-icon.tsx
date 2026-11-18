import type { ReactNode } from 'react';
import { Icon } from '../../../components/Icon/Icon';
import './_c63-room-icon.css';

/**
 * Review change: an icon for each room on C63 Rooms and materials. The HC icon set has no room icons, so these are
 * simple 24px outline drawings (2px stroke, currentColor) picked from the room's name; anything else gets the house.
 * Not a screen: the registry only picks up files named <CODE>-<slug>.tsx.
 */
const ROOM_ICONS: { match: RegExp; label: string; paths: ReactNode }[] = [
  {
    match: /kitchen/,
    label: 'Kitchen',
    paths: (
      <>
        <path d="M4 11h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-3Z" />
        <path d="M2 11h2M20 11h2M9.5 4.5c-.8.8.8 1.7 0 2.5M14.5 4.5c-.8.8.8 1.7 0 2.5" />
      </>
    ),
  },
  {
    match: /living|family|den|lounge/,
    label: 'Living room',
    paths: (
      <>
        <path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3" />
        <path d="M3 13a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v4H3v-4Z" />
        <path d="M5 17v2M19 17v2" />
      </>
    ),
  },
  {
    match: /bed/,
    label: 'Bedroom',
    paths: (
      <>
        <path d="M3 6v13M3 15h18v4M21 15v-3a3 3 0 0 0-3-3h-7v6" />
        <circle cx="7" cy="12" r="1.75" />
      </>
    ),
  },
  {
    match: /bath|toilet|powder|restroom/,
    label: 'Bathroom',
    paths: (
      <>
        <path d="M3 12h18v1.5a5.5 5.5 0 0 1-5.5 5.5h-7A5.5 5.5 0 0 1 3 13.5V12Z" />
        <path d="M6 12V6.5a2.5 2.5 0 0 1 5 0M7 19l-1 2M17 19l1 2" />
      </>
    ),
  },
  {
    match: /garage|carport/,
    label: 'Garage',
    paths: (
      <>
        <path d="M3 20V9.5L12 4l9 5.5V20" />
        <path d="M7 20v-8h10v8M7 15h10M7 18h10" />
      </>
    ),
  },
  {
    match: /office|study/,
    label: 'Office',
    paths: (
      <>
        <rect x="4" y="5" width="16" height="10" rx="1.5" />
        <path d="M9 19h6M12 15v4" />
      </>
    ),
  },
  {
    match: /laundry|utility/,
    label: 'Laundry',
    paths: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <circle cx="12" cy="13" r="4" />
        <path d="M8 6.5h2" />
      </>
    ),
  },
  {
    match: /dining/,
    label: 'Dining room',
    paths: <path d="M7 3v18M5 3v5a2 2 0 0 0 4 0V3M17 21V3c-2 2-2.5 6.5 0 8" />,
  },
];

/** The room's icon in a 32px tinted tile (decorative: the room name sits next to it) */
export function RoomIcon({ name }: { name: string }) {
  const hit = ROOM_ICONS.find((r) => r.match.test(name.toLowerCase()));
  return (
    <span className="hc-c63-room-icon" aria-hidden>
      {hit ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {hit.paths}
        </svg>
      ) : (
        <Icon name="home" size={20} />
      )}
    </span>
  );
}
