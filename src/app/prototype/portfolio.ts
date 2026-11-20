import { useSyncExternalStore } from 'react';
import type { PortfolioProperty } from '../data/sample';

/**
 * Review change: properties added on Add property (C80), so they show on the landlord Portfolio (C79), its property
 * detail page, Property rules and Tenants & access. Kept for the visit (sessionStorage), after Mesa Verde Holdings' own
 * five. Prototype only: a new property has no tenants (each door is vacant or occupied, no one invited), nothing open or spent yet, a budget of $100 a door a month and the
 * portfolio's default approval rules.
 */
/** Review change: each door's tenancy is chosen on Add property (was one Occupied now toggle for the whole property) */
export type DoorTenancy = 'vacant' | 'occupied';
/** budget: the monthly maintenance budget chosen on Add property (else $100 a door) */
/** Review change: a tenant invited on an occupied door on Add property (they're emailed to join) */
export type Invitee = { name: string; email: string };
/** tenants: the tenant invited on each door, by door index (occupied doors only) */
export type NewProperty = { address: string; city: string; units: number; doors: DoorTenancy[]; tenants?: (Invitee | undefined)[]; budget?: number; billing?: Billing; details?: PropertyDetails };
/** Door names: A, B, C … */
export const doorName = (i: number) => String.fromCharCode(65 + (i % 26));
/** Resize a door list to a new count (new doors start vacant) */
export const resizeDoors = (doors: DoorTenancy[], count: number): DoorTenancy[] =>
  Array.from({ length: count }, (_, i) => doors[i] ?? 'vacant');

/**
 * Review change: when each property's billing starts (next cycle or today, prorated). Chosen on Add property and
 * editable on the property's detail page. Its plan field is no longer used: the plan is account-wide (usePortfolioPlan).
 * Kept for the visit; a property with nothing chosen is Monthly, from the next cycle.
 */
export type Billing = { plan: 'monthly' | 'yearly'; start: 'next' | 'today' };
export const DEFAULT_BILLING: Billing = { plan: 'monthly', start: 'next' };
const BILLING_KEY = 'hc-property-billing';

function getBillingMap(): Record<string, Billing> {
  try {
    return JSON.parse(sessionStorage.getItem(BILLING_KEY) ?? '{}') as Record<string, Billing>;
  } catch {
    return {};
  }
}

export function getBilling(id: string): Billing {
  return getBillingMap()[id] ?? DEFAULT_BILLING;
}

export function setBilling(id: string, billing: Billing) {
  try {
    sessionStorage.setItem(BILLING_KEY, JSON.stringify({ ...getBillingMap(), [id]: billing }));
  } catch {
    /* storage unavailable */
  }
  version++;
  listeners.forEach((fn) => fn());
}

/** A property's billing; re-renders when it changes */
export function useBilling(id: string): Billing {
  useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => version,
  );
  return getBilling(id);
}

const KEY = 'hc-added-properties';
const listeners = new Set<() => void>();
let version = 0;

export function getAddedProperties(): PortfolioProperty[] {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? '[]') as PortfolioProperty[];
  } catch {
    return [];
  }
}

function save(list: PortfolioProperty[]) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
  version++;
  listeners.forEach((fn) => fn());
}

/** "1418 E Roosevelt St, Phoenix, AZ 85006" → street and city (Phoenix when there's no city) */
export function splitAddress(full: string): { address: string; city: string } {
  const [street, city] = full.split(',').map((s) => s.trim());
  return { address: street ?? full.trim(), city: city || 'Phoenix' };
}

