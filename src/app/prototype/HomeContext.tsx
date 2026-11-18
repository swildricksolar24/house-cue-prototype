import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { accountHomes, type AccountHome } from '../data/sample';

const STORAGE_KEY = 'hc-current-home';
/** Review change: homes joined by accepting an invite (prototype shortcuts → Receive an invite) */
const JOINED_KEY = 'hc-joined-homes';

type HomeState = {
  home: AccountHome;
  homes: AccountHome[];
  setHomeId: (id: string) => void;
  /** Add a home to the account (e.g. after accepting an invite); does nothing if it's already there */
  addHome: (home: AccountHome) => void;
};

const Ctx = createContext<HomeState | null>(null);

function load() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function loadJoined(): AccountHome[] {
  try {
    return JSON.parse(localStorage.getItem(JOINED_KEY) ?? '[]') as AccountHome[];
  } catch {
    return [];
  }
}

/** The home picked in the header / side nav home picker, remembered per viewer. */
export function HomeProvider({ children }: { children: ReactNode }) {
  const [homeId, setId] = useState(() => load() ?? accountHomes[0].id);
  const [joined, setJoined] = useState<AccountHome[]>(loadJoined);
  const value = useMemo<HomeState>(() => {
    const homes = [...accountHomes, ...joined.filter((j) => !accountHomes.some((h) => h.id === j.id))];
    return {
      home: homes.find((h) => h.id === homeId) ?? accountHomes[0],
      homes,
      setHomeId: (id) => {
        setId(id);
        try {
          localStorage.setItem(STORAGE_KEY, id);
        } catch {
          /* storage unavailable */
        }
      },
      addHome: (home) =>
        setJoined((list) => {
          if (list.some((h) => h.id === home.id) || accountHomes.some((h) => h.id === home.id)) return list;
          const next = [...list, home];
          try {
            localStorage.setItem(JOINED_KEY, JSON.stringify(next));
          } catch {
            /* storage unavailable */
          }
          return next;
        }),
    };
  }, [homeId, joined]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Current home and the account's homes. Falls back to the first home outside the provider (e.g. Storybook). */
export function useCurrentHome(): HomeState {
  return useContext(Ctx) ?? { home: accountHomes[0], homes: accountHomes, setHomeId: () => {}, addHome: () => {} };
}
