import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { ConsentRow } from '../../../components/ConsentRow/ConsentRow';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { currentHome } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C16-book-and-schedule.css';

/**
 * C16 Book and schedule — Figma mobile 217:29332, web 217:30324 (J1 Review & book step 3).
 * ?state=oon — "Out-of-network acknowledgement" (231:24749 / batch 230:40089, web 100:3185).
 */

const JOB = 'Diagnose and fix warm air upstairs';
const mobileSlots = ['Thu 13 · 8–10 AM', 'Thu 13 · 1–3 PM', 'Fri 14 · 8–10 AM'];
const webSlots = ['Thu, Nov 13 · 8–10 AM', 'Thu, Nov 13 · 1–3 PM', 'Fri, Nov 14 · 8–10 AM', 'Mon, Nov 17 · 10–12 AM'];

const OON_TITLE = 'Not background-checked';
const OON_BODY =
  'Ocotillo Air Repair is out of network. HouseCue has not run a background check on this pro. Out-of-network bookings follow our out-of-network protection terms.';
const OON_ACK = 'I understand this pro is not background-checked and I still want to book.';

export default function BookAndSchedule(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const oon = params.get('state') === 'oon';
  // Figma draws the OON frame with the acknowledgement already ticked
  const [ack, setAck] = useState(true);
  useEffect(() => setAck(true), [oon]);
  const [slot, setSlot] = useState(0);

  const continueToPayment = () => {
    if (oon) {
      if (flow.nextPath) navigate(`${flow.nextPath}?state=oon`);
    } else flow.goNext();
  };
  const blocked = oon && !ack;

  const slots = (labels: string[]) => (
    <div className="hc-c16-chips" role="radiogroup" aria-label="Pick a time">
      {labels.map((l, i) => (
        <button
          key={l}
          type="button"
          role="radio"
          aria-checked={slot === i}
          className={['hc-c16-chip', slot === i && 'hc-c16-chip--selected'].filter(Boolean).join(' ')}
          onClick={() => setSlot(i)}
        >
          {l}
        </button>
      ))}
    </div>
  );

  const oonBanner = (
    <Banner tone="error" title={OON_TITLE}>
      {OON_BODY}
    </Banner>
  );
  const ackRow = (
    <ConsentRow checked={ack} onChange={(e) => setAck(e.target.checked)} linkLabel="Out-of-network terms" onLinkClick={() => flow.go('X08')}>
      {OON_ACK}
    </ConsentRow>
  );

  // ───────────── Mobile ─────────────
  if (device === 'mobile') {
    return (
      <MobileShell
        header={{ title: 'Book' }}
        bottom={
          <BottomActions
            primaryLabel="Continue to payment"
            onPrimary={continueToPayment}
            primaryDisabled={blocked}
            secondaryLabel="Cancel"
            onSecondary={flow.goBack}
          />
        }
      >
        {oon && oonBanner}
        {oon && ackRow}
        <DetailRow label="Pro" value={oon ? 'Ocotillo Air Repair' : 'Zephyrline HVAC'} />
        <p className="hc-small hc-muted">
          {oon ? 'New on HouseCue: no job reviews yet' : 'HouseCue reviews ★ 4.8 (126) · 3 jobs within 2 mi'}
        </p>
        <DetailRow label="Job" value={JOB} actionLabel="Edit" onAction={() => flow.go('C13')} />
        <h2 className="hc-medium-semibold">Pick a time</h2>
        {slots(mobileSlots)}
        <div>
          <DetailRow label="Who will be home" value="You" actionLabel="Change" onAction={() => undefined} />
          <DetailRow label="Access" value="Ring the doorbell" actionLabel="Edit" onAction={() => undefined} />
        </div>
        <Banner tone="info" title="Fees this pro sets">
          No-show trip fee $49 if nobody is home within 15 minutes.
        </Banner>
      </MobileShell>
    );
  }

  // ───────────── Web ─────────────
  return (
    <WebShell nav="plan">
      <div className="hc-c16-web">
        <h1 className="hc-h2">Book {oon ? 'Ocotillo Air Repair' : 'Zephyrline HVAC'}</h1>
        <div className="hc-c16-web__cols">
          <div className="hc-c16-web__main">
            <section className="hc-c16-card">
              <h2 className="hc-large-bold">The job</h2>
              <div>
                <DetailRow label="Scope" value={JOB} actionLabel="Edit" onAction={() => flow.go('C13')} />
                <DetailRow label="Item" value="AC / heat pump · Trane XR14" />
                <DetailRow label="Address" value={`${currentHome.address}, ${currentHome.city}`} />
              </div>
            </section>
            <section className="hc-c16-card">
              <h2 className="hc-large-bold">Pick a time</h2>
              <p className="hc-small hc-muted">Matched to your calendar. Times are the home’s local time.</p>
              {slots(webSlots)}
            </section>
            <section className="hc-c16-card">
              <h2 className="hc-large-bold">On the day</h2>
              <div>
                <DetailRow label="Who will be home" value="You" actionLabel="Change" onAction={() => undefined} />
                <DetailRow label="Access" value="Ring the doorbell" actionLabel="Edit" onAction={() => undefined} />
              </div>
            </section>
          </div>
          <aside className="hc-c16-web__side">
            {oon && oonBanner}
            {oon && ackRow}
            <Banner tone="info" title="Fees this pro sets">
              No-show trip fee $49 if nobody is home within 15 minutes. No emergency surcharge on this job. Free cancellation until 24 hours before.
            </Banner>
            <section className="hc-c16-card hc-c16-card--summary">
              {oon ? (
                <>
                  <h2 className="hc-large-bold">Out-of-network pro</h2>
                  <p className="hc-small hc-muted">New on HouseCue: no job reviews yet (shown apart from the trust score)</p>
                </>
              ) : (
                <>
                  <h2 className="hc-large-bold">Zephyrline HVAC · Trust 92</h2>
                  <p className="hc-small hc-muted">HouseCue job reviews ★ 4.8 · 126 jobs (shown apart from the trust score)</p>
                  <p className="hc-small hc-c16-nearby">3 recent jobs within 2 miles of your home</p>
                </>
              )}
              <DetailRow label="Quoted price" value={oon ? '$175' : '$189'} />
              <Button fullWidth onClick={continueToPayment} disabled={blocked}>
                Continue to payment
              </Button>
              <p className="hc-small hc-muted">Nothing is charged until you sign off the job.</p>
            </section>
          </aside>
        </div>
      </div>
    </WebShell>
  );
}
