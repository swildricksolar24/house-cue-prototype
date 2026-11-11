import { Link } from 'react-router-dom';
import { Button } from '../Button/Button';
import './BottomActions.css';

export type BottomActionsProps = {
  /** Full-width primary button label. Default "Continue" */
  primaryLabel?: string;
  primaryTo?: string;
  onPrimary?: () => void;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  /** Use type="submit" on the primary button (inside a form) */
  primarySubmit?: boolean;
  /** Optional text action under the button (link colour). Hidden when omitted */
  secondaryLabel?: string;
  secondaryTo?: string;
  onSecondary?: () => void;
  /** iOS home indicator strip (34pt). Default true */
  showHomeIndicator?: boolean;
  className?: string;
};

/**
 * HC/Bottom Actions (Figma 6:153) — sticky mobile action area: full-width HC/Button Primary Medium (44pt),
 * optional text action and home indicator.
 */
export function BottomActions({
  primaryLabel = 'Continue',
  primaryTo,
  onPrimary,
  primaryDisabled,
  primaryLoading,
  primarySubmit,
  secondaryLabel,
  secondaryTo,
  onSecondary,
  showHomeIndicator = true,
  className,
}: BottomActionsProps) {
  return (
    <div className={['hc-bottom-actions', className].filter(Boolean).join(' ')}>
      <Button
        fullWidth
        to={primaryTo}
        onClick={onPrimary}
        disabled={primaryDisabled}
        loading={primaryLoading}
        type={primarySubmit ? 'submit' : 'button'}
      >
        {primaryLabel}
      </Button>
      {secondaryLabel &&
        (secondaryTo ? (
          <Link to={secondaryTo} className="hc-bottom-actions__secondary" onClick={onSecondary}>
            {secondaryLabel}
          </Link>
        ) : (
          <button type="button" className="hc-bottom-actions__secondary" onClick={onSecondary} disabled={!onSecondary}>
            {secondaryLabel}
          </button>
        ))}
      {showHomeIndicator ? (
        <div className="hc-bottom-actions__home-indicator" aria-hidden>
          <span />
        </div>
      ) : (
        <div className="hc-bottom-actions__end" />
      )}
    </div>
  );
}
