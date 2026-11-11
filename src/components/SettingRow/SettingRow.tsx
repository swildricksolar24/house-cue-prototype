import { useId, type ReactNode } from 'react';
import { Switch } from '../Switch/Switch';
import './SettingRow.css';

export type SettingRowProps = {
  title: ReactNode;
  /** One line that explains what the setting changes */
  description?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Locked setting (e.g. members-only); title and description drop to 50% */
  disabled?: boolean;
  name?: string;
  className?: string;
};

/** HC/Setting Row (Figma 76:169) — title, optional description and an HC/Switch. States On, Off, Disabled off, Disabled on. */
export function SettingRow({
  title,
  description,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  name,
  className,
}: SettingRowProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descId = description ? `${id}-desc` : undefined;

  return (
    <label className={['hc-setting-row', disabled && 'hc-setting-row--disabled', className].filter(Boolean).join(' ')}>
      <span className="hc-setting-row__text">
        <span id={titleId} className="hc-setting-row__title">
          {title}
        </span>
        {description && (
          <span id={descId} className="hc-setting-row__description">
            {description}
          </span>
        )}
      </span>
      <Switch
        aria-labelledby={titleId}
        aria-describedby={descId}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        name={name}
      />
    </label>
  );
}
