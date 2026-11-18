import { useEffect, useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { OptionCard } from '../../../components/OptionCard/OptionCard';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { useConnectFail } from '../../prototype/connectFail';
import { AccountConfirmDialog } from '../../shells/AccountConfirmDialog';
import { ConnectFailed } from '../../shells/ConnectFailed';
import { MobileShell } from '../../shells/MobileShell';
import { useSetupFlow } from '../../shells/SetupFlow';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C44-email-import-setup.css';

const PROVIDERS = [
  { id: 'google', title: 'Google (Gmail)', short: 'Google' },
  { id: 'microsoft', title: 'Microsoft (Outlook, Hotmail)', short: 'Microsoft' },
  { id: 'other', title: 'Other provider', short: 'your provider' },
  // Review change: a way to skip linking email
  { id: 'none', title: 'Don’t link my email', short: '', description: 'Add receipts and warranties by hand instead' },
] as { id: string; title: string; short: string; description?: string }[];

/**
 * C44 Email import setup — Figma mobile 215:13400 (batch 211:38860), web 215:16751 (batch 211:38861). J1 Onboarding step 20.
 * Review change: the "Yahoo · Coming soon" option is removed (mobile and web).
 * Review change: in the setup flow (opened from the C08 checklist) the provider connects in place instead of moving on to
 * the next onboarding step: "Connect <provider>", a short loading state, then "Connected" with what we'll search and
 * Disconnect. Picking another provider shows Connect again. Connecting counts as an edit for the step's Save. Mobile gets
 * the button in the content there (the setup flow's Cancel / Save replace the bottom actions). Same as C43 Calendar.
 * Review change: a fourth option, "Don't link my email", skips linking: no Connect button, a note says nothing will be
 * linked, and Continue reads "Continue without email" outside the setup flow.
 * Review change: Connect (setup flow) and Continue (journey) first ask you to confirm the account (AccountConfirmDialog:
 * your account or another one, what HouseCue sees and never sees, Continue). The connected panel shows which account.
 * Review change: if connecting fails (prototype: "Connections fail" in the shortcuts panel), the ConnectFailed panel
 * shows instead: why (permission not given), Try again, Use another account, and Don't link my email.
 */
export default function EmailImportSetup(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [provider, setProvider] = useState('google');
  const current = PROVIDERS.find((p) => p.id === provider)!;
  const { fromSetup } = useSetupFlow();
  const [connected, setConnected] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  // Review change: "Connections fail" (prototype shortcuts panel) makes connecting end in the failure panel
  const fail = useConnectFail();
  const [failedFor, setFailedFor] = useState<string | null>(null);
  useEffect(() => {
    if (!connecting) return;
    const t = setTimeout(() => {
      if (fail) setFailedFor(provider);
      else setConnected(provider);
      setConnecting(false);
    }, 900);
    return () => clearTimeout(t);
  }, [connecting, provider, fail]);

  // Confirm the account first; then connect here (setup flow) or go on to the next journey step
  const [signingIn, setSigningIn] = useState<'mine' | 'other' | null>(null);
  const [account, setAccount] = useState('');
  const signIn = () => setSigningIn('mine');
  const providerName = current.id === 'other' ? 'email' : current.short;
  const signInDialog = signingIn && (
    <AccountConfirmDialog
      provider={providerName}
      service="email import"
      sees="Receipts, warranties, invoices, quotes and service contracts"
      never="Any other email. We never send email."
      initialChoice={signingIn}
      onConfirm={(email) => {
        setSigningIn(null);
        setAccount(email);
        setFailedFor(null);
        if (fromSetup) setConnecting(true);
        else flow.goNext();
      }}
      onCancel={() => setSigningIn(null)}
    />
  );

  const connectLabel = current.id === 'other' ? 'Connect your email' : `Connect ${current.short}`;
  const skip = provider === 'none';
  const connectBlock = skip ? (
    // Don't link my email: nothing to connect; picking it counts as an edit, so the step can be saved as is
    <p className="hc-small hc-muted hc-c44-skip" role="status">
      Nothing will be linked. Upload receipts and warranties yourself in Documents, or link an email later in Settings.
    </p>
  ) : connected === provider ? (
      <div className="hc-c44-connected" role="status">
        <StatusPill label="Connected" tone="success" />
        <p className="hc-medium">
          We’ll look for receipts and warranties in <strong>{account || (current.id === 'other' ? 'your email' : `your ${current.short} email`)}</strong>.
        </p>
        <Button variant="tertiary" size="small" onClick={() => setConnected(null)} data-setup-edit>
          Disconnect
        </Button>
      </div>
    ) : failedFor === provider && !connecting ? (
      <ConnectFailed
        reason={`HouseCue didn’t get permission to search your ${providerName === 'email' ? 'email' : `${providerName} email`}, so nothing was linked. Try again and allow access to receipts and warranties.`}
        onRetry={() => setSigningIn('mine')}
        onOtherAccount={() => setSigningIn('other')}
        fallbackLabel="Don’t link my email"
        onFallback={() => {
          setFailedFor(null);
          setProvider('none');
        }}
      />
    ) : (
      <div>
        <Button onClick={signIn} loading={connecting} fullWidth={device === 'mobile'}>
          {connectLabel}
        </Button>
      </div>
    );

  const card = (p: (typeof PROVIDERS)[number]) => (
    <OptionCard key={p.id} title={p.title} description={p.description} selected={provider === p.id} onClick={() => setProvider(p.id)} />
  );

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Email import' }} bottom={<BottomActions primaryLabel={skip ? 'Continue without email' : `Continue with ${current.short}`} onPrimary={skip ? flow.goNext : signIn} />}>
        <div className="hc-c44-content">
          <h1 className="hc-h3">Find receipts and warranties in your email</h1>
          <Banner tone="info" title="Read-only">
            We search only for receipts, warranties, invoices, quotes and service contracts. We never send email or read anything else.
          </Banner>
          <div className="hc-c44-content" role="radiogroup" aria-label="Email provider">
            {card(PROVIDERS[0])}
            {card(PROVIDERS[1])}
            {card(PROVIDERS[2])}
            {card(PROVIDERS[3])}
          </div>
          {fromSetup && connectBlock}
        </div>
        {signInDialog}
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
              {card(PROVIDERS[2])}
            {card(PROVIDERS[3])}
            </div>
            {/* Setup flow: connect here; otherwise the original journey step (Continue → next step) */}
            {fromSetup ? (
              connectBlock
            ) : (
              <div>
                <Button onClick={skip ? flow.goNext : signIn}>{skip ? 'Continue without email' : 'Continue'}</Button>
              </div>
            )}
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
      {signInDialog}
    </WebShell>
  );
}
