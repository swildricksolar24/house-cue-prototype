import { useState } from 'react';
import { OptionCard } from '../../components/OptionCard/OptionCard';
import { homeowner } from '../data/sample';
import { FormDialog } from './EditDialog';
import './AccountConfirmDialog.css';

export type AccountConfirmDialogProps = {
  /** Who you sign in with: "Google", "Microsoft", "Amazon", "Apple"; or "email" for another provider */
  provider: string;
  /** What's being connected, e.g. "Google Calendar" */
  service: string;
  /** What HouseCue will be able to see */
  sees: string;
  /** What it never sees */
  never: string;
  /** Start with "Use another account" picked (from a failed connection's "Use another account") */
  initialChoice?: 'mine' | 'other';
  onConfirm: (email: string) => void;
  onCancel: () => void;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Review change: "Sign in with <provider>" asks you to confirm which account to connect before anything is linked.
 * Your HouseCue account's name and email are picked; "Use another account" asks for an email and its password (Show /
 * Hide; the prototype doesn't check or keep it). It lists what
 * HouseCue will see and never see, then Continue connects. No provider logos or branding: it's HouseCue's own step,
 * the provider's sign-in itself is out of the prototype's scope.
 * Used by C43 Calendar, C44 Email import and C46 Connected devices. Continue counts as an edit for the setup step's Save.
 */
export function AccountConfirmDialog({ provider, service, sees, never, initialChoice = 'mine', onConfirm, onCancel }: AccountConfirmDialogProps) {
  const [choice, setChoice] = useState<'mine' | 'other'>(initialChoice);
  const name = `${homeowner.firstName} ${homeowner.lastName}`;

  return (
    <FormDialog
      title={`Confirm your ${provider} account`}
      description={`Choose the account to connect to ${service}.`}
      fields={
        choice === 'other'
          ? [
              {
                key: 'email',
                label: `${provider === 'email' ? 'Email' : provider} account email`,
                field: { kind: 'email', placeholder: 'name@example.com' },
                validate: (v) => (EMAIL.test(v) ? undefined : 'Enter an email like name@example.com.'),
              },
              // Review change: another account also needs its password (prototype: nothing is checked or stored)
              {
                key: 'password',
                label: 'Password',
                field: { kind: 'password' },
              },
            ]
          : []
      }
      values={{ email: '', password: '' }}
      submitLabel="Continue"
      onSave={(v) => onConfirm(choice === 'mine' ? homeowner.email : v.email)}
      onCancel={onCancel}
      after={
        <dl className="hc-account-confirm__kv">
          <div>
            <dt className="hc-small hc-muted">HouseCue will see</dt>
            <dd className="hc-medium">{sees}</dd>
          </div>
          <div>
            <dt className="hc-small hc-muted">Never</dt>
            <dd className="hc-medium">{never}</dd>
          </div>
        </dl>
      }
    >
      <div className="hc-account-confirm__options" role="radiogroup" aria-label="Account">
        <OptionCard icon="account" title={name} description={homeowner.email} selected={choice === 'mine'} onClick={() => setChoice('mine')} />
        <OptionCard title="Use another account" selected={choice === 'other'} onClick={() => setChoice('other')} />
      </div>
    </FormDialog>
  );
}
