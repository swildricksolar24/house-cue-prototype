import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './DetailRow.css';

export type DetailRowProps = {
  /** Field name; inferred values add a source note here (e.g. "Year built · from county records") */
  label: ReactNode;
  value: ReactNode;
  /** Action text, shown when onAction or actionTo is set */
  actionLabel?: string;
  onAction?: () => void;
  /** Router path for the action (prototype navigation) */
  actionTo?: string;
  /** Show the action, greyed out, when the design draws it but it has nothing to do yet */
  actionDisabled?: boolean;
  className?: string;
};

/** HC/Detail Row (Figma 6:128) — read-and-confirm row: label, value, Edit (C04 home details). */
export function DetailRow({ label, value, actionLabel = 'Edit', onAction, actionTo, actionDisabled, className }: DetailRowProps) {
  return (
    <div className={['hc-detail-row', className].filter(Boolean).join(' ')}>
      <div className="hc-detail-row__text">
        <span className="hc-detail-row__label">{label}</span>
        <span className="hc-detail-row__value">{value}</span>
      </div>
      {actionDisabled ? (
        <button type="button" className="hc-detail-row__action" disabled>
          {actionLabel}
        </button>
      ) : actionTo ? (
        <Link className="hc-detail-row__action" to={actionTo}>
          {actionLabel}
        </Link>
      ) : onAction ? (
        <button type="button" className="hc-detail-row__action" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
