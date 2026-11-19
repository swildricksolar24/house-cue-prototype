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
  /** Greyed out and not clickable; `disabledTitle` is its tooltip */
  disabled?: boolean;
  disabledTitle?: string;
};

/** Pinned bottom row (Emergency / Help / Sign out). */
export function SideNavFooterItem({
  label,
  icon,
  tone = 'default',
  iconTone = 'text',
  to,
  onClick,
  disabled = false,
  disabledTitle = 'Not available yet',
}: SideNavFooterItemProps) {
  const className = [
    'hc-side-nav__item',
    'hc-side-nav__footer-item',
    `hc-side-nav__footer-item--${tone}`,
    iconTone === 'danger' && 'hc-side-nav__footer-item--danger-icon',
    disabled && 'hc-side-nav__item--disabled',
  ]
    .filter(Boolean)
    .join(' ');
  const content = (
    <>
      <Icon name={icon} size={24} />
      <span className="hc-side-nav__label">{label}</span>
    </>
  );
  if (disabled)
    return (
      <span className={className} aria-disabled="true" title={disabledTitle}>
        {content}
      </span>
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
  /** Items shown greyed out and not clickable (e.g. a destination that isn't built yet) */
  disabled?: K[];
  /** Tooltip on disabled items. Default "Not available yet" */
  disabledTitle?: string;
  /** Small muted line in the switcher card (e.g. "Home", "Business") */
  switcherLabel: string;
  /** Main switcher line; a ▾ is appended */
  switcherValue: string;
  onSwitcherClick?: () => void;
  /** The switcher's menu is open (sets aria-expanded and flips the ▾) */
  switcherExpanded?: boolean;
  /** Review change: leave out the switcher card (e.g. the prototype's web app nav) */
  hideSwitcher?: boolean;
  /** Review change: a small muted note after an item's label, after a dash, by item key (e.g. "Account – Landlord") */
  itemNotes?: Partial<Record<K, string>>;
  /** Route of the logo link. Default "/" */
  logoTo?: string;
  /** Row(s) above the first item */
  lead?: ReactNode;
  /** Review change: row(s) right after the last item, before the spacer (e.g. Emergency under Account) */
  trail?: ReactNode;
  footer?: ReactNode;
  className?: string;
  'aria-label'?: string;
};

export function SideNavShell<K extends string>({
  items,
  active,
  paths,
  disabled,
  disabledTitle = 'Not available yet',
  switcherLabel,
  switcherValue,
  onSwitcherClick,
  switcherExpanded,
  hideSwitcher = false,
  itemNotes,
  logoTo = '/',
  lead,
  trail,
  footer,
  className,
  'aria-label': ariaLabel = 'Main',
}: SideNavShellProps<K>) {
  return (
    <nav className={['hc-side-nav', className].filter(Boolean).join(' ')} aria-label={ariaLabel}>
      <Link to={logoTo} className="hc-side-nav__logo" aria-label="HouseCue home">
        {/* Review change: the logo stretches across the column (216px inside the padding) */}
        <Logo fill />
      </Link>
      {!hideSwitcher && (
        <button
          type="button"
          className={['hc-side-nav__switcher', switcherExpanded && 'is-open'].filter(Boolean).join(' ')}
          onClick={onSwitcherClick}
          aria-haspopup="menu"
          aria-expanded={switcherExpanded ?? false}
        >
          <span className="hc-side-nav__switcher-label">{switcherLabel}</span>
          <span className="hc-side-nav__switcher-value">
            {switcherValue}{' '}
            <span className="hc-side-nav__switcher-caret" aria-hidden>
              ▾
            </span>
          </span>
        </button>
      )}
      {lead}
      <ul className="hc-side-nav__items">
        {withPaths(items, paths).map((item) => {
          const isActive = item.key === active;
          const content = (
            <>
              <Icon name={item.icon} size={24} />
              {itemNotes?.[item.key] ? (
                <span className="hc-side-nav__text">
                  <span className="hc-side-nav__label">{item.label}</span>
                  <span className="hc-side-nav__note">– {itemNotes[item.key]}</span>
                </span>
              ) : (
                <span className="hc-side-nav__label">{item.label}</span>
              )}
            </>
          );
          return (
            <li key={item.key}>
              {disabled?.includes(item.key) ? (
                <span
                  className="hc-side-nav__item hc-side-nav__item--disabled"
                  aria-disabled="true"
                  title={disabledTitle}
                >
                  {content}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className={['hc-side-nav__item', isActive && 'hc-side-nav__item--active'].filter(Boolean).join(' ')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      {trail}
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
  /** Items shown greyed out and not clickable */
  disabled?: RoleNavKey[R][];
  /** Review change: a small muted note after an item's label (e.g. "Account – Landlord") */
  itemNotes?: Partial<Record<RoleNavKey[R], string>>;
  /** Tooltip on disabled items and a disabled Emergency row. Default "Not available yet" */
  disabledTitle?: string;
  /** Emergency row greyed out and not clickable */
  emergencyDisabled?: boolean;
  /** Switcher card text; defaults per role from Figma */
  switcherLabel?: string;
  switcherValue?: string;
  onSwitcherClick?: () => void;
  switcherExpanded?: boolean;
  /** Review change: leave out the switcher card */
  hideSwitcher?: boolean;
  /** Emergency row (above the first item). Default route "/emergency" */
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
  emergencyDisabled = false,
  disabledTitle,
  ...props
}: WebSideNavProps<R>) {
  const r = (role ?? 'homeowner') as AppRole;
  const items = roleNavItems[r] as NavItem<RoleNavKey[R]>[];
  return (
    <SideNavShell
      items={items}
      switcherLabel={switcherLabel ?? defaultSwitcher[r].label}
      switcherValue={switcherValue ?? defaultSwitcher[r].value}
      disabledTitle={disabledTitle}
      /* Review change: Emergency sits right under the last item (Account); it was above the first item, then pinned to
         the bottom (Figma) */
      trail={
        <SideNavFooterItem
          label="Emergency"
          icon="caution"
          tone="emergency"
          to={emergencyTo}
          onClick={onEmergency}
          disabled={emergencyDisabled}
          disabledTitle={disabledTitle}
        />
      }
      {...props}
    />
  );
}
