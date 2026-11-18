import { useEffect, useState } from 'react';
import { Checkbox } from '../../../components/Checkbox/Checkbox';
import { OptionCard } from '../../../components/OptionCard/OptionCard';
import { useConnectFail } from '../../prototype/connectFail';
import { AccountConfirmDialog } from '../../shells/AccountConfirmDialog';
import { FormDialog } from '../../shells/EditDialog';

/**
 * Review change: C24 Documents' "Import from email" runs here in dialogs instead of opening C44:
 * 1. Import from email: provider (Google / Microsoft / Other) + what we search and never read → Continue
 * 2. Confirm your <provider> account (AccountConfirmDialog)
 * 3. Searching your email… (brief), or Couldn't connect when "Connections fail" is on in the shortcuts panel
 * 4. Found N documents: a ticked list (untick to skip) → Add N documents puts them at the top of the vault
 * Invented sample finds; nothing is read from any real mailbox.
 * Not a screen: the registry only picks up files named <CODE>-<slug>.tsx.
 */

const PROVIDERS = [
  { id: 'google', title: 'Google (Gmail)', short: 'Google' },
  { id: 'microsoft', title: 'Microsoft (Outlook, Hotmail)', short: 'Microsoft' },
  { id: 'other', title: 'Other provider', short: 'email' },
];

export type FoundDocument = { id: string; title: string; type: string; linked: string; detail: string };

const FOUND: FoundDocument[] = [
  { id: 'dishwasher', title: 'Dishwasher receipt', type: 'Receipt', linked: 'Whole home', detail: 'Desert Appliance Co. · $649 · Oct 2, 2026' },
  { id: 'thermostat', title: 'Thermostat order confirmation', type: 'Receipt', linked: 'Thermostat · Living room', detail: 'Online order · $129 · Aug 18, 2026' },
  { id: 'pool-warranty', title: 'Pool pump extended warranty', type: 'Warranty', linked: 'Pool pump · Pentair', detail: 'Ends Apr 2029' },
];

type Stage = 'provider' | 'account' | 'searching' | 'found' | 'failed';

export function EmailImportDialog({ onAdd, onClose }: { onAdd: (docs: FoundDocument[], account: string) => void; onClose: () => void }) {
  const fail = useConnectFail();
  const [stage, setStage] = useState<Stage>('provider');
  const [provider, setProvider] = useState(PROVIDERS[0]);
  const [account, setAccount] = useState('');
  const [picked, setPicked] = useState<string[]>(FOUND.map((f) => f.id));

  useEffect(() => {
    if (stage !== 'searching') return;
    const t = setTimeout(() => setStage(fail ? 'failed' : 'found'), 1200);
    return () => clearTimeout(t);
  }, [stage, fail]);

  if (stage === 'account') {
    return (
      <AccountConfirmDialog
        provider={provider.short}
        service="email import"
        sees="Receipts, warranties, invoices, quotes and service contracts"
        never="Any other email. We never send email."
        onConfirm={(email) => {
          setAccount(email);
          setStage('searching');
        }}
        onCancel={onClose}
      />
    );
  }

  if (stage === 'searching') {
    return (
      <FormDialog
        key="searching"
        title="Searching your email…"
        description={`Looking for receipts, warranties and manuals in ${account}. This takes a moment.`}
        fields={[]}
        values={{}}
        submitLabel="Searching"
        busy
        countsAsEdit={false}
        onSave={() => {}}
        onCancel={onClose}
      />
    );
  }

  if (stage === 'failed') {
    return (
      <FormDialog
        key="failed"
        title="Couldn’t connect"
        description={`HouseCue didn’t get permission to search ${account}, so nothing was imported. Try again and allow access to receipts and warranties.`}
        fields={[]}
        values={{}}
        submitLabel="Try again"
        cancelLabel="Close"
        countsAsEdit={false}
        onSave={() => setStage('account')}
        onCancel={onClose}
      />
    );
  }

  if (stage === 'found') {
    const chosen = FOUND.filter((f) => picked.includes(f.id));
    return (
      <FormDialog
        key="found"
        title={`Found ${FOUND.length} documents`}
        description={`In ${account}. Untick anything you don’t want in your vault.`}
        fields={[]}
        values={{}}
        submitLabel={chosen.length ? `Add ${chosen.length} ${chosen.length === 1 ? 'document' : 'documents'}` : 'Add documents'}
        cancelLabel="Not now"
        beforeSave={() => chosen.length > 0}
        onSave={() => onAdd(chosen, account)}
        onCancel={onClose}
      >
        <ul className="hc-c24-found">
          {FOUND.map((f) => (
            <li key={f.id}>
              <Checkbox
                label={
                  <span className="hc-c24-found__text">
                    <span className="hc-medium-semibold">{f.title}</span>
                    <span className="hc-small hc-muted">
                      {f.type} · {f.linked} · {f.detail}
                    </span>
                  </span>
                }
                checked={picked.includes(f.id)}
                onChange={(e) => setPicked((p) => (e.target.checked ? [...p, f.id] : p.filter((id) => id !== f.id)))}
              />
            </li>
          ))}
        </ul>
        {chosen.length === 0 && (
          <p className="hc-input__error" role="alert">
            Tick at least one document to add.
          </p>
        )}
      </FormDialog>
    );
  }

  return (
    <FormDialog
      key="provider"
      title="Import from email"
      description="We find receipts, warranties and manuals in your email and file them here, linked to your systems and devices."
      fields={[]}
      values={{}}
      submitLabel="Continue"
      countsAsEdit={false}
      onSave={() => setStage('account')}
      onCancel={onClose}
      after={
        <dl className="hc-c24-import__kv">
          <div>
            <dt className="hc-small hc-muted">Searched</dt>
            <dd className="hc-medium">Receipts, warranties, invoices, quotes, contracts</dd>
          </div>
          <div>
            <dt className="hc-small hc-muted">Never read</dt>
            <dd className="hc-medium">Everything else. We never send email.</dd>
          </div>
        </dl>
      }
    >
      <div className="hc-c24-import__providers" role="radiogroup" aria-label="Email provider">
        {PROVIDERS.map((p) => (
          <OptionCard key={p.id} title={p.title} selected={provider.id === p.id} onClick={() => setProvider(p)} />
        ))}
      </div>
    </FormDialog>
  );
}
