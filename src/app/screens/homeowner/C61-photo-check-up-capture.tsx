import { useSearchParams } from 'react-router-dom';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { ImagePlaceholder } from '../../../components/ImagePlaceholder/ImagePlaceholder';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C61-photo-check-up-capture.css';

/**
 * What the check-up is of. Default: the water heater base (Figma). Review change: the roof line check-up from Plan
 * (?task=roof-check) shows the roof instead; there's no roof result screen, so its photos finish the task and go back
 * to Plan (marked done) instead of on to C62.
 */
const CHECK_UPS = {
  'water-heater': {
    subject: 'Water heater base',
    meta: 'Every 6 months · last check-up May 4',
    example: 'Example: base and drain valve',
    tip: 'Good light, no flash. Include the drain valve.',
  },
  'roof-check': {
    subject: 'Roof line',
    meta: 'Every 6 months · last check-up Jun 12',
    example: 'Example: roof line from the street',
    tip: 'From the ground: the front, the back and the sunny side.',
  },
} as const;

/** C61 Photo check-up capture — Figma mobile 216:15513, web 216:17465 (J1 Home record & maintenance step 6) */
export default function PhotoCheckUpCapture(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [params] = useSearchParams();
  const roof = params.get('task') === 'roof-check';
  const c = CHECK_UPS[roof ? 'roof-check' : 'water-heater'];
  const upload = roof ? () => flow.go('C11', '?done=roof-check') : flow.goNext;

  if (device === 'mobile') {
    return (
      <MobileShell
        header={{ title: 'Check-up' }}
        bottom={
          <BottomActions
            primaryLabel="Take photo"
            onPrimary={upload}
            secondaryLabel="Skip this time"
            onSecondary={() => flow.go('C11')}
          />
        }
      >
        <div className="hc-c61-stack">
          <h2 className="hc-h3">{c.subject}</h2>
          <ImagePlaceholder label={c.example} height={120} />
          <ImagePlaceholder label="Camera with framing guide" height={250} />
          <p className="hc-small hc-muted">Take 1 to 3 photos in good light.</p>
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="plan">
      <div className="hc-c61-web">
        <header className="hc-c61-web__head">
          <div>
            <h1 className="hc-h2">Check-up · {c.subject.toLowerCase()}</h1>
            <p className="hc-medium hc-muted">{c.meta}</p>
          </div>
          <Button onClick={upload}>Upload photos</Button>
        </header>
        <div className="hc-c61-web__cols">
          <div className="hc-c61-web__col">
            <ImagePlaceholder label={c.example} height={260} />
          </div>
          <div className="hc-c61-web__col">
            <ImagePlaceholder label="Drop up to 3 photos" height={260} />
            <p className="hc-small hc-muted">{c.tip}</p>
          </div>
        </div>
      </div>
    </WebShell>
  );
}
