import { SideNavFooterItem, SideNavShell } from '../WebSideNav/WebSideNav';
import { vendorNavItems, type VendorNavKey } from '../VendorTabBar/VendorTabBar';
import './VendorWebSideNav.css';

export type VendorWebSideNavProps = {
  /** Key of the highlighted item: today | requests | jobs | earnings | account */
  active?: VendorNavKey;
  /** Override the `to` route per item key (defaults /vendor/<key>) */
  paths?: Partial<Record<VendorNavKey, string>>;
  /** Business switcher. Defaults "Business" / "Copperwick Pipe Co." */
  switcherLabel?: string;
  switcherValue?: string;
  onSwitcherClick?: () => void;
  /** Help row pinned at the bottom. Default route "/vendor/help" */
  helpTo?: string;
  onHelp?: () => void;
  logoTo?: string;
  className?: string;
};

/** HC/Vendor Web Side Nav (Figma 76:510) — Active Today/Requests/Jobs/Earnings/Account, plus Help. */
export function VendorWebSideNav({
  switcherLabel = 'Business',
  switcherValue = 'Copperwick Pipe Co.',
  helpTo = '/vendor/help',
  onHelp,
  ...props
}: VendorWebSideNavProps) {
  return (
    <SideNavShell
      items={vendorNavItems}
      aria-label="Vendor"
      switcherLabel={switcherLabel}
      switcherValue={switcherValue}
      footer={<SideNavFooterItem label="Help" icon="help" to={helpTo} onClick={onHelp} />}
      {...props}
    />
  );
}
