import { useEffect, useSyncExternalStore } from 'react';

/**
 * Review change: "Connections fail" switch in the prototype shortcuts panel (DemoTools). When on, connecting a calendar,
 * an email account or a smart-home platform (C43, C44, C46) ends in a failure panel instead of "Connected", so the
 * error path can be shown. The switch only appears on screens that connect something (they call useConnectFail) and
 * is remembered for the session. Prototype only.
 */
const KEY = 'hc-proto-connect-fail';
const listeners = new Set<() => void>();

const read = () => {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};

let fail = read();
let screens = 0;

const emit = () => listeners.forEach((fn) => fn());
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export function setConnectFail(on: boolean) {
  fail = on;
  try {
    sessionStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    /* storage unavailable */
  }
  emit();
}

/** For screens that connect something: whether connecting should fail. Also shows the switch in the panel. */
export function useConnectFail(): boolean {
  useEffect(() => {
    screens += 1;
    emit();
    return () => {
      screens -= 1;
      emit();
    };
  }, []);
  return useSyncExternalStore(subscribe, () => fail, () => false);
}

/** For the panel: show the switch (a connecting screen is open) and its state */
export function useConnectFailSwitch(): { visible: boolean; on: boolean } {
  const snap = useSyncExternalStore(subscribe, () => `${screens > 0 ? 1 : 0}${fail ? 1 : 0}`, () => '00');
  return { visible: snap[0] === '1', on: snap[1] === '1' };
}
