import { useSearchParams } from 'react-router-dom';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { ImagePlaceholder } from '../../../components/ImagePlaceholder/ImagePlaceholder';
import { TimelineStep, type TimelineStepState } from '../../../components/TimelineStep/TimelineStep';
import { planTaskDetails } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C26-diy-video-coach.css';

/** Figma draws an empty (zero-width space) meta line under upcoming steps, which keeps their height */
const EMPTY_META = '​';

type Step = { state: TimelineStepState; title: string; meta: string };

/** What the coach is helping with: the Figma toilet fill valve, or a Plan task */
type Coach = {
  subject: string;
  camera: string;
  steps: Step[];
  /** Mobile warning banner */
  check: { title: string; body: string };
  /** Web safety banner */
  safety: string;
  part?: { label: string; value: string };
};

const FIGMA: Coach = {
  subject: 'Toilet fill valve',
  camera: 'toilet tank',
  steps: [
    { state: 'done', title: 'Turn off water and flush', meta: 'Confirmed by the coach' },
    { state: 'current', title: 'Remove the old fill valve', meta: 'Unscrew the nut under the tank' },
    { state: 'upcoming', title: 'Install the new valve', meta: EMPTY_META },
    { state: 'upcoming', title: 'Turn water on and test', meta: EMPTY_META },
  ],
  check: { title: 'Water off?', body: 'Turn off the shutoff behind the toilet first.' },
  safety: 'Shutoff closed · towel and bucket ready · adjustable wrench.',
  part: { label: 'Part 400H · fill valve', value: 'Member discount at checkout' },
};

/**
 * Review change: opened from a task (C12 Do it myself passes ?task=<id>), the coach walks through that task: its
 * camera view, its steps (first confirmed, second in progress), its safety note and part (data/sample.ts planTaskDetails).
 */
function coachFor(id: string | null): Coach {
  const t = id ? planTaskDetails[id] : undefined;
  if (!t) return FIGMA;
  return {
    subject: t.title,
    camera: t.camera,
    steps: t.steps.map((s, i) => ({
      state: i === 0 ? 'done' : i === 1 ? 'current' : 'upcoming',
      title: s,
      meta: i === 0 ? 'Confirmed by the coach' : i === 1 ? 'In progress' : EMPTY_META,
    })),
    check: { title: 'Safety first', body: t.safety },
    safety: t.safety,
    part: t.part && { label: t.part.name, value: `${t.part.price} · member discount at checkout` },
  };
}

/**
 * C26 DIY video coach — Figma mobile 216:15719, web 216:17766 (J1 Home record & maintenance step 8).
 * Mobile lists the first three steps, web all of them. Get a pro instead → C13; End session (web) returns to Plan (C11,
 * review change), marking the task done when the coach was opened from one.
 */
export default function DiyVideoCoach(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [params] = useSearchParams();
  const taskId = params.get('task');
  const coach = coachFor(taskId);
  const fromTask = coach !== FIGMA;
  const endSession = () => flow.go('C11', fromTask ? `?done=${taskId}` : undefined);

  const steps = (count: number) => (
    <ol className="hc-c26-steps">
      {coach.steps.slice(0, count).map((s) => (
        <TimelineStep key={s.title} state={s.state} title={s.title} meta={s.meta} />
      ))}
    </ol>
  );

  const camera = <ImagePlaceholder label={`Live camera · ${coach.camera}`} height={200} />;

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'DIY coach' }} tab="plan" background="page">
        <div className="hc-c26-stack">
          {fromTask && <h1 className="hc-h3">{coach.subject}</h1>}
          {camera}
          <Banner tone="warning" title={coach.check.title}>
            {coach.check.body}
          </Banner>
          {steps(3)}
          {coach.part &&
            (fromTask ? (
              <DetailRow label="Part" value={coach.part.label} actionLabel="Buy" actionDisabled />
            ) : (
              <DetailRow label="Part 400H" value="Universal fill valve" actionLabel="Buy" actionDisabled />
            ))}
          <Button variant="secondary" fullWidth onClick={() => flow.go('C13')}>
            Get a pro instead
          </Button>
          {fromTask && (
            <Button variant="secondary" fullWidth onClick={endSession}>
              End session
            </Button>
          )}
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="plan">
      <div className="hc-c26-web">
        <header className="hc-c26-web__head">
          <h1 className="hc-h2">DIY video coach</h1>
          <p className="hc-medium hc-muted">{coach.subject} · live guidance, step by step</p>
        </header>
        <div className="hc-c26-web__cols">
          <div className="hc-c26-web__main">
            {camera}
            <section className="hc-c26-card">
              <h2 className="hc-large-bold">Steps</h2>
              {steps(coach.steps.length)}
            </section>
          </div>
          <div className="hc-c26-web__side">
            <Banner tone="warning" title="Safety check">
              {coach.safety}
            </Banner>
            {coach.part && (
              <section className="hc-c26-card">
                <h2 className="hc-large-bold">Need a part?</h2>
                <DetailRow label={coach.part.label} value={coach.part.value} actionLabel="Buy from partner" actionDisabled />
                <p className="hc-small hc-muted">You buy on the partner’s site. Returns are handled there.</p>
              </section>
            )}
            <div className="hc-c26-web__actions">
              <Button variant="secondary" onClick={() => flow.go('C13')}>
                Get a pro instead
              </Button>
              {/* Review change: finishing the DIY job returns to Plan */}
              <Button variant="secondary" onClick={endSession}>
                End session
              </Button>
            </div>
          </div>
        </div>
      </div>
    </WebShell>
  );
}
