import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';

export type Theme = 'light' | 'dark';
/** mobile = 390×844 phone frame · web = full-width web layout · auto = by window width (< 768 → mobile) */
export type DeviceSetting = 'auto' | 'mobile' | 'web';
export type Device = 'mobile' | 'web';
/** Screen state frames drawn in Figma for list screens (#160) */
export type ScreenState = 'default' | 'empty' | 'loading' | 'error';

type PrototypeSettings = {
  theme: Theme;
  deviceSetting: DeviceSetting;
  device: Device;
  screenState: ScreenState;
  setTheme: (t: Theme) => void;
  setDevice: (d: DeviceSetting) => void;
  setScreenState: (s: ScreenState) => void;
};

const Ctx = createContext<PrototypeSettings | null>(null);

const STORAGE_KEY = 'hc-prototype';

function load(): Partial<{ theme: Theme; device: DeviceSetting }> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function save(v: { theme: Theme; device: DeviceSetting }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch {
    /* storage unavailable */
  }
}

function useWindowWidth() {
  const [w, setW] = useState(() => window.innerWidth);
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return w;
}

/**
 * Prototype-wide settings. Theme and device persist per viewer; ?theme=, ?device= and ?state= in the URL override
 * them so a link can open a specific frame (e.g. /homeowner/request-quotes/2?device=mobile&state=empty).
 */
export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useSearchParams();
  const stored = useMemo(load, []);
  const [theme, setThemeState] = useState<Theme>((params.get('theme') as Theme) ?? stored.theme ?? 'light');
  const [deviceSetting, setDeviceState] = useState<DeviceSetting>(
    (params.get('device') as DeviceSetting) ?? stored.device ?? 'auto',
  );
  const screenState = (params.get('state') as ScreenState) ?? 'default';
  const width = useWindowWidth();
  const device: Device = deviceSetting === 'auto' ? (width < 768 ? 'mobile' : 'web') : deviceSetting;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    save({ theme, device: deviceSetting });
  }, [theme, deviceSetting]);

  const setParam = useCallback(
    (key: string, value: string | null) =>
      setParams(
        (p) => {
          const n = new URLSearchParams(p);
          if (value == null) n.delete(key);
          else n.set(key, value);
          return n;
        },
        { replace: true },
      ),
    [setParams],
  );

  const value = useMemo<PrototypeSettings>(
    () => ({
      theme,
      deviceSetting,
      device,
      screenState,
      setTheme: (t) => {
        setThemeState(t);
        setParam('theme', null);
      },
      setDevice: (d) => {
        setDeviceState(d);
        setParam('device', null);
      },
      setScreenState: (s) => setParam('state', s === 'default' ? null : s),
    }),
    [theme, deviceSetting, device, screenState, setParam],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrototype() {
  const v = useContext(Ctx);
  if (!v) throw new Error('usePrototype must be used inside <PrototypeProvider>');
  return v;
}
