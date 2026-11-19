import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { Logo } from '../../components/Logo/Logo';
import { Radio } from '../../components/Radio/Radio';
import { roleNavItems, type AppRole, type RoleNavKey } from '../../components/TabBar/TabBar';
import { WebSideNav } from '../../components/WebSideNav/WebSideNav';
import { WebTopBar, type WebTopBarType } from '../../components/WebTopBar/WebTopBar';
import { useAccounts } from '../prototype/accounts';
import { useOptionalFlow } from '../prototype/flow';
import { useCurrentHome } from '../prototype/HomeContext';
import { HomePicker } from './HomePicker';
import { ReceivedInvite } from './ReceivedInvite';
import { PageBackButton, SetupActions, SetupBackButton, SetupTracker, useSetupEdits, useSetupFlow, useSetupTitle } from './SetupFlow';
import { MenuButton, SiteMenu, type SiteMenuLink } from './SiteMenu';
import {
  emergencyDisabled,
  homeownerPaths,
  landlordPaths,
  logoPaths,
  navDisabled,
  NOT_BUILT,
  tenantPaths,
  topBarPaths,
  utilityPaths,
} from './navPaths';
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

/**
 * Home switcher inside the phone-width ☰ menu (review change): the address card opens the account's homes right
 * below it, inside the menu, instead of closing the menu for a separate picker. Picking a home makes it current and
 * folds the list back up (the menu stays open); "Manage homes" goes to C38.
 */
