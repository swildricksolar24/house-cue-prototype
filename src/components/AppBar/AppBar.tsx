import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AppBar.css';

export type AppBarProps = {
  /** Centred title (Large/Bold) */
  title?: string;
  /** Show the 44pt back target. Default true */
  showBack?: boolean;
  /** Route for back; when omitted, back calls onBack or navigates -1 in history */
  backTo?: string;
  onBack?: () => void;
  /** Step counter text, e.g. "2 of 7". Hidden when omitted (unless `action` is given) */
  step?: string;
  /** Optional trailing action (44pt slot); replaces the step counter */
  action?: ReactNode;
  /** Progress bar fill 0–1. Hidden when omitted */
  progress?: number;
  className?: string;
};

/**
 * HC/App Bar (Figma 5:58) — mobile top bar for onboarding and sub-pages:
 * 44pt back target, centred title, step counter and a 4pt progress bar.
 */
export function AppBar({ title, showBack = true, backTo, onBack, step, action, progress, className }: AppBarProps) {
  const navigate = useNavigate();
  const back = <span className="hc-app-bar__back-icon" aria-hidden />;

  return (
    <header className={['hc-app-bar', className].filter(Boolean).join(' ')}>
      <div className="hc-app-bar__row">
        {showBack ? (
          backTo ? (
            <Link to={backTo} className="hc-app-bar__back" aria-label="Back" onClick={onBack}>
              {back}
            </Link>
          ) : (
            <button type="button" className="hc-app-bar__back" aria-label="Back" onClick={onBack ?? (() => navigate(-1))}>
              {back}
            </button>
          )
        ) : (
          <span className="hc-app-bar__slot" />
        )}
        <h1 className="hc-app-bar__title">{title}</h1>
        <div className="hc-app-bar__slot hc-app-bar__trailing">
          {action ?? (step && <span className="hc-app-bar__step">{step}</span>)}
        </div>
      </div>
      {progress != null && (
        <div
          className="hc-app-bar__progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(Math.min(1, Math.max(0, progress)) * 100)}
          aria-label={step ? `Step ${step}` : 'Progress'}
        >
          <div className="hc-app-bar__progress-fill" style={{ width: `${Math.min(1, Math.max(0, progress)) * 100}%` }} />
        </div>
      )}
    </header>
  );
}
