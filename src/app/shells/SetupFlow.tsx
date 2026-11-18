import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type SyntheticEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { setupChecklist } from '../data/sample';
import { screenPath } from '../prototype/journeys';
import { homeownerPaths } from './navPaths';

/**
 * Review change: the setup screens opened from the C08 checklist ("Finish setting up your home") run as one stepped
 * flow. The checklist's Edit buttons open a step with `?from=setup&step=<n>`; the shells read it:
 * - web (WebShell): "Back to dashboard" and the step tracker above the page content, Cancel / Save at the bottom
 * - mobile (MobileShell): the app bar's back arrow goes to the dashboard, the step tracker tops the content, and
 *   Cancel / Save replace the bottom actions / tab bar
 * The tracker reads "Step 3 of 9" with one segment per step (click to jump). Cancel goes back to the dashboard;
 * Save goes on to the next step (the last step returns to the dashboard). Save stays disabled until something on the
 * page is edited (useSetupEdits). Clicking Save first checks that every field on the step has a value (findMissing):
 * each empty one gets the HC/Input error state with its own message (flagMissing), a line by the buttons says how
 * many are missing, and focus goes to the first one. Editing a field clears its error. Works the same on all nine steps.
 * A step saved after an edit is marked done (useSetupProgress): the C08 card shows it as Done and the count / bar /
 * tracker update. Saved steps are remembered in this browser (localStorage).
 * Opened any other way (side nav, journey steps), the screens look as before.
 */

/** Screen for each checklist item, in checklist order */
export const setupScreens: Record<string, string> = {
  systems: 'C05',
  'agent-prefs': 'C42',
  calendar: 'C43',
  email: 'C44',
  rooms: 'C63',
  documents: 'C24',
  devices: 'C46',
  household: 'C35',
  payment: 'C30',
};

/* Steps saved in the setup flow, on top of the sample data's done items. Remembered in localStorage. */
const PROGRESS_KEY = 'hc-proto-setup-done';
const listeners = new Set<() => void>();
const readSaved = (): string => {
  try {
    return localStorage.getItem(PROGRESS_KEY) ?? '';
  } catch {
    return '';
  }
};
let savedIds = readSaved();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
function markStepDone(id: string) {
  const ids = new Set(savedIds.split(',').filter(Boolean));
  if (ids.has(id)) return;
  ids.add(id);
  savedIds = [...ids].join(',');
  try {
    localStorage.setItem(PROGRESS_KEY, savedIds);
  } catch {
    /* private mode: keep it for this visit only */
  }
  listeners.forEach((fn) => fn());
}

/** The setup checklist with each item's done state (sample data + steps saved in the flow) */
export function useSetupProgress() {
  const saved = useSyncExternalStore(subscribe, () => savedIds, () => '');
  const ids = new Set(saved.split(',').filter(Boolean));
  const items = setupChecklist.map((i) => (ids.has(i.id) && !i.done ? { ...i, done: true, meta: 'Done' } : i));
  return { items, completed: items.filter((i) => i.done).length, markStepDone };
}

/** Query string that opens checklist step `step` (1-based) in setup mode */
export const setupSearch = (step: number) => `?from=setup&step=${step}`;

export function useSetupFlow() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const fromSetup = params.get('from') === 'setup';
  const total = setupChecklist.length;
  const step = Math.min(total, Math.max(1, Number(params.get('step')) || 1));
  const backToDashboard = () => navigate(homeownerPaths.home);
  const goToStep = (n: number) => {
    const item = setupChecklist[n - 1];
    navigate({ pathname: screenPath(setupScreens[item.id] ?? 'C05'), search: setupSearch(n) });
  };
  const save = () => (step < total ? goToStep(step + 1) : backToDashboard());
  return { fromSetup, step, total, backToDashboard, goToStep, save };
}

/** Controls whose click is an edit (option cards, chips, toggles), besides typing / changing native fields */
const EDIT_CONTROLS =
  '[role="radio"], [role="checkbox"], [role="switch"], [role="option"], [role="menuitemradio"], [aria-pressed], input[type="checkbox"], input[type="radio"], select';
/** The setup flow's own controls never count as edits */
const FLOW_CONTROLS = '.hc-setup-tracker, .hc-setup-actions, .hc-web-shell__back, .hc-edit-dialog';

/** Content area of the current page (web main column or the phone screen's body) */
const contentArea = () => document.querySelector<HTMLElement>('.hc-web-shell__main, .hc-mobile-shell__body');

const isVisible = (el: HTMLElement) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
const labelText = (el: HTMLElement) =>
  ((el as HTMLInputElement).labels?.[0]?.textContent ?? el.getAttribute('aria-label') ?? '').toLowerCase();

/**
 * Fields on the step that still need a value: text fields, text areas and dropdowns that are empty, and option groups
 * with nothing picked. Skips fields labelled "(optional)", search boxes, read-only / disabled / hidden fields and the
 * setup flow's own controls.
 */
