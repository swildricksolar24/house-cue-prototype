import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { accountHomes, type AccountHome } from '../data/sample';

const STORAGE_KEY = 'hc-current-home';

type HomeState = { home: AccountHome; homes: AccountHome[]; setHomeId: (id: string) => void };

const Ctx = createContext<HomeState | null>(null);

function load() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** The home picked in the header / side nav home picker, remembered per viewer. */
export function HomeProvider({ children }: { children: ReactNode }) {
  const [homeId, setId] = useState(() => load() ?? accountHomes[0].id);
  const value = useMemo<HomeState>(
    () => ({
      home: accountHomes.find((h) => h.id === homeId) ?? accountHomes[0],
      homes: accountHomes,
      setHomeId: (id) => {
        setId(id);
        try {
          localStorage.setItem(STORAGE_KEY, id);
        } catch {
          /* storage unavailable */
        }
      },
    }),
    [homeId],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Current home and the account's homes. Falls back to the first home outside the provider (e.g. Storybook). */
export function useCurrentHome(): HomeState {
  return useContext(Ctx) ?? { home: accountHomes[0], homes: accountHomes, setHomeId: () => {} };
}
