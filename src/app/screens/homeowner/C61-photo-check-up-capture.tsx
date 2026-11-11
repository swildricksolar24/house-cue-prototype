import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { ImagePlaceholder } from '../../../components/ImagePlaceholder/ImagePlaceholder';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C61-photo-check-up-capture.css';

/** C61 Photo check-up capture — Figma mobile 216:15513, web 216:17465 (J1 Home record & maintenance step 6) */
export default function PhotoCheckUpCapture(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();

  if (device === 'mobile') {
    return (
      <MobileShell
        header={{ title: 'Check-up' }}
        bottom={
          <BottomActions
            primaryLabel="Take photo"
            onPrimary={flow.goNext}
            secondaryLabel="Skip this time"
            onSecondary={() => flow.go('C11')}
          />
        }
      >
        <div className="hc-c61-stack">
          <h2 className="hc-h3">Water heater base</h2>
          <ImagePlaceholder label="Example: base and drain valve" height={120} />
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
            <h1 className="hc-h2">Check-up · water heater base</h1>
            <p className="hc-medium hc-muted">Every 6 months · last check-up May 4</p>
          </div>
          <Button onClick={flow.goNext}>Upload photos</Button>
        </header>
        <div className="hc-c61-web__cols">
          <div className="hc-c61-web__col">
            <ImagePlaceholder label="Example: base and drain valve" height={260} />
          </div>
          <div className="hc-c61-web__col">
            <ImagePlaceholder label="Drop up to 3 photos" height={260} />
            <p className="hc-small hc-muted">Good light, no flash. Include the drain valve.</p>
          </div>
        </div>
      </div>
    </WebShell>
  );
}