function findMissing(root: HTMLElement): HTMLElement[] {
  const missing: HTMLElement[] = [];
  root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select').forEach((el) => {
    if (el.closest(FLOW_CONTROLS) || el.disabled || !isVisible(el)) return;
    if (el instanceof HTMLInputElement && (['checkbox', 'radio', 'hidden', 'search', 'button', 'submit', 'file'].includes(el.type) || el.readOnly)) return;
    if (labelText(el).includes('optional') || /search/i.test(el.getAttribute('placeholder') ?? '')) return;
    if (!el.value.trim()) missing.push(el);
  });
  root.querySelectorAll<HTMLElement>('[role="radiogroup"]').forEach((group) => {
    if (group.closest(FLOW_CONTROLS) || !isVisible(group) || (group.getAttribute('aria-label') ?? '').toLowerCase().includes('optional')) return;
    const picked = group.querySelector('[aria-checked="true"], input:checked');
    if (!picked) missing.push(group);
  });
  return missing;
}

/** Message under an empty field */
const missingMessage = (el: HTMLElement) =>
  el.matches('select') ? 'Choose an option.' : el.matches('[role="radiogroup"]') ? 'Choose one.' : 'Enter a value.';

let errorSeq = 0;

/** Puts a field in the error state: HC/Input's red border + message when it's an HC/Input or HC/Select, else a red outline + message */
function flagMissing(el: HTMLElement) {
  const wrapper = el.closest<HTMLElement>('.hc-input');
  const target = wrapper ?? el;
  target.setAttribute('data-setup-missing', '');
  if (wrapper && !wrapper.classList.contains('hc-input--error')) {
    wrapper.classList.add('hc-input--error');
    wrapper.setAttribute('data-setup-error-class', '');
  }
  const msg = document.createElement('p');
  msg.className = 'hc-input__error hc-setup-error';
  msg.id = `hc-setup-error-${++errorSeq}`;
  msg.textContent = missingMessage(el);
  msg.setAttribute('data-setup-error', '');
  if (wrapper) wrapper.appendChild(msg);
  else el.insertAdjacentElement('afterend', msg);
  el.setAttribute('aria-invalid', 'true');
  el.setAttribute('aria-describedby', [el.getAttribute('aria-describedby'), msg.id].filter(Boolean).join(' '));
}

/** Undoes flagMissing for one field */
function clearMissing(target: HTMLElement) {
  target.removeAttribute('data-setup-missing');
  if (target.hasAttribute('data-setup-error-class')) {
    target.classList.remove('hc-input--error');
    target.removeAttribute('data-setup-error-class');
  }
  const msgs = target.classList.contains('hc-input')
    ? target.querySelectorAll<HTMLElement>('[data-setup-error]')
    : target.nextElementSibling?.matches('[data-setup-error]')
      ? [target.nextElementSibling as HTMLElement]
      : [];
  msgs.forEach((m) => {
    document.querySelectorAll(`[aria-describedby~="${m.id}"]`).forEach((f) => {
      const rest = (f.getAttribute('aria-describedby') ?? '').split(' ').filter((id) => id && id !== m.id).join(' ');
      if (rest) f.setAttribute('aria-describedby', rest);
      else f.removeAttribute('aria-describedby');
      f.removeAttribute('aria-invalid');
    });
    m.remove();
  });
}

/**
 * Has the current setup step been edited? The shells put `handlers` on their content area; typing, changing a field,
 * or clicking an option / chip / toggle marks the step edited. Each step (URL) starts unedited.
 */
export function useSetupEdits() {
  const { fromSetup } = useSetupFlow();
  const location = useLocation();
  const [edited, setEdited] = useState(false);
  useEffect(() => setEdited(false), [location.pathname, location.search]);
  const mark = (e: SyntheticEvent) => {
    const t = e.target as HTMLElement;
    // Editing a field flagged by Save clears its error
    const flagged = t.closest<HTMLElement>('[data-setup-missing]');
    if (flagged) clearMissing(flagged);
    if (!fromSetup || edited) return;
    // An edit dialog's Save is an edit; typing in the dialog and then cancelling isn't
    if (e.type === 'click' && t.closest('[data-setup-edit]')) return setEdited(true);
    if (t.closest(FLOW_CONTROLS)) return;
    if (e.type === 'click' && !t.closest(EDIT_CONTROLS)) return;
    setEdited(true);
  };
  return { edited, handlers: { onInputCapture: mark, onChangeCapture: mark, onClickCapture: mark } };
}

/**
 * Props for the shell around a setup step: the page title gets the step number in a circle (the checklist's circle:
 * green when the step is done, outlined when not). CSS draws it before the title (web: the page's h1; mobile: the app
 * bar title) from the --hc-setup-step variable, so the screens don't change.
 */
