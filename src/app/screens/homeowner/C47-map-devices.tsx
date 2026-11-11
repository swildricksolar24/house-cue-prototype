import { useState } from 'react';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C47-map-devices.css';

type Link = { id: string; device: string; room: string; mobileLabel: string; item: string | null; ignored?: boolean };

const DEVICES: Link[] = [
  { id: 'nest', device: 'Nest thermostat', room: 'Hallway', mobileLabel: 'Nest thermostat', item: 'HVAC system' },
  { id: 'leak', device: 'Leak sensor', room: 'Garage', mobileLabel: 'Leak sensor · garage', item: 'Water heater' },
  { id: 'smoke', device: 'Smoke alarm', room: 'Hallway', mobileLabel: 'Smoke alarm · hallway', item: null },
  { id: 'doorbell', device: 'Doorbell camera', room: 'Front door', mobileLabel: 'Doorbell camera', item: null, ignored: true },
];

/** Item a device can be linked to when the user taps Link (prototype stand-in for the picker) */
const SUGGESTED: Record<string, string> = { smoke: 'Smoke alarms', nest: 'HVAC system', leak: 'Water heater', doorbell: 'Front door' };

/** "Water heater" → "water heater" mid-sentence; acronyms (HVAC) stay as they are */
const inSentence = (item: string) => (/^[A-Z]{2,}/.test(item) ? item : item.charAt(0).toLowerCase() + item.slice(1));

/**
 * C47 Connected devices, map devices — Figma mobile 215:13067 (batch 211:38866), web 215:16189 (batch 211:38867).
 * J1 Onboarding step 17. Link / Undo toggle locally; Save goes to the next step.
 */
export default function MapDevices(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [links, setLinks] = useState(DEVICES);

  const toggle = (id: string) =>
    setLinks((ls) =>
      ls.map((l) => {
        if (l.id !== id) return l;
        if (l.ignored) return { ...l, ignored: false };
        if (!l.item) return { ...l, item: SUGGESTED[l.id] };
        return l;
      }),
    );

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Link your devices' }} bottom={<BottomActions primaryLabel="Save" onPrimary={flow.goNext} />}>
        <div className="hc-c47-content">
          <h2 className="hc-medium-semibold">Found 4 devices</h2>
          <div>
            {links.map((l) => (
              <DetailRow
                key={l.id}
                label={l.mobileLabel}
                value={l.ignored ? 'Ignored' : l.item ? `Linked to ${inSentence(l.item)}` : 'Not linked'}
                actionLabel={l.ignored ? 'Undo' : l.item ? 'Change' : 'Link'}
                onAction={() => toggle(l.id)}
              />
            ))}
          </div>
          <p className="hc-small hc-muted">Linked items show live readings, and your maintenance plan adjusts to real use.</p>
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="account">
      <div className="hc-c47-web">
        <header className="hc-c47-web__head">
          <div>
            <h1 className="hc-h2">Link your devices to items</h1>
            <p className="hc-medium hc-muted">Google Home / Nest · 4 devices found</p>
          </div>
          <Button onClick={flow.goNext}>Save</Button>
        </header>
        <div className="hc-c47-table" role="table" aria-label="Devices">
          <div className="hc-c47-table__head" role="row">
            <span role="columnheader">Device</span>
            <span role="columnheader">Room</span>
            <span role="columnheader">Link to item</span>
          </div>
          {links.map((l) => (
            <div key={l.id} className="hc-c47-table__row" role="row">
              <span role="cell" className="hc-medium-semibold">
                {l.device}
              </span>
              <span role="cell">{l.room}</span>
              <span role="cell">
                <button type="button" className="hc-c47-pill-btn" onClick={() => toggle(l.id)}>
                  <StatusPill label={l.ignored ? 'Ignored' : (l.item ?? 'Not linked')} tone={l.item && !l.ignored ? 'success' : 'neutral'} />
                </button>
              </span>
            </div>
          ))}
        </div>
        <p className="hc-small hc-muted">Example: filter changes move from every 90 days to every 60 days based on run time.</p>
      </div>
    </WebShell>
  );
}
