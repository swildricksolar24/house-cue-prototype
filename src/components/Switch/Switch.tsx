import { useState, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react';
import './Switch.css';

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'onChange'> & {
  /** Visible label. Without it, pass `aria-label` or `aria-labelledby`. */
  label?: ReactNode;
  /**
   * Where the switch sits when there is a label.
   * `start` = Figma Label=Left (switch, then label) · `end` = Figma Label=Right (label fills, switch at the end).
   */
  switchPosition?: 'start' | 'end';
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
};

/**
 * HC/Switch (Figma 203:928) — State On / Off / Disabled off / Disabled on × Label None / Left / Right.
 * Also covers the older HC/Toggle (Figma 76:150), which is just an HC/Switch instance with Label=None.
 */
export function Switch({
  label,
  switchPosition = 'start',
  checked,
  defaultChecked,
  onChange,
  onCheckedChange,
  disabled,
  className,
  ...props
}: SwitchProps) {
  const [inner, setInner] = useState(Boolean(defaultChecked));
  const isOn = checked ?? inner;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (checked === undefined) setInner(event.target.checked);
    onCheckedChange?.(event.target.checked);
    onChange?.(event);
  };

  const control = (
    <span className="hc-switch__control">
      <input
        {...props}
        type="checkbox"
        role="switch"
        className="hc-switch__input"
        checked={isOn}
        onChange={handleChange}
        disabled={disabled}
      />
      <span className="hc-switch__track" aria-hidden>
        <span className="hc-switch__knob" />
      </span>
    </span>
  );

  const classes = [
    'hc-switch',
    label != null && `hc-switch--label hc-switch--${switchPosition}`,
    disabled && 'hc-switch--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (label == null) return <span className={classes}>{control}</span>;

  return (
    <label className={classes}>
      {switchPosition === 'start' && control}
      <span className="hc-switch__label">{label}</span>
      {switchPosition === 'end' && control}
    </label>
  );
}
