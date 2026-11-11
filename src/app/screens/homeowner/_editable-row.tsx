import { useState, type KeyboardEvent } from 'react';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { Input } from '../../../components/Input/Input';
import { Select } from '../../../components/Select/Select';
import './_editable-row.css';

type Base = {
  label: string;
  /** Value shown when not editing (e.g. a masked email) */
  display: string;
  /** Value the editor starts with */
  value: string;
  actionLabel?: string;
  onSave: (value: string) => void;
};
type TextRow = Base & { kind: 'text' | 'email' | 'phone'; validate?: (v: string) => boolean };
type SelectRow = Base & { kind: 'select'; options: { value: string; label: string }[] };
export type EditableRowProps = TextRow | SelectRow;

/**
 * A DetailRow whose Edit opens an inline editor (Input or Select) with Save and Cancel.
 * Enter saves, Escape cancels. Save stays disabled until the value is valid. Prototype only: nothing is sent.
 * Not a screen: the registry ignores files that don't start with a screen code.
 */
export function EditableRow(props: EditableRowProps) {
  const { label, display, value, actionLabel = 'Edit', onSave } = props;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editing) {
    return (
      <DetailRow
        label={label}
        value={display}
        actionLabel={actionLabel}
        onAction={() => {
          setDraft(value);
          setEditing(true);
        }}
      />
    );
  }

  const valid = props.kind === 'select' ? true : draft.trim() !== '' && (props.validate?.(draft) ?? true);
  const save = () => {
    if (!valid) return;
    onSave(draft.trim());
    setEditing(false);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') setEditing(false);
  };

  return (
    <div className="hc-editable-row">
      {props.kind === 'select' ? (
        <Select label={label} options={props.options} value={draft} onValueChange={setDraft} onKeyDown={onKeyDown} autoFocus />
      ) : (
        <Input
          label={label}
          type={props.kind}
          value={draft}
          onValueChange={setDraft}
          onKeyDown={onKeyDown}
          error={!valid && draft !== '' ? `Enter a valid ${label.toLowerCase()}` : undefined}
          autoFocus
        />
      )}
      <div className="hc-editable-row__actions">
        <Button size="small" variant="tertiary" onClick={() => setEditing(false)}>
          Cancel
        </Button>
        <Button size="small" onClick={save} disabled={!valid}>
          Save
        </Button>
      </div>
    </div>
  );
}

export const isEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v.trim());
export const isPhone = (v: string) => v.replace(/\D/g, '').length === 10;
export const maskEmail = (v: string) => (v.includes('@') ? `${v[0]}•••${v.slice(v.indexOf('@'))}` : v);
export const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, '');
  return d.length === 10 ? `(${d.slice(0, 3)}) •••-${d.slice(6)}` : v;
};
