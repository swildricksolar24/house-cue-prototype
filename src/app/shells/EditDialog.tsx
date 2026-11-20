import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { Select } from '../../components/Select/Select';
import { DatePicker } from '../../components/DatePicker/DatePicker';
import { usePrototype } from '../prototype/PrototypeContext';
import { DialogClose } from './DialogClose';
import './EditDialog.css';

/** Form controls the dialog focuses (a drop zone's hidden file input isn't one) */
const FIELD_SELECTOR = 'input:not([type=file]), select, textarea';

export type EditField =
  | { kind: 'select'; options: string[] }
  /** Review change: a day from the HC/Date Picker calendar; its value is YYYY-MM-DD */
  | { kind: 'date'; placeholder?: string }
  | { kind: 'text' | 'number' | 'email' | 'password'; placeholder?: string };

export type FormDialogField = {
  key: string;
  label: string;
  field: EditField;
  /** Optional fields may be left empty; required ones show "Enter a value." / "Choose an option." */
  optional?: boolean;
  /** Extra check on a filled-in value; return the error message, or nothing when it's fine */
  validate?: (value: string) => string | undefined;
};

export type FormDialogProps = {
  /** Dialog title, e.g. "Add a room" */
  title: string;
  /** Optional line under the title */
  description?: string;
  fields: FormDialogField[];
  /** Starting values by field key */
  values: Record<string, string>;
  /** Primary button label (default "Save") */
  submitLabel?: string;
  /** "destructive" for removals (Disconnect); default primary */
  submitVariant?: 'primary' | 'destructive';
  /** Extra content between the title and the fields (e.g. what connecting shares) */
  children?: ReactNode;
  /** Content after the fields, before the buttons */
  after?: ReactNode;
  /** Whether Save counts as an edit for the setup step's Save (default true; false when another dialog follows) */
  countsAsEdit?: boolean;
  /** Label of the secondary button (default "Cancel"); `null` hides it (e.g. a "Done" result dialog) */
  cancelLabel?: string | null;
  /** Shows a spinner on Save and ignores it while true (e.g. "Preparing…") */
  busy?: boolean;
  /** Extra check before saving (e.g. a file was chosen); return false to keep the dialog open */
  beforeSave?: () => boolean;
  /** Web width: default 440px; "wide" 600px for longer forms (e.g. a person with permissions) */
  width?: 'default' | 'wide';
  /** An extra button at the start of the button row, e.g. a red "Remove Lorraine" (review change) */
  extraAction?: { label: string; onClick: () => void; variant?: 'destructive' | 'secondary' };
  onSave: (values: Record<string, string>) => void;
  onCancel: () => void;
};

/**
 * Review change: a dialog for editing or adding on the setup steps. One or more fields, Cancel and Save.
 * Web: a centred dialog over a dimmed page. Mobile: a bottom sheet inside the phone frame.
 * Enter saves, Esc or a click outside cancels, focus starts in the first field and goes back to the button that opened
 * it, Tab stays inside. Required fields left empty get their error message and keep the dialog open.
 * Its Save counts as an edit for the setup step's own Save (data-setup-edit, see SetupFlow).
 * Used by EditDialog (one field: C42 Agent preferences, C35 Household), C63 Rooms' Add a room and C46 Connected devices'
 * Connect / Sign in again / Disconnect (no fields or one; Disconnect uses a destructive Save). With no fields, focus starts
 * on Cancel.
 */
