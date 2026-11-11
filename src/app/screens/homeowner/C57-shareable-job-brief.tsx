import { useState } from 'react';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { ImagePlaceholder } from '../../../components/ImagePlaceholder/ImagePlaceholder';
import { MetricRow } from '../../../components/MetricRow/MetricRow';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C57-shareable-job-brief.css';

const TITLE = 'Water heater not heating';
const SCOPE = 'Scope: diagnose no hot water; likely element or thermostat.';

/** C57 Shareable job brief — Figma mobile 216:19305, web 216:20788 (J1 Request quotes step 8) */
export default function ShareableJobBrief(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [copied, setCopied] = useState(false);
  const [pdf, setPdf] = useState(false);

  if (device === 'mobile') {
    return (
      <MobileShell
        header={{ title: 'Job brief' }}
        bottom={
          <BottomActions
            primaryLabel="Share link"
            onPrimary={flow.goNext}
            secondaryLabel={pdf ? 'PDF downloaded' : 'Download PDF'}
            onSecondary={() => setPdf(true)}
          />
        }
      >
        <section className="hc-c57-card">
          <h2 className="hc-large-bold">{TITLE}</h2>
          <MetricRow label="Item" value="Rheem 50 gal · 9 yrs" />
          <MetricRow label="Error code" value="F28" />
          <MetricRow label="Last service" value="Flush, Mar 2025" />
          <ImagePlaceholder label="Photos (3)" height={100} />
          <p className="hc-small hc-muted">{SCOPE}</p>
        </section>
        <p className="hc-small hc-muted">The link shows this brief only, not your home record.</p>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="plan">
      <div className="hc-c57-web">
        <header className="hc-c57-web__head">
          <div>
            <h1 className="hc-h2">Shareable job brief</h1>
            <p className="hc-medium hc-muted">Ready to send to any contractor</p>
          </div>
          <Button variant="secondary" onClick={() => setCopied(true)}>
            {copied ? 'Copied' : 'Copy text'}
          </Button>
          <Button variant="secondary" onClick={() => setPdf(true)}>
            {pdf ? 'PDF downloaded' : 'Download PDF'}
          </Button>
          <Button onClick={flow.goNext}>Share link</Button>
        </header>
        <div className="hc-c57-web__cols">
          <section className="hc-c57-card hc-c57-web__main">
            <h2 className="hc-large-bold">{TITLE}</h2>
            <MetricRow label="Item" value="Rheem 50 gal electric · 9 yrs" />
            <MetricRow label="Error code" value="F28" />
            <MetricRow label="Last service" value="Flush, Mar 2025" />
            <MetricRow label="Home" value="Flagstaff, AZ" />
            <p className="hc-medium">{SCOPE}</p>
          </section>
          <aside className="hc-c57-web__side">
            <ImagePlaceholder label="Photos (3)" height={220} />
            <p className="hc-small hc-muted">Anyone with the link sees this brief only. Link expires in 30 days (assumption).</p>
          </aside>
        </div>
      </div>
    </WebShell>
  );
}
