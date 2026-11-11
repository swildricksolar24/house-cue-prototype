import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { ImagePlaceholder } from '../../../components/ImagePlaceholder/ImagePlaceholder';
import { TimelineStep, type TimelineStepState } from '../../../components/TimelineStep/TimelineStep';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C26-diy-video-coach.css';

/** Figma draws an empty (zero-width space) meta line under upcoming steps, which keeps their height */
const EMPTY_META = '​';

const STEPS: { state: TimelineStepState; title: string; meta: string }[] = [
  { state: 'done', title: 'Turn off water and flush', meta: 'Confirmed by the coach' },
  { state: 'current', title: 'Remove the old fill valve', meta: 'Unscrew the nut under the tank' },
  { state: 'upcoming', title: 'Install the new valve', meta: EMPTY_META },
  { state: 'upcoming', title: 'Turn water on and test', meta: EMPTY_META },
];

/** Opens the partner's store in the real product; nothing to do in the prototype */

/**
 * C26 DIY video coach — Figma mobile 216:15719, web 216:17766 (J1 Home record & maintenance step 8).
 * Mobile lists the first three steps, web all four. Get a pro instead → C13; End session (web) continues the journey.
 */
export default function DiyVideoCoach(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();

  const steps = (count: number) => (
    <ol className="hc-c26-steps">
      {STEPS.slice(0, count).map((s) => (
        <TimelineStep key={s.title} state={s.state} title={s.title} meta={s.meta} />
      ))}
    </ol>
  );

  const camera = <ImagePlaceholder label="Live camera · toilet tank" height={200} />;

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'DIY coach' }} tab="plan" background="page">
        <div className="hc-c26-stack">
          {camera}
          <Banner tone="warning" title="Water off?">
            Turn off the shutoff behind the toilet first.
          </Banner>
          {steps(3)}
          <DetailRow label="Part 400H" value="Universal fill valve" actionLabel="Buy" actionDisabled />
          <Button variant="secondary" fullWidth onClick={() => flow.go('C13')}>
            Get a pro instead
          </Button>
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="plan">
      <div className="hc-c26-web">
        <header className="hc-c26-web__head">
          <h1 className="hc-h2">DIY video coach</h1>
          <p className="hc-medium hc-muted">Toilet fill valve · live guidance, step by step</p>
        </header>
        <div className="hc-c26-web__cols">
          <div className="hc-c26-web__main">
            {camera}
            <section className="hc-c26-card">
              <h2 className="hc-large-bold">Steps</h2>
              {steps(4)}
            </section>
          </div>
          <div className="hc-c26-web__side">
            <Banner tone="warning" title="Safety check">
              Shutoff closed · towel and bucket ready · adjustable wrench.
            </Banner>
            <section className="hc-c26-card">
              <h2 className="hc-large-bold">Need a part?</h2>
              <DetailRow
                label="Part 400H · fill valve"
                value="Member discount at checkout"
                actionLabel="Buy from partner"
                actionDisabled
              />
              <p className="hc-small hc-muted">You buy on the partner’s site. Returns are handled there.</p>
            </section>
            <div className="hc-c26-web__actions">
              <Button variant="secondary" onClick={() => flow.go('C13')}>
                Get a pro instead
              </Button>
              <Button variant="secondary" onClick={flow.goNext}>
                End session
              </Button>
            </div>
          </div>
        </div>
      </div>
    </WebShell>
  );
}
