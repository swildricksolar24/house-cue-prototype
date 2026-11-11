import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { ImagePlaceholder } from '../../../components/ImagePlaceholder/ImagePlaceholder';
import { MetricRow } from '../../../components/MetricRow/MetricRow';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C62-check-up-result.css';

/**
 * C62 Check-up result — Figma mobile 216:15580, web 216:17592 (J1 Home record & maintenance step 7).
 * The mobile frame shows the "Watch" finding, the web frame the "Problem found" finding; each layout keeps its own.
 * "Do it myself" continues the journey to C26 DIY video coach; Ask the agent → C09, Get quotes → C13.
 */
export default function CheckUpResult(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();

  const compare = (height: number) => (
    <div className="hc-c62-compare">
      <ImagePlaceholder label="May 4" height={height} />
      <ImagePlaceholder label="Today" height={height} />
    </div>
  );

  if (device === 'mobile') {
    return (
      <MobileShell
        header={{ title: 'Check-up result' }}
        bottom={
          <BottomActions
            primaryLabel="Ask the agent"
            onPrimary={() => flow.go('C09')}
            secondaryLabel="Get quotes"
            onSecondary={() => flow.go('C13')}
          />
        }
      >
        <div className="hc-c62-stack">
          <Banner tone="warning" title="Watch">
            Light rust at the drain valve, more than last time.
          </Banner>
          {compare(100)}
          <div className="hc-c62-details">
            <MetricRow label="Likely cause" value="Slow drip at the valve" />
            <MetricRow label="Next check" value="3 months (was 6)" />
          </div>
          <button type="button" className="hc-c62-link" onClick={flow.goNext}>
            Do it myself
          </button>
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="plan">
      <div className="hc-c62-web">
        <header className="hc-c62-web__head">
          <h1 className="hc-h2">Check-up result · water heater</h1>
          <p className="hc-medium hc-muted">Compared with May 4 and the manufacturer’s manual</p>
        </header>
        <Banner tone="error" title="Problem found">
          Active leak at the drain valve. Urgency: this week.
        </Banner>
        <div className="hc-c62-web__cols">
          <div className="hc-c62-web__photos">{compare(180)}</div>
          <section className="hc-c62-card">
            <h2 className="hc-large-bold">What to do</h2>
            <div className="hc-c62-card__actions">
              <Button onClick={() => flow.go('C13')}>Get quotes</Button>
              <Button variant="secondary" onClick={() => flow.go('C09')}>
                Ask the agent
              </Button>
              <Button variant="secondary" onClick={flow.goNext}>
                Do it myself
              </Button>
            </div>
            <p className="hc-small hc-muted">Quotes are pre-filled with the photos and the finding.</p>
          </section>
        </div>
      </div>
    </WebShell>
  );
}
