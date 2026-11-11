import { useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { MetricRow } from '../../../components/MetricRow/MetricRow';
import { Switch } from '../../../components/Switch/Switch';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C55-booking-waitlist.css';

/** C55 Booking waitlist — Figma mobile 216:19140, web 216:20542 (J1 Request quotes step 6) */
export default function BookingWaitlist(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [notify, setNotify] = useState(true);

  const details = (
    <>
      <MetricRow label="Your area" value="Flagstaff, AZ 86001" />
      <MetricRow label="Booking open in" value="Phoenix and Tucson" />
      <Switch label="Tell me when booking opens" checked={notify} onCheckedChange={setNotify} />
    </>
  );

  if (device === 'mobile') {
    return (
      <MobileShell
        header={{ title: 'Booking in your area' }}
        bottom={
          <BottomActions
            primaryLabel="Join the waitlist"
            onPrimary={flow.goNext}
            secondaryLabel="Skip"
            onSecondary={() => flow.go('C08')}
          />
        }
      >
        <div className="hc-c55-stack">
          <Banner title="Booking isn’t available in Flagstaff yet">
            Everything else works: your home record, maintenance plan, check-ups and agent.
          </Banner>
          {details}
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell layout="onboarding" width="narrow">
      <div className="hc-c55-web">
        <header className="hc-c55-web__head">
          <h1 className="hc-h2">Booking isn’t available here yet</h1>
          <p className="hc-medium hc-muted">Everything else works. Join the waitlist and we’ll tell you when quotes and booking open.</p>
        </header>
        <section className="hc-c55-card">
          {details}
          <div className="hc-c55-card__actions">
            <Button onClick={flow.goNext}>Join the waitlist</Button>
            <button type="button" className="hc-c55-skip" onClick={() => flow.go('C08')}>
              Skip for now
            </button>
          </div>
        </section>
      </div>
    </WebShell>
  );
}
