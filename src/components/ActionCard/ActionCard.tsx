import type { ReactNode } from 'react';
import { Button } from '../Button/Button';
import './ActionCard.css';

export type ActionCardProps = {
  /** What the agent will do */
  title: ReactNode;
  /** What it involves and what it costs */
  body?: ReactNode;
  /** Source and time, e.g. "Agent · 2 min ago" */
  meta?: ReactNode;
  /** Status pill text */
  status?: string;
  approveLabel?: string;
  editLabel?: string;
  rejectLabel?: string;
  onApprove?: () => void;
  onEdit?: () => void;
  onReject?: () => void;
  className?: string;
};

/** HC/Action Card (Figma 19:73) — agent action awaiting the homeowner's OK (W20): Approve / Edit / Reject. */
export function ActionCard({
  title,
  body,
  meta,
  status = 'Needs your OK',
  approveLabel = 'Approve',
  editLabel = 'Edit',
  rejectLabel = 'Reject',
  onApprove,
  onEdit,
  onReject,
  className,
}: ActionCardProps) {
  return (
    <section className={['hc-action-card', className].filter(Boolean).join(' ')}>
      <div className="hc-action-card__header">
        <span className="hc-action-card__pill">{status}</span>
        {meta && <span className="hc-action-card__meta">{meta}</span>}
      </div>
      <p className="hc-action-card__title">{title}</p>
      {body && <p className="hc-action-card__body">{body}</p>}
      <div className="hc-action-card__actions">
        <Button className="hc-action-card__button" onClick={onApprove}>{approveLabel}</Button>
        <Button className="hc-action-card__button" variant="secondary" onClick={onEdit}>{editLabel}</Button>
        <Button className="hc-action-card__button" variant="secondary" onClick={onReject}>{rejectLabel}</Button>
      </div>
    </section>
  );
}
