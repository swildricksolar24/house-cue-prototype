import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
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
 * The card (review change): a floating panel you can drag anywhere by its header, with × to close it; when closed, a
 * small tab on the left edge brings it back. Open/closed and where you left it are remembered for the session.
 * "Use Demo Account" shows on steps that offer a shortcut; the Dark mode switch is always there.
 * Rendered into <body> so it floats over the page (and beside the phone frame on mobile).
 */
type Pos = { x: number; y: number };

function read<T>(key: string, fallback: T): T {
  try {
    const v = sessionStorage.getItem(key);
    return v == null ? fallback : (JSON.parse(v) as T);
  } catch {
    return fallback;
  }
}

function write(key: string, v: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* storage unavailable */
  }
}

/** Keep the panel fully on screen */
function clamp(p: Pos, el: HTMLElement | null): Pos {
  const w = el?.offsetWidth ?? 288;
  const h = el?.offsetHeight ?? 200;
  return {
    x: Math.min(Math.max(8, p.x), Math.max(8, window.innerWidth - w - 8)),
    y: Math.min(Math.max(8, p.y), Math.max(8, window.innerHeight - h - 8)),
  };
}

function DemoCard({ actionsRef, labels }: { actionsRef: MutableRefObject<DemoAction[]>; labels: string[] }) {
  const { device, theme, setTheme } = usePrototype();
  const [open, setOpenState] = useState<boolean>(() => read('hc-proto-demo-open', true));
  const [pos, setPos] = useState<Pos | null>(() => read<Pos | null>('hc-proto-demo-pos', null));
  const panel = useRef<HTMLElement>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  const setOpen = (next: boolean) => {
    setOpenState(next);
    write('hc-proto-demo-open', next);
  };

  // A spot saved in a wider window may be off screen here: pull it back in when the panel shows
  useLayoutEffect(() => {
    if (open) setPos((p) => (p ? clamp(p, panel.current) : p));
  }, [open]);

  // Stay on screen when the window shrinks
  useEffect(() => {
    const onResize = () => setPos((p) => (p ? clamp(p, panel.current) : p));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return; // the × isn't a drag handle
    const r = panel.current?.getBoundingClientRect();
    if (!r) return;
    drag.current = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    setPos(clamp({ x: e.clientX - d.dx, y: e.clientY - d.dy }, panel.current));
  };
  const onPointerUp = () => {
    if (!drag.current) return;
    drag.current = null;
    setPos((p) => {
      write('hc-proto-demo-pos', p);
      return p;
    });
  };

  if (!open) {
    return createPortal(
      <button
        type="button"
        className={`hc-proto-demo__tab hc-proto-demo__tab--${device}`}
        onClick={() => setOpen(true)}
        aria-label="Show prototype shortcuts"
        title="Show prototype shortcuts"
      >
        <Icon name="account" size={20} />
      </button>,
      document.body,
    );
  }

  return createPortal(
    <aside
      ref={panel}
      className={`hc-proto-demo hc-proto-demo--${device}${pos ? ' is-placed' : ''}`}
      style={pos ? { left: pos.x, top: pos.y } : undefined}
      aria-label="Prototype shortcuts (prototype only)"
    >
      <div className="hc-proto-demo__card">
        <div
          className="hc-proto-demo__head"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          title="Drag to move"
        >
          <span className="hc-proto-demo__grip" aria-hidden>
            <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
              <circle cx="2" cy="2" r="1.5" />
              <circle cx="8" cy="2" r="1.5" />
              <circle cx="2" cy="8" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="2" cy="14" r="1.5" />
              <circle cx="8" cy="14" r="1.5" />
            </svg>
          </span>
          <span className="hc-proto-demo__icon">
            <Icon name="account" size={20} />
          </span>
          <p className="hc-medium-semibold">Prototype shortcuts</p>
          <button
            type="button"
            className="hc-proto-demo__close"
            onClick={() => setOpen(false)}
            aria-label="Close prototype shortcuts"
            title="Close"
          >
            <Icon name="close-small" size={20} />
          </button>
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
    </aside>,
    document.body,
  );
}
