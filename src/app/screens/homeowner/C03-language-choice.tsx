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

/**
 * C03 Language choice — Figma mobile 215:11673, web 215:14096.
 * Review change (shorter onboarding, Option A): no longer a homeowner onboarding step; it lives under Settings &
 * account with Save going back (the top bar's language menu was later removed too, so this is the only language
 * choice). The landlord sign-up still shows it as step 2 of 6.
 */
export default function LanguageChoice(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [lang, setLang] = useState<Lang>('en');
  const mobile = device === 'mobile';
  const signUp = flow.journey.slug === 'landlord-portfolio';
  const done = signUp ? flow.goNext : flow.goBack;
  const doneLabel = signUp ? 'Continue' : 'Save';

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
        header={signUp ? { title: 'Language', step: '2 of 6', progress: 2 / 6 } : { title: 'Language' }}
        bottom={<BottomActions primaryLabel={doneLabel} onPrimary={done} />}
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
        {signUp && <WebStepHeader step={2} />}
        <h1 className="hc-h2">Choose your language</h1>
        <p className="hc-large hc-muted">You can change this any time in Settings.</p>
        {options}
        <div className="hc-onb-actions">
          <Button fullWidth onClick={done}>
            {doneLabel}
          </Button>
        </div>
      </WebCard>
    </WebShell>
  );
}
