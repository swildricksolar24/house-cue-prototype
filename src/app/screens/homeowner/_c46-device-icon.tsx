import type { ReactNode } from 'react';
import { Icon } from '../../../components/Icon/Icon';
import './_c46-device-icon.css';

/**
 * Review change: an icon for each device in C46 Connected devices' "Devices by room". The HC icon set has no device
 * icons, so these are simple 24px outline drawings (currentColor) picked from the device's name, in the same style as
 * the room icons (_c63-room-icon.tsx); anything else gets the HC "devices" icon.
 * Not a screen: the registry only picks up files named <CODE>-<slug>.tsx.
 */
const DROP = 'M12 3.5c3 3.8 5.5 6.9 5.5 10a5.5 5.5 0 0 1-11 0c0-3.1 2.5-6.2 5.5-10Z';

const DEVICE_ICONS: { match: RegExp; paths: ReactNode }[] = [
  {
    match: /thermostat/,
    paths: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l2.5 2.5" />
      </>
    ),
  },
  {
    match: /smoke|co alarm/,
    paths: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="M8 8.5h.01M16 8.5h.01M8 15.5h.01M16 15.5h.01" />
      </>
    ),
  },
  {
    match: /humidity/,
    paths: (
      <>
        <path d={DROP} />
        <path d="M10 16l4-4M10 12h.01M14 16h.01" />
      </>
    ),
  },
  { match: /leak/, paths: <path d={DROP} /> },
  { match: /plug/, paths: <path d="M9 3v4M15 3v4M7 7h10v3a5 5 0 0 1-10 0V7ZM12 15v6" /> },
  {
    match: /light|lamp/,
    paths: <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z" />,
  },
  {
    match: /garage door/,
    paths: (
      <>
        <path d="M3 20V9.5L12 4l9 5.5V20" />
        <path d="M7 20v-8h10v8M7 15h10M7 18h10" />
      </>
    ),
  },
  {
    match: /door/,
    paths: (
      <>
        <path d="M6 21V3h9v18M4 21h13" />
        <path d="M12.5 12h.01" />
        <rect x="17.5" y="9" width="2.5" height="6" rx="1" />
      </>
    ),
  },
  {
    match: /motion|floodlight/,
    paths: (
      <>
        <circle cx="12" cy="15" r="2" />
        <path d="M8.5 11.5a5 5 0 0 1 7 0M6 9a8.5 8.5 0 0 1 12 0" />
      </>
    ),
  },
  {
    match: /temperature/,
    paths: (
      <>
        <path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0Z" />
        <path d="M12 9v7" />
      </>
    ),
  },
];

/** The device's icon in a 32px tinted tile (decorative: the device name sits next to it) */
export function DeviceIcon({ name }: { name: string }) {
  const hit = DEVICE_ICONS.find((d) => d.match.test(name.toLowerCase()));
  return (
    <span className="hc-c46-device-icon" aria-hidden>
      {hit ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {hit.paths}
        </svg>
      ) : (
        <Icon name="devices" size={20} />
      )}
    </span>
  );
}
