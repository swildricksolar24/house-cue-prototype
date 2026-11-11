import { useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { Input } from '../../../components/Input/Input';
import { demoAccount } from '../../data/sample';
import { useDemoActions } from '../../prototype/DemoTools';
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
 * Both steps exist on both layouts and both start on the email step: Send code → code step; Verify → next journey step.
 */
export default function SignUp(_: ScreenProps) {
  const { device, screenState } = usePrototype();
  const flow = useFlow();
  // Both layouts start on the email step (review decision). The Figma web frame's
  // "That code didn't match" state is the Error state (?state=error): code step, wrong code entered.
  const wrongCode = screenState === 'error';
  const [stage, setStage] = useState<Stage>(wrongCode ? 'code' : 'email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState(wrongCode ? '482913' : '');
  const [codeError, setCodeError] = useState(wrongCode);

  // Review decision: Send code stays disabled until both required fields are filled in
  const canSend = /^\S+@\S+\.\S+$/.test(email.trim()) && phone.replace(/\D/g, '').length >= 10;

  // Prototype shortcuts (not in Figma), like hub360: fill in the demo account / demo code.
  // Only the demo code verifies; any other 6 digits show "That code didn't match".
  const verify = () => (code === demoAccount.code ? flow.goNext() : setCodeError(true));
  useDemoActions(
    stage === 'email'
      ? [
          {
            label: 'Use Demo Account',
            onClick: () => {
              setEmail(demoAccount.email);
              setPhone(demoAccount.phone);
            },
          },
        ]
      : [
          {
            label: 'Use Demo Account',
            onClick: () => {
              setCode(demoAccount.code);
              setCodeError(false);
            },
          },
        ],
  );

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
            <BottomActions
              primaryLabel="Send code"
              onPrimary={() => setStage('code')}
              primaryDisabled={!canSend}
              secondaryLabel="I have an account"
              onSecondary={() => setStage('code')}
            />
          ) : (
            <BottomActions primaryLabel="Verify" onPrimary={verify} primaryDisabled={code.length < 6} />
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
              <Button fullWidth onClick={() => setStage('code')} disabled={!canSend}>
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
              <Button fullWidth onClick={verify} disabled={code.length < 6}>
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
