import { useState } from 'react';
import { Button } from '../../../components/Button/Button';
import { ImagePlaceholder } from '../../../components/ImagePlaceholder/ImagePlaceholder';
import { Input } from '../../../components/Input/Input';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { DialogClose } from '../../shells/DialogClose';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import { TextLink, WebCard } from './_onboarding';
import './X05-permission-prompts.css';

type Prompt = 'camera' | 'location';

/**
 * X05 Permission prompts — Figma mobile 215:12135 (camera pre-prompt), state frame "Location" 12:2548; web 215:14716
 * (browser location pre-prompt).
 *
 * Review change (prototype Figma flow, file 1uysjkCuc5ZiNIocKmdKFg): the location pre-prompt is a branch of C04, opened
 * by "Use my current location". Use my location → back to C04 with the address filled in and confirmed
 * (?state=located); Type my address → back to C04. The mobile camera pre-prompt is the ?state=camera branch
 * (camera → location).
 */
export default function PermissionPrompts(_: ScreenProps) {
  const { device, screenState } = usePrototype();
  const flow = useFlow();
  const [prompt, setPrompt] = useState<Prompt>((screenState as string) === 'camera' ? 'camera' : 'location');
  const useLocation = () => flow.go('C04', '?state=located');
  const typeAddress = () => flow.go('C04');

  if (device === 'mobile') {
    const camera = prompt === 'camera';
    const sheet = (
        <section className="hc-x05-sheet" role="dialog" aria-modal="true" aria-labelledby="hc-x05-title">
          <span className="hc-x05-grabber" aria-hidden />
          {/* × = not now: type the address (camera prompt: skip to the location prompt) */}
          <DialogClose onClick={camera ? () => setPrompt('location') : typeAddress} />
          <h2 id="hc-x05-title" className="hc-h4">
            {camera ? 'Allow camera to scan labels' : 'Find your address faster'}
          </h2>
          <p className="hc-medium hc-muted">
            {camera
              ? 'HouseCue uses the camera only when you scan a label or take a check-up photo. Photos stay in your home record.'
              : 'We use your location once to fill in your address. You can always type it instead.'}
          </p>
          <Button fullWidth onClick={camera ? () => setPrompt('location') : useLocation}>
            {camera ? 'Continue' : 'Use my location'}
          </Button>
          <TextLink underline={false} onClick={camera ? () => setPrompt('location') : typeAddress}>
            {camera ? 'Not now, type it in' : 'Type my address'}
          </TextLink>
          <div className="hc-x05-home-indicator" aria-hidden>
            <span />
          </div>
        </section>
    );
    return (
      <MobileShell className="hc-x05-mobile" padding="none" bottom={sheet}>
        <div className="hc-x05-behind" aria-hidden>
          {camera ? (
            <>
              <h1 className="hc-h4">Add an item</h1>
              <ImagePlaceholder label="Camera preview (waiting for permission)" height={320} />
            </>
          ) : (
            <>
              <h1 className="hc-h4">Where’s your home?</h1>
              <Input label="Home address" placeholder="Start typing your address" tabIndex={-1} />
            </>
          )}
          <div className="hc-x05-scrim" />
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell layout="onboarding" className="hc-onb-web">
      <WebCard>
        <h1 className="hc-h3">Use your location?</h1>
        <p className="hc-large hc-muted">Your browser will ask next. We use it once to fill in your address, then stop.</p>
        <Button fullWidth onClick={useLocation}>
          Use my location
        </Button>
        <TextLink underline={false} onClick={typeAddress}>
          Type my address instead
        </TextLink>
      </WebCard>
    </WebShell>
  );
}
