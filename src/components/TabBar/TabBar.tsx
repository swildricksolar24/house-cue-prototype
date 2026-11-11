import { Link } from 'react-router-dom';
import { Icon, type IconName } from '../Icon/Icon';
import './TabBar.css';

/** One navigation destination, shared by the mobile tab bars and the web side navs. */
export type NavItem<K extends string = string> = {
  key: K;
  label: string;
  icon: IconName;
  to: string;
};

export type AppRole = 'homeowner' | 'landlord' | 'tenant';

export type HomeownerNavKey = 'home' | 'plan' | 'agent' | 'jobs' | 'account';
export type LandlordNavKey = 'portfolio' | 'home' | 'plan' | 'jobs' | 'account';
export type TenantNavKey = 'home' | 'agent' | 'jobs' | 'account';

export type RoleNavKey = {
  homeowner: HomeownerNavKey;
  landlord: LandlordNavKey;
  tenant: TenantNavKey;
};

/**
 * Locked app navigation per role (Figma HC/Tab Bar 5:188 description, Nov 9 role variants).
 * Landlord has no Agent tab: the agent is reached via HC/Agent FAB.
 */
export const roleNavItems: { [R in AppRole]: NavItem<RoleNavKey[R]>[] } = {
  homeowner: [
    { key: 'home', label: 'Home', icon: 'home', to: '/home' },
    { key: 'plan', label: 'Plan', icon: 'calendar', to: '/plan' },
    { key: 'agent', label: 'Agent', icon: 'chat', to: '/agent' },
    { key: 'jobs', label: 'Jobs', icon: 'tasks', to: '/jobs' },
    { key: 'account', label: 'Account', icon: 'account', to: '/account' },
  ],
  landlord: [
    { key: 'portfolio', label: 'Portfolio', icon: 'dashboard', to: '/landlord/portfolio' },
    { key: 'home', label: 'Home', icon: 'home', to: '/landlord/home' },
    { key: 'plan', label: 'Plan', icon: 'calendar', to: '/landlord/plan' },
    { key: 'jobs', label: 'Jobs', icon: 'tasks', to: '/landlord/jobs' },
    { key: 'account', label: 'Account', icon: 'account', to: '/landlord/account' },
  ],
  tenant: [
    { key: 'home', label: 'Home', icon: 'home', to: '/tenant/home' },
    { key: 'agent', label: 'Agent', icon: 'chat', to: '/tenant/agent' },
    { key: 'jobs', label: 'Jobs', icon: 'tasks', to: '/tenant/jobs' },
    { key: 'account', label: 'Account', icon: 'account', to: '/tenant/account' },
  ],
};

/** Applies a `paths` override ({ key: '/route' }) to a nav config. */
export function withPaths<K extends string>(items: NavItem<K>[], paths?: Partial<Record<K, string>>): NavItem<K>[] {
  if (!paths) return items;
  return items.map((item) => ({ ...item, to: paths[item.key] ?? item.to }));
}

type TabBarBaseProps<K extends string> = {
  /** Key of the highlighted tab */
  active?: K;
  /** Override the `to` route per tab key */
  paths?: Partial<Record<K, string>>;
  /** iOS home indicator strip (34pt). Default true. */
  showHomeIndicator?: boolean;
  className?: string;
  'aria-label'?: string;
};

export type TabBarProps<R extends AppRole = AppRole> = TabBarBaseProps<RoleNavKey[R]> & {
  /** Homeowner (5 tabs), Landlord (Portfolio first, no Agent), Tenant (4 tabs) */
  role?: R;
};

/** Renders any item list as a bottom tab bar. Used by TabBar and VendorTabBar. */
export function TabBarList<K extends string>({
  items,
  active,
  paths,
  showHomeIndicator = true,
  className,
  'aria-label': ariaLabel = 'Main',
}: TabBarBaseProps<K> & { items: NavItem<K>[] }) {
  return (
    <nav className={['hc-tab-bar', className].filter(Boolean).join(' ')} aria-label={ariaLabel}>
      <ul className="hc-tab-bar__tabs">
        {withPaths(items, paths).map((item) => {
          const isActive = item.key === active;
          return (
            <li key={item.key} className="hc-tab-bar__cell">
              <Link
                to={item.to}
                className={['hc-tab-bar__tab', isActive && 'hc-tab-bar__tab--active'].filter(Boolean).join(' ')}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon name={item.icon} size={24} />
                <span className="hc-tab-bar__label">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      {showHomeIndicator && (
        <div className="hc-tab-bar__home-indicator" aria-hidden>
          <span />
        </div>
      )}
    </nav>
  );
}

/** HC/Tab Bar (Figma 5:188) — Role Homeowner/Landlord/Tenant × Active. Mobile bottom navigation. */
export function TabBar<R extends AppRole = 'homeowner'>({ role, ...props }: TabBarProps<R>) {
  const items = roleNavItems[(role ?? 'homeowner') as AppRole] as NavItem<RoleNavKey[R]>[];
  return <TabBarList items={items} {...props} />;
}
