import { useEffect, useState } from 'react';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { OptionCard } from '../../../components/OptionCard/OptionCard';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { useConnectFail } from '../../prototype/connectFail';
import { AccountConfirmDialog } from '../../shells/AccountConfirmDialog';
import { ConnectFailed } from '../../shells/ConnectFailed';
import { MobileShell } from '../../shells/MobileShell';
import { useSetupFlow } from '../../shells/SetupFlow';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C43-calendar-connect.css';

const CALENDARS = ['Google Calendar', 'Microsoft Outlook', 'Apple Calendar'];
// Review change: a way to skip linking a calendar (same as C44's "Don't link my email")
const NO_CALENDAR = 'Don’t link my calendar';
const WINDOWS = ['Weekday mornings', 'Weekday afternoons', 'Saturdays'];
/** Who you sign in with for each calendar (Confirm your account dialog) */
const PROVIDER: Record<string, string> = { 'Google Calendar': 'Google', 'Microsoft Outlook': 'Microsoft', 'Apple Calendar': 'Apple' };

/**
 * C43 Calendar connect — Figma mobile 215:13305 (batch 211:38858), web 215:16607 (batch 211:38859). J1 Onboarding step 19.
 * Review change: in the setup flow (opened from the C08 checklist) Connect works in place instead of moving on to the next
 * onboarding step: a short loading state, then "Connected" with the calendar's name and Disconnect. Picking another
 * calendar shows Connect again. Connecting counts as an edit for the step's Save. Mobile gets its own Connect button in
 * the content there (the setup flow's Cancel / Save replace the bottom actions). Outside the setup flow nothing changed.
 * Review change: a fourth option, "Don't link my calendar", skips linking: no Connect button, a note says nothing will be
 * linked (the agent uses the times entered by hand), and outside the setup flow the button reads "Continue without a
 * calendar".
 * Review change: Connect first asks you to confirm the account (AccountConfirmDialog: your account or another one, what
 * HouseCue sees and never sees, Continue). Then it connects in place (setup flow) or moves on (journey). The connected
 * panel shows which account.
 * Review change: if connecting fails (prototype: "Connections fail" in the shortcuts panel), the ConnectFailed panel
 * shows instead: why, Try again, Use another account, and Enter times by hand (picks "Don't link my calendar").
 */
