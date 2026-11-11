import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { ImagePlaceholder } from '../../../components/ImagePlaceholder/ImagePlaceholder';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C59-partner-welcome.css';

/** Invented sample partner and home (Figma copy; not a real company) */
const PARTNER = 'Desert Home Inspections';
const ADDRESS = '5530 E Saguaro Dr, Tucson';

function KeyValues({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="hc-c59-kv">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt className="hc-medium hc-muted">{k}</dt>
          <dd className="hc-medium-semibold">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** C59 Partner welcome — Figma mobile 215:13557 (batch 211:38886), web 215:17011 (batch 211:38887). J1 Onboarding step 22. */
export default function PartnerWelcome(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Welcome' }} bottom={<BottomActions primaryLabel="Get started" onPrimary={flow.goNext} />}>
        <div className="hc-c59-content">
          <section className="hc-c59-card">
            <div className="hc-c59-card__row">
              <h2 className="hc-large-bold">A gift from {PARTNER}</h2>
              <StatusPill label="Partner" tone="info" />
            </div>
            <ImagePlaceholder label="Partner logo" height={60} />
          </section>
          <h1 className="hc-h3">Your home record is already started</h1>
          <KeyValues
            rows={[
              ['Address', ADDRESS],
              ['Items', '18'],
              ['Findings', '6 (2 safety)'],
              ['Photos', '42'],
            ]}
          />
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell layout="onboarding" width="narrow">
      <div className="hc-c59-web">
        <header className="hc-c59-web__head">
          <h1 className="hc-h2">Your home record is already started</h1>
          <p className="hc-medium hc-muted">A gift from {PARTNER}</p>
        </header>
        <section className="hc-c59-card">
          <ImagePlaceholder label="Partner logo" height={60} />
          <KeyValues
            rows={[
              ['Address', ADDRESS],
              ['Pre-loaded', '18 items · 6 findings · 42 photos'],
            ]}
          />
          <div>
            <Button onClick={flow.goNext}>Get started</Button>
          </div>
        </section>
      </div>
    </WebShell>
  );
}
