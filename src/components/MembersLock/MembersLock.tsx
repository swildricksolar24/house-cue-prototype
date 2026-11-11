import type { ReactNode } from 'react';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import './MembersLock.css';

export type MembersLockProps = {
  title?: ReactNode;
  body?: ReactNode;
  actionLabel?: ReactNode;
  /** Opens the membership page (C28) with the trigger named */
  onAction?: () => void;
  /** Router path for the action instead of a click handler */
  to?: string;
  className?: string;
};

/** HC/Members Lock (Figma 29:132) — locked members-only state used on every upgrade moment. */
export function MembersLock({
  title = 'Member feature',
  body = 'Fair-price check, permits and rebates for this quote.',
  actionLabel = 'Upgrade',
  onAction,
  to,
  className,
}: MembersLockProps) {
  return (
    <div className={['hc-members-lock', className].filter(Boolean).join(' ')}>
      <Icon name="lock" size={24} className="hc-members-lock__icon" label="Members only" />
      <div className="hc-members-lock__text">
        <p className="hc-members-lock__title">{title}</p>
        {body && <p className="hc-members-lock__body">{body}</p>}
      </div>
      <Button variant="secondary" onClick={onAction} to={to}>
        {actionLabel}
      </Button>
    </div>
  );
}
