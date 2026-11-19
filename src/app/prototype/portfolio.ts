import { useSyncExternalStore } from 'react';
import type { PortfolioProperty } from '../data/sample';

/**
 * Review change: properties added on Add property (C80), so they show on the landlord Portfolio (C79), its property
 * detail page, Property rules and Tenants & access. Kept for the visit (sessionStorage), after Mesa Verde Holdings' own
 * five. Prototype only: a new property has no tenants, nothing open or spent yet, a budget of $100 a door a month and the
 * portfolio's default approval rules.
 */
export type NewProperty = { address: string; city: string; units: number; occupied: boolean; billing?: Billing };

/**
 * Review change: each property's Portfolio plan billing (monthly $2 a door or yearly $20 a door) and when it starts.
 * Chosen on Add property (One property, or the Fix this address dialog) and editable on the property's detail page.
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
  return {
    id: `added-${Date.now().toString(36)}-${index}`,
    address: `${p.address}, ${p.city}`,
    short: p.address,
    city: p.city,
    units,
    mobileMeta: `${units} · ${p.occupied ? 'occupied · no tenants invited yet' : 'vacant'}`,
    tenancy: p.occupied ? ['No tenants invited', 'warning'] : ['Vacant', 'neutral'],
    open: 'Nothing open',
    spent: { month: 0, year: 0 },
    budget: { month: 100 * p.units, year: 1200 * p.units },
    rules: { routine: 100, emergency: 600, own: false },
    tenants: [],
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
  });
  return fresh.length;
}

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

/** The Plan and Billing starts drop-down options (Add property, its Fix this address dialog, the property detail page) */
export const BILLING_PLAN_OPTIONS = [
  { value: 'monthly', label: 'Monthly · $9.99 + $2/door' },
  { value: 'yearly', label: 'Yearly · $99 + $20/door' },
];
export const BILLING_START_OPTIONS = [
  { value: 'next', label: 'Next cycle · Dec 1' },
  { value: 'today', label: 'Today · prorated' },
];

/**
 * Review change: a property's own approval rules, saved on its Property rules page (C81 ?property=<id>) and shown on its
 * detail page. Kept for the visit; a property with none saved uses the rules in the sample data.
 */
export type PropertyRules = { routine: number; emergency: number; emergencyRules: boolean };
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
