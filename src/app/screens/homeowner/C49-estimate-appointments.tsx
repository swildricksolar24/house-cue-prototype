import { useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { TaskRow } from '../../../components/TaskRow/TaskRow';
import { currentHome } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C49-estimate-appointments.css';

const SLOTS = [
  { id: 'mon', mobile: 'Mon 17 · 1 PM', web: 'Mon, Nov 17 · 1 PM' },
  { id: 'tue', mobile: 'Tue 18 · 9 AM', web: 'Tue, Nov 18 · 9 AM' },
  { id: 'wed', mobile: 'Wed 19 · 3 PM', web: 'Wed, Nov 19 · 3 PM' },
];
const WHO = ['You', 'Someone in your household'];

/** C49 Estimate appointments — Figma mobile 216:19074, web 216:20478 (J1 Request quotes step 5) */
export default function EstimateAppointments(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [slot, setSlot] = useState('mon');
  const [who, setWho] = useState(0);
  const [outcome, setOutcome] = useState<'asked' | 'declined' | null>(null);
  const mobile = device === 'mobile';

  const slots = (
    <div className="hc-c49-slots" role="radiogroup" aria-label="Estimate visit time">
      {SLOTS.map((s) => (
        <button
          key={s.id}
          type="button"
          role="radio"
          aria-checked={slot === s.id}
          className={['hc-c49-slot', slot === s.id && 'hc-c49-slot--selected'].filter(Boolean).join(' ')}
          onClick={() => setSlot(s.id)}
        >
          {mobile ? s.mobile : s.web}
        </button>
      ))}
    </div>
  );

  const whoRow = (
    <DetailRow label="Who will be home" value={WHO[who]} actionLabel="Edit" onAction={() => setWho((i) => (i + 1) % WHO.length)} />
  );

  const outcomeBanner =
    outcome === 'asked' ? (
      <Banner tone="success">I asked Fernhollow Pool Care for other times. I’ll let you know when they reply.</Banner>
    ) : outcome === 'declined' ? (
      <Banner>You declined this visit. Fernhollow Pool Care won’t be booked.</Banner>
    ) : null;

  const confirmed = (
    <TaskRow
      icon="calendar"
      title="Mesa Comfort Co."
      meta={mobile ? 'AC estimate · Fri, Nov 14, 10 AM · you’ll be home' : 'AC estimate · Fri, Nov 14, 10 AM'}
      tag="Confirmed"
      tagTone="success"
      onClick={() => flow.go('C74')}
    />
  );

  if (mobile) {
    return (
      <MobileShell header={{ title: 'Estimate visits' }} tab="jobs">
        <h2 className="hc-large-bold">Needs your answer</h2>
        <section className="hc-c49-card">
          <div className="hc-c49-request">
            <p className="hc-medium-semibold">Fernhollow Pool Care</p>
            <p className="hc-small hc-muted">Pool pump noise · {currentHome.address}</p>
          </div>
          {slots}
          <div>
            <DetailRow label="Estimate visit fee" value="$45, set by the pro" />
            {whoRow}
          </div>
          {outcomeBanner ?? (
            <div className="hc-c49-actions hc-c49-actions--fill">
              <Button onClick={flow.goNext}>Accept</Button>
              <Button variant="secondary" onClick={() => setOutcome('asked')}>
                Other times
              </Button>
            </div>
          )}
        </section>
        <h2 className="hc-large-bold hc-c49-confirmed-title">Confirmed</h2>
        <div>{confirmed}</div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="jobs">
      <div className="hc-c49-web">
        <h1 className="hc-h2">Estimate visits</h1>
        <div className="hc-c49-web__cols">
          <section className="hc-c49-card hc-c49-card--web hc-c49-web__main">
            <h2 className="hc-large-bold">Needs your answer</h2>
            <p className="hc-medium-semibold">Fernhollow Pool Care · pool pump noise</p>
            <div className="hc-c49-times">
              <p className="hc-small hc-muted">Times that fit your calendar:</p>
              {slots}
            </div>
            <div>
              <DetailRow label="Estimate visit fee" value="$45, set by the pro · you accept it before the visit" />
              {whoRow}
              <DetailRow label="Access" value="Side gate code shared after you confirm" actionLabel="Edit" actionDisabled />
            </div>
            {outcomeBanner ?? (
              <div className="hc-c49-actions">
                <Button onClick={flow.goNext}>Accept $45 visit</Button>
                <Button variant="secondary" onClick={() => setOutcome('asked')}>
                  Propose other times
                </Button>
                <Button variant="secondary" onClick={() => setOutcome('declined')}>
                  Decline
                </Button>
              </div>
            )}
          </section>
          <aside className="hc-c49-web__side">
            <section className="hc-c49-card hc-c49-card--web hc-c49-card--confirmed">
              <h2 className="hc-large-bold">Confirmed</h2>
              {confirmed}
            </section>
            <Banner tone="success" title="Calendar connected">
              Google Calendar. Confirmed visits are added for you.
            </Banner>
          </aside>
        </div>
      </div>
    </WebShell>
  );
}