export function useSetupTitle(): { className?: string; style?: CSSProperties } {
  const { fromSetup, step } = useSetupFlow();
  const { items } = useSetupProgress();
  if (!fromSetup) return {};
  return {
    className: ['hc-setup-mode', items[step - 1]?.done && 'hc-setup-mode--done'].filter(Boolean).join(' '),
    style: { '--hc-setup-step': `"${step}"` } as CSSProperties,
  };
}

/** Web: "Back to dashboard" at the top of a setup step */
export function SetupBackButton() {
  const { fromSetup, backToDashboard } = useSetupFlow();
  if (!fromSetup) return null;
  return <PageBackButton label="Back to dashboard" onClick={backToDashboard} />;
}

/**
 * The web back button at the top of a sub page (review change): back arrow + "Back to <tab>". Shared by the Home
 * tab's setup steps ("Back to dashboard") and the Plan tab's sub pages ("Back to plan", WebShell), so they're identical.
 */
export function PageBackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="hc-web-shell__back" onClick={onClick}>
      <span className="hc-web-shell__back-icon" aria-hidden />
      {label}
    </button>
  );
}

/** Step tracker at the top of a setup step: "Step 3 of 9 · <task>", one segment per step (click to jump) */
export function SetupTracker({ variant }: { variant: 'web' | 'mobile' }) {
  const { fromSetup, step, total, goToStep } = useSetupFlow();
  const { items } = useSetupProgress();
  if (!fromSetup) return null;
  const current = setupChecklist[step - 1];
  return (
    <nav className={`hc-setup-tracker hc-setup-tracker--${variant}`} aria-label="Setup steps">
      <p className="hc-setup-tracker__label">
        <span className="hc-medium-semibold">
          Step {step} of {total}
        </span>
        <span className="hc-small hc-muted">{current.label}</span>
      </p>
      <ol className="hc-setup-tracker__steps">
        {items.map((item, i) => {
          const n = i + 1;
          const state = n === step ? 'current' : item.done ? 'done' : 'todo';
          return (
            <li key={item.id}>
              <button
                type="button"
                className={`hc-setup-tracker__step hc-setup-tracker__step--${state}`}
                aria-label={`Step ${n}: ${item.label}${item.done ? ', done' : ''}`}
                aria-current={n === step ? 'step' : undefined}
                title={item.label}
                onClick={() => goToStep(n)}
              />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

const SAVE_EVENT = 'hc-setup-save';
/**
 * Review change: a screen's own save button (e.g. C05 Add an item's "Save item") can run the setup step's Save: same
 * field check, marks the step done and moves on. Does nothing outside the setup flow.
 */
export const requestSetupSave = () => window.dispatchEvent(new Event(SAVE_EVENT));

/**
 * Cancel (back to the dashboard) and Save (next step; the last step returns to the dashboard) at the bottom. Save is
 * disabled until the step is edited.
 */
export function SetupActions({ variant, edited }: { variant: 'web' | 'mobile'; edited: boolean }) {
  const { fromSetup, step, backToDashboard, save } = useSetupFlow();
  const location = useLocation();
  const [missingCount, setMissingCount] = useState(0);
  useEffect(() => setMissingCount(0), [location.pathname, location.search]);
  // requestSetupSave() from the screen runs the latest trySave
  const saveRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    const onSave = () => saveRef.current?.();
    window.addEventListener(SAVE_EVENT, onSave);
    return () => window.removeEventListener(SAVE_EVENT, onSave);
  }, []);
  if (!fromSetup) return null;

  // Save checks every field first; anything empty is outlined and the step stays open
  const trySave = () => {
    const root = contentArea();
    if (!root) return save();
    root.querySelectorAll<HTMLElement>('[data-setup-missing]').forEach(clearMissing);
    const missing = findMissing(root);
    setMissingCount(missing.length);
    if (missing.length === 0) {
      // Saved after an edit (Save is only enabled once the step is edited): mark the step done on the dashboard
      markStepDone(setupChecklist[step - 1].id);
      return save();
    }
    missing.forEach(flagMissing);
    const first = missing[0];
    const focusable = first.matches('input, textarea, select') ? first : first.querySelector<HTMLElement>('button, input');
    first.scrollIntoView({ block: 'center', behavior: 'smooth' });
    focusable?.focus({ preventScroll: true });
  };
  saveRef.current = trySave;

  return (
    <div className={`hc-setup-actions hc-setup-actions--${variant}`}>
      {missingCount > 0 && (
        <p className="hc-small hc-setup-actions__error" role="alert">
          {missingCount === 1 ? '1 field still needs a value. Fill it in to save.' : `${missingCount} fields still need a value. Fill them in to save.`}
        </p>
      )}
      <Button variant="secondary" fullWidth={variant === 'mobile'} onClick={backToDashboard}>
        Cancel
      </Button>
      <Button fullWidth={variant === 'mobile'} disabled={!edited} onClick={trySave}>
        Save
      </Button>
    </div>
  );
}