function toProperty(p: NewProperty, index: number): PortfolioProperty {
  const units = `${p.units} ${p.units === 1 ? 'unit' : 'units'}`;
  const doors = resizeDoors(p.doors, p.units);
  const occupied = doors.filter((d) => d === 'occupied').length;
  return {
    id: `added-${Date.now().toString(36)}-${index}`,
    address: `${p.address}, ${p.city}`,
    short: p.address,
    city: p.city,
    units,
    mobileMeta: `${units} · ${occupied ? `${occupied} occupied · no tenants invited yet` : 'vacant'}`,
    // Review change: the building's tag sums its doors: "2 vacant" (or "Vacant" for one door), else "1 occupied"
    tenancy: occupied ? [`${occupied} occupied`, 'warning'] : [p.units === 1 ? 'Vacant' : `${p.units} vacant`, 'neutral'],
    // Review change: one row per door on the Portfolio table, each tagged New
    doors: doors.map((d, i) => ({ unit: doorName(i), tenancy: d, tenant: d === 'occupied' ? p.tenants?.[i]?.name : undefined })),
    open: 'Nothing open',
    spent: { month: 0, year: 0 },
    budget: { month: p.budget ?? 100 * p.units, year: 12 * (p.budget ?? 100 * p.units) },
    rules: { routine: 100, emergency: 600, own: false },
    // Review change: tenants invited on Add property show as Invite pending (Tenants & access, the property page)
    tenants: doors.flatMap((d, i) => {
      const t = d === 'occupied' ? p.tenants?.[i] : undefined;
      if (!t) return [];
      return [{ id: `invite-${index}-${i}`, name: t.name, email: t.email, unit: p.units === 1 ? '—' : doorName(i), status: 'Invite pending', tone: 'warning' as const, windows: 'Not set yet', since: 'Sent today', mobileMeta: `Invite pending · sent today to ${t.email}` }];
    }),
    isNew: true,
  };
}

/** Add properties (an address already in the list isn't added twice); returns how many were added */
export function addProperties(list: NewProperty[], existing: PortfolioProperty[]): number {
  const current = getAddedProperties();
  const taken = new Set([...existing, ...current].map((p) => p.short.toLowerCase()));
  const keep = list.filter((p) => !taken.has(p.address.toLowerCase()));
  const fresh = keep.map(toProperty);
  if (fresh.length) save([...current, ...fresh]);
  // Their billing choices, if any were made on Add property
  keep.forEach((p, i) => {
    if (p.billing) setBilling(fresh[i].id, p.billing);
    if (p.details) setDetails(fresh[i].id, p.details);
  });
  return fresh.length;
}

/**
 * Review change: the Portfolio plan (monthly or yearly) is one choice for the whole account, set on Account › Billing
 * (was chosen per property on Add property and the property page). Kept for the visit; Monthly until changed.
 */
export type PortfolioPlan = Billing['plan'];
const PLAN_KEY = 'hc-portfolio-plan';
export function getPortfolioPlan(): PortfolioPlan {
  try {
    return sessionStorage.getItem(PLAN_KEY) === 'yearly' ? 'yearly' : 'monthly';
  } catch {
    return 'monthly';
  }
}
export function setPortfolioPlan(plan: PortfolioPlan) {
  try {
    sessionStorage.setItem(PLAN_KEY, plan);
  } catch {
    /* storage unavailable */
  }
  version++;
  listeners.forEach((fn) => fn());
}
/** The account's plan; re-renders when it changes */
export function usePortfolioPlan(): PortfolioPlan {
  useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => version,
  );
  return getPortfolioPlan();
}
/** The plan as one line, e.g. "Portfolio · Monthly, $9.99 + $2/door" */
export const planLine = (plan: PortfolioPlan) => (plan === 'yearly' ? 'Portfolio · Yearly, $99 + $20/door' : 'Portfolio · Monthly, $9.99 + $2/door');

/** The added properties; re-renders when one is added */
export function useAddedProperties(): PortfolioProperty[] {
  useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => version,
  );
  return getAddedProperties();
}

/** The Billing starts drop-down options (Add property, its Fix this address dialog, the property detail page) */
export const BILLING_START_OPTIONS = [
  { value: 'next', label: 'Next cycle · Dec 1' },
  { value: 'today', label: 'Today · prorated' },
];

/**
 * Review change: a property's own approval rules, saved in the Property rules card on its page (C79 ?property=<id>; the C81 page is removed) and shown on its
 * detail page. Kept for the visit; a property with none saved uses the rules in the sample data.
 */
