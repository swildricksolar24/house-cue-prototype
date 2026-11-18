import { useState } from 'react';
import { Upload } from '../../../components/Upload/Upload';
import { homeDevices, systems } from '../../data/sample';
import { FormDialog } from '../../shells/EditDialog';

/**
 * Review change: "Add a document" dialog for C24 Documents (Upload, the side drop zone and "Add a document" used to
 * jump to the next onboarding step, C46). A file (drop zone / browse, then shown with its size and "Replace file"), Name (from
 * the file name), Type (guessed from the file name) and Linked to (optional: whole home, a system or a known device). The prototype keeps only
 * the file's name and size; nothing is uploaded.
 * Not a screen: the registry only picks up files named <CODE>-<slug>.tsx.
 */

export const DOC_TYPES = ['Receipt', 'Warranty', 'Manual', 'Invoice', 'Inspection', 'Permit', 'Insurance', 'Other'];
/**
 * "Linked to" (review change): the home's known things: Whole home, its systems, then every known device with its room
 * ("Smoke and CO alarm · Kitchen"), the same devices as C46 Connected devices.
 */
const LINKS = ['Whole home', ...systems.map((s) => `${s.name} · ${s.model}`), ...homeDevices.map((d) => `${d.name} · ${d.room}`)];

export type NewDocument = { title: string; type: string; linked: string; fileName: string; size: string };

const sizeLabel = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/** "dishwasher-receipt_2026.pdf" → "Dishwasher receipt 2026" */
const nameFromFile = (file: string) => {
  const base = file.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : '';
};

/** Guess the type from words in the file name */
const typeFromFile = (file: string) => {
  const f = file.toLowerCase();
  return DOC_TYPES.find((t) => t !== 'Other' && f.includes(t.toLowerCase())) ?? '';
};

const MAX_BYTES = 25 * 1024 * 1024;

export function AddDocumentDialog({
  initialFile,
  onAdd,
  onCancel,
}: {
  /** A file already dropped on the page's drop zone */
  initialFile?: File | null;
  onAdd: (doc: NewDocument) => void;
  onCancel: () => void;
}) {
  const [file, setFile] = useState<File | null>(initialFile ?? null);
  const [fileError, setFileError] = useState<string>();

  const pick = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (f.size > MAX_BYTES) {
      setFileError(`${f.name} is ${sizeLabel(f.size)}. Choose a file up to 25 MB.`);
      return;
    }
    setFile(f);
    setFileError(undefined);
  };

  return (
    <FormDialog
      // Re-fill Name and Type when a different file is chosen
      key={file ? `${file.name}-${file.size}` : 'none'}
      title="Add a document"
      description="Receipts, warranties, manuals and more. Linking it to a system or device makes it easy to find later."
      fields={[
        { key: 'title', label: 'Name', field: { kind: 'text', placeholder: 'e.g. Dishwasher receipt' } },
        { key: 'type', label: 'Type', field: { kind: 'select', options: DOC_TYPES } },
        { key: 'linked', label: 'Linked to', field: { kind: 'select', options: LINKS }, optional: true },
      ]}
      values={{ title: file ? nameFromFile(file.name) : '', type: file ? typeFromFile(file.name) : '', linked: '' }}
      submitLabel="Add document"
      beforeSave={() => {
        if (file) return true;
        setFileError('Choose a file to add.');
        return false;
      }}
      onSave={(v) => {
        if (!file) return;
        onAdd({ title: v.title, type: v.type, linked: v.linked, fileName: file.name, size: sizeLabel(file.size) });
      }}
      onCancel={onCancel}
    >
      <div className="hc-c24-add__file">
        <Upload
          state={file ? 'done' : 'idle'}
          onFiles={pick}
          accept=".pdf,.jpg,.jpeg,.png,.heic"
          fileName={file?.name}
          meta={file ? `${sizeLabel(file.size)} · ready to add` : undefined}
        />
        {fileError && (
          <p className="hc-input__error" role="alert">
            {fileError}
          </p>
        )}
      </div>
    </FormDialog>
  );
}
