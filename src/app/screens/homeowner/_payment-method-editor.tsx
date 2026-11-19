import { useState, type ReactNode } from 'react';
import { Button } from '../../../components/Button/Button';
import { Icon, type IconName } from '../../../components/Icon/Icon';
import { Input } from '../../../components/Input/Input';
import { StatusPill, type StatusTone } from '../../../components/StatusPill/StatusPill';
import './_payment-method-editor.css';

/** A card on file (invented sample cards; the prototype never stores a real card number, only the last 4 digits) */
export type SavedCard = { id: string; brand: string; last4: string; exp: string; name: string; zip: string };

export const SAMPLE_CARDS: SavedCard[] = [
  { id: 'visa', brand: 'Visa', last4: '4242', exp: '08/28', name: 'Biff Tannen', zip: '85004' },
  { id: 'amex', brand: 'Amex', last4: '1005', exp: '03/27', name: 'Biff Tannen', zip: '85004' },
  { id: 'mc', brand: 'Mastercard', last4: '8810', exp: '12/26', name: 'Mesa Verde Holdings', zip: '85711' },
];

/** Review change: the homeowner's cards (same as the Payments page, C30), for the combined Billing page (C29) */
export const HOMEOWNER_CARDS: SavedCard[] = [
  { id: 'visa', brand: 'Visa', last4: '4242', exp: '08/28', name: 'Marty McFly', zip: '85004' },
  { id: 'mc', brand: 'Mastercard', last4: '5100', exp: '02/27', name: 'Marty McFly', zip: '85004' },
  { id: 'amex', brand: 'Amex', last4: '3007', exp: '12/26', name: 'Marty McFly', zip: '85004' },
];

/** What Edit on a card can change (the number can't: add a new card for that) */
export type CardDetails = { name: string; exp: string; zip: string };

/**
 * Review change: Edit on a card on file opens this inside the card row: name on card, expiry (MM/YY), billing ZIP,
 * each checked, with Cancel and Save. The card number can't be changed.
 */
export function CardEditForm({ details, onSave, onCancel }: { details: CardDetails; onSave: (d: CardDetails) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState(details);
  const [errors, setErrors] = useState<Partial<Record<keyof CardDetails, string>>>({});
  const field = (key: keyof CardDetails) => ({
    value: draft[key],
    error: errors[key],
    onValueChange: (v: string) => {
      setDraft((d) => ({ ...d, [key]: v }));
      if (errors[key]) setErrors(({ [key]: _, ...rest }) => rest);
    },
  });
  const save = () => {
    const found: Partial<Record<keyof CardDetails, string>> = {};
    if (!draft.name.trim()) found.name = 'Enter the name on the card.';
    const m = draft.exp.trim().match(/^(\d{2})\s*\/\s*(\d{2})$/);
    if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) found.exp = 'Use MM/YY.';
    if (!/^\d{5}$/.test(draft.zip.trim())) found.zip = '5-digit ZIP.';
    if (Object.keys(found).length) return setErrors(found);
    onSave({ name: draft.name.trim(), exp: draft.exp.replace(/\s/g, ''), zip: draft.zip.trim() });
  };
  return (
    <div className="hc-pay-card__edit" role="group" aria-label="Edit card">
      <Input label="Name on card" {...field('name')} />
      <div className="hc-pay-editor__row hc-pay-editor__row--two">
        <Input label="Expiry" placeholder="MM/YY" {...field('exp')} />
        <Input label="Billing ZIP" inputMode="numeric" {...field('zip')} />
      </div>
      <p className="hc-small hc-muted">To use a different card number, add a new card.</p>
      <div className="hc-pay-editor__actions">
        <Button size="small" variant="tertiary" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="small" variant="secondary" onClick={save}>
          Save card
        </Button>
      </div>
    </div>
  );
}

export const cardLabel = (c: SavedCard) => `${c.brand} ending ${c.last4}`;

/** "12/26" expires within ~2 months of the prototype's date (Nov 2026) */
export const expiresSoon = (exp: string) => {
  const [m, y] = exp.split('/').map(Number);
  const months = (2000 + y) * 12 + m - (2026 * 12 + 11);
  return months <= 1;
};

