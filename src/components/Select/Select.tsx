import { useId, useState, type ChangeEvent, type ReactNode, type SelectHTMLAttributes } from 'react';
import '../Input/Input.css';
import './Select.css';

export type SelectOption = { value: string; label: string; disabled?: boolean };

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'value' | 'defaultValue' | 'children'> & {
  label: ReactNode;
  hideLabel?: boolean;
  options: SelectOption[];
  /** Shown (muted) while nothing is chosen. Pass '' to require a choice without a placeholder row. */
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Medium 44 default · Large 52 */
  size?: 'medium' | 'large';
  helper?: ReactNode;
  /** Error text; switches to the Error state */
  error?: ReactNode;
  className?: string;
};

/** HC/Select (Figma 92:27131) — HC/Input Type=Text with HC/Icon/Chevron Down as trailing action. Native picker on every platform. */
export function Select({
  label,
  hideLabel = false,
  options,
  placeholder = 'Select an option',
  value,
  defaultValue,
  onChange,
  onValueChange,
  size = 'medium',
  helper,
  error,
  className,
  id,
  disabled,
  ...props
}: SelectProps) {
  const autoId = useId();
  const selectId = id ?? `hc-select-${autoId}`;
  const helperId = helper ? `${selectId}-helper` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;

  const [inner, setInner] = useState(defaultValue ?? '');
  const current = value ?? inner;

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (value === undefined) setInner(event.target.value);
    onValueChange?.(event.target.value);
    onChange?.(event);
  };

  const classes = [
    'hc-input',
    'hc-select',
    `hc-input--${size}`,
    current === '' && 'hc-select--placeholder',
    error && 'hc-input--error',
    disabled && 'hc-input--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <label htmlFor={selectId} className={hideLabel ? 'hc-input__label hc-input__label--hidden' : 'hc-input__label'}>
        {label}
      </label>
      <div className="hc-input__field">
        <select
          {...props}
          id={selectId}
          className="hc-input__control hc-select__control"
          value={current}
          onChange={handleChange}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={[props['aria-describedby'], helperId, errorId].filter(Boolean).join(' ') || undefined}
        >
          {placeholder !== '' && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="hc-select__chevron" aria-hidden />
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
