import { useState, type ReactNode } from 'react';
import { AppBar, type AppBarProps } from '../../components/AppBar/AppBar';
import { HomeHeader } from '../../components/HomeHeader/HomeHeader';
import { StatusBar } from '../../components/StatusBar/StatusBar';
import { TabBar, type AppRole, type RoleNavKey } from '../../components/TabBar/TabBar';
import { useOptionalFlow } from '../prototype/flow';
import { useCurrentHome } from '../prototype/HomeContext';
import { HomePicker } from './HomePicker';
import { ReceivedInvite } from './ReceivedInvite';
import { SetupActions, SetupTracker, useSetupEdits, useSetupFlow, useSetupTitle } from './SetupFlow';
import { homeownerPaths, landlordPaths, NOT_BUILT, navDisabled, tenantPaths, utilityPaths } from './navPaths';
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
  const { fromSetup, backToDashboard } = useSetupFlow();
  const setupEdits = useSetupEdits();
  const setupTitle = useSetupTitle();
  const { home } = useCurrentHome();
  const [picking, setPicking] = useState(false);
  const r = (role ?? 'homeowner') as AppRole;

  let top: ReactNode = null;
  if (header === 'home') {
    top = (
      <HomeHeader
        address={home.address}
        emergencyTo={utilityPaths.emergency}
        notificationsTo={utilityPaths.notifications}
        onSwitchHome={() => setPicking(true)}
      />
    );
  } else if (isAppBarProps(header)) {
    // Default back = previous journey step, unless the screen passes its own onBack or backTo. Review change: on a
    // setup screen opened from the C08 checklist (?from=setup) it goes back to the dashboard.
    const defaultBack = fromSetup ? backToDashboard : flow?.goBack;
    top = <AppBar {...header} onBack={header.onBack ?? (header.backTo ? undefined : defaultBack)} />;
  } else if (header) {
    top = header;
  }

  return (
    <div className={['hc-mobile-shell', `hc-mobile-shell--${background}`, setupTitle.className, className].filter(Boolean).join(' ')} style={setupTitle.style}>
      <StatusBar />
      {top}
      <main className={`hc-mobile-shell__body hc-mobile-shell__body--${padding}`} {...setupEdits.handlers}>
        {/* Review change: setup screens opened from the C08 checklist start with the step tracker (SetupFlow.tsx) */}
        <SetupTracker variant="mobile" />
        {children}
      </main>
      {/* …and end with Cancel / Save in place of the screen's own bottom actions or tab bar */}
      {fromSetup ? <SetupActions variant="mobile" edited={setupEdits.edited} /> : bottom}
      {!fromSetup && !bottom && tab && (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <TabBar role={r as any} active={tab as any} paths={rolePaths[r] as any} disabled={navDisabled[r] as any} disabledTitle={NOT_BUILT} />
      )}
      {picking && <HomePicker variant="sheet" onClose={() => setPicking(false)} />}
      {/* Review change: an invite from another home's owner (prototype shortcuts → Receive an invite) */}
      <ReceivedInvite />
    </div>
  );
}