/** Review change: allowed (report categories) and showCosts are saved too, from the rules on the property page */
export type PropertyRules = { routine: number; emergency: number; emergencyRules: boolean; allowed?: string[]; showCosts?: boolean };
const RULES_KEY = 'hc-property-rules';

function getRulesMap(): Record<string, PropertyRules> {
  try {
    return JSON.parse(sessionStorage.getItem(RULES_KEY) ?? '{}') as Record<string, PropertyRules>;
  } catch {
    return {};
  }
}

export function getPropertyRules(id: string): PropertyRules | undefined {
  return getRulesMap()[id];
}

export function setPropertyRules(id: string, rules: PropertyRules) {
  try {
    sessionStorage.setItem(RULES_KEY, JSON.stringify({ ...getRulesMap(), [id]: rules }));
  } catch {
    /* storage unavailable */
  }
  version++;
  listeners.forEach((fn) => fn());
}

/** A property's saved rules (undefined when none); re-renders when they change */
export function usePropertyRules(id: string): PropertyRules | undefined {
  useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => version,
  );
  return getPropertyRules(id);
}

/**
 * Review change: the landlord's business name ("Mesa Verde Holdings" by default), editable as Business name in the
 * landlord's Settings (C34). Every screen that names the business reads it, landlord and tenant side, so a rename shows
 * everywhere for the visit (sessionStorage). Prototype only.
 */
export const DEFAULT_COMPANY = 'Mesa Verde Holdings';
const COMPANY_KEY = 'hc-company-name';

export function getCompanyName(): string {
  try {
    return sessionStorage.getItem(COMPANY_KEY) || DEFAULT_COMPANY;
  } catch {
    return DEFAULT_COMPANY;
  }
}

export function setCompanyName(name: string) {
  try {
    if (name.trim() && name.trim() !== DEFAULT_COMPANY) sessionStorage.setItem(COMPANY_KEY, name.trim());
    else sessionStorage.removeItem(COMPANY_KEY);
  } catch {
    /* storage unavailable */
  }
  version++;
  listeners.forEach((fn) => fn());
}

/** The business name; re-renders when it changes */
export function useCompanyName(): string {
  useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => version,
  );
  return getCompanyName();
}

/** Swap the default business name in a fixed sample string (e.g. an invite's text) for the saved one */
export const withCompany = (text: string) => (text.includes(DEFAULT_COMPANY) ? text.split(DEFAULT_COMPANY).join(getCompanyName()) : text);

/**
 * Review change: more about a property, from Add property's Property details section (looked up in public records,
 * read from an uploaded document or typed in) and editable on the property's page. Kept for the visit by property id.
 * `from` marks fields filled by an import (field key → where it came from) so they show a "From records" tag.
 */
export type ApplianceItem = { id: string; name: string; brand: string; age: string };
export type JobItem = { id: string; date: string; job: string; vendor: string; cost: string };
export type VendorItem = { id: string; name: string; trade: string; phone: string };
export type PropertyDetails = {
  yearBuilt: string;
  roof: string;
  foundation: string;
  sewer: string;
  hvac: string;
  acUnits: number;
  gas: string;
  solar: string;
  pool: string;
  electric: string;
  internet: string;
  gate: string;
  appliances: ApplianceItem[];
  jobs: JobItem[];
  vendors: VendorItem[];
  from: Record<string, 'records' | 'document' | 'file'>;
};
export const EMPTY_DETAILS: PropertyDetails = {
  yearBuilt: '',
  roof: '',
  foundation: '',
  sewer: '',
  hvac: '',
  acUnits: 0,
  gas: '',
  solar: '',
  pool: '',
  electric: '',
  internet: '',
  gate: '',
  appliances: [],
  jobs: [],
  vendors: [],
  from: {},
};
const DETAILS_KEY = 'hc-property-details';
function getDetailsMap(): Record<string, PropertyDetails> {
  try {
    return JSON.parse(sessionStorage.getItem(DETAILS_KEY) ?? '{}') as Record<string, PropertyDetails>;
  } catch {
    return {};
  }
}
export function getDetails(id: string): PropertyDetails {
  return { ...EMPTY_DETAILS, ...getDetailsMap()[id] };
}
export function setDetails(id: string, details: PropertyDetails) {
  try {
    sessionStorage.setItem(DETAILS_KEY, JSON.stringify({ ...getDetailsMap(), [id]: details }));
  } catch {
    /* storage unavailable */
  }
  version++;
  listeners.forEach((fn) => fn());
}
/** A property's details; re-renders when they change */
export function useDetails(id: string): PropertyDetails {
  useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => version,
  );
  return getDetails(id);
}

