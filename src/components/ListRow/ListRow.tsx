import type { ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import './ListRow.css';

export type ListRowProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Icon in the 40px circle. Default check. */
  icon?: IconName;
  className?: string;
};

/** HC/List Row (Figma 6:133) — icon + title + description for capability, feature and check lists. */
export function ListRow({ title, description, icon = 'check', className }: ListRowProps) {
  return (
    <div className={['hc-list-row', className].filter(Boolean).join(' ')}>
      <span className="hc-list-row__icon">
        <Icon name={icon} size={20} />
      </span>
      <div className="hc-list-row__text">
        <span className="hc-list-row__title">{title}</span>
        {description && <span className="hc-list-row__description">{description}</span>}
      </div>
    </div>
  );
}
