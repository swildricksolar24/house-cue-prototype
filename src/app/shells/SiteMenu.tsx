import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { Logo } from '../../components/Logo/Logo';
import './SiteMenu.css';

/**
 * Full-screen floating menu (review change), shared so every small-screen menu looks and works the same:
 * - the landing page on mobile (C39: How it works, Membership, For Pros, Help + Log in / Get started),
 * - the signed-out top bar at phone width (WebShell marketing layout, same items),
 * - the signed-in side menu at phone width (WebShell app layout: Home, Plan, Agent, Jobs, Account + Emergency).
 * Logo and × on top, large links with dividers, actions pinned to the bottom. × or Escape closes it.
 * position: fixed covers the phone frame (DeviceFrame) on mobile, or the window on web.
 * Not a screen and not an HC component (there's no HC menu yet).
 */
/** `disabled`: greyed out and not clickable (a destination that isn't in the prototype yet) */
export type SiteMenuLink = { label: string; onClick: () => void; current?: boolean; icon?: ReactNode; disabled?: boolean };

export function SiteMenu({
  id,
  links,
  actions,
  top,
  onClose,
  statusBar = false,
}: {
  id?: string;
  links: SiteMenuLink[];
  /** Pinned to the bottom (buttons) */
  actions?: ReactNode;
  /** Optional row between the header and the links (e.g. the home switcher) */
  top?: ReactNode;
  onClose: () => void;
  /** Leave room for the phone status bar (mobile frame) */
  statusBar?: boolean;
}) {
  const head = useRef<HTMLDivElement>(null);

  // Review change: open and closed must not jump. Line the menu's logo and × up with the bar's logo and ☰ (the
  // button with aria-controls = this menu's id), wherever that bar sits: the sticky web bar, or the mobile landing
  // header, which scrolls with the page. Runs before paint, so the header never shows in the wrong place.
  useLayoutEffect(() => {
    const el = head.current;
    const trigger = id ? document.querySelector<HTMLElement>(`[aria-controls="${id}"]`) : null;
    const close = el?.querySelector<HTMLElement>('.hc-site-menu-btn');
    if (!el || !trigger || !close) return;
    const t = trigger.getBoundingClientRect();
    if (t.bottom <= 0) return; // the bar has scrolled away; keep the default spot
    const dy = t.top - close.getBoundingClientRect().top;
    if (Math.abs(dy) > 0.5) el.style.marginTop = `${dy}px`;
  }, [id]);

  return (
    <div
      id={id}
      className={`hc-site-menu${statusBar ? ' hc-site-menu--status-bar' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div ref={head} className="hc-site-menu__head">
        <Logo />
        <MenuButton open onClick={onClose} autoFocus />
      </div>
      {top}
      <nav className="hc-site-menu__links" aria-label="Site">
        {links.map((l) => (
          <button
            key={l.label}
            type="button"
            className={l.current ? 'is-current' : undefined}
            aria-current={l.current ? 'page' : undefined}
            disabled={l.disabled}
            title={l.disabled ? 'Not in the prototype yet' : undefined}
            onClick={() => {
              onClose();
              l.onClick();
            }}
          >
            {l.icon}
            {l.label}
          </button>
        ))}
      </nav>
      {actions && <div className="hc-site-menu__actions">{actions}</div>}
    </div>
  );
}

/** The ☰ / × button that opens and closes the menu */
export function MenuButton({
  open,
  onClick,
  controls,
  autoFocus,
  className,
}: {
  open: boolean;
  onClick: () => void;
  controls?: string;
  autoFocus?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={['hc-site-menu-btn', open && 'is-open', className].filter(Boolean).join(' ')}
      aria-label={open ? 'Close menu' : 'Menu'}
      aria-expanded={open}
      aria-controls={controls}
      onClick={onClick}
      autoFocus={autoFocus}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        {/* Review change: three lines that morph ☰ ⇄ × (SiteMenu.css). The bar's button turns back into ☰ as the
            menu closes; the menu's own × plays ☰ → × as it opens. */}
        <path className="hc-site-menu-btn__top" d="M4 7h16" />
        <path className="hc-site-menu-btn__mid" d="M4 12h16" />
        <path className="hc-site-menu-btn__bot" d="M4 17h16" />
      </svg>
    </button>
  );
}
