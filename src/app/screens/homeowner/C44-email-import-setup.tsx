import { useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { OptionCard } from '../../../components/OptionCard/OptionCard';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C44-email-import-setup.css';

const PROVIDERS = [
  { id: 'google', title: 'Google (Gmail)', short: 'Google' },
  { id: 'microsoft', title: 'Microsoft (Outlook, Hotmail)', short: 'Microsoft' },
  { id: 'other', title: 'Other provider', short: 'your provider' },
];

/** C44 Email import setup — Figma mobile 215:13400 (batch 211:38860), web 215:16751 (batch 211:38861). J1 Onboarding step 20. */
export default function EmailImportSetup(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [provider, setProvider] = useState('google');
  const current = PROVIDERS.find((p) => p.id === provider)!;

  const card = (p: (typeof PROVIDERS)[number]) => (
    <OptionCard key={p.id} title={p.title} selected={provider === p.id} onClick={() => setProvider(p.id)} />
  );

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Email import' }} bottom={<BottomActions primaryLabel={`Continue with ${current.short}`} onPrimary={flow.goNext} />}>
        <div className="hc-c44-content">
          <h1 className="hc-h3">Find receipts and warranties in your email</h1>
          <Banner tone="info" title="Read-only">
            We search only for receipts, warranties, invoices, quotes and service contracts. We never send email or read anything else.
          </Banner>
          <div className="hc-c44-content" role="radiogroup" aria-label="Email provider">
            {card(PROVIDERS[0])}
            {card(PROVIDERS[1])}
            <OptionCard title="Yahoo" description="Coming soon" aria-disabled />
            {card(PROVIDERS[2])}
          </div>
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="home">
      <div className="hc-c44-web">
        <header className="hc-c44-web__head">
          <h1 className="hc-h2">Import from email</h1>
          <p className="hc-medium hc-muted">Files what we find into your document vault, linked to your items</p>
        </header>
        <div className="hc-c44-web__cols">
          <section className="hc-c44-card">
            <h2 className="hc-large-bold">Choose your email provider</h2>
            <div className="hc-c44-options" role="radiogroup" aria-label="Email provider">
              {card(PROVIDERS[0])}
              {card(PROVIDERS[1])}
              <div className="hc-c44-soon">
                <span className="hc-medium">Yahoo</span>
                <StatusPill label="Coming soon" tone="neutral" />
              </div>
              {card(PROVIDERS[2])}
            </div>
            <div>
              <Button onClick={flow.goNext}>Continue</Button>
            </div>
          </section>
          <section className="hc-c44-card">
            <h2 className="hc-large-bold">What we look for</h2>
            <dl className="hc-c44-kv">
              <div>
                <dt className="hc-medium hc-muted">Searched</dt>
                <dd className="hc-medium-semibold">Receipts, warranties, invoices, quotes, contracts</dd>
              </div>
              <div>
                <dt className="hc-medium hc-muted">Never read</dt>
                <dd className="hc-medium-semibold">Everything else</dd>
              </div>
              <div>
                <dt className="hc-medium hc-muted">Never used for</dt>
                <dd className="hc-medium-semibold">Data licensing</dd>
              </div>
            </dl>
            <p className="hc-small hc-muted">Turn it off anytime in Settings.</p>
          </section>
        </div>
      </div>
    </WebShell>
  );
}
