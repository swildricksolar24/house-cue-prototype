import { Link } from 'react-router-dom';
import { Icon } from '../Icon/Icon';
import './ConsoleBreadcrumb.css';

export type ConsoleBreadcrumbProps = {
  /** Previous place (primary, semibold). Default "Support" */
  parent?: string;
  /** Route for the parent link; when omitted, onParentClick (or plain text) */
  parentTo?: string;
  onParentClick?: () => void;
  /** This screen (muted). Default "Ticket detail" */
  current?: string;
  /**
   * Route for a home icon link before the parent (review change), e.g. the landlord Portfolio; no icon when omitted.
   * `homeLabel` is its accessible name (default "Home").
   */
  homeTo?: string;
  homeLabel?: string;
  className?: string;
};

/** HC/Console Breadcrumb (Figma 239:27269) — sits at the top of the support/admin header title block. */
export function ConsoleBreadcrumb({
  parent = 'Support',
  parentTo,
  onParentClick,
  current = 'Ticket detail',
  homeTo,
  homeLabel = 'Home',
  className,
}: ConsoleBreadcrumbProps) {
  return (
    <nav className={['hc-console-breadcrumb', className].filter(Boolean).join(' ')} aria-label="Breadcrumb">
      <ol className="hc-console-breadcrumb__list">
        {homeTo && (
          <>
            <li>
              <Link to={homeTo} className="hc-console-breadcrumb__home" aria-label={homeLabel} title={homeLabel}>
                <Icon name="home" size={16} />
              </Link>
            </li>
            <li className="hc-console-breadcrumb__sep" aria-hidden>
              /
            </li>
          </>
        )}
        <li>
          {parentTo ? (
            <Link to={parentTo} className="hc-console-breadcrumb__parent" onClick={onParentClick}>
              {parent}
            </Link>
          ) : onParentClick ? (
            <button type="button" className="hc-console-breadcrumb__parent" onClick={onParentClick}>
              {parent}
            </button>
          ) : (
            <span className="hc-console-breadcrumb__parent">{parent}</span>
          )}
        </li>
        <li className="hc-console-breadcrumb__sep" aria-hidden>
          /
        </li>
        <li className="hc-console-breadcrumb__current" aria-current="page">
          {current}
        </li>
      </ol>
    </nav>
  );
}
