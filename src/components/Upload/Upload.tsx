import { useId, useRef, useState, type DragEvent, type ReactNode } from 'react';
import './Upload.css';

export type UploadState = 'idle' | 'dragging' | 'uploading' | 'done' | 'error';

export type UploadProps = {
  /** Idle / Uploading / Done / Error are driven by the parent; Dragging is detected automatically while idle */
  state?: Exclude<UploadState, 'dragging'> | 'dragging';
  /** Called with the dropped or browsed files */
  onFiles?: (files: File[]) => void;
  /** e.g. ".pdf,.jpg,.png,.heic" */
  accept?: string;
  multiple?: boolean;
  /** Idle hint under the prompt */
  hint?: ReactNode;
  /** Dragging hint */
  dropHint?: ReactNode;
  /** File name shown while uploading / done */
  fileName?: string;
  /** 0–100 */
  progress?: number;
  /** Meta line under the file, e.g. "Uploading… 62% · 1.4 of 2.3 MB" or "Uploaded · 2.3 MB · Saved to Warranties" */
  meta?: ReactNode;
  onCancel?: () => void;
  onReplace?: () => void;
  errorTitle?: ReactNode;
  errorMessage?: ReactNode;
  onRetry?: () => void;
  disabled?: boolean;
  className?: string;
};

/** HC/Upload (Figma 203:978) — drop zone with Idle, Dragging, Uploading, Done and Error states. Resize width freely. */
export function Upload({
  state = 'idle',
  onFiles,
  accept,
  multiple = false,
  hint = 'PDF, JPG, PNG or HEIC · up to 25 MB',
  dropHint = 'Release to add it to your document vault',
  fileName,
  progress = 0,
  meta,
  onCancel,
  onReplace,
  errorTitle = 'Upload failed',
  errorMessage,
  onRetry,
  disabled = false,
  className,
}: UploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragDepth, setDragDepth] = useState(0);

  const acceptsDrop = state === 'idle' && !disabled;
  const shown: UploadState = acceptsDrop && dragDepth > 0 ? 'dragging' : state;
  const pct = Math.round(Math.min(100, Math.max(0, progress)));

  const emit = (list: FileList | null) => {
    if (list && list.length) onFiles?.(Array.from(list));
  };

  const dragHandlers = acceptsDrop
    ? {
        onDragEnter: (e: DragEvent) => {
          e.preventDefault();
          setDragDepth((d) => d + 1);
        },
        onDragOver: (e: DragEvent) => e.preventDefault(),
        onDragLeave: () => setDragDepth((d) => Math.max(0, d - 1)),
        onDrop: (e: DragEvent) => {
          e.preventDefault();
          setDragDepth(0);
          emit(e.dataTransfer.files);
        },
      }
    : {};

  const browse = () => inputRef.current?.click();

  return (
    <div
      className={['hc-upload', `hc-upload--${shown}`, disabled && 'hc-upload--disabled', className].filter(Boolean).join(' ')}
      aria-busy={shown === 'uploading' || undefined}
      {...dragHandlers}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        className="hc-upload__input"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          emit(e.target.files);
          e.target.value = '';
        }}
      />

      {(shown === 'idle' || shown === 'dragging') && (
        <>
          <span className="hc-upload__icon hc-upload__icon--upload" aria-hidden />
          {shown === 'idle' ? (
            <p className="hc-upload__title">
              Drop a file here, or{' '}
              <button type="button" className="hc-upload__link" onClick={browse} disabled={disabled}>
                browse
              </button>
            </p>
          ) : (
            <p className="hc-upload__title">Drop to upload</p>
          )}
          <p className="hc-upload__hint">{shown === 'idle' ? hint : dropHint}</p>
        </>
      )}

      {(shown === 'uploading' || shown === 'done') && (
        <>
          <div className="hc-upload__file">
            <span
              className={`hc-upload__icon ${shown === 'done' ? 'hc-upload__icon--done' : 'hc-upload__icon--file'}`}
              aria-hidden
            />
            <span className="hc-upload__name">{fileName}</span>
          </div>
          {shown === 'uploading' && (
            <div
              className="hc-upload__progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              aria-label={fileName ? `Uploading ${fileName}` : 'Uploading'}
            >
              <span className="hc-upload__bar" style={{ width: `${pct}%` }} />
            </div>
          )}
          <p className="hc-upload__meta" aria-live="polite">
            {meta ?? (shown === 'uploading' ? `Uploading… ${pct}%` : 'Uploaded')}
          </p>
          {shown === 'uploading' ? (
            <button type="button" className="hc-upload__link" onClick={onCancel}>
              Cancel
            </button>
          ) : (
            <button type="button" className="hc-upload__link" onClick={onReplace ?? browse}>
              Replace file
            </button>
          )}
        </>
      )}

      {shown === 'error' && (
        <>
          <span className="hc-upload__icon hc-upload__icon--error" aria-hidden />
          <p className="hc-upload__title" role="alert">
            {errorTitle}
          </p>
          {errorMessage && <p className="hc-upload__hint hc-upload__hint--error">{errorMessage}</p>}
          <button type="button" className="hc-upload__link" onClick={onRetry ?? browse}>
            Try again
          </button>
        </>
      )}
    </div>
  );
}
