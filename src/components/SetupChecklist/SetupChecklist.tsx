import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../Icon/Icon';
import './SetupChecklist.css';

export type SetupChecklistItem = {
  id?: string;
  label: ReactNode;
  /** Right-hand note: time estimate ("3 min") or "Done" */
  meta?: ReactNode;
  done?: boolean;
  onClick?: () => void;
};

export type SetupChecklistProps = {
  title: ReactNode;
  /** Items completed so far (drives the bar and the "3 of 9" label) */
  completed: number;
  /** Total items in the full checklist */
  total: number;
  /** The next few items to show (Figma shows 3) */
  items: SetupChecklistItem[];
  /** Footer link text, e.g. "See all 9 items" */
  seeAllLabel?: ReactNode;
  onSeeAll?: () => void;
  seeAllTo?: string;
  className?: string;
};

/**
 * HC/Setup Checklist (Figma 19:87) — C08 setup card: progress, next items with time estimates, link to all items.
 * Checkbox look uses the checkbox / checkbox-checked icons (swap for HC/Checkbox when it lands).
 */
export function SetupChecklist({
  title,
  completed,
  total,
  items,
  seeAllLabel,
  onSeeAll,
  seeAllTo,
  className,
}: SetupChecklistProps) {
  const pct = total > 0 ? Math.min(100, Math.max(0, (completed / total) * 100)) : 0;

  return (
    <section className={['hc-setup-checklist', className].filter(Boolean).join(' ')}>
      <div className="hc-setup-checklist__header">
        <p className="hc-setup-checklist__title">{title}</p>
        <span className="hc-setup-checklist__progress-label">
          {completed} of {total}
        </span>
      </div>
      <div
        className="hc-setup-checklist__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={completed}
        aria-label="Setup progress"
      >
        <span className="hc-setup-checklist__bar" style={{ width: `${pct}%` }} />
      </div>
      <ul className="hc-setup-checklist__items">
        {items.map((item, i) => {
          const inner = (
            <>
              <Icon name={item.done ? 'checkbox-checked' : 'checkbox'} size={24} label={item.done ? 'Done' : 'Not done'} />
              <span className="hc-setup-checklist__label">{item.label}</span>
              {item.meta && <span className="hc-setup-checklist__meta">{item.meta}</span>}
            </>
          );
          return (
            <li key={item.id ?? i}>
              {item.onClick ? (
                <button type="button" className="hc-setup-checklist__item hc-setup-checklist__item--interactive" onClick={item.onClick}>
                  {inner}
                </button>
              ) : (
                <div className="hc-setup-checklist__item">{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
      {seeAllLabel &&
        (seeAllTo ? (
          <Link className="hc-setup-checklist__see-all" to={seeAllTo}>
            {seeAllLabel}
          </Link>
        ) : (
          <button type="button" className="hc-setup-checklist__see-all" onClick={onSeeAll}>
            {seeAllLabel}
          </button>
        ))}
    </section>
  );
}
