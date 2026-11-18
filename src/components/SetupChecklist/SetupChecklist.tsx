import { Fragment, useId, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import { StatusPill } from '../StatusPill/StatusPill';
import './SetupChecklist.css';

export type SetupChecklistItem = {
  id?: string;
  label: ReactNode;
  /** Right-hand note: time estimate ("3 min") or "Done" */
  meta?: ReactNode;
  done?: boolean;
  /** Makes the whole row a button */
  onClick?: () => void;
  /** Shows an Edit button at the right end of the row instead (the row itself isn't clickable then) */
  onEdit?: () => void;
  /** Group heading; consecutive items with the same group are listed under it (numbering carries on across groups) */
  group?: string;
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
  /** When the footer button expands the list in place, whether it's expanded (sets aria-expanded) */
  seeAllExpanded?: boolean;
  seeAllTo?: string;
  /**
   * Numbered list: each item starts with its number in a circle instead of the checkbox (filled when done, outlined
   * when not). Use when the card shows every item.
   */
  numbered?: boolean;
  /** Show each item's meta as a tag right after its label ("Done" green, time estimates neutral) instead of at the right */
  metaAsTag?: boolean;
  /** Show each group's name as a heading (default true). Off: groups are only set apart by a gap (names stay for screen readers). */
  showGroupNames?: boolean;
  className?: string;
};


/**
 * HC/Setup Checklist (Figma 19:87) — C08 setup card: progress, next items with time estimates, link to all items.
 * Checkbox look uses the checkbox / checkbox-checked icons (swap for HC/Checkbox when it lands).
 * Review change: items with a `group` are listed under small group headings (consecutive items share a heading), and
 * with `numbered` the numbers carry on from one group to the next.
 */
export function SetupChecklist({
  title,
  completed,
  total,
  items,
  seeAllLabel,
  onSeeAll,
  seeAllExpanded,
  seeAllTo,
  numbered = false,
  metaAsTag = false,
  showGroupNames = true,
  className,
}: SetupChecklistProps) {
  const uid = useId();
  const pct = total > 0 ? Math.min(100, Math.max(0, (completed / total) * 100)) : 0;
  const List = numbered ? 'ol' : 'ul';

  // Consecutive items with the same group form one block (no group = one block without a heading)
  const groups: { name?: string; start: number; items: SetupChecklistItem[] }[] = [];
  items.forEach((item, i) => {
    const last = groups[groups.length - 1];
    if (last && last.name === item.group) last.items.push(item);
    else groups.push({ name: item.group, start: i, items: [item] });
  });

  const renderItem = (item: SetupChecklistItem, i: number) => {
    const inner = (
      <>
        {numbered ? (
          <span className={['hc-setup-checklist__num', item.done && 'is-done'].filter(Boolean).join(' ')}>
            <span aria-hidden>{i + 1}</span>
            <span className="hc-setup-checklist__sr">{item.done ? 'Done' : 'Not done'}</span>
          </span>
        ) : (
          <Icon name={item.done ? 'checkbox-checked' : 'checkbox'} size={24} label={item.done ? 'Done' : 'Not done'} />
        )}
        {metaAsTag ? (
          <span className="hc-setup-checklist__label hc-setup-checklist__label--tagged">
            <span>{item.label}</span>
            {typeof item.meta === 'string' && <StatusPill label={item.meta} tone={item.done ? 'success' : 'neutral'} />}
          </span>
        ) : (
          <span className="hc-setup-checklist__label">{item.label}</span>
        )}
        {item.meta && !metaAsTag && <span className="hc-setup-checklist__meta">{item.meta}</span>}
      </>
    );
    return (
      <li key={item.id ?? i}>
        {item.onEdit ? (
          <div className="hc-setup-checklist__item">
            {inner}
            <Button
              variant="secondary"
              size="tiny"
              className="hc-setup-checklist__edit"
              onClick={item.onEdit}
              aria-label={typeof item.label === 'string' ? `Edit: ${item.label}` : undefined}
            >
              Edit
            </Button>
          </div>
        ) : item.onClick ? (
          <button type="button" className="hc-setup-checklist__item hc-setup-checklist__item--interactive" onClick={item.onClick}>
            {inner}
          </button>
        ) : (
          <div className="hc-setup-checklist__item">{inner}</div>
        )}
      </li>
    );
  };

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
      {groups.map((g, gi) => {
        const headingId = `${uid}-group-${gi}`;
        const list = (
          <List
            className={['hc-setup-checklist__items', numbered && 'hc-setup-checklist__items--numbered'].filter(Boolean).join(' ')}
            start={numbered && g.start > 0 ? g.start + 1 : undefined}
            aria-labelledby={g.name && showGroupNames ? headingId : undefined}
            aria-label={g.name && !showGroupNames ? g.name : undefined}
          >
            {g.items.map((item, j) => renderItem(item, g.start + j))}
          </List>
        );
        return g.name ? (
          <div key={`${gi}-${g.name}`} className="hc-setup-checklist__group">
            {showGroupNames && (
              <p id={headingId} className="hc-setup-checklist__group-title">
                {g.name}
              </p>
            )}
            {list}
          </div>
        ) : (
          <Fragment key={gi}>{list}</Fragment>
        );
      })}
      {seeAllLabel &&
        (seeAllTo ? (
          <Link className="hc-setup-checklist__see-all" to={seeAllTo}>
            {seeAllLabel}
          </Link>
        ) : (
          <button type="button" className="hc-setup-checklist__see-all" onClick={onSeeAll} aria-expanded={seeAllExpanded}>
            {seeAllLabel}
          </button>
        ))}
    </section>
  );
}
