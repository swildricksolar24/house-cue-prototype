/**
 * Extra states a screen can show beyond default / empty / loading / error: Figma "Branch:" frames on the J pages and
 * other state frames on the batch pages. Screens read them from the URL (?state=… or ?view=…); this list only feeds
 * the prototype bar's state menu. Add an entry when a screen gains a branch.
 */
export type Branch = { param: 'state' | 'view'; value: string; label: string };

const s = (value: string, label: string): Branch => ({ param: 'state', value, label });
const v = (value: string, label: string): Branch => ({ param: 'view', value, label });

export const branchStates: Record<string, Branch[]> = {
  C04: [s('error', 'Address not found')],
  C09: [s('over-cap', 'Over spend cap'), s('vendor-cancelled', 'Vendor cancelled'), s('tenant-report', 'Tenant report (landlord)'), s('rental-emergency', 'Rental emergency (landlord)')],
  C14: [s('negotiating', 'Negotiation'), s('oon', 'Out-of-network quote'), s('revised', 'Disclosure + quote revised'), s('declined', 'Quote declined by vendor')],
  C15: [s('pending', 'Pending verification')],
  C16: [s('oon', 'Out-of-network acknowledgement')],
  C17: [s('oon', 'Out-of-network'), s('over-cap', 'Over spend cap')],
  C18: [s('late', 'Vendor late'), s('cancel-ask', 'Vendor cancels: ask first'), s('cancel-rebook', 'Vendor cancels: auto-rebook'), s('change-order', 'Change order'), s('costs', 'Tenant: costs shown')],
  C22: [s('paused', 'Outreach halted (kill switch)')],
  C28: [s('portfolio', 'Second rental → Portfolio plan')],
  C38: [v('portfolio', 'Roles and portfolio')],
  C40: [s('tenant', 'Tenant view')],
  C41: [s('error', 'Consent declined (blocked)')],
  C48: [s('no-quotes', 'No quotes')],
  C50: [s('free', 'Free user')],
  C78: [v('flag-off', 'Vendors don’t see your score yet'), v('new', 'Building your score'), v('landlord', 'Landlord account')],
};
