import { useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { Input } from '../../../components/Input/Input';
import { legalPdf } from '../../data/legal';
import { useNavigate } from 'react-router-dom';
import { demoAccount, sampleInvites } from '../../data/sample';
import { completePendingInvite, useAccounts } from '../../prototype/accounts';
import { useDemoActions } from '../../prototype/DemoTools';
import { useFlow } from '../../prototype/flow';
import { useCurrentHome } from '../../prototype/HomeContext';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import { OnboardingStepper, TextLink, WebCard, WebStepHeader } from './_onboarding';
import appleLogo from './assets/c02-apple.png';
import googleLogo from './assets/c02-google.png';
import './C02-sign-up.css';

type Stage = 'email' | 'code';
type Mode = 'signup' | 'signin';

/**
 * C02 Sign up / sign in — Figma mobile 215:11597 (email step), web 215:14016 (code step with a wrong-code error).
 * Both steps exist on both layouts and both start on the email step: Send code → code step; Verify → next journey step.
 *
 * Review change (prototype Figma flow, file 1uysjkCuc5ZiNIocKmdKFg "C02 Sign in"): returning users get a sign-in mode
 * (?state=signin, or "I have an account"): "Welcome back", email only, no step counter; Verify goes to Home (C08).
 * Continue with Apple / Google skips the email code: sign up → next step, sign in → Home.
 *
 * Review change (shorter onboarding, Option A): the homeowner sign-up is step 1 of 3 and carries the agreements as one
 * line under the form (Terms, how disputes work, Privacy Policy → X08); the separate Agreements step (C41) is gone.
 * The landlord sign-up keeps 6 steps and its C41 step.
 *
 * Review change (signed-out gaps): email mistakes are caught on Send code. Signing in with an email that has no account
 * shows "No account with that email" (+ Create an account); signing up with an email that already has one shows "You
 * already have an account" (+ Sign in instead). In the prototype the one existing account is the demo account
 * (marty@example.com); the sign-up demo fills a new email. Branch states: ?state=no-account, ?state=email-taken.
 * "Can't sign in?" opens Account recovery (C52); the agreement line opens the legal PDFs.
 *
 * Review change (invites): after Accept invite (prototype shortcuts) sign in shows a note about the invite on top, and
 * signing in goes to Choose an account (/accounts) with the new account added, instead of Home.
 */
/** The one existing account in the prototype (sign in works only with it) and the email the sign-up demo fills in */
const EXISTING_EMAIL = demoAccount.email;
const NEW_EMAIL = 'new.homeowner@example.com';
export default function SignUp(_: ScreenProps) {
  const { device, screenState } = usePrototype();
  const flow = useFlow();
  // Both layouts start on the email step (review decision). The Figma web frame's
  // "That code didn't match" state is the Error state (?state=error): code step, wrong code entered.
  const wrongCode = screenState === 'error';
  const [mode, setMode] = useState<Mode>(['signin', 'no-account'].includes(screenState as string) ? 'signin' : 'signup');
  const signIn = mode === 'signin';
  // Homeowner onboarding is 3 steps with the agreement line here; the landlord sign-up keeps its 6 steps and C41
  const shortFlow = flow.journey.slug === 'onboarding';
  const total = shortFlow ? 3 : 6;
  const [stage, setStage] = useState<Stage>(wrongCode ? 'code' : 'email');
  const branch = screenState as string;
  // Email mistakes caught on Send code: 'unknown' (sign in, no account) or 'taken' (sign up, account exists)
  const [emailError, setEmailError] = useState<null | 'unknown' | 'taken'>(
    branch === 'no-account' ? 'unknown' : branch === 'email-taken' ? 'taken' : null,
  );
  const [email, setEmail] = useState(branch === 'no-account' ? 'marty@exmaple.com' : branch === 'email-taken' ? EXISTING_EMAIL : '');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState(wrongCode ? '482913' : '');
  const [codeError, setCodeError] = useState(wrongCode);

  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim());
  // Review decision: Send code stays disabled until the required fields are filled in (sign in only asks for email)
  const canSend = emailOk && (signIn || phone.replace(/\D/g, '').length >= 10);

  // Review change: an invite accepted from the prototype shortcuts waits for this sign-in (prototype/accounts.ts)
  const { pending } = useAccounts();
  const invite = pending && signIn ? sampleInvites[pending] : null;
  const { addHome } = useCurrentHome();
  const navigate = useNavigate();

  /**
   * Signed in or verified: sign up carries on with onboarding, sign in goes Home (Portfolio for landlords). With an
   * invite waiting, sign in adds its account and goes to Choose an account instead.
   */
  const done = () => {
    if (invite) {
      const joined = completePendingInvite();
      if (joined?.home) addHome(joined.home);
      return navigate('/accounts');
    }
    return signIn ? flow.go(flow.journey.slug === 'landlord-portfolio' ? 'C79' : 'C08') : flow.goNext();
  };
  const switchMode = (m: Mode) => {
    setMode(m);
    setStage('email');
    setCode('');
    setCodeError(false);
    setEmailError(null);
  };
  const changeEmail = (v: string) => {
    setEmail(v);
    setEmailError(null);
  };
  /** Send code: catch "no account" (sign in) and "already have an account" (sign up) before the code step */
  const sendCode = () => {
    const known = email.trim().toLowerCase() === EXISTING_EMAIL;
    if (signIn && !known) return setEmailError('unknown');
    if (!signIn && known) return setEmailError('taken');
    setStage('code');
  };
  const recover = () => flow.go('C52');

  // Prototype shortcuts (not in Figma), like hub360: fill in the demo account / demo code.
  // Only the demo code verifies; any other 6 digits show "That code didn't match".
  const verify = () => (code === demoAccount.code ? done() : setCodeError(true));
  useDemoActions(
    stage === 'email'
      ? [
          {
            label: 'Use Demo Account',
            onClick: () => {
              // Sign in: the existing demo account. Sign up: a new email (the demo account is already registered)
              changeEmail(signIn ? EXISTING_EMAIL : NEW_EMAIL);
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

  const title = signIn ? 'Welcome back' : 'Create your account';
  const intro = signIn
    ? 'Sign in with the account you used before. No password needed.'
    : 'Use an account you already have, or sign in with your email. No password needed.';

  const social = (
    <>
      <Button variant="secondary" fullWidth onClick={done}>
        <span className="hc-c02-social">
          <img src={appleLogo} alt="" width={23} height={19} className="hc-c02-social__apple" />
          Continue with Apple
        </span>
      </Button>
      <Button variant="secondary" fullWidth onClick={done}>
        <span className="hc-c02-social">
          <img src={googleLogo} alt="" width={19} height={19} />
          Continue with Google
        </span>
      </Button>
    </>
  );

  const emailFields = (
    <>
      <Input label="Email" type="email" placeholder="name@example.com" value={email} onValueChange={changeEmail} />
      {emailError === 'unknown' && (
        <div className="hc-c02-email-error">
          <Banner tone="error" title="No account with that email">
            Check the spelling, or create a new account with this email.
          </Banner>
          <Button variant="secondary" fullWidth onClick={() => switchMode('signup')}>
            Create an account
          </Button>
        </div>
      )}
      {emailError === 'taken' && (
        <div className="hc-c02-email-error">
          <Banner tone="warning" title="You already have an account">
            {email} is already registered. Sign in instead, or use a different email.
          </Banner>
          <Button variant="secondary" fullWidth onClick={() => switchMode('signin')}>
            Sign in instead
          </Button>
        </div>
      )}
      {!signIn && <Input label="Mobile number (for account recovery)" type="phone" value={phone} onValueChange={setPhone} />}
      <p className="hc-small hc-muted">
        {signIn
          ? 'We’ll email you a 6-digit code.'
          : 'We’ll email you a 6-digit code. Your mobile number is only used to text a backup code if you lose access to your email.'}
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

  /** Link to the other mode: "I have an account" on sign up, "New to HouseCue? Create an account" on sign in */
  const otherMode = signIn
    ? { label: 'New to HouseCue? Create an account', onClick: () => switchMode('signup') }
    : { label: 'I have an account', onClick: () => switchMode('signin') };

  const agreementLine = shortFlow && !signIn && (
    <p className="hc-small hc-muted hc-c02-agree">
      By continuing, you agree to the{' '}
      <a href={legalPdf.terms} target="_blank" rel="noopener noreferrer">Terms of Service</a>,{' '}
      <a href={legalPdf.terms} target="_blank" rel="noopener noreferrer">how disputes work</a> and the{' '}
      <a href={legalPdf.privacy} target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
    </p>
  );

  const inviteNote = invite && (
    <Banner tone="info" title={invite.signInTitle}>
      After you sign in, you can choose which account to open.
    </Banner>
  );

  const masked = email ?`${email[0]}•••${email.slice(email.indexOf('@'))}` : 'm•••@example.com';

  if (device === 'mobile') {
    return (
      <MobileShell
        className="hc-onb-mobile"
        header={{
          title: signIn ? 'Sign in' : 'Create account',
          // Homeowner onboarding shows the stepper in the body instead of the app bar's step and progress
          ...(signIn || shortFlow ? {} : { step: `1 of ${total}`, progress: 1 / total }),
          ...(stage === 'code' ? { onBack: () => setStage('email') } : {}),
        }}
        bottom={
          stage === 'email' ? (
            <BottomActions
              primaryLabel="Send code"
              onPrimary={sendCode}
              primaryDisabled={!canSend}
              secondaryLabel={otherMode.label}
              onSecondary={otherMode.onClick}
            />
          ) : (
            <BottomActions primaryLabel="Verify" onPrimary={verify} primaryDisabled={code.length < 6} />
          )
        }
      >
        {!signIn && shortFlow && <OnboardingStepper step={1} />}
        {stage === 'email' ? (
          <>
            {inviteNote}
            <h1 className="hc-h3">{title}</h1>
            <p className="hc-medium hc-muted">{intro}</p>
            {social}
            <p className="hc-small hc-muted hc-onb-divider">or</p>
            {emailFields}
            {agreementLine}
          </>
        ) : (
          <>
            <h1 className="hc-h3">Enter the 6-digit code</h1>
            <p className="hc-medium hc-muted">We sent it to {masked}. It expires in 10 minutes.</p>
            {codeBlock}
          </>
        )}
        <div className="hc-onb-spacer" />
        <TextLink onClick={recover}>Can’t sign in?</TextLink>
      </MobileShell>
    );
  }

  return (
    <WebShell layout="onboarding" className="hc-onb-web">
      <WebCard>
        {!signIn && (shortFlow ? <OnboardingStepper step={1} /> : <WebStepHeader step={1} total={total} />)}
        {stage === 'email' ? (
          <>
            {inviteNote}
            <h1 className="hc-h2">{title}</h1>
            <p className="hc-large hc-muted">{intro}</p>
            {social}
            <p className="hc-small hc-muted hc-onb-divider">or</p>
            {emailFields}
            <TextLink align="left" onClick={recover}>Can’t sign in?</TextLink>
            {agreementLine}
            <div className="hc-onb-actions">
              <Button fullWidth onClick={sendCode} disabled={!canSend}>
                Send code
              </Button>
              <TextLink underline={false} onClick={otherMode.onClick}>
                {otherMode.label}
              </TextLink>
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
              <TextLink underline={false} onClick={recover}>Can’t sign in?</TextLink>
            </div>
          </>
        )}
      </WebCard>
    </WebShell>
  );
}
