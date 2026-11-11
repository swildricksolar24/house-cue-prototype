import { useState } from 'react';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { OptionCard } from '../../../components/OptionCard/OptionCard';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C43-calendar-connect.css';

const CALENDARS = ['Google Calendar', 'Microsoft Outlook', 'Apple Calendar'];
const WINDOWS = ['Weekday mornings', 'Weekday afternoons', 'Saturdays'];

/** C43 Calendar connect — Figma mobile 215:13305 (batch 211:38858), web 215:16607 (batch 211:38859). J1 Onboarding step 19. */
export default function CalendarConnect(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [calendar, setCalendar] = useState(CALENDARS[0]);
  const [windows, setWindows] = useState<string[]>([WINDOWS[0]]);

  const options = (
    <div className="hc-c43-options" role="radiogroup" aria-label="Calendar">
      {CALENDARS.map((c) => (
        <OptionCard key={c} title={c} selected={calendar === c} onClick={() => setCalendar(c)} />
      ))}
    </div>
  );

  if (device === 'mobile') {
    return (
      <MobileShell
        header={{ title: 'Calendar' }}
        bottom={
          <BottomActions
            primaryLabel={`Connect ${calendar}`}
            onPrimary={flow.goNext}
            secondaryLabel="Enter times by hand"
            onSecondary={flow.goNext}
          />
        }
      >
        <div className="hc-c43-content">
          <h1 className="hc-h3">Let your agent see when you’re free</h1>
          <p className="hc-medium">Your agent proposes estimate and job times that fit your calendar.</p>
          {options}
          <p className="hc-small hc-muted">We read busy and free times only, never event details (assumption).</p>
        </div>
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
              <div>
                <Button onClick={flow.goNext}>Connect</Button>
              </div>
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
    </WebShell>
  );
}
