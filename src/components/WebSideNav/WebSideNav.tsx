import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon, type IconName } from '../Icon/Icon';
import { Logo } from '../Logo/Logo';
import { roleNavItems, withPaths, type AppRole, type NavItem, type RoleNavKey } from '../TabBar/TabBar';
import './WebSideNav.css';

/* ------------------------------------------------------------------ */
/* Shared 248px web menu shell (also used by VendorWebSideNav and      */
/* ConsoleSideNav): logo, switcher card, items, spacer, footer item.   */
/* ------------------------------------------------------------------ */

export type SideNavFooterItemProps = {
  label: string;
  icon: IconName;
  /** Emergency = danger outline + danger text/icon; Default = plain row with semibold label */
  tone?: 'default' | 'emergency';
  /** Icon colour for the default tone (Sign out uses danger) */
  iconTone?: 'text' | 'danger';
  to?: string;
  onClick?: () => void;
};

/** Pinned bottom row (Emergency / Help / Sign out). */
export function SideNavFooterItem({ label, icon, tone = 'default', iconTone = 'text', to, onClick }: SideNavFooterItemProps) {
  const className = [
    'hc-side-nav__item',
    'hc-side-nav__footer-item',
    `hc-side-nav__footer-item--${tone}`,
    iconTone === 'danger' && 'hc-side-nav__footer-item--danger-icon',
  ]
    .filter(Boolean)
    .join(' ');
  const content = (
    <>
      <Icon name={icon} size={24} />
      <span className="hc-side-nav__label">{label}</span>
    </>
  );
  return to ? (
    <Link to={to} className={className} onClick={onClick}>
      {content}
    </Link>
  ) : (
    <button type="button" className={className} onClick={onClick}>
      {content}
    </button>
  );
}

export type SideNavShellProps<K extends string> = {
  items: NavItem<K>[];
  active?: K;
  paths?: Partial<Record<K, string>>;
  /** Small muted line in the switcher card (e.g. "Home", "Business") */
  switcherLabel: string;
  /** Main switcher line; a ▾ is appended */
  switcherValue: string;
  onSwitcherClick?: () => void;
  /** Route of the logo link. Default "/" */
  logoTo?: string;
  footer?: ReactNode;
  className?: string;
  'aria-label'?: string;
};

export function SideNavShell<K extends string>({
  items,
  active,
  paths,
  switcherLabel,
  switcherValue,
  onSwitcherClick,
  logoTo = '/',
  footer,
  className,
  'aria-label': ariaLabel = 'Main',
}: SideNavShellProps<K>) {
  return (
    <nav className={['hc-side-nav', className].filter(Boolean).join(' ')} aria-label={ariaLabel}>
      <Link to={logoTo} className="hc-side-nav__logo" aria-label="HouseCue home">
        <Logo />
      </Link>
      <button type="button" className="hc-side-nav__switcher" onClick={onSwitcherClick} aria-haspopup="listbox">
        <span className="hc-side-nav__switcher-label">{switcherLabel}</span>
        <span className="hc-side-nav__switcher-value">
          {switcherValue} <span aria-hidden>▾</span>
        </span>
      </button>
      <ul className="hc-side-nav__items">
        {withPaths(items, paths).map((item) => {
          const isActive = item.key === active;
          return (
            <li key={item.key}>
              <Link
                to={item.to}
                className={['hc-side-nav__item', isActive && 'hc-side-nav__item--active'].filter(Boolean).join(' ')}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon name={item.icon} size={24} />
                <span className="hc-side-nav__label">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="hc-side-nav__spacer" />
      {footer}
    </nav>
  );
}

/* ------------------------------------------------------------------ */

const defaultSwitcher: Record<AppRole, { label: string; value: string }> = {
  homeowner: { label: 'Home', value: '2218 W Palm Ln, Phoenix' },
  landlord: { label: 'Portfolio', value: 'Mesa Verde Holdings · 5 properties' },
  tenant: { label: 'Tenant · Unit A', value: '1418 E Roosevelt St, Phoenix' },
};

export type WebSideNavProps<R extends AppRole = AppRole> = {
  /** Homeowner (5 items), Landlord (Portfolio first, no Agent — pair with AgentFab Extended), Tenant (4 items) */
  role?: R;
  /** Key of the highlighted item */
  active?: RoleNavKey[R];
  /** Override the `to` route per item key */
  paths?: Partial<Record<RoleNavKey[R], string>>;
  /** Switcher card text; defaults per role from Figma */
  switcherLabel?: string;
  switcherValue?: string;
  onSwitcherClick?: () => void;
  /** Emergency row (pinned bottom). Default route "/emergency" */
  emergencyTo?: string;
  onEmergency?: () => void;
  logoTo?: string;
  className?: string;
};

/** HC/Web Side Nav (Figma 92:21097) — Role Homeowner/Landlord/Tenant × Active. 248px web app menu. */
export function WebSideNav<R extends AppRole = 'homeowner'>({
  role,
  switcherLabel,
  switcherValue,
  emergencyTo = '/emergency',
  onEmergency,
  ...props
}: WebSideNavProps<R>) {
  const r = (role ?? 'homeowner') as AppRole;
  const items = roleNavItems[r] as NavItem<RoleNavKey[R]>[];
  return (
    <SideNavShell
      items={items}
      switcherLabel={switcherLabel ?? defaultSwitcher[r].label}
      switcherValue={switcherValue ?? defaultSwitcher[r].value}
      footer={<SideNavFooterItem label="Emergency" icon="caution" tone="emergency" to={emergencyTo} onClick={onEmergency} />}
      {...props}
    />
  );
}
