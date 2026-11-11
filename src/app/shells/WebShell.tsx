import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AppRole, RoleNavKey } from '../../components/TabBar/TabBar';
import { WebSideNav } from '../../components/WebSideNav/WebSideNav';
import { WebTopBar, type WebTopBarType } from '../../components/WebTopBar/WebTopBar';
import { currentHome } from '../data/sample';
import { homeownerPaths, landlordPaths, tenantPaths, topBarPaths, utilityPaths } from './navPaths';
import './shells.css';

const rolePaths = { homeowner: homeownerPaths, landlord: landlordPaths, tenant: tenantPaths };

export type WebShellProps<R extends AppRole = 'homeowner'> = {
  /**
   * - "app": signed-in app with the 248px HC/Web Side Nav (needs `nav`)
   * - "onboarding" / "marketing": HC/Web Top Bar over the page
   */
  layout?: 'app' | WebTopBarType;
  role?: R;
  /** Active side-nav item (layout "app") */
  nav?: RoleNavKey[R];
  /** Content width: "full" fills the area; "narrow" centres a 640px column (onboarding forms) */
  width?: 'full' | 'narrow';
  /** Page background: page (default) or card */
  background?: 'page' | 'card';
  children: ReactNode;
  className?: string;
};

/** Web 1440×900 layout: side nav + content for the signed-in app, or top bar + content for onboarding/marketing. */
export function WebShell<R extends AppRole = 'homeowner'>({
  layout = 'app',
  role,
  nav,
  width = 'full',
  background = 'page',
  children,
  className,
}: WebShellProps<R>) {
  const navigate = useNavigate();
  const r = (role ?? 'homeowner') as AppRole;
  const classes = ['hc-web-shell', `hc-web-shell--${layout}`, `hc-web-shell--${background}`, className].filter(Boolean).join(' ');
  const content = <main className={`hc-web-shell__main hc-web-shell__main--${width}`}>{children}</main>;

  if (layout !== 'app') {
    return (
      <div className={classes}>
        <WebTopBar type={layout} paths={topBarPaths} />
        {content}
      </div>
    );
  }

  return (
    <div className={classes}>
      <WebSideNav
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        role={r as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        active={nav as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        paths={rolePaths[r] as any}
        switcherValue={r === 'homeowner' ? `${currentHome.address}, ${currentHome.city}` : undefined}
        onSwitcherClick={() => navigate(utilityPaths.homeSwitcher)}
        emergencyTo={utilityPaths.emergency}
        logoTo={rolePaths[r].home}
        className="hc-web-shell__nav"
      />
      {content}
    </div>
  );
}
