import { Link } from 'react-router-dom';
import './ConsoleBreadcrumb.css';

export type ConsoleBreadcrumbProps = {
  /** Previous place (primary, semibold). Default "Support" */
  parent?: string;
  /** Route for the parent link; when omitted, onParentClick (or plain text) */
  parentTo?: string;
  onParentClick?: () => void;
  /** This screen (muted). Default "Ticket detail" */
  current?: string;
  className?: string;
};

/** HC/Console Breadcrumb (Figma 239:27269) — sits at the top of the support/admin header title block. */
export function ConsoleBreadcrumb({ parent = 'Support', parentTo, onParentClick, current = 'Ticket detail', className }: ConsoleBreadcrumbProps) {
  return (
    <nav className={['hc-console-breadcrumb', className].filter(Boolean).join(' ')} aria-label="Breadcrumb">
      <ol className="hc-console-breadcrumb__list">
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
