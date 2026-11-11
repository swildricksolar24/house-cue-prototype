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
function endPath(journey: Journey) {
  if (journey.slug === 'landlord-portfolio') return screenPath('C79');
  if (journey.slug === 'tenant') return screenPath('C84');
  return screenPath('C08');
}

export function FlowProvider({ role, journey, index, children }: { role: RoleKey; journey: Journey; index: number; children: ReactNode }) {
  const navigate = useNavigate();
  // Paths keep the current user (/landlord/…, /tenant/…); see stepPath / screenPath
  const nextPath = index + 1 < journey.steps.length ? stepPath(journey.slug, index + 2) : undefined;
  const backPath = index > 0 ? stepPath(journey.slug, index) : undefined;
  const flow: Flow = {
    role,
    journey,
    index,
    step: journey.steps[index],
    nextPath,
    backPath,
    // At the end of a journey the primary CTA returns to the role's home screen
    goNext: () => navigate({ pathname: nextPath ?? endPath(journey), search: '' }),
    goBack: () => (backPath ? navigate(backPath) : navigate(-1)),
    go: (code) => navigate(screenPath(code)),
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
