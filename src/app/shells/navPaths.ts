import type { HomeownerNavKey, LandlordNavKey, TenantNavKey } from '../../components/TabBar/TabBar';
import { screenPath } from '../prototype/journeys';

/**
 * Where each nav item goes in the prototype: the first journey step that shows its screen
 * (Screen Inventory: Home C08, Plan C11, Agent C09, Jobs C40, Account C34, Emergency C22, Notifications C33,
 * home switcher C38; landlord Portfolio C79; tenant Home C84).
 */
export const homeownerPaths: Record<HomeownerNavKey, string> = {
  home: screenPath('C08'),
  plan: screenPath('C11'),
  agent: screenPath('C09'),
  jobs: screenPath('C40'),
  account: screenPath('C34'),
};

export const landlordPaths: Record<LandlordNavKey, string> = {
  portfolio: screenPath('C79'),
  home: screenPath('C08'),
  plan: screenPath('C11'),
  jobs: screenPath('C40'),
  account: screenPath('C34'),
};

export const tenantPaths: Record<TenantNavKey, string> = {
  home: screenPath('C84'),
  agent: screenPath('C09'),
  jobs: screenPath('C40'),
  account: screenPath('C34'),
};

/** HC/Web Top Bar links (marketing + onboarding) */
export const topBarPaths = {
  home: screenPath('C39'),
  howItWorks: screenPath('C39'),
  membership: screenPath('C28'),
  forPros: screenPath('C39'),
  help: screenPath('C32'),
  login: screenPath('C02'),
  getStarted: screenPath('C02'),
};

export const utilityPaths = {
  emergency: screenPath('C22'),
  notifications: screenPath('C33'),
  homeSwitcher: screenPath('C38'),
};