export function FormDialog({ title, description, fields, values, submitLabel = 'Save', submitVariant = 'primary', children, after, countsAsEdit = true, cancelLabel = 'Cancel', busy = false, beforeSave, width = 'default', extraAction, onSave, onCancel }: FormDialogProps) {
  const { device } = usePrototype();
  const [draft, setDraft] = useState<Record<string, string>>(values);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const panel = useRef<HTMLFormElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    opener.current = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>(`${FIELD_SELECTOR}, .hc-edit-dialog__actions button`)?.focus();
    return () => opener.current?.focus({ preventScroll: true });
  }, []);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (busy) return;
    const clean = Object.fromEntries(fields.map((f) => [f.key, (draft[f.key] ?? '').trim()]));
    const missing: Record<string, string> = {};
    for (const f of fields) {
      if (!f.optional && !clean[f.key]) missing[f.key] = f.field.kind === 'select' ? 'Choose an option.' : f.field.kind === 'date' ? 'Choose a date.' : 'Enter a value.';
      else if (clean[f.key] && f.validate) {
        const err = f.validate(clean[f.key]);
        if (err) missing[f.key] = err;
      }
    }
    const extraOk = beforeSave ? beforeSave() : true;
    if (Object.keys(missing).length) {
      setErrors(missing);
      const first = fields.findIndex((f) => missing[f.key]);
      panel.current?.querySelectorAll<HTMLElement>(FIELD_SELECTOR)[first]?.focus();
      return;
    }
    if (!extraOk) return;
    onSave(clean);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onCancel();
    }
    // Keep Tab inside the dialog
    if (e.key === 'Tab' && panel.current) {
      const els = [...panel.current.querySelectorAll<HTMLElement>(`${FIELD_SELECTOR}, button:not(:disabled)`)];
      const i = els.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        els[els.length - 1]?.focus();
      } else if (!e.shiftKey && i === els.length - 1) {
        e.preventDefault();
        els[0]?.focus();
      }
    }
  };

  const change = (key: string) => (v: string) => {
    setDraft((d) => ({ ...d, [key]: v }));
    if (errors[key]) setErrors(({ [key]: _, ...rest }) => rest);
  };

  return (
    <div className={`hc-edit-dialog hc-edit-dialog--${device}`} onKeyDown={onKeyDown}>
      <button type="button" className="hc-edit-dialog__scrim" aria-label="Close" tabIndex={-1} onClick={onCancel} />
      <form ref={panel} className={`hc-edit-dialog__panel${width === 'wide' ? ' hc-edit-dialog__panel--wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="hc-edit-dialog-title" onSubmit={submit} noValidate>
        {device === 'mobile' && <span className="hc-edit-dialog__grabber" aria-hidden />}
        <DialogClose onClick={onCancel} />
        <div className="hc-edit-dialog__head">
          <h2 id="hc-edit-dialog-title" className="hc-h4">
            {title}
          </h2>
          {description && <p className="hc-medium hc-muted">{description}</p>}
        </div>
        {children}
        {fields.map((f) =>
          f.field.kind === 'date' ? (
            <DatePicker
              key={f.key}
              label={f.optional ? `${f.label} (optional)` : f.label}
              placeholder={f.field.placeholder}
              value={draft[f.key] ?? ''}
              onValueChange={change(f.key)}
              error={errors[f.key]}
            />
          ) : f.field.kind === 'select' ? (
            <Select
              key={f.key}
              label={f.optional ? `${f.label} (optional)` : f.label}
              placeholder={draft[f.key] ? '' : 'Choose…'}
              options={f.field.options.map((o) => ({ value: o, label: o }))}
              value={draft[f.key] ?? ''}
              onValueChange={change(f.key)}
              error={errors[f.key]}
            />
          ) : (
            <Input
              key={f.key}
              label={f.optional ? `${f.label} (optional)` : f.label}
              type={f.field.kind}
              placeholder={f.field.placeholder}
              value={draft[f.key] ?? ''}
              onValueChange={change(f.key)}
              error={errors[f.key]}
            />
          ),
        )}
        {after}
        <div className="hc-edit-dialog__actions">
          {extraAction && (
            <Button
              variant={extraAction.variant ?? 'destructive'}
              fullWidth={device === 'mobile'}
              className="hc-edit-dialog__extra"
              onClick={extraAction.onClick}
            >
              {extraAction.label}
            </Button>
          )}
          {cancelLabel !== null && (
            <Button variant="secondary" fullWidth={device === 'mobile'} onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
          <Button
            type="submit"
            variant={submitVariant}
            fullWidth={device === 'mobile'}
            loading={busy}
            data-setup-edit={countsAsEdit || undefined}
          >
            {submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}

export type EditDialogProps = {
  /** Dialog title, e.g. "Edit monthly budget" */
  title: string;
  /** Field label */
  label: string;
  /** Optional line under the title */
  description?: string;
  field: EditField;
  value: string;
  /** Optional fields may be saved empty; required ones show "Enter a value." */
  optional?: boolean;
  onSave: (value: string) => void;
  onCancel: () => void;
};

/**
 * Review change: every Edit on the setup steps (Agent preferences: estimate times, monthly budget, urgency rules;
 * Household: spend limit) opens this one-field FormDialog instead of editing in place or doing nothing.
 */
export function EditDialog({ title, label, description, field, value, optional = false, onSave, onCancel }: EditDialogProps) {
  return (
    <FormDialog
      title={title}
      description={description}
      fields={[{ key: 'value', label, field, optional }]}
      values={{ value }}
      onSave={(v) => onSave(v.value)}
      onCancel={onCancel}
    />
  );
}
