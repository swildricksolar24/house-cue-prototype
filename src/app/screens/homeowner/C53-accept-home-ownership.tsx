import { useState } from 'react';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { Checkbox } from '../../../components/Checkbox/Checkbox';
import { MetricRow } from '../../../components/MetricRow/MetricRow';
import { Switch } from '../../../components/Switch/Switch';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C53-accept-home-ownership.css';

/** C53 Accept home ownership — Figma mobile 218:18169, web 218:18791 (J1 Household & access step 2) */
export default function AcceptHomeOwnership(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [agreed, setAgreed] = useState(true);
  const [largeText, setLargeText] = useState(true);
  const [voice, setVoice] = useState(true);

  const controls = (
    <>
      <Checkbox label="I agree to the Terms and Privacy Policy" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
      <Switch label="Large text" checked={largeText} onCheckedChange={setLargeText} />
      <Switch label="Talk instead of typing" checked={voice} onCheckedChange={setVoice} />
    </>
  );

  if (device === 'mobile') {
    return (
      <MobileShell
        header={{ title: 'Your home on HouseCue' }}
        bottom={
          <BottomActions
            primaryLabel="Accept and continue"
            onPrimary={flow.goNext}
            primaryDisabled={!agreed}
            secondaryLabel="Not now"
            onSecondary={flow.goBack}
          />
        }
        className="hc-c53-mobile"
      >
        <h2 className="hc-h3">A family member invited you to own your home record</h2>
        <p className="hc-medium">5530 E Saguaro Dr, Tucson. They’ll help as your caregiver.</p>
        <div className="hc-c53-details">
          <MetricRow label="They can" value="Manage requests" />
          <MetricRow label="" value="Approve bookings up to $300" />
          <MetricRow label="" value="View documents · be the vendor contact" className="hc-c53-wrap" />
        </div>
        {controls}
      </MobileShell>
    );
  }

  return (
    <WebShell layout="onboarding" width="narrow">
      <div className="hc-c53-web">
        <header className="hc-c53-web__head">
          <h1 className="hc-h2">Your home on HouseCue</h1>
          <p className="hc-medium hc-muted">Large text and voice are on. This works on the web without the app.</p>
        </header>
        <section className="hc-c53-card">
          <p className="hc-medium">A family member invited you to own the home record for 5530 E Saguaro Dr, Tucson.</p>
          <MetricRow
            label="They can"
            value="Manage requests, approve bookings up to $300, view documents, be the vendor contact"
            className="hc-c53-wrap"
          />
          {controls}
          <Button className="hc-c53-cta" onClick={flow.goNext} disabled={!agreed}>
            Accept and continue
          </Button>
        </section>
      </div>
    </WebShell>
  );
}