export default function CalendarConnect(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [calendar, setCalendar] = useState(CALENDARS[0]);
  const [windows, setWindows] = useState<string[]>([WINDOWS[0]]);
  const { fromSetup } = useSetupFlow();
  const [connected, setConnected] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  // Review change: "Connections fail" (prototype shortcuts panel) makes connecting end in the failure panel
  const fail = useConnectFail();
  const [failedFor, setFailedFor] = useState<string | null>(null);
  useEffect(() => {
    if (!connecting) return;
    const t = setTimeout(() => {
      if (fail) setFailedFor(calendar);
      else setConnected(calendar);
      setConnecting(false);
    }, 900);
    return () => clearTimeout(t);
  }, [connecting, calendar, fail]);

  // Connect → confirm the account first; then connect here (setup flow) or go on to the next journey step
  const [signingIn, setSigningIn] = useState<'mine' | 'other' | null>(null);
  const [account, setAccount] = useState('');
  const connectNow = () => setSigningIn('mine');
  const provider = PROVIDER[calendar] ?? 'calendar';
  const signInDialog = signingIn && (
    <AccountConfirmDialog
      provider={provider}
      service={calendar}
      sees="Busy and free times"
      never="Event titles, people, locations or notes (assumption)"
      initialChoice={signingIn}
      onConfirm={(email) => {
        setSigningIn(null);
        setAccount(email);
        setFailedFor(null);
        if (fromSetup) setConnecting(true);
        else flow.goNext();
      }}
      onCancel={() => setSigningIn(null)}
    />
  );
  const isConnected = connected === calendar;
  const skip = calendar === NO_CALENDAR;
  const connectBlock = skip ? (
    // Don't link my calendar: nothing to connect; picking it counts as an edit, so the step can be saved as is
    fromSetup || device === 'web' ? (
      <div className="hc-c43-skip">
        <p className="hc-small hc-muted">Nothing will be linked. Your agent suggests visits in the times you choose by hand.</p>
        {!fromSetup && (
          <div>
            <Button onClick={flow.goNext}>Continue without a calendar</Button>
          </div>
        )}
      </div>
    ) : null
  ) : isConnected ? (
    <div className="hc-c43-connected" role="status">
      <StatusPill label="Connected" tone="success" />
      <p className="hc-medium">
        Your agent can see busy and free times in <strong>{connected}</strong>
        {account && <> ({account})</>}.
      </p>
      <Button variant="tertiary" size="small" onClick={() => setConnected(null)} data-setup-edit>
        Disconnect
      </Button>
    </div>
  ) : failedFor === calendar && !connecting ? (
    <ConnectFailed
      reason={`${provider} didn’t finish signing you in, so nothing was linked. This can happen if the sign-in was cancelled or timed out.`}
      onRetry={() => setSigningIn('mine')}
      onOtherAccount={() => setSigningIn('other')}
      fallbackLabel="Enter times by hand"
      onFallback={() => {
        setFailedFor(null);
        setCalendar(NO_CALENDAR);
      }}
    />
  ) : (
    <div>
      <Button onClick={connectNow} loading={connecting} fullWidth={device === 'mobile'}>
        {device === 'mobile' ? `Connect ${calendar}` : 'Connect'}
      </Button>
    </div>
  );

  const options = (
    <div className="hc-c43-options" role="radiogroup" aria-label="Calendar">
      {CALENDARS.map((c) => (
        <OptionCard key={c} title={c} selected={calendar === c} onClick={() => setCalendar(c)} />
      ))}
      <OptionCard
        title={NO_CALENDAR}
        description="Your agent uses the times you enter by hand"
        selected={calendar === NO_CALENDAR}
        onClick={() => setCalendar(NO_CALENDAR)}
      />
    </div>
  );

  if (device === 'mobile') {
    return (
      <MobileShell
        header={{ title: 'Calendar' }}
        bottom={
          <BottomActions
            primaryLabel={skip ? 'Continue without a calendar' : `Connect ${calendar}`}
            onPrimary={skip ? flow.goNext : connectNow}
            secondaryLabel="Enter times by hand"
            onSecondary={flow.goNext}
          />
        }
      >
        <div className="hc-c43-content">
          <h1 className="hc-h3">Let your agent see when you’re free</h1>
          <p className="hc-medium">Your agent proposes estimate and job times that fit your calendar.</p>
          {options}
          {fromSetup && connectBlock}
          <p className="hc-small hc-muted">We read busy and free times only, never event details (assumption).</p>
        </div>
        {signInDialog}
      </MobileShell>
    );
  }

  const toggleWindow = (w: string) => setWindows((ws) => (ws.includes(w) ? ws.filter((x) => x !== w) : [...ws, w]));

  return (
    <WebShell nav="agent">
      <div className="hc-c43-web">
        <header className="hc-c43-web__head">
          <h1 className="hc-h2">Connect your calendar</h1>
          <p className="hc-medium hc-muted">Needed to schedule estimates and jobs automatically</p>
        </header>
        <div className="hc-c43-web__cols">
          <div className="hc-c43-web__col">
            <section className="hc-c43-card">
              <h2 className="hc-large-bold">Choose a calendar</h2>
              {options}
              {connectBlock}
            </section>
          </div>
          <div className="hc-c43-web__col">
            <section className="hc-c43-card">
              <h2 className="hc-large-bold">What your agent sees</h2>
              <dl className="hc-c43-kv">
                <div>
                  <dt className="hc-medium hc-muted">Sees</dt>
                  <dd className="hc-medium-semibold">Busy and free times</dd>
                </div>
                <div>
                  <dt className="hc-medium hc-muted">Never sees</dt>
                  <dd className="hc-medium-semibold">Titles, people, notes (assumption)</dd>
                </div>
              </dl>
            </section>
            <section className="hc-c43-card">
              <h2 className="hc-large-bold">Or enter times by hand</h2>
              <div className="hc-c43-chips" role="group" aria-label="Times that work">
                {WINDOWS.map((w) => (
                  <button
                    key={w}
                    type="button"
                    aria-pressed={windows.includes(w)}
                    className={['hc-c43-chip', windows.includes(w) && 'hc-c43-chip--selected'].filter(Boolean).join(' ')}
                    onClick={() => toggleWindow(w)}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
      {signInDialog}
    </WebShell>
  );
}