/**
 * Review change: tenant changes made on a unit's page (details saved, invites sent, invites revoked), kept for the
 * visit by property id so the property page's Tenants table, the Portfolio and the unit page all show them.
 */
type Tenant = PortfolioProperty['tenants'][number];
export type TenantChanges = { edited: Record<string, Tenant>; added: Tenant[]; revoked: string[] };
const TENANTS_KEY = 'hc-tenant-changes';
function getTenantChangesMap(): Record<string, TenantChanges> {
  try {
    return JSON.parse(sessionStorage.getItem(TENANTS_KEY) ?? '{}') as Record<string, TenantChanges>;
  } catch {
    return {};
  }
}
export function getTenantChanges(id: string): TenantChanges {
  const c: Partial<TenantChanges> = getTenantChangesMap()[id] ?? {};
  return { edited: c.edited ?? {}, added: c.added ?? [], revoked: c.revoked ?? [] };
}
export function setTenantChanges(id: string, changes: TenantChanges) {
  try {
    sessionStorage.setItem(TENANTS_KEY, JSON.stringify({ ...getTenantChangesMap(), [id]: changes }));
  } catch {
    /* storage unavailable */
  }
  version++;
  listeners.forEach((fn) => fn());
}
/** A property's tenants with this visit's changes applied */
export function tenantsOf(p: PortfolioProperty): Tenant[] {
  const c = getTenantChanges(p.id);
  return [...p.tenants, ...c.added].filter((t) => !c.revoked.includes(t.id)).map((t) => c.edited[t.id] ?? t);
}
/** Save, invite or revoke one tenant on a property */
export function saveTenant(p: PortfolioProperty, t: Tenant, isNew: boolean) {
  const c = getTenantChanges(p.id);
  setTenantChanges(p.id, isNew ? { ...c, added: [...c.added, t] } : { ...c, edited: { ...c.edited, [t.id]: t } });
}
export function revokeTenant(p: PortfolioProperty, id: string) {
  const c = getTenantChanges(p.id);
  setTenantChanges(p.id, { ...c, revoked: [...c.revoked, id] });
}
/** A property's tenants (with changes); re-renders when they change */
export function useTenants(p: PortfolioProperty): Tenant[] {
  useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => version,
  );
  return tenantsOf(p);
}

/**
 * Review change: properties removed with Remove property on their page, kept for the visit. An added property is taken
 * out of the added list; one of the sample five is remembered as removed so the Portfolio leaves it out.
 */
const REMOVED_KEY = 'hc-removed-properties';
export function getRemovedProperties(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(REMOVED_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}
export function removeProperty(id: string) {
  const added = getAddedProperties();
  if (added.some((p) => p.id === id)) save(added.filter((p) => p.id !== id));
  else {
    try {
      sessionStorage.setItem(REMOVED_KEY, JSON.stringify([...new Set([...getRemovedProperties(), id])]));
    } catch {
      /* storage unavailable */
    }
    version++;
    listeners.forEach((fn) => fn());
  }
}
/** Hide properties removed this visit */
export const withoutRemoved = <T extends { id: string }>(list: T[]): T[] => {
  const removed = getRemovedProperties();
  return list.filter((p) => !removed.includes(p.id));
};
