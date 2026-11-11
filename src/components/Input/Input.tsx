import {
  useId,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import './Input.css';

export type InputType = 'text' | 'email' | 'phone' | 'number' | 'code' | 'search' | 'multiline';
export type InputSize = 'medium' | 'large';

export type InputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size' | 'value' | 'defaultValue' | 'onChange' | 'children'
> & {
  /** Visible label above the field. Keep it visible; use `hideLabel` only when a visible heading labels the field. */
  label: ReactNode;
  hideLabel?: boolean;
  /** Text / Email / Phone (+1 prefix) / Number (right-aligned) / Password-less code / Search / Multiline */
  type?: InputType;
  /** Medium 44 default · Large 52 for onboarding and hero forms */
  size?: InputSize;
  /** Format hint shown below the field */
  helper?: ReactNode;
  /** Error text. Setting it switches the field to the Error state (2px danger + danger-bg). */
  error?: ReactNode;
  value?: string;
  defaultValue?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  /** Called with the new value on typing and when Search is cleared */
  onValueChange?: (value: string) => void;
  /** Optional leading icon (Search always shows the search icon) */
  leadingIcon?: IconName;
  /** Optional trailing slot, e.g. a visibility toggle. Search shows its own clear button when filled. */
  trailingAction?: ReactNode;
  /** Rows for Multiline (defaults to the Figma height: 96 medium / 120 large) */
  rows?: number;
  /** Class for the outer wrapper */
  className?: string;
};

const nativeType: Record<InputType, string> = {
  text: 'text',
  email: 'email',
  phone: 'tel',
  number: 'text',
  code: 'text',
  search: 'search',
  multiline: 'text',
};

const typeDefaults: Partial<Record<InputType, InputHTMLAttributes<HTMLInputElement>>> = {
  email: { autoComplete: 'email', inputMode: 'email' },
  phone: { autoComplete: 'tel-national', inputMode: 'tel' },
  number: { inputMode: 'decimal' },
  code: { autoComplete: 'one-time-code', inputMode: 'numeric', spellCheck: false },
  search: { inputMode: 'search', enterKeyHint: 'search' },
};

/** HC/Input (Figma 177:1592) — Type 7 × State 6 × Size 2. Focus, filled and placeholder come from CSS; Error, Disabled and Read-only are props. */
export function Input({
  label,
  hideLabel = false,
  type = 'text',
  size = 'medium',
  helper,
  error,
  value,
  defaultValue,
  onChange,
  onValueChange,
  leadingIcon,
  trailingAction,
  rows,
  className,
  id,
  disabled,
  readOnly,
  ...props
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? `hc-input-${autoId}`;
  const helperId = helper ? `${inputId}-helper` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [props['aria-describedby'], helperId, errorId].filter(Boolean).join(' ') || undefined;

  const [inner, setInner] = useState(defaultValue ?? '');
  const current = value ?? inner;

  const update = (next: string) => {
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    update(event.target.value);
    onChange?.(event);
  };

  const editable = !disabled && !readOnly;
  const showClear = type === 'search' && current !== '' && editable;
  const icon = type === 'search' ? 'search' : leadingIcon;

  const classes = [
    'hc-input',
    `hc-input--${type}`,
    `hc-input--${size}`,
    error && 'hc-input--error',
    disabled && 'hc-input--disabled',
    readOnly && 'hc-input--readonly',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const shared = {
    id: inputId,
    className: 'hc-input__control',
    value: current,
    onChange: handleChange,
    disabled,
    readOnly,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
  } as const;

  return (
    <div className={classes}>
      <label htmlFor={inputId} className={hideLabel ? 'hc-input__label hc-input__label--hidden' : 'hc-input__label'}>
        {label}
      </label>
      <div className="hc-input__field">
        {icon && <Icon name={icon} size={20} className="hc-input__icon" />}
        {type === 'phone' && (
          <span className="hc-input__prefix" aria-hidden>
            +1
          </span>
        )}
        {type === 'multiline' ? (
          <textarea
            {...(props as unknown as InputHTMLAttributes<HTMLTextAreaElement>)}
            {...shared}
            rows={rows}
            style={rows ? { height: 'auto', ...props.style } : props.style}
          />
        ) : (
          <input {...typeDefaults[type]} {...props} {...shared} type={nativeType[type]} />
        )}
        {showClear && (
          <button
            type="button"
            className="hc-input__action"
            aria-label="Clear search"
            onClick={() => update('')}
          >
            <Icon name="close-small" size={20} />
          </button>
        )}
        {trailingAction && <span className="hc-input__trailing">{trailingAction}</span>}
      </div>
      {helper && (
        <p id={helperId} className="hc-input__helper">
          {helper}
        </p>
      )}
      {error && (
        <p id={errorId} className="hc-input__error">
          {error}
        </p>
      )}
    </div>
  );
}
