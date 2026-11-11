import { useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { Input } from '../../../components/Input/Input';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import { TextLink, WebCard, WebStepHeader } from './_onboarding';
import appleLogo from './assets/c02-apple.png';
import googleLogo from './assets/c02-google.png';
import './C02-sign-up.css';

type Stage = 'email' | 'code';

/**
 * C02 Sign up / sign in — Figma mobile 215:11597 (email step), web 215:14016 (code step with a wrong-code error).
 * Both steps exist on both layouts: Send code → code step; Verify → next journey step.
 */
export default function SignUp(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  // Mobile frame draws the email step, web frame the code step
  const [stage, setStage] = useState<Stage>(device === 'mobile' ? 'email' : 'code');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('(602) 555-0100');
  const [code, setCode] = useState('482913');
  const [codeError, setCodeError] = useState(true);

  const social = (
    <>
      <Button variant="secondary" fullWidth onClick={() => setStage('code')}>
        <span className="hc-c02-social">
          <img src={appleLogo} alt="" width={23} height={19} className="hc-c02-social__apple" />
          Continue with Apple
        </span>
      </Button>
      <Button variant="secondary" fullWidth onClick={() => setStage('code')}>
        <span className="hc-c02-social">
          <img src={googleLogo} alt="" width={19} height={19} />
          Continue with Google
        </span>
      </Button>
    </>
  );

  const emailFields = (
    <>
      <Input label="Email" type="email" placeholder="name@example.com" value={email} onValueChange={setEmail} />
      <Input label="Mobile number (for account recovery)" type="phone" value={phone} onValueChange={setPhone} />
      <p className="hc-small hc-muted">
        We’ll email you a 6-digit code. Your mobile number is only used to text a backup code if you lose access to your email.
      </p>
    </>
  );

  const codeBlock = (
    <>
      <Input
        label="6-digit code"
        hideLabel
        type="code"
        size="large"
        value={code.split('').join(' ')}
        onValueChange={(v) => {
          setCode(v.replace(/\D/g, '').slice(0, 6));
          setCodeError(false);
        }}
      />
      {codeError && (
        <Banner tone="error" title="That code didn’t match">
          Check the newest message and try again. 2 tries left before a 15-minute pause.
        </Banner>
      )}
      <TextLink align="left">Resend code (0:42)</TextLink>
      <TextLink align="left" onClick={() => setStage('email')}>
        Use a different email
      </TextLink>
    </>
  );

  const masked = email ? `${email[0]}•••${email.slice(email.indexOf('@'))}` : 'm•••@example.com';

  if (device === 'mobile') {
    return (
      <MobileShell
        className="hc-onb-mobile"
        header={{
          title: 'Create account',
          step: '1 of 6',
          progress: 1 / 6,
          ...(stage === 'code' ? { onBack: () => setStage('email') } : {}),
        }}
        bottom={
          stage === 'email' ? (
            <BottomActions primaryLabel="Send code" onPrimary={() => setStage('code')} secondaryLabel="I have an account" onSecondary={() => setStage('code')} />
          ) : (
            <BottomActions primaryLabel="Verify" onPrimary={flow.goNext} primaryDisabled={code.length < 6} />
          )
        }
      >
        {stage === 'email' ? (
          <>
            <h1 className="hc-h3">Create your account</h1>
            <p className="hc-medium hc-muted">Use an account you already have, or sign in with your email. No password needed.</p>
            {social}
            <p className="hc-small hc-muted hc-onb-divider">or</p>
            {emailFields}
          </>
        ) : (
          <>
            <h1 className="hc-h3">Enter the 6-digit code</h1>
            <p className="hc-medium hc-muted">We sent it to {masked}. It expires in 10 minutes.</p>
            {codeBlock}
          </>
        )}
        <div className="hc-onb-spacer" />
        <TextLink>Can’t sign in?</TextLink>
      </MobileShell>
    );
  }

  return (
    <WebShell layout="onboarding" className="hc-onb-web">
      <WebCard>
        <WebStepHeader step={1} />
        {stage === 'email' ? (
          <>
            <h1 className="hc-h2">Create your account</h1>
            <p className="hc-large hc-muted">Use an account you already have, or sign in with your email. No password needed.</p>
            {social}
            <p className="hc-small hc-muted hc-onb-divider">or</p>
            {emailFields}
            <div className="hc-onb-actions">
              <Button fullWidth onClick={() => setStage('code')}>
                Send code
              </Button>
              <TextLink underline={false}>Can’t sign in?</TextLink>
            </div>
          </>
        ) : (
          <>
            <h1 className="hc-h2">Enter the 6-digit code</h1>
            <p className="hc-large hc-muted">We sent it to {masked}. It expires in 10 minutes.</p>
            {codeBlock}
            <div className="hc-onb-actions">
              <Button fullWidth onClick={flow.goNext} disabled={code.length < 6}>
                Verify
              </Button>
              <TextLink underline={false}>Can’t sign in?</TextLink>
            </div>
          </>
        )}
      </WebCard>
    </WebShell>
  );
}
