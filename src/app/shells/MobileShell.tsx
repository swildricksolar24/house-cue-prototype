import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, type AppBarProps } from '../../components/AppBar/AppBar';
import { HomeHeader } from '../../components/HomeHeader/HomeHeader';
import { StatusBar } from '../../components/StatusBar/StatusBar';
import { TabBar, type AppRole, type RoleNavKey } from '../../components/TabBar/TabBar';
import { currentHome } from '../data/sample';
import { useOptionalFlow } from '../prototype/flow';
import { homeownerPaths, landlordPaths, tenantPaths, utilityPaths } from './navPaths';
import './shells.css';

const rolePaths = { homeowner: homeownerPaths, landlord: landlordPaths, tenant: tenantPaths };

export type MobileShellProps<R extends AppRole = 'homeowner'> = {
  /**
   * Top of the screen under the status bar:
   * - "home": HC/Home Header (signed-in tabs: home switcher, Emergency, notifications)
   * - an AppBar props object: HC/App Bar (back + title); back defaults to the previous journey step
   * - any node: custom header
   * - omitted: nothing (splash, full-bleed screens)
   */
  header?: 'home' | AppBarProps | ReactNode;
  /** Role whose tab bar to show. Default homeowner */
  role?: R;
  /** Active tab; when set, the HC/Tab Bar is shown */
  tab?: RoleNavKey[R];
  /** Sticky bottom area, usually <BottomActions>; replaces the tab bar's spot */
  bottom?: ReactNode;
  /** Body padding: "default" = 16 top / 24 sides / 24 bottom with 16 gap (as Figma "content"); "none" = edge to edge */
  padding?: 'default' | 'none';
  /** Screen background. Mobile screens use card (white) by default; some use page */
  background?: 'card' | 'page';
  children: ReactNode;
  className?: string;
};

function isAppBarProps(h: unknown): h is AppBarProps {
  return typeof h === 'object' && h !== null && 'title' in h && !('$$typeof' in h);
}

/** Mobile 390×844 layout: status bar, header, scrolling content, tab bar or bottom actions. */
export function MobileShell<R extends AppRole = 'homeowner'>({
  header,
  role,
  tab,
  bottom,
  padding = 'default',
  background = 'card',
  children,
  className,
}: MobileShellProps<R>) {
  const flow = useOptionalFlow();
  const navigate = useNavigate();
  const r = (role ?? 'homeowner') as AppRole;

  let top: ReactNode = null;
  if (header === 'home') {
    top = (
      <HomeHeader
        address={currentHome.address}
        emergencyTo={utilityPaths.emergency}
        notificationsTo={utilityPaths.notifications}
        onSwitchHome={() => navigate(utilityPaths.homeSwitcher)}
      />
    );
  } else if (isAppBarProps(header)) {
    // Default back = previous journey step, unless the screen passes its own onBack or backTo
    top = <AppBar {...header} onBack={header.onBack ?? (header.backTo ? undefined : flow?.goBack)} />;
  } else if (header) {
    top = header;
  }

  return (
    <div className={['hc-mobile-shell', `hc-mobile-shell--${background}`, className].filter(Boolean).join(' ')}>
      <StatusBar />
      {top}
      <main className={`hc-mobile-shell__body hc-mobile-shell__body--${padding}`}>{children}</main>
      {bottom}
      {!bottom && tab && (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <TabBar role={r as any} active={tab as any} paths={rolePaths[r] as any} />
      )}
    </div>
  );
}
