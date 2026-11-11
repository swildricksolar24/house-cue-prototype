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
    Object.defineProperty(out, key, { enumerable: true, get: () => screenPath(codes[key]) });
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

export const landlordPaths: Record<LandlordNavKey, string> = paths({
  portfolio: 'C79',
  home: 'C08',
  plan: 'C11',
  jobs: 'C40',
  account: 'C34',
});

export const tenantPaths: Record<TenantNavKey, string> = paths({
  home: 'C84',
  agent: 'C09',
  jobs: 'C40',
  account: 'C34',
});

/** HC/Web Top Bar links (marketing + onboarding) */
export const topBarPaths = paths({
  home: 'C39',
  howItWorks: 'C39',
  membership: 'C28',
  forPros: 'C39',
  help: 'C32',
  login: 'C02',
  getStarted: 'C02',
});

export const utilityPaths = paths({
  emergency: 'C22',
  notifications: 'C33',
  homeSwitcher: 'C38',
});
