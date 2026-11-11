import homeowner from './journeys.homeowner.json';

/** One step of a journey, from the Figma J pages ("<n>. <code> <label> (Mobile|Web)") */
export type JourneyStep = {
  /** Screen ID from the Screen Inventory, e.g. "C08" */
  code: string;
  /** Screen name; for screens reused in several journeys it names the variant (e.g. "Job tracker (tenant, status only)") */
  label: string;
  /** Figma node of the mobile instance on the J page */
  mobile?: string;
  /** Figma node of the web instance on the J page */
  web?: string;
};

export type Journey = {
  slug: string;
  name: string;
  /** Workflow references, e.g. "W7–W12" */
  workflows: string;
  /** Figma section node on the J page */
  figma: string;
  steps: JourneyStep[];
};

/** Screen set (src/app/screens/<role>/). All J1 screens, homeowner, landlord and tenant, live in "homeowner". */
export type RoleKey = 'homeowner';

export const journeys: Record<RoleKey, Journey[]> = {
  homeowner: homeowner as Journey[],
};

export const roleNames: Record<RoleKey, string> = {
  homeowner: 'Homeowner',
};

export function findJourney(role: RoleKey, slug: string | undefined) {
  return journeys[role].find((j) => j.slug === slug);
}

/* ------------------------------------------------------------------ */
/* URLs: /<user>/<journey>/<step>. The user is who you are playing     */
/* (homeowner, landlord or tenant), so the address shows it.           */
/* ------------------------------------------------------------------ */

export type UserKey = 'homeowner' | 'landlord' | 'tenant';
export const userKeys: UserKey[] = ['homeowner', 'landlord', 'tenant'];

/** Journeys that belong to one user, with the short slug used in their URL: /landlord/portfolio/1, /tenant/home/1 */
const ownJourneys: Record<string, { user: UserKey; slug: string }> = {
  'landlord-portfolio': { user: 'landlord', slug: 'portfolio' },
  tenant: { user: 'tenant', slug: 'home' },
};

/** The user whose step is on screen. Set by StepPage on every render, so links built anywhere keep that user. */
let activeUser: UserKey = 'homeowner';
export function setActiveUser(user: UserKey) {
  activeUser = user;
}

/**
 * URL of a step inside a journey (step is 1-based). A user's own journey always uses that user's address
 * (/landlord/portfolio/3); shared journeys use the current user's (/landlord/settings-and-account/1).
 */
export function stepPath(journey: string, step: number, user: UserKey = activeUser) {
  const own = ownJourneys[journey];
  return own ? `/${own.user}/${own.slug}/${step}` : `/${user}/${journey}/${step}`;
}

/** Journey for a URL slug under a user, plus the canonical path when the URL should redirect (old or mismatched links) */
export function journeyFromUrl(user: UserKey, urlSlug: string | undefined) {
  const own = Object.entries(ownJourneys).find(([, o]) => o.user === user && o.slug === urlSlug);
  if (own) return { journey: findJourney('homeowner', own[0]), redirect: false };
  const journey = findJourney('homeowner', urlSlug);
  // e.g. /homeowner/landlord-portfolio/2 → /landlord/portfolio/2
  return { journey, redirect: !!journey && !!ownJourneys[journey.slug] };
}

/**
 * First journey step that shows a given screen code, for links that jump across journeys. Looks in the current
 * user's own journey first, so a landlord stays in the landlord journey when the screen is there.
 */
export function screenPath(code: string, user: UserKey = activeUser) {
  const list = journeys.homeowner;
  const ownSlug = Object.entries(ownJourneys).find(([, o]) => o.user === user)?.[0];
  const ordered = [...list.filter((j) => j.slug === ownSlug), ...list.filter((j) => j.slug !== ownSlug)];
  for (const j of ordered) {
    const i = j.steps.findIndex((s) => s.code === code);
    if (i >= 0) return stepPath(j.slug, i + 1, user);
  }
  return '/';
}
