import { Fragment, useEffect, useState } from 'react';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { Icon } from '../../../components/Icon/Icon';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';
import { StateBlock } from '../../../components/StateBlock/StateBlock';
import { StatusPill, type StatusTone } from '../../../components/StatusPill/StatusPill';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { homeDevices as DEVICES, roomOrder as ROOM_ORDER } from '../../data/sample';
import { useConnectFail } from '../../prototype/connectFail';
import { AccountConfirmDialog } from '../../shells/AccountConfirmDialog';
import { ConnectFailed } from '../../shells/ConnectFailed';
import { FormDialog } from '../../shells/EditDialog';
import { MobileShell } from '../../shells/MobileShell';
import { useSetupFlow } from '../../shells/SetupFlow';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import { DeviceIcon } from './_c46-device-icon';
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
  { name: 'Google Home / Nest', value: 'Connected · 6 devices', action: 'Manage', status: 'Connected', tone: 'success', devices: '6 linked · 1 ignored', lastReading: '2 min ago', webAction: 'Manage' },
  { name: 'Alexa / Ring', value: 'Not connected', action: 'Connect', status: 'Not connected', tone: 'neutral', devices: '—', lastReading: '—', webAction: 'Connect' },
  // Review change: the mobile row matches the web card (it said "Not connected" while its devices showed Paused)
  { name: 'Apple Home', value: 'Needs sign-in again · 3 devices', action: 'Reconnect', status: 'Needs sign-in again', tone: 'warning', devices: '3', lastReading: 'Nov 2', webAction: 'Reconnect' },
];

const INTRO = 'Your agent reads live data like thermostat run time and leak alerts, and adjusts your plan.';

/**
 * Review change: the devices behind each platform, grouped by room on the page ("Devices by room"). Rooms and their order
 * follow C63 Rooms and materials. A platform's devices show while it's connected (Live) or needs signing in again
 * (Paused); connecting Alexa / Ring adds its two. Invented sample devices.
 */

/** Who you sign in with for each platform (review change: Connect / Sign in again dialogs) */
const PROVIDER: Record<string, string> = { 'Google Home / Nest': 'Google', 'Alexa / Ring': 'Amazon', 'Apple Home': 'Apple' };

/**
 * Review change: where a paused device's owner fixes the account outside HouseCue (its app on mobile, its web account
 * on web; the prototype can't open apps, so both use the web address). Opens in a new tab.
 */
const ACCOUNT_LINKS: Record<string, { app: string; web: string; url: string }> = {
  'Google Home / Nest': { app: 'Google Home', web: 'Google Home account', url: 'https://home.google.com' },
  'Alexa / Ring': { app: 'Alexa', web: 'Amazon Alexa account', url: 'https://alexa.amazon.com' },
  'Apple Home': { app: 'Apple Home', web: 'Apple account', url: 'https://account.apple.com' },
};
const LINK_SCOPES = ['All supported devices', 'Thermostats and sensors only'];

type DialogKind = 'connect' | 'signin' | 'disconnect';

/**
 * C46 Connected devices — Figma mobile 215:12990 (batch 211:38864), web 215:16056 (batch 211:38865).
 * States: Empty 111:12082, Loading 111:12144, Error 111:12216 (+ web 111:12278/12376/12484). J1 Onboarding step 16.
 * Connecting/managing a platform goes to C47 (map devices, next step).
 * Review change (web): the 5-column table is replaced by one card per platform (icon, name + status tag, devices and last
 * reading underneath, the action on the right). The table's fixed columns left the platform name about 2px wide, so
 * names wrapped a word per line under the status tags and the Platform / Status headers overlapped.
 * Review change: in the setup flow (opened from the C08 checklist) the buttons work in place instead of moving on to C47:
 * Connect / Reconnect show a short loading state, then the platform reads Connected (devices linked, last reading "just
 * now"); a connected platform's button is Disconnect (it was Manage), which sets it back to Not connected. Each counts as
 * an edit for the step's Save. Outside the setup flow they still go to C47.
 * Review change: each button opens a dialog first (FormDialog): Connect (not connected: what your agent reads and never
 * reads, "Devices to link", "Sign in with <provider>"), Sign in again (needs sign-in: when it expired, readings paused,
 * "Sign in with <provider>") and Disconnect (connected, setup flow: what stops and what stays, red Disconnect). Confirming
 * does the change in place in the setup flow; outside it, Connect / Sign in go on to C47 as before and Manage still opens C47.
 * Review change: after "Sign in with <provider>" you confirm the account (AccountConfirmDialog), then it connects.
 * Review change: "Devices by room" under the platforms lists each platform's devices grouped by room (C63's rooms, with
 * their icons, later removed from these headings): name, platform and reading, and a Live / Paused tag. It follows
 * connect / disconnect.
 * Review change: if connecting fails (prototype: "Connections fail" in the shortcuts panel), a ConnectFailed panel shows
 * under that platform: why (provider not responding), Try again, Use another account, and Skip for now.
 */
