import { createContext, useContext, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { screenPath, stepPath, type Journey, type JourneyStep, type RoleKey } from './journeys';

export type Flow = {
  role: RoleKey;
  journey: Journey;
  /** 0-based index of the current step */
  index: number;
  step: JourneyStep;
  nextPath?: string;
  backPath?: string;
  /** Go to the next step of this journey (no-op at the end) */
  goNext: () => void;
  /** Go to the previous step (or browser back at the start) */
  goBack: () => void;
  /** Jump to the first step showing a screen code, e.g. go('C14') */
  go: (code: string) => void;
};

const FlowCtx = createContext<Flow | null>(null);

/** Where a finished journey lands: landlord → Portfolio (C79), tenant → Tenant home (C84), otherwise Home (C08) */
function endPath(role: RoleKey, journey: Journey) {
  if (journey.slug === 'landlord-portfolio') return screenPath('C79', role);
  if (journey.slug === 'tenant') return screenPath('C84', role);
  return screenPath('C08', role);
}

export function FlowProvider({ role, journey, index, children }: { role: RoleKey; journey: Journey; index: number; children: ReactNode }) {
  const navigate = useNavigate();
  const nextPath = index + 1 < journey.steps.length ? stepPath(role, journey.slug, index + 2) : undefined;
  const backPath = index > 0 ? stepPath(role, journey.slug, index) : undefined;
  const flow: Flow = {
    role,
    journey,
    index,
    step: journey.steps[index],
    nextPath,
    backPath,
    // At the end of a journey the primary CTA returns to the role's home screen
    goNext: () => navigate({ pathname: nextPath ?? endPath(role, journey), search: '' }),
    goBack: () => (backPath ? navigate(backPath) : navigate(-1)),
    go: (code) => navigate(screenPath(code, role)),
  };
  return <FlowCtx.Provider value={flow}>{children}</FlowCtx.Provider>;
}

/** Current journey step and navigation helpers for a screen. Screens wire their primary CTA to goNext(). */
export function useFlow() {
  const f = useContext(FlowCtx);
  if (!f) throw new Error('useFlow must be used inside a journey step route');
  return f;
}

/** Same as useFlow but returns null outside a journey (e.g. in Storybook) */
export function useOptionalFlow() {
  return useContext(FlowCtx);
}
