import { TabBarList, type NavItem } from '../TabBar/TabBar';
import './VendorTabBar.css';

export type VendorNavKey = 'today' | 'requests' | 'jobs' | 'earnings' | 'account';

/** Vendor navigation (Figma HC/Vendor Tab Bar 41:458), shared with VendorWebSideNav. */
export const vendorNavItems: NavItem<VendorNavKey>[] = [
  { key: 'today', label: 'Today', icon: 'home', to: '/vendor/today' },
  { key: 'requests', label: 'Requests', icon: 'email', to: '/vendor/requests' },
  { key: 'jobs', label: 'Jobs', icon: 'tasks', to: '/vendor/jobs' },
  { key: 'earnings', label: 'Earnings', icon: 'dollar-sign', to: '/vendor/earnings' },
  { key: 'account', label: 'Account', icon: 'account', to: '/vendor/account' },
];

export type VendorTabBarProps = {
  /** Key of the highlighted tab */
  active?: VendorNavKey;
  /** Override the `to` route per tab key */
  paths?: Partial<Record<VendorNavKey, string>>;
  /** iOS home indicator strip (34pt). Default true. */
  showHomeIndicator?: boolean;
  className?: string;
};

/** HC/Vendor Tab Bar (Figma 41:458) — Active Today/Requests/Jobs/Earnings/Account. Same anatomy as HC/Tab Bar. */
export function VendorTabBar(props: VendorTabBarProps) {
  return <TabBarList items={vendorNavItems} aria-label="Vendor" {...props} />;
}