export default function ConnectedDevices(_: ScreenProps) {
  const { device, screenState } = usePrototype();
  const flow = useFlow();
  const open = flow.goNext;
  const { fromSetup } = useSetupFlow();
  const [platforms, setPlatforms] = useState(PLATFORMS);
  const [busy, setBusy] = useState<string | null>(null);
  const [scope, setScope] = useState(LINK_SCOPES[0]);
  const [dialog, setDialog] = useState<{ kind: DialogKind; p: Platform } | null>(null);

  // Review change: "Connections fail" (prototype shortcuts panel) makes connecting end in the failure panel
  const fail = useConnectFail();
  const [failedFor, setFailedFor] = useState<string | null>(null);

  // Setup flow: finish connecting after a short wait
  useEffect(() => {
    if (!busy) return;
    const t = setTimeout(() => {
      if (fail) {
        setFailedFor(busy);
        setBusy(null);
        return;
      }
      setPlatforms((list) =>
        list.map((p) => {
          if (p.name !== busy) return p;
          // A newly connected account links the sample devices it has (Devices by room)
          const base = p.devices === '—' ? `${DEVICES.filter((d) => d.platform === p.name).length || 2} linked` : p.devices.includes('linked') ? p.devices : `${p.devices} linked`;
          const devices = scope === LINK_SCOPES[1] ? `${base.split(' · ')[0]} · thermostats and sensors` : base;
          const count = parseInt(devices, 10) || 2;
          return { ...p, status: 'Connected', tone: 'success', devices, lastReading: 'just now', value: `Connected · ${count} devices` };
        }),
      );
      setBusy(null);
    }, 900);
    return () => clearTimeout(t);
  }, [busy, scope, fail]);

  const isConnected = (p: Platform) => p.status === 'Connected';
  /** Button label: in the setup flow a connected platform offers Disconnect instead of Manage */
  const actionLabel = (p: Platform, web: boolean) => (fromSetup && isConnected(p) ? 'Disconnect' : web ? p.webAction : p.action);
  // Every button opens its dialog first; Manage outside the setup flow still opens C47 (map devices)
  const act = (p: Platform) => {
    if (isConnected(p) && !fromSetup) return open();
    setDialog({ kind: isConnected(p) ? 'disconnect' : p.status === 'Needs sign-in again' ? 'signin' : 'connect', p });
  };
  const confirm = (kind: DialogKind, p: Platform, values: Record<string, string>) => {
    setDialog(null);
    if (kind === 'disconnect') {
      setPlatforms((list) =>
        list.map((x) =>
          x.name === p.name ? { ...x, status: 'Not connected', tone: 'neutral', devices: '—', lastReading: '—', value: 'Not connected', action: 'Connect', webAction: 'Connect' } : x,
        ),
      );
      return;
    }
    if (values.scope) setScope(values.scope);
    // Next: confirm which account to sign in with (AccountConfirmDialog), then connect
    setSigningIn({ p, choice: 'mine' });
  };
  const [signingIn, setSigningIn] = useState<{ p: Platform; choice: 'mine' | 'other' } | null>(null);
  const signInDialog = signingIn && (
    <AccountConfirmDialog
      provider={PROVIDER[signingIn.p.name] ?? signingIn.p.name}
      service={signingIn.p.name}
      sees="Thermostat run time, leak and smoke alerts, door and window sensors"
      never="Cameras, voice recordings or anything else in the account (assumption)"
      initialChoice={signingIn.choice}
      onConfirm={() => {
        const { p } = signingIn;
        setSigningIn(null);
        setFailedFor(null);
        if (fromSetup) setBusy(p.name);
        else open();
      }}
      onCancel={() => setSigningIn(null)}
    />
  );
  /** Couldn't connect panel under the platform that failed */
  const failure = (p: Platform) =>
    failedFor === p.name && busy !== p.name ? (
      <ConnectFailed
        reason={`${PROVIDER[p.name] ?? p.name} isn’t responding right now, so ${p.name} wasn’t linked. Try again in a few minutes.`}
        onRetry={() => setSigningIn({ p, choice: 'mine' })}
        onOtherAccount={() => setSigningIn({ p, choice: 'other' })}
        fallbackLabel="Skip for now"
        onFallback={() => setFailedFor(null)}
      />
    ) : null;

  const reads = (provider: string) => (
    <dl className="hc-c46-dialog-kv">
      <div>
        <dt className="hc-small hc-muted">Your agent reads</dt>
        <dd className="hc-medium">Thermostat run time, leak and smoke alerts, door and window sensors</dd>
      </div>
      <div>
        <dt className="hc-small hc-muted">Never</dt>
        <dd className="hc-medium">Cameras, voice recordings or anything else in your {provider} account (assumption)</dd>
      </div>
    </dl>
  );
  const linked = (p: Platform) => parseInt(p.devices, 10) || 0;
  const dialogEl =
    dialog &&
    (() => {
      const { kind, p } = dialog;
      const provider = PROVIDER[p.name] ?? p.name;
      const close = () => setDialog(null);
      if (kind === 'disconnect') {
        const n = linked(p);
        return (
          <FormDialog
            title={`Disconnect ${p.name}?`}
            description={`Your agent stops reading your ${n || 'linked'} ${n === 1 ? 'device' : 'devices'}. Past readings stay in your home record, and you can connect again anytime.`}
            fields={[]}
            values={{}}
            submitLabel="Disconnect"
            submitVariant="destructive"
            onSave={(v) => confirm(kind, p, v)}
            onCancel={close}
          />
        );
      }
      if (kind === 'signin') {
        return (
          <FormDialog
            title={`Sign in to ${p.name} again`}
            description={`${provider} asked you to sign in again on ${p.lastReading}. Readings from your ${p.devices} devices are paused until you do.`}
            fields={[]}
            values={{}}
            submitLabel={`Sign in with ${provider}`}
            countsAsEdit={false}
            onSave={(v) => confirm(kind, p, v)}
            onCancel={close}
          >
            {reads(provider)}
          </FormDialog>
        );
      }
      return (
        <FormDialog
          title={`Connect ${p.name}`}
          description={`You’ll sign in with ${provider} to link your devices. Smart-home links are free on every plan.`}
          fields={[{ key: 'scope', label: 'Devices to link', field: { kind: 'select', options: LINK_SCOPES } }]}
          values={{ scope: LINK_SCOPES[0] }}
          submitLabel={`Sign in with ${provider}`}
            countsAsEdit={false}
          onSave={(v) => confirm(kind, p, v)}
          onCancel={close}
        >
          {reads(provider)}
        </FormDialog>
      );
    })();

  // Devices by room: only platforms that are connected (Live) or need signing in again (Paused)
  const platformStatus = Object.fromEntries(platforms.map((p) => [p.name, p.status]));
  const shown = DEVICES.filter((d) => ['Connected', 'Needs sign-in again'].includes(platformStatus[d.platform] ?? ''));
  const byRoom = ROOM_ORDER.map((room) => ({ room, devices: shown.filter((d) => d.room === room) })).filter((g) => g.devices.length);
  // Review change: a heading over the platforms, so they read as accounts (not devices missing a room)
  const accountsHead = (
    <div className="hc-c46-section-head">
      <h2 id="hc-c46-accounts-title" className="hc-large-bold">
        Smart-home accounts
      </h2>
      <p className="hc-small hc-muted">Each account can have devices in several rooms. Connect one to see its devices below.</p>
    </div>
  );
  const devicesByRoom = (
    <section className="hc-c46-rooms" aria-labelledby="hc-c46-rooms-title">
      <h2 id="hc-c46-rooms-title" className="hc-large-bold">
        Devices by room
      </h2>
      {byRoom.length === 0 ? (
        <p className="hc-medium hc-muted">No devices yet. Connect a platform above to see its devices here.</p>
      ) : (
        byRoom.map(({ room, devices }) => (
          <div key={room} className="hc-c46-room">
            <h3 className="hc-c46-room__head">
              <span className="hc-medium-semibold">{room}</span>
              <span className="hc-small hc-muted">
                {devices.length} {devices.length === 1 ? 'device' : 'devices'}
              </span>
            </h3>
            <ul className="hc-c46-room__devices">
              {devices.map((d) => {
                const paused = platformStatus[d.platform] !== 'Connected';
                const account = ACCOUNT_LINKS[d.platform];
                const platform = platforms.find((p) => p.name === d.platform);
                return (
                  <li key={d.id} className="hc-c46-device">
                    {/* Review change: an icon for each device */}
                    <DeviceIcon name={d.name} />
                    <span className="hc-c46-device__text">
                      <span className="hc-medium">{d.name}</span>
                      <span className="hc-small hc-muted">
                        {d.platform} · {paused ? 'Paused until you sign in again' : d.reading}
                      </span>
                      {/* Review change: paused devices link to fixing the account: sign in again here, or open the
                          account in its app / on the web */}
                      {paused && (
                        <span className="hc-c46-device__fix">
                          {platform && (
                            <button type="button" className="hc-c46-link" onClick={() => act(platform)}>
                              Sign in again
                            </button>
                          )}
                          {account && (
                            <a className="hc-c46-link" href={account.url} target="_blank" rel="noopener noreferrer">
                              {device === 'mobile' ? `Open the ${account.app} app` : `Open your ${account.web}`}
                              <span aria-hidden> ↗</span>
                              <span className="hc-c46-sr"> (opens in a new tab)</span>
                            </a>
                          )}
                        </span>
                      )}
                    </span>
                    <StatusPill label={paused ? 'Paused' : 'Live'} tone={paused ? 'warning' : 'success'} />
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}
    </section>
  );

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
              {accountsHead}
              <div>
                {platforms.map((p) => (
                  <Fragment key={p.name}>
                    <DetailRow
                      label={p.name}
                      value={busy === p.name ? 'Connecting…' : p.value}
                      actionLabel={actionLabel(p, false)}
                      actionDisabled={busy === p.name}
                      onAction={() => act(p)}
                    />
                    {failure(p)}
                  </Fragment>
                ))}
              </div>
              <p className="hc-small hc-muted">Included free on every plan.</p>
              {devicesByRoom}
            </>
          )}
        </div>
        {dialogEl}
        {signInDialog}
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
        <p className="hc-medium">{INTRO}</p>
        {state ? (
          <div className="hc-c46-state">{state}</div>
        ) : (
          <>
          {accountsHead}
          <ul className="hc-c46-list" aria-labelledby="hc-c46-accounts-title">
            {platforms.map((p) => (
              <li key={p.name} className="hc-c46-platform">
                <span className="hc-c46-platform__icon" aria-hidden>
                  <Icon name="devices" size={24} />
                </span>
                <div className="hc-c46-platform__text">
                  <div className="hc-c46-platform__title">
                    <h2 className="hc-large-bold">{p.name}</h2>
                    <StatusPill label={p.status} tone={p.tone} />
                  </div>
                  <p className="hc-medium hc-muted">
                    {p.devices === '—' ? 'No devices yet' : `Devices: ${p.devices}`}
                    {p.lastReading !== '—' && <> · Last reading {p.lastReading}</>}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => act(p)}
                  loading={busy === p.name}
                  aria-label={`${actionLabel(p, true)} ${p.name}`}
                >
                  {actionLabel(p, true)}
                </Button>
                {failedFor === p.name && <div className="hc-c46-platform__failed">{failure(p)}</div>}
              </li>
            ))}
          </ul>
          </>
        )}
        {!state && devicesByRoom}
      </div>
      {dialogEl}
      {signInDialog}
    </WebShell>
  );
}
