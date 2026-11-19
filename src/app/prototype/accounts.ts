import { useSyncExternalStore } from 'react';
import { sampleInvites, type InviteRole } from '../data/sample';

/**
 * Review change: the accounts you can open (Choose an account, /accounts). Your own homeowner account is always there;
 * accepting an invite and signing in adds the invite's account (household member, co-manager or tenant).
 * - pending invite: accepted but not signed in yet (sessionStorage, so it survives the trip to Sign in)
 * - joined accounts: added once you sign in (localStorage, like the joined homes)
 * - new account: the one you just joined, tagged "New" until you pick an account
 * Prototype only.
 */
export type JoinedAccount = { id: string; role: InviteRole; title: string; meta: string; homeId?: string };

const PENDING_KEY = 'hc-pending-invite';
const NEW_KEY = 'hc-new-account';
const JOINED_KEY = 'hc-joined-accounts';
const DECLINED_KEY = 'hc-declined-invites';
const SIGNED_IN_KEY = 'hc-signed-in-as';

/**
 * Review change: who is signed in, so Choose an account can show it at the top and list that person's accounts.
 * homeowner = Marty McFly (the demo account), landlord = Biff Tannen (the landlord demo). Set by signing in (C02) and
 * the shortcuts panel's Homeowner / Landlord Demo; cleared by Sign out. sessionStorage, prototype only.
 */
export type SignedInAs = 'homeowner' | 'landlord';

export function getSignedInAs(): SignedInAs {
  return get(sessionStorage, SIGNED_IN_KEY) === 'landlord' ? 'landlord' : 'homeowner';
}

export function setSignedInAs(who: SignedInAs | null) {
  set(sessionStorage, SIGNED_IN_KEY, who);
  notify();
}

const listeners = new Set<() => void>();
let version = 0;
const notify = () => {
  version++;
  listeners.forEach((fn) => fn());
};

function get(store: Storage, key: string) {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}
function set(store: Storage, key: string, value: string | null) {
  try {
    if (value === null) store.removeItem(key);
    else store.setItem(key, value);
  } catch {
    /* storage unavailable */
  }
}

/** The invite accepted on this visit that still needs a sign-in */
export function getPendingInvite(): InviteRole | null {
  const v = get(sessionStorage, PENDING_KEY);
  return v === 'homeowner' || v === 'landlord' || v === 'tenant' ? v : null;
}

export function setPendingInvite(role: InviteRole) {
  set(sessionStorage, PENDING_KEY, role);
  notify();
}

export function getJoinedAccounts(): JoinedAccount[] {
  try {
    return JSON.parse(get(localStorage, JOINED_KEY) ?? '[]') as JoinedAccount[];
  } catch {
    return [];
  }
}

/**
 * Signed in with an invite waiting: add its account (once), mark it New and clear the invite. Returns the invite, so the
 * caller can also add a homeowner invite's home to the home switcher.
 */
export function completePendingInvite() {
  const role = getPendingInvite();
  if (!role) return null;
  set(sessionStorage, PENDING_KEY, null);
  return acceptInvite(role);
}

/**
 * Accept an invite while signed in (the invites on Choose an account): add its account (once) and mark it New.
 * Returns the invite, so a homeowner invite's home can also go into the home switcher.
 */
export function acceptInvite(role: InviteRole) {
  const invite = sampleInvites[role];
  const list = getJoinedAccounts();
  if (!list.some((a) => a.id === invite.account.id)) {
    list.push({ ...invite.account, role, homeId: invite.home?.id });
    set(localStorage, JOINED_KEY, JSON.stringify(list));
  }
  set(sessionStorage, NEW_KEY, invite.account.id);
  notify();
  return invite;
}

/** Decline an invite on Choose an account: it's gone for this visit */
export function declineInvite(role: InviteRole) {
  set(sessionStorage, DECLINED_KEY, JSON.stringify([...getDeclined(), role]));
  notify();
}

function getDeclined(): InviteRole[] {
  try {
    return JSON.parse(get(sessionStorage, DECLINED_KEY) ?? '[]') as InviteRole[];
  } catch {
    return [];
  }
}

/** Picked an account: it isn't new any more */
export function clearNewAccount() {
  set(sessionStorage, NEW_KEY, null);
  notify();
}

/** Accounts joined by invite, the pending invite and the New one; re-renders when they change */
export function useAccounts() {
  useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => version,
  );
  const joined = getJoinedAccounts();
  const declined = getDeclined();
  // Review change: landlord and tenant invites waiting on Choose an account, until you accept or decline them
  const invites = (['landlord', 'tenant'] as InviteRole[]).filter(
    (r) => !declined.includes(r) && !joined.some((a) => a.id === sampleInvites[r].account.id),
  );
  // Switch account shows when there's another account to open or an invite waiting on Choose an account (review
  // change: the shortcuts panel's invite buttons are gone, so this is the way in)
  const hasOthers = joined.length > 0 || invites.length > 0;
  return { joined, invites, pending: getPendingInvite(), newId: get(sessionStorage, NEW_KEY), hasOthers, signedInAs: getSignedInAs() };
}
