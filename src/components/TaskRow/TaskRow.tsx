import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon, type IconName } from '../Icon/Icon';
import './TaskRow.css';

export type TaskRowTagTone = 'info' | 'success' | 'warning' | 'danger';

export type TaskRowProps = {
  title: ReactNode;
  /** Item and due date, e.g. "AC / heat pump · Due Nov 28" */
  meta?: ReactNode;
  /** Icon in the 40px tile. Default tasks. */
  icon?: IconName;
  /** Trailing pill text, e.g. "DIY" or "Pro" */
  tag?: string;
  tagTone?: TaskRowTagTone;
  /** Makes the whole row a button */
  onClick?: () => void;
  /** Makes the whole row a router link */
  to?: string;
  className?: string;
};

/** HC/Task Row (Figma 19:62) — one maintenance task: item, due date and DIY/Pro tag (C08, C11, C23). */
export function TaskRow({ title, meta, icon = 'tasks', tag, tagTone = 'info', onClick, to, className }: TaskRowProps) {
  const classes = ['hc-task-row', (to || onClick) && 'hc-task-row--interactive', className].filter(Boolean).join(' ');
  const content = (
    <>
      <span className="hc-task-row__icon">
        <Icon name={icon} size={24} />
      </span>
      <span className="hc-task-row__text">
        <span className="hc-task-row__title">{title}</span>
        {meta && <span className="hc-task-row__meta">{meta}</span>}
      </span>
      {tag && <span className={`hc-task-row__tag hc-task-row__tag--${tagTone}`}>{tag}</span>}
    </>
  );

  if (to) {
    return (
      <Link className={classes} to={to}>
        {content}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick}>
        {content}
      </button>
    );
  }
  return <div className={classes}>{content}</div>;
}
