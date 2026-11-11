import type { ReactNode } from 'react';
import { Button } from '../Button/Button';
import './ChangeOrderCard.css';

export type ChangeOrderCardProps = {
  /** The extra work and price delta, e.g. "Replace the run capacitor (+$185)" */
  title: ReactNode;
  /** Why, the new total and what happens to the hold */
  body?: ReactNode;
  /** Source and time, e.g. "From the pro · 10:05 AM" */
  meta?: ReactNode;
  /** Status pill text */
  status?: string;
  approveLabel?: string;
  declineLabel?: string;
  onApprove?: () => void;
  onDecline?: () => void;
  className?: string;
};

/** HC/Change Order Card (Figma 29:111) — extra work and price from the vendor (C18, W19): Approve / Decline. */
export function ChangeOrderCard({
  title,
  body,
  meta,
  status = 'Change order',
  approveLabel = 'Approve',
  declineLabel = 'Decline',
  onApprove,
  onDecline,
  className,
}: ChangeOrderCardProps) {
  return (
    <section className={['hc-change-order-card', className].filter(Boolean).join(' ')}>
      <div className="hc-change-order-card__header">
        <span className="hc-change-order-card__pill">{status}</span>
        {meta && <span className="hc-change-order-card__meta">{meta}</span>}
      </div>
      <p className="hc-change-order-card__title">{title}</p>
      {body && <p className="hc-change-order-card__body">{body}</p>}
      <div className="hc-change-order-card__actions">
        <Button className="hc-change-order-card__button" onClick={onApprove}>{approveLabel}</Button>
        <Button className="hc-change-order-card__button" variant="secondary" onClick={onDecline}>{declineLabel}</Button>
      </div>
    </section>
  );
}
