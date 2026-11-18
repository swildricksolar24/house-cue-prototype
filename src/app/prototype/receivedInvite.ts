import { useSyncExternalStore } from 'react';
import type { InviteRole } from '../data/sample';

/**
 * Review change: "Receive an invite" in the prototype shortcuts panel shows what someone sees when they're invited to
 * HouseCue: as a household member of someone's home (C35 Invite someone from the other side), a co-manager of a
 * landlord's portfolio, or a tenant. The shells render the dialog (ReceivedInvite) when this is set, so it opens over
 * whatever screen is showing, inside the phone frame on mobile. Prototype only.
 */
export type InviteDemo = { kind: 'none' } | { kind: 'invite'; role: InviteRole } | { kind: 'expired' };

const NONE: InviteDemo = { kind: 'none' };
let current: InviteDemo = NONE;
const listeners = new Set<() => void>();

function update(next: InviteDemo) {
  current = next;
  listeners.forEach((fn) => fn());
}

export function showReceivedInvite(role: InviteRole) {
  update({ kind: 'invite', role });
}

export function showExpiredInvite() {
  update({ kind: 'expired' });
}

export function closeReceivedInvite() {
  update(NONE);
}

export function useReceivedInvite(): InviteDemo {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => current,
    () => NONE,
  );
}
