import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';
import { StateBlock } from '../../../components/StateBlock/StateBlock';
import { StatusPill, type StatusTone } from '../../../components/StatusPill/StatusPill';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C46-connected-devices.css';

type Platform = {
  name: string;
  value: string;
  action: string;
  status: string;
  tone: StatusTone;
  devices: string;
  lastReading: string;
  webAction: string;
};

const PLATFORMS: Platform[] = [
  { name: 'Google Home / Nest', value: 'Connected · 3 devices', action: 'Manage', status: 'Connected', tone: 'success', devices: '3 linked · 1 ignored', lastReading: '2 min ago', webAction: 'Manage' },
  { name: 'Alexa / Ring', value: 'Not connected', action: 'Connect', status: 'Not connected', tone: 'neutral', devices: '—', lastReading: '—', webAction: 'Connect' },
  { name: 'Apple Home', value: 'Not connected', action: 'Connect', status: 'Needs sign-in again', tone: 'warning', devices: '2', lastReading: 'Nov 2', webAction: 'Reconnect' },
];

const INTRO = 'Your agent reads live data like thermostat run time and leak alerts, and adjusts your plan.';

/**
 * C46 Connected devices — Figma mobile 215:12990 (batch 211:38864), web 215:16056 (batch 211:38865).
 * States: Empty 111:12082, Loading 111:12144, Error 111:12216 (+ web 111:12278/12376/12484). J1 Onboarding step 16.
 * Connecting/managing a platform goes to C47 (map devices, next step).
 */
export default function ConnectedDevices(_: ScreenProps) {
  const { device, screenState } = usePrototype();
  const flow = useFlow();
  const open = flow.goNext;

  const state =
    screenState === 'empty' ? (
      <StateBlock title="No devices connected" body="Connect a thermostat, leak sensor or other device." actionLabel="Connect a device" onAction={open} />
    ) : screenState === 'error' ? (
      <StateBlock kind="error" title="Couldn’t load your devices" body="Check your connection and try again. Nothing was lost." actionLabel="Try again" />
    ) : screenState === 'loading' ? (
      <>
        <SkeletonCard label="Loading devices" />
        <SkeletonCard label="Loading devices" />
        <SkeletonCard label="Loading devices" />
      </>
    ) : null;

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Connected devices' }} tab="account">
        <div className="hc-c46-content">
          <p className="hc-medium">{INTRO}</p>
          {state ?? (
            <>
              <div>
                {PLATFORMS.map((p) => (
                  <DetailRow key={p.name} label={p.name} value={p.value} actionLabel={p.action} onAction={open} />
                ))}
              </div>
              <p className="hc-small hc-muted">Included free on every plan.</p>
            </>
          )}
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="account">
      <div className="hc-c46-web">
        <header className="hc-c46-web__head">
          <h1 className="hc-h2">Connected devices</h1>
          <p className="hc-medium hc-muted">Smart-home links are free on all plans</p>
        </header>
        <div className="hc-c46-table" role="table" aria-label="Smart-home platforms">
          <div className="hc-c46-table__head" role="row">
            <span role="columnheader">Platform</span>
            <span role="columnheader">Status</span>
            <span role="columnheader">Devices</span>
            <span role="columnheader">Last reading</span>
            <span role="columnheader" aria-label="Action" />
          </div>
          {state ? (
            <div className="hc-c46-table__state">{state}</div>
          ) : (
            PLATFORMS.map((p) => (
              <div key={p.name} className="hc-c46-table__row" role="row">
                <span role="cell" className="hc-medium-semibold">
                  {p.name}
                </span>
                <span role="cell">
                  <StatusPill label={p.status} tone={p.tone} />
                </span>
                <span role="cell">{p.devices}</span>
                <span role="cell">{p.lastReading}</span>
                <span role="cell">
                  <Button variant="secondary" onClick={open}>
                    {p.webAction}
                  </Button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </WebShell>
  );
}
