import type { HomeownerNavKey, LandlordNavKey, TenantNavKey } from '../../components/TabBar/TabBar';
import { screenPath } from '../prototype/journeys';

/**
 * Where each nav item goes in the prototype: the first journey step that shows its screen
 * (Screen Inventory: Home C08, Plan C11, Agent C09, Jobs C40, Account C34, Emergency C22, Notifications C33,
 * home switcher C38; landlord Portfolio C79; tenant Home C84).
 * Getters, so each link is built when it's read and keeps the current user in the URL (/landlord/…, /tenant/…).
 */
const paths = <K extends string>(codes: Record<K, string>) => {
  const out = {} as Record<K, string>;
  for (const key of Object.keys(codes) as K[]) {
    // A code may carry a branch, e.g. 'C02?state=signin'
    const [code, query] = codes[key].split('?');
    Object.defineProperty(out, key, { enumerable: true, get: () => screenPath(code) + (query ? `?${query}` : '') });
  }
  return out;
};

export const homeownerPaths: Record<HomeownerNavKey, string> = paths({
  home: 'C08',
  plan: 'C11',
  agent: 'C09',
  jobs: 'C40',
  account: 'C34',
});

/**
 * Review change: the landlord nav opens the landlord screens that are built: Jobs → C86 Approval queue (the landlord's
 * jobs, it highlights Jobs) and Account → C89 Portfolio billing (it highlights Account). Home and Plan have no landlord
 * screens yet (they used to open Marty's homeowner C08 / C11), so they're disabled, see navDisabled below; their paths
 * stay for the type and Back to plan.
 */
export const landlordPaths: Record<LandlordNavKey, string> = paths({
  portfolio: 'C79',
  home: 'C08',
  plan: 'C11',
  jobs: 'C86',
  account: 'C89',
});

/** Tooltip on nav items that are disabled because their flow isn't in the prototype yet */
export const NOT_BUILT = 'Not in the prototype yet';

/**
 * Review change: nav items per role whose flow isn't built yet. They show greyed out and can't be clicked (side nav,
 * tab bar and the phone-width ☰ menu). Remove a key here once its screens exist.
 */
export const navDisabled: { homeowner: HomeownerNavKey[]; landlord: LandlordNavKey[]; tenant: TenantNavKey[] } = {
  homeowner: [],
  landlord: ['home', 'plan'],
  tenant: [],
};

/** Review change: Emergency has no landlord flow yet (C22 is the homeowner's), so it's disabled for landlords */
export const emergencyDisabled: Record<'homeowner' | 'landlord' | 'tenant', boolean> = {
  homeowner: false,
  landlord: true,
  tenant: false,
};

/** Where the logo goes per role: the role's first nav item */
export const logoPaths = {
  get homeowner() {
    return homeownerPaths.home;
  },
  get landlord() {
    return landlordPaths.portfolio;
  },
  get tenant() {
    return tenantPaths.home;
  },
};

export const tenantPaths: Record<TenantNavKey, string> = paths({
  home: 'C84',
  agent: 'C09',
  jobs: 'C40',
  account: 'C34',
});

/** HC/Web Top Bar links (marketing + onboarding) */
export const topBarPaths = paths({
  home: 'C39',
  // Its own signed-out page: C39 with ?view=how-it-works (the three steps stacked)
  howItWorks: 'C39?view=how-it-works',
  // Signed-out versions (top bar, no side menu): see C28 / C32 ?visitor=1
  membership: 'C28?visitor=1',
  forPros: 'C39?view=for-pros',
  help: 'C32?visitor=1',
  // Log in opens C02 in sign-in mode (returning user)
  login: 'C02?state=signin',
  getStarted: 'C02',
});

export const utilityPaths = paths({
  emergency: 'C22',
  notifications: 'C33',
  homeSwitcher: 'C38',
});