/**
 * Review change: one card on file as a choice: radio, card (or bank) icon, name with tags, a detail line, and Remove
 * on the right when given. Shared by this editor (landlord Billing) and the homeowner's Payments page (C30).
 */
export function CardChoice({
  title,
  detail,
  tags = [],
  icon = 'credit-card',
  selected,
  onSelect,
  onRemove,
  onEdit,
  editForm,
}: {
  title: string;
  detail: ReactNode;
  tags?: { label: string; tone: StatusTone }[];
  icon?: IconName;
  selected: boolean;
  onSelect: () => void;
  onRemove?: () => void;
  /** Review change: an Edit link on the right; editForm (when given) shows inside the row while editing */
  onEdit?: () => void;
  editForm?: ReactNode;
}) {
  return (
    <div className={['hc-pay-card', selected && 'hc-pay-card--selected'].filter(Boolean).join(' ')}>
      <div className="hc-pay-card__row">
      <button type="button" role="radio" aria-checked={selected} className="hc-pay-card__pick" onClick={onSelect}>
        <span className="hc-pay-card__radio" aria-hidden />
        <span className="hc-pay-card__icon" aria-hidden>
          <Icon name={icon} size={20} />
        </span>
        <span className="hc-pay-card__text">
          <span className="hc-medium-semibold">
            {title}
            {tags.map((t) => (
              <StatusPill key={t.label} label={t.label} tone={t.tone} />
            ))}
          </span>
          <span className="hc-small hc-muted">{detail}</span>
        </span>
      </button>
      <span className="hc-pay-card__links">
        {onEdit && !editForm && (
          <button type="button" className="hc-pay-card__edit-link" onClick={onEdit}>
            Edit
          </button>
        )}
        {onRemove && !editForm && (
          <button type="button" className="hc-pay-card__remove" onClick={onRemove}>
            Remove
          </button>
        )}
      </span>
      </div>
      {editForm}
    </div>
  );
}

const brandOf = (digits: string) => (digits.startsWith('4') ? 'Visa' : digits.startsWith('3') ? 'Amex' : digits.startsWith('5') ? 'Mastercard' : 'Card');

type NewCard = { name: string; number: string; exp: string; cvc: string; zip: string };
const EMPTY: NewCard = { name: '', number: '', exp: '', cvc: '', zip: '' };

function checkNewCard(c: NewCard): Partial<Record<keyof NewCard, string>> {
  const errors: Partial<Record<keyof NewCard, string>> = {};
  const digits = c.number.replace(/\D/g, '');
  if (!c.name.trim()) errors.name = 'Enter the name on the card.';
  if (digits.length < 15 || digits.length > 16) errors.number = 'Enter a 15 or 16 digit card number.';
  const m = c.exp.match(/^(\d{2})\s*\/\s*(\d{2})$/);
  if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) errors.exp = 'Use MM/YY.';
  if (!/^\d{3,4}$/.test(c.cvc)) errors.cvc = '3 or 4 digits.';
  if (!/^\d{5}$/.test(c.zip)) errors.zip = '5-digit ZIP.';
  return errors;
}

/**
 * Review change: Edit on the Billing page's Payment method opens this inside the Payment card (was a plain dropdown).
 * Every card on file with its brand, last 4, expiry and name on the card (Expires soon / Default tags); pick one to
 * charge, remove the others, or add a new card (name, number, expiry, security code, billing ZIP; only the last 4
 * digits are kept). Save makes the chosen card the payment method; Cancel drops every change. Prototype only.
 */
