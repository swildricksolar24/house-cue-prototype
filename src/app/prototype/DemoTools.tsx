import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../components/Button/Button';
import { Icon } from '../../components/Icon/Icon';
import { Switch } from '../../components/Switch/Switch';
import { usePrototype } from './PrototypeContext';

/**
 * Sun (light mode) / moon (dark mode) for the Dark mode switch, Material "light_mode" / "dark_mode" shapes (the HC
 * icon set has neither). Both are drawn; CSS turns and fades between them when the theme changes. Prototype chrome only.
 */
function ThemeIcon({ dark }: { dark: boolean }) {
  return (
    <span className={`hc-proto-demo__icon hc-proto-demo__theme-icon${dark ? ' is-dark' : ''}`} title={dark ? 'Dark mode' : 'Light mode'} aria-hidden>
      <svg className="hc-proto-demo__sun" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5ZM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1Zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1ZM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1Zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1ZM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58Zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06Zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06ZM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06Z"
          fill="currentColor"
        />
      </svg>
      <svg className="hc-proto-demo__moon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

/** A shortcut a screen offers on the demo card, e.g. "Use demo code" or "Accept required agreements" */
export type DemoAction = { label: string; onClick: () => void };

type Ctx = { ref: MutableRefObject<DemoAction[]>; setKey: (k: string) => void };
const DemoCtx = createContext<Ctx | null>(null);

/**
 * Wraps a journey step: shows the demo card on every step and lets the screen add its own shortcuts.
 * The card is prototype-only (not in Figma), modelled on hub360's "Use demo account".
 */
export function DemoProvider({ children }: { children: ReactNode }) {
  const ref = useRef<DemoAction[]>([]);
  const [key, setKey] = useState('');
  const value = useMemo(() => ({ ref, setKey }), []);
  return (
    <DemoCtx.Provider value={value}>
      {children}
      <DemoCard actionsRef={ref} labels={key ? key.split('\n') : []} />
    </DemoCtx.Provider>
  );
}

/**
 * Adds this screen's shortcuts to the demo card. Pass the current actions on every render; the card always calls
 * the latest handlers, and only re-renders when the labels change.
 */
export function useDemoActions(actions: DemoAction[]) {
  const ctx = useContext(DemoCtx);
  const key = actions.map((a) => a.label).join('\n');
  useLayoutEffect(() => {
    if (ctx) ctx.ref.current = actions;
  });
  useEffect(() => {
    if (!ctx) return;
    ctx.setKey(key);
    // Only clear the labels: the layout effect above has already stored the new handlers, and clearing the ref
    // here would wipe them (passive cleanups run after layout effects). With no labels no buttons render.
    return () => ctx.setKey('');
  }, [ctx, key]);
}

/**
 * The card: slides out from the left edge on every step, open each time (the tab hides it until the next step).
 * "Use Demo Account" shows on steps that offer a shortcut; the Dark mode switch is always there.
 * Rendered into <body> so it sits beside the phone frame on mobile instead of inside it.
 */
function DemoCard({ actionsRef, labels }: { actionsRef: MutableRefObject<DemoAction[]>; labels: string[] }) {
  const { device, theme, setTheme } = usePrototype();
  // Starts closed; opening or closing it carries over from step to step
  const [open, setOpen] = useState(false);

  return createPortal(
    <aside className={`hc-proto-demo hc-proto-demo--${device}${open ? ' is-open' : ''}`} aria-label="Demo account (prototype only)">
      <div className="hc-proto-demo__card" aria-hidden={!open} inert={!open}>
        <div className="hc-proto-demo__head">
          <span className="hc-proto-demo__icon">
            <Icon name="account" size={20} />
          </span>
          <p className="hc-medium-semibold">Prototype shortcuts</p>
        </div>
        <Switch
          label={<ThemeIcon dark={theme === 'dark'} />}
          aria-label="Dark mode"
          switchPosition="end"
          checked={theme === 'dark'}
          onCheckedChange={(on) => setTheme(on ? 'dark' : 'light')}
          className="hc-proto-demo__theme"
        />
        {/* Always at the bottom: fills in what this step needs (disabled when there's nothing to fill); the
            screen's own button moves on */}
        <div className="hc-proto-demo__actions">
          {labels.length > 0 ? (
            labels.map((label, i) => (
              <Button key={label} fullWidth onClick={() => actionsRef.current[i]?.onClick()}>
                {label}
              </Button>
            ))
          ) : (
            <Button fullWidth disabled title="Nothing to fill in on this step">
              Use Demo Account
            </Button>
          )}
        </div>
      </div>
      <button type="button" className="hc-proto-demo__tab" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? 'Hide demo account' : 'Show demo account'}>
        <Icon name={open ? 'close-small' : 'account'} size={20} />
      </button>
    </aside>,
    document.body,
  );
}
