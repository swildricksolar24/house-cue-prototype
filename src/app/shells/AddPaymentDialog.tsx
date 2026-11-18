import { useState } from 'react';
import { Checkbox } from '../../components/Checkbox/Checkbox';
import { OptionCard } from '../../components/OptionCard/OptionCard';
import { FormDialog, type FormDialogField } from './EditDialog';
import './AddPaymentDialog.css';

export type NewPaymentMethod = {
  kind: 'card' | 'bank';
  /** e.g. "Visa •• 1111" or "Checking •• 6789" */
  title: string;
  /** e.g. "Expires 08/29" or "Bank account · routing •• 0021" */
  detail: string;
  makeDefault: boolean;
};

const digits = (v: string) => v.replace(/\D/g, '');

/** Luhn check, so a typo in the card number is caught */
function luhn(num: string) {
  let sum = 0;
  let double = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = Number(num[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

function brand(num: string) {
  if (/^4/.test(num)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(num)) return 'Mastercard';
  if (/^3[47]/.test(num)) return 'American Express';
  if (/^6/.test(num)) return 'Discover';
  return 'Card';
}

const CARD_FIELDS: FormDialogField[] = [
  { key: 'name', label: 'Name on card', field: { kind: 'text', placeholder: 'e.g. Marty McFly' } },
  {
    key: 'number',
    label: 'Card number',
    field: { kind: 'text', placeholder: '1234 5678 9012 3456' },
    validate: (v) => {
      const n = digits(v);
      return n.length >= 13 && n.length <= 19 && luhn(n) ? undefined : 'Enter a valid card number.';
    },
  },
  {
    key: 'expiry',
    label: 'Expiry (MM/YY)',
    field: { kind: 'text', placeholder: 'MM/YY' },
    validate: (v) => {
      const m = /^(\d{1,2})\s*\/\s*(\d{2})$/.exec(v.trim());
      if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) return 'Enter a date like 08/29.';
      const now = new Date();
      const end = new Date(2000 + Number(m[2]), Number(m[1]), 1); // first day after the expiry month
      return end > now ? undefined : 'This card has expired.';
    },
  },
  {
    key: 'cvc',
    label: 'Security code',
    field: { kind: 'text', placeholder: '3 or 4 digits' },
    validate: (v) => (/^\d{3,4}$/.test(v.trim()) ? undefined : 'Enter the 3 or 4 digits on the card.'),
  },
  {
    key: 'zip',
    label: 'Billing ZIP code',
    field: { kind: 'text', placeholder: '85016' },
    validate: (v) => (/^\d{5}$/.test(v.trim()) ? undefined : 'Enter a 5-digit ZIP code.'),
  },
];

const BANK_FIELDS: FormDialogField[] = [
  { key: 'holder', label: 'Account holder name', field: { kind: 'text', placeholder: 'e.g. Marty McFly' } },
  { key: 'type', label: 'Account type', field: { kind: 'select', options: ['Checking', 'Savings'] } },
  {
    key: 'routing',
    label: 'Routing number',
    field: { kind: 'text', placeholder: '9 digits' },
    validate: (v) => (/^\d{9}$/.test(v.replace(/\s/g, '')) ? undefined : 'Enter the 9-digit routing number.'),
  },
  {
    key: 'account',
    label: 'Account number',
    field: { kind: 'text', placeholder: '4 to 17 digits' },
    validate: (v) => (/^\d{4,17}$/.test(v.replace(/\s/g, '')) ? undefined : 'Enter an account number of 4 to 17 digits.'),
  },
];

/**
 * Review change: "Add a card or bank account" on C30 Payments (it had no action, and Figma has no add-card screen).
 * Card (name, number, expiry, security code, billing ZIP) or Bank account (holder, checking / savings, routing, account
 * number), each checked for format with the usual red errors; "Make this the default for <home>". Web dialog / mobile
 * sheet (FormDialog). Prototype only: nothing is charged, sent or stored; only the last 4 digits are shown afterwards.
 */
export function AddPaymentDialog({
  homeAddress,
  onAdd,
  onCancel,
}: {
  homeAddress: string;
  onAdd: (method: NewPaymentMethod) => void;
  onCancel: () => void;
}) {
  const [kind, setKind] = useState<'card' | 'bank'>('card');
  const [makeDefault, setMakeDefault] = useState(true);

  return (
    <FormDialog
      title="Add a card or bank account"
      description="Used for holds and payments on this home’s jobs. You’re only charged when you approve a job."
      fields={kind === 'card' ? CARD_FIELDS : BANK_FIELDS}
      values={{ type: 'Checking' }}
      submitLabel={kind === 'card' ? 'Add card' : 'Add bank account'}
      onSave={(v) => {
        if (kind === 'card') {
          const n = digits(v.number);
          const [mm, yy] = v.expiry.split('/').map((s) => s.trim());
          onAdd({ kind, title: `${brand(n)} •• ${n.slice(-4)}`, detail: `Expires ${mm.padStart(2, '0')}/${yy}`, makeDefault });
        } else {
          const a = v.account.replace(/\s/g, '');
          onAdd({ kind, title: `${v.type} •• ${a.slice(-4)}`, detail: `Bank account · routing •• ${digits(v.routing).slice(-4)}`, makeDefault });
        }
      }}
      onCancel={onCancel}
      after={
        <Checkbox
          label={`Make this the default for ${homeAddress}`}
          checked={makeDefault}
          onChange={(e) => setMakeDefault(e.target.checked)}
          className="hc-add-payment__default"
        />
      }
    >
      <div className="hc-add-payment__kinds" role="radiogroup" aria-label="Payment method type">
        <OptionCard title="Card" description="Debit or credit" selected={kind === 'card'} onClick={() => setKind('card')} />
        <OptionCard title="Bank account" description="Checking or savings" selected={kind === 'bank'} onClick={() => setKind('bank')} />
      </div>
    </FormDialog>
  );
}
