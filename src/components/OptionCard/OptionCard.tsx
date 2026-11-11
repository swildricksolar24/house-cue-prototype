import type { ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import './OptionCard.css';

export type OptionCardProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'title'> & {
  title: string;
  description?: string;
  /** Leading icon in a tinted 40px tile; omit to hide it */
  icon?: IconName;
  selected?: boolean;
};

/**
 * HC/Option Card (Figma 6:80) — Selected False/True. Single-choice card; the whole card is the tap target (min 64).
 * Selected = selected fill + 2px link stroke + filled radio (never colour alone). Group cards in a `role="radiogroup"`.
 */
export function OptionCard({ title, description, icon, selected = false, className, type = 'button', ...props }: OptionCardProps) {
  const classes = ['hc-option-card', selected && 'hc-option-card--selected', className].filter(Boolean).join(' ');

  return (
    <button type={type} role="radio" aria-checked={selected} className={classes} {...props}>
      {icon && (
        <span className="hc-option-card__icon">
          <Icon name={icon} size={24} />
        </span>
      )}
      <span className="hc-option-card__text">
        <span className="hc-option-card__title">{title}</span>
        {description && <span className="hc-option-card__description">{description}</span>}
      </span>
      <span className="hc-option-card__radio" aria-hidden />
    </button>
  );
}
