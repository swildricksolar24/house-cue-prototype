import { useState } from 'react';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { OptionCard } from '../../../components/OptionCard/OptionCard';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import { WebCard, WebStepHeader } from './_onboarding';

type Lang = 'en' | 'es';

/** C03 Language choice — Figma mobile 215:11673, web 215:14096 (J1 Onboarding step 4) */
export default function LanguageChoice(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [lang, setLang] = useState<Lang>('en');
  const mobile = device === 'mobile';

  const options = (
    <div role="radiogroup" aria-label="Language" className="hc-onb-stack">
      <OptionCard
        icon="chat"
        title="English"
        description={mobile ? 'Detected from your phone' : 'Detected from your browser'}
        selected={lang === 'en'}
        onClick={() => setLang('en')}
      />
      <OptionCard icon="chat" title="Español" description="Usar HouseCue en español" selected={lang === 'es'} onClick={() => setLang('es')} />
    </div>
  );

  if (mobile) {
    return (
      <MobileShell
        className="hc-onb-mobile"
        header={{ title: 'Language', step: '2 of 6', progress: 2 / 6 }}
        bottom={<BottomActions primaryLabel="Continue" onPrimary={flow.goNext} />}
      >
        <h1 className="hc-h3">Choose your language</h1>
        <p className="hc-medium hc-muted">You can change this any time in Settings.</p>
        {options}
      </MobileShell>
    );
  }

  return (
    <WebShell layout="onboarding" className="hc-onb-web">
      <WebCard>
        <WebStepHeader step={2} />
        <h1 className="hc-h2">Choose your language</h1>
        <p className="hc-large hc-muted">You can change this any time in Settings.</p>
        {options}
        <div className="hc-onb-actions">
          <Button fullWidth onClick={flow.goNext}>
            Continue
          </Button>
        </div>
      </WebCard>
    </WebShell>
  );
}
