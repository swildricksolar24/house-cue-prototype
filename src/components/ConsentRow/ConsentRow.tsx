import { useId, type ChangeEvent, type ReactNode } from 'react';
import { Checkbox } from '../Checkbox/Checkbox';
import { StatusPill } from '../StatusPill/StatusPill';
import './ConsentRow.css';

export type ConsentRowProps = {
  /** Consent wording; wraps freely */
  children: ReactNode;
  /** Shows the Required pill (default) or Optional. Optional consents start unchecked. */
  required?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  /** Error = 2px danger box plus this message (e.g. a missing required consent) */
  error?: ReactNode;
  disabled?: boolean;
  name?: string;
  /** Link to the full document (X08 page) */
  linkLabel?: string;
  linkHref?: string;
  onLinkClick?: () => void;
  className?: string;
};

/** HC/Consent Row (Figma 6:81) — HC/Checkbox + wrapping text + Required/Optional pill + link to the full text. */
export function ConsentRow({
  children,
  required = true,
  checked,
  defaultChecked,
  onChange,
  error,
  disabled,
  name,
  linkLabel = 'Read',
  linkHref,
  onLinkClick,
  className,
}: ConsentRowProps) {
  const id = useId();
  const inputId = `${id}-input`;
  const textId = `${id}-text`;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={['hc-consent-row', className].filter(Boolean).join(' ')}>
      <Checkbox
        id={inputId}
        hideLabel
        aria-labelledby={textId}
        aria-describedby={errorId}
        aria-required={required || undefined}
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange}
        error={Boolean(error)}
        disabled={disabled}
        name={name}
      />
      <div className="hc-consent-row__text">
        <label id={textId} htmlFor={inputId} className="hc-consent-row__label">
          {children}
        </label>
        <div className="hc-consent-row__meta">
          <StatusPill tone="neutral" label={required ? 'Required' : 'Optional'} />
          {linkHref ? (
            <a className="hc-consent-row__link" href={linkHref} onClick={onLinkClick}>
              {linkLabel}
            </a>
          ) : (
            <button type="button" className="hc-consent-row__link" onClick={onLinkClick}>
              {linkLabel}
            </button>
          )}
        </div>
        {error && (
          <p id={errorId} className="hc-consent-row__error">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
