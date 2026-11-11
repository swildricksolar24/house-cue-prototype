import { useState } from 'react';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { CodeEntry } from '../../../components/CodeEntry/CodeEntry';
import { Input } from '../../../components/Input/Input';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './X10-account-deletion-request.css';

type AccountKind = 'homeowner' | 'pro';

/** X10 Account deletion request (public web page) — Figma mobile 218:22410, web 218:23470 (J1 Settings & account step 6) */
export default function AccountDeletionRequest(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [kind, setKind] = useState<AccountKind>('homeowner');
  const [contact, setContact] = useState('');
  const [code, setCode] = useState('');

  const chips = (
    <div className="hc-x10-chips" role="radiogroup" aria-label="Account type">
      {(
        [
          ['homeowner', 'Homeowner account'],
          ['pro', 'Pro account'],
        ] as const
      ).map(([key, label]) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={kind === key}
          className={['hc-x10-chip', kind === key && 'hc-x10-chip--selected'].filter(Boolean).join(' ')}
          onClick={() => setKind(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );

  const contactInput = (
    <Input label="Account email or phone" type="email" placeholder="you@example.com" value={contact} onValueChange={setContact} />
  );

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Delete an account' }} bottom={<BottomActions primaryLabel="Send code" onPrimary={flow.goNext} />}>
        <div className="hc-x10-content">
          <p className="hc-medium">For HouseCue homeowners and pros. Use this page if you don’t have the app.</p>
          {chips}
          {contactInput}
          <p className="hc-small hc-muted">We send a code to prove it’s your account.</p>
          <h2 className="hc-medium-semibold">We erase</h2>
          <p className="hc-small hc-muted">Personal data. Jobs, payments, disputes and compliance records are kept for legal reasons.</p>
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell layout="marketing" width="narrow">
      <div className="hc-x10-web">
        <header className="hc-x10-web__head">
          <h1 className="hc-h2">Delete a HouseCue account</h1>
          <p className="hc-medium hc-muted">For homeowners and pros. Linked from the app-store listings.</p>
        </header>
        <section className="hc-x10-card">
          {chips}
          {contactInput}
          <Button className="hc-x10-card__button" onClick={flow.goNext}>
            Send code
          </Button>
          <CodeEntry value={code} onValueChange={setCode} onComplete={flow.goNext} className="hc-x10-code" />
          <p className="hc-small hc-muted">
            We erase personal data. Job, payment, dispute and compliance records are kept for legal, fraud and tax reasons.
          </p>
        </section>
      </div>
    </WebShell>
  );
}
