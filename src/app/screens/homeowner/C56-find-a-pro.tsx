import { Banner } from '../../../components/Banner/Banner';
import { ListRow } from '../../../components/ListRow/ListRow';
import { MetricRow } from '../../../components/MetricRow/MetricRow';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C56-find-a-pro.css';

/** C56 Find a pro (coming soon) — Figma mobile 216:19249, web 216:20663 (J1 Request quotes step 7) */
export default function FindAPro(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const mobile = device === 'mobile';

  const options = (
    <div className="hc-c56-options">
      <button type="button" className="hc-c56-option" onClick={flow.goNext}>
        <ListRow
          title="Share a job brief"
          description={mobile ? 'Send a ready-made brief to any contractor' : 'Ready-made brief for any contractor'}
        />
      </button>
      <button type="button" className="hc-c56-option" onClick={() => flow.go('C58')}>
        <ListRow title="Log an outside job" description="Keep your home record complete" />
      </button>
    </div>
  );

  if (mobile) {
    return (
      <MobileShell header={{ title: 'Find a pro' }} tab="plan">
        <Banner title="Quotes and booking are coming">You’re on the waitlist for Flagstaff. We’ll tell you when they open.</Banner>
        {options}
        <p className="hc-small hc-muted">In an emergency, you’ll see safety steps, shutoffs and local emergency numbers.</p>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="plan">
      <div className="hc-c56-web">
        <header className="hc-c56-web__head">
          <h1 className="hc-h2">Find a pro</h1>
          <p className="hc-medium hc-muted">Coming soon to Flagstaff</p>
        </header>
        <div className="hc-c56-web__cols">
          <section className="hc-c56-card">
            <h2 className="hc-large-bold">You’re on the waitlist</h2>
            <MetricRow label="Area" value="Flagstaff, AZ" />
            <MetricRow label="Homes waiting" value="1,240" />
          </section>
          <section className="hc-c56-card">
            <h2 className="hc-large-bold">Meanwhile</h2>
            {options}
          </section>
        </div>
      </div>
    </WebShell>
  );
}
