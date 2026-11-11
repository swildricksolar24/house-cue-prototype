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

/** URL of a step inside a journey: /homeowner/<journey>/<step number, 1-based> */
export function stepPath(role: RoleKey, journey: string, step: number) {
  return `/${role}/${journey}/${step}`;
}

/** First journey step that shows a given screen code, for links that jump across journeys */
export function screenPath(code: string, role: RoleKey = 'homeowner') {
  for (const j of journeys[role]) {
    const i = j.steps.findIndex((s) => s.code === code);
    if (i >= 0) return stepPath(role, j.slug, i + 1);
  }
  return '/';
}