export function PaymentMethodEditor({
  cards,
  currentId,
  nextCharge,
  onSave,
  onCancel,
}: {
  cards: SavedCard[];
  currentId: string;
  /** e.g. "$27.99 on Dec 1" */
  nextCharge: string;
  onSave: (cards: SavedCard[], currentId: string) => void;
  onCancel: () => void;
}) {
  const [list, setList] = useState(cards);
  const [chosen, setChosen] = useState(currentId);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<NewCard>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof NewCard, string>>>({});
  // Review change: the card whose Edit form is open
  const [editingId, setEditingId] = useState<string | null>(null);

  const field = (key: keyof NewCard) => ({
    value: draft[key],
    error: errors[key],
    onValueChange: (v: string) => {
      setDraft((d) => ({ ...d, [key]: v }));
      if (errors[key]) setErrors(({ [key]: _, ...rest }) => rest);
    },
  });

  const addCard = () => {
    const found = checkNewCard(draft);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    const digits = draft.number.replace(/\D/g, '');
    const card: SavedCard = {
      id: `new-${Date.now()}`,
      brand: brandOf(digits),
      last4: digits.slice(-4),
      exp: draft.exp.replace(/\s/g, ''),
      name: draft.name.trim(),
      zip: draft.zip.trim(),
    };
    setList((l) => [...l, card]);
    setChosen(card.id);
    setDraft(EMPTY);
    setAdding(false);
  };

  return (
    <div className="hc-pay-editor" role="group" aria-label="Payment method">
      <div className="hc-pay-editor__head">
        <span className="hc-medium-semibold">Payment method</span>
        <span className="hc-small hc-muted">Choose the card for {nextCharge}. Changing cards doesn’t change your plan.</span>
      </div>

      <div className="hc-pay-editor__cards" role="radiogroup" aria-label="Cards on file">
        {list.map((c) => (
          <CardChoice
            key={c.id}
            title={cardLabel(c)}
            detail={`Expires ${c.exp} · ${c.name}`}
            tags={[
              ...(c.id === currentId ? [{ label: 'Current', tone: 'neutral' as const }] : []),
              ...(expiresSoon(c.exp) ? [{ label: 'Expires soon', tone: 'warning' as const }] : []),
            ]}
            selected={c.id === chosen}
            onSelect={() => setChosen(c.id)}
            onRemove={c.id !== currentId && c.id !== chosen ? () => setList((l) => l.filter((x) => x.id !== c.id)) : undefined}
            onEdit={() => setEditingId(c.id)}
            editForm={
              editingId === c.id && (
                <CardEditForm
                  details={{ name: c.name, exp: c.exp, zip: c.zip }}
                  onSave={(d) => {
                    setList((l) => l.map((x) => (x.id === c.id ? { ...x, ...d } : x)));
                    setEditingId(null);
                  }}
                  onCancel={() => setEditingId(null)}
                />
              )
            }
          />
        ))}
      </div>

      {adding ? (
        <div className="hc-pay-editor__new" role="group" aria-label="Add a card">
          <span className="hc-medium-semibold">Add a card</span>
          <Input label="Name on card" {...field('name')} />
          <Input label="Card number" inputMode="numeric" autoComplete="off" placeholder="1234 5678 9012 3456" {...field('number')} />
          <div className="hc-pay-editor__row">
            <Input label="Expiry" placeholder="MM/YY" {...field('exp')} />
            <Input label="Security code" inputMode="numeric" autoComplete="off" placeholder="CVC" {...field('cvc')} />
            <Input label="Billing ZIP" inputMode="numeric" {...field('zip')} />
          </div>
          <p className="hc-small hc-muted">Only the last 4 digits are kept. Prototype only: nothing is charged.</p>
          <div className="hc-pay-editor__actions">
            <Button
              size="small"
              variant="tertiary"
              onClick={() => {
                setAdding(false);
                setDraft(EMPTY);
                setErrors({});
              }}
            >
              Cancel
            </Button>
            <Button size="small" variant="secondary" onClick={addCard}>
              Add card
            </Button>
          </div>
        </div>
      ) : (
        <Button size="small" variant="secondary" leadingIcon="plus" className="hc-pay-editor__add" onClick={() => setAdding(true)}>
          Add a new card
        </Button>
      )}

      <div className="hc-pay-editor__actions hc-pay-editor__actions--main">
        <Button size="small" variant="tertiary" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="small" onClick={() => onSave(list, chosen)} disabled={adding || editingId !== null}>
          Save
        </Button>
      </div>
    </div>
  );
}
