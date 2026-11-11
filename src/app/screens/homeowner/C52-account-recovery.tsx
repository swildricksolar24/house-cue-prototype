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
import './C52-account-recovery.css';

type Fields = { name: string; address: string; payment: string; job: string; email: string };

/** C52 Account recovery request — Figma mobile 218:22171, web 218:23087 (J1 Settings & account step 3) */
export default function AccountRecovery(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [f, setF] = useState<Fields>({ name: '', address: '', payment: '', job: '', email: '' });
  const set = (k: keyof Fields) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  const fields = (
    <>
      <Input label="Full name" placeholder="As on your account" autoComplete="name" value={f.name} onValueChange={set('name')} />
      <Input label="Home address" placeholder="Street, city, ZIP" autoComplete="street-address" value={f.address} onValueChange={set('address')} />
      <Input label="Last payment" placeholder="Amount or last 4 card digits" value={f.payment} onValueChange={set('payment')} />
      <Input label="A recent job" placeholder="For example, AC repair in June" value={f.job} onValueChange={set('job')} />
      <Input label="New email to use" type="email" placeholder="you@example.com" value={f.email} onValueChange={set('email')} />
    </>
  );

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Recover your account' }} bottom={<BottomActions primaryLabel="Send request" onPrimary={flow.goNext} />}>
        <div className="hc-c52-form">
          <Banner tone="info" title="Lost your email and phone?">
            Tell us enough to prove it’s you. A person reviews it, usually within 1 business day.
          </Banner>
          {fields}
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell layout="onboarding" width="narrow">
      <div className="hc-c52-web">
        <header className="hc-c52-web__head">
          <h1 className="hc-h2">Recover your account</h1>
          <p className="hc-medium hc-muted">For when you can’t get an email code or a text-message code</p>
        </header>
        <form
          className="hc-c52-card"
          onSubmit={(e) => {
            e.preventDefault();
            flow.goNext();
          }}
        >
          {fields}
          <Button type="submit" className="hc-c52-card__submit">
            Send request
          </Button>
          <p className="hc-small hc-muted">Once verified, sign-in is restored and every other session is signed out.</p>
        </form>
      </div>
    </WebShell>
  );
}