function MenuHomeSwitcher({ onManage }: { onManage: () => void }) {
  const { home, homes, setHomeId } = useCurrentHome();
  const [open, setOpen] = useState(false);
  return (
    <div className="hc-web-shell__menu-home">
      <button
        type="button"
        className={`hc-web-shell__menu-switcher${open ? ' is-open' : ''}`}
        aria-expanded={open}
        aria-controls="hc-menu-homes"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="hc-small hc-muted">Home</span>
        <span className="hc-medium-semibold hc-web-shell__menu-switcher-value">
          {`${home.address}, ${home.city}`}
          <span className="hc-web-shell__menu-switcher-caret" aria-hidden>
            ▾
          </span>
        </span>
      </button>
      {open && (
        <div id="hc-menu-homes" className="hc-web-shell__menu-homes">
          <div className="hc-home-picker__list" role="radiogroup" aria-label="Your homes">
            {homes.map((h) => (
              <Radio
                key={h.id}
                name="menu-current-home"
                value={h.id}
                checked={h.id === home.id}
                onChange={() => {
                  setHomeId(h.id);
                  setOpen(false);
                }}
                label={
                  <span className="hc-home-picker__option">
                    <span className="hc-medium-semibold">
                      {h.address}, {h.city}
                    </span>
                    <span className="hc-small hc-muted">{h.meta}</span>
                  </span>
                }
              />
            ))}
          </div>
          <Button variant="secondary" fullWidth onClick={onManage}>
            Manage homes
          </Button>
        </div>
      )}
    </div>
  );
}

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
  const { home } = useCurrentHome();
  // Review change: with more than one account (joined by invite), Switch account opens Choose an account
  const { hasOthers } = useAccounts();
  const [picking, setPicking] = useState(false);
  // Review change: at phone width the side menu (signed in) and the top bar's links (landing and top-bar pages) fold
  // into a ☰ that opens the same full-screen menu as the mobile landing page (SiteMenu)
  const [menuOpen, setMenuOpen] = useState(false);
  const r = (role ?? 'homeowner') as AppRole;
  // Review change: setup steps opened from the C08 checklist keep Home highlighted in the menu, whichever section the
  // screen belongs to (Agent preferences, Payments, …)
  const { fromSetup } = useSetupFlow();
  // A page under the Plan tab other than Plan itself (C11)
  const flow = useOptionalFlow();
  const planSubPage = layout === 'app' && nav === 'plan' && !fromSetup && !!flow && flow.step.code !== 'C11';
  const activeNav = fromSetup && r === 'homeowner' ? 'home' : nav;
  // Setup steps: Save turns on once something on the page is edited
  const setupEdits = useSetupEdits();
  // …and the page title gets the step number in a circle
  const setupTitle = useSetupTitle();
  const classes = ['hc-web-shell', `hc-web-shell--${layout}`, `hc-web-shell--${background}`, className].filter(Boolean).join(' ');
  const content = (
    <main
      className={[`hc-web-shell__main hc-web-shell__main--${width}`, layout === 'app' && setupTitle.className].filter(Boolean).join(' ')}
      style={layout === 'app' ? setupTitle.style : undefined}
      {...setupEdits.handlers}
    >
      {/* Review change: setup screens opened from the C08 checklist (signed-in pages only) get "Back to dashboard" and
          the step tracker on top, Cancel / Save at the bottom (SetupFlow.tsx) */}
      {layout === 'app' && <SetupBackButton />}
      {/* Review change: every Plan sub page starts with the same back button as the Home tab's pages, back to Plan */}
      {planSubPage && <PageBackButton label="Back to plan" onClick={() => navigate(r === 'landlord' ? landlordPaths.plan : homeownerPaths.plan)} />}
      {layout === 'app' && <SetupTracker variant="web" />}
      {children}
      {layout === 'app' && <SetupActions variant="web" edited={setupEdits.edited} />}
    </main>
  );

  if (layout !== 'app') {
    return (
      <div className={classes}>
        {/* Review change: no language picker in the prototype's top bar */}
        {/* Review change: no Log in while onboarding (onboarding-style top bar); the landing and top-bar pages keep it */}
        <WebTopBar type={layout} paths={topBarPaths} showLanguage={false} hideLogin={layout === 'onboarding'} />
        {layout === 'marketing' && (
          <>
            <div className="hc-web-shell__mbar">
              <Link to={topBarPaths.home} className="hc-web-shell__mbar-logo" aria-label="HouseCue home">
                <Logo />
              </Link>
              <MenuButton open={menuOpen} onClick={() => setMenuOpen(true)} controls="hc-shell-menu" />
            </div>
            {menuOpen && (
              <SiteMenu
                id="hc-shell-menu"
                onClose={() => setMenuOpen(false)}
                links={[
                  { label: 'How it works', onClick: () => navigate(topBarPaths.howItWorks) },
                  { label: 'Membership', onClick: () => navigate(topBarPaths.membership) },
                  { label: 'For Pros', onClick: () => navigate(topBarPaths.forPros) },
                  { label: 'Help', onClick: () => navigate(topBarPaths.help) },
                ]}
                actions={
                  <>
                    <Button variant="secondary" size="large" fullWidth onClick={() => navigate(topBarPaths.login)}>
                      Log in
                    </Button>
                    <Button size="large" fullWidth onClick={() => navigate(topBarPaths.getStarted)}>
                      Get started
                    </Button>
                  </>
                }
              />
            )}
          </>
        )}
        {content}
        <ReceivedInvite />
      </div>
    );
  }

  // Review change: nav items whose flow isn't built for this role (navDisabled, e.g. the landlord's Home and Plan) and a
  // landlord's Emergency are greyed out and can't be clicked, here and in the ☰ menu
  const disabledNav = navDisabled[r] as string[];
  const appLinks: SiteMenuLink[] = (roleNavItems[r] as { key: string; label: string }[]).map((item) => ({
    label: item.label,
    current: item.key === activeNav,
    disabled: disabledNav.includes(item.key),
    onClick: () => navigate((rolePaths[r] as Record<string, string>)[item.key]),
  }));
  if (hasOthers) appLinks.push({ label: 'Switch account', onClick: () => navigate('/accounts') });

  return (
    <div className={classes}>
      <WebSideNav
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        role={r as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        active={activeNav as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        paths={rolePaths[r] as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        disabled={disabledNav as any}
        disabledTitle={NOT_BUILT}
        emergencyDisabled={emergencyDisabled[r]}
        switcherValue={r === 'homeowner' ? `${home.address}, ${home.city}` : undefined}
        // Homeowner: pick from the account's homes (dropdown under the card; the card toggles it); landlord / tenant
        // switchers open C38, or Choose an account when you have more than one account (review change)
        onSwitcherClick={() => (r === 'homeowner' ? setPicking((p) => !p) : navigate(hasOthers ? '/accounts' : utilityPaths.homeSwitcher))}
        switcherExpanded={r === 'homeowner' ? picking : undefined}
        emergencyTo={utilityPaths.emergency}
        logoTo={logoPaths[r]}
        className="hc-web-shell__nav"
      />
      <div className="hc-web-shell__mbar">
        <Link to={logoPaths[r]} className="hc-web-shell__mbar-logo" aria-label="HouseCue home">
          <Logo />
        </Link>
        <MenuButton open={menuOpen} onClick={() => setMenuOpen(true)} controls="hc-shell-menu" />
      </div>
      {menuOpen && (
        <SiteMenu
          id="hc-shell-menu"
          onClose={() => setMenuOpen(false)}
          top={
            r === 'homeowner' ? (
              <MenuHomeSwitcher
                onManage={() => {
                  setMenuOpen(false);
                  navigate(utilityPaths.homeSwitcher);
                }}
              />
            ) : undefined
          }
          links={appLinks}
          actions={
            <Button
              variant="secondary"
              size="large"
              fullWidth
              className="hc-site-menu__emergency"
              leadingIcon="caution"
              disabled={emergencyDisabled[r]}
              title={emergencyDisabled[r] ? NOT_BUILT : undefined}
              onClick={() => navigate(utilityPaths.emergency)}
            >
              Emergency
            </Button>
          }
        />
      )}
      {content}
      {/* Review change: an invite from another home's owner (prototype shortcuts → Receive an invite) */}
      <ReceivedInvite />
      {picking && (
        <HomePicker
          variant="dropdown"
          anchor={document.querySelector<HTMLElement>('.hc-web-shell__nav .hc-side-nav__switcher')}
          onClose={() => setPicking(false)}
        />
      )}
    </div>
  );
}
