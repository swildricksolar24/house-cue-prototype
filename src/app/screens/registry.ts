import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

/** Props every screen receives */
export type ScreenProps = {
  /** The journey step label, e.g. "Job tracker (tenant, status only)" — screens reused in several journeys switch on it */
  variant: string;
};

type ScreenModule = { default: ComponentType<ScreenProps> };

/**
 * Screens are discovered by file name: src/app/screens/<role>/<CODE>-<slug>.tsx with a default export,
 * e.g. homeowner/C08-home-dashboard.tsx → key "homeowner/C08". Adding a screen needs no edit here.
 */
const modules = import.meta.glob<ScreenModule>('./*/*.tsx');

export const screens: Record<string, LazyExoticComponent<ComponentType<ScreenProps>>> = {};
for (const [path, load] of Object.entries(modules)) {
  const m = path.match(/^\.\/([^/]+)\/([A-Z]+\d+[a-z]?)-/);
  if (m) screens[`${m[1]}/${m[2]}`] = lazy(load);
}

export function getScreen(role: string, code: string) {
  return screens[`${role}/${code}`];
}
