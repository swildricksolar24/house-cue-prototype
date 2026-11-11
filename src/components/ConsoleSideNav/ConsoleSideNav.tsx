import { SideNavFooterItem, SideNavShell } from '../WebSideNav/WebSideNav';
import type { NavItem } from '../TabBar/TabBar';
import './ConsoleSideNav.css';

export type ConsoleType = 'support' | 'admin';
export type SupportNavKey = 'queue' | 'conversations' | 'people' | 'jobs' | 'disputes' | 'money' | 'ai-agent';
export type AdminNavKey = 'platform' | 'people' | 'vendors' | 'money' | 'disputes' | 'ai-agent';

export type ConsoleNavKey = {
  support: SupportNavKey;
  admin: AdminNavKey;
};

/** Console item sets (Figma HC/Console Side Nav 41:589). */
export const consoleNavItems: { [C in ConsoleType]: NavItem<ConsoleNavKey[C]>[] } = {
  support: [
    { key: 'queue', label: 'Queue', icon: 'tasks', to: '/support/queue' },
    { key: 'conversations', label: 'Conversations', icon: 'chat', to: '/support/conversations' },
    { key: 'people', label: 'People', icon: 'account', to: '/support/people' },
    { key: 'jobs', label: 'Jobs', icon: 'calendar', to: '/support/jobs' },
    { key: 'disputes', label: 'Disputes', icon: 'caution', to: '/support/disputes' },
    { key: 'money', label: 'Money', icon: 'dollar-sign', to: '/support/money' },
    { key: 'ai-agent', label: 'AI agent', icon: 'shield', to: '/support/ai-agent' },
  ],
  admin: [
    { key: 'platform', label: 'Platform', icon: 'dashboard', to: '/admin/platform' },
    { key: 'people', label: 'People', icon: 'account', to: '/admin/people' },
    { key: 'vendors', label: 'Vendors', icon: 'tasks', to: '/admin/vendors' },
    { key: 'money', label: 'Money', icon: 'dollar-sign', to: '/admin/money' },
    { key: 'disputes', label: 'Disputes', icon: 'caution', to: '/admin/disputes' },
    { key: 'ai-agent', label: 'AI agent', icon: 'shield', to: '/admin/ai-agent' },
  ],
};

const defaultSwitcher: Record<ConsoleType, { label: string; value: string }> = {
  support: { label: 'Support console', value: 'Senior agent · EN, ES' },
  admin: { label: 'Admin console', value: 'Admin · all metros' },
};

export type ConsoleSideNavProps<C extends ConsoleType = ConsoleType> = {
  /** Support (Queue … AI agent) or Admin (Platform … AI agent) */
  console?: C;
  /** Key of the highlighted item */
  active?: ConsoleNavKey[C];
  /** Override the `to` route per item key (defaults /support/<key>, /admin/<key>) */
  paths?: Partial<Record<ConsoleNavKey[C], string>>;
  /** Role card text; defaults per console from Figma */
  switcherLabel?: string;
  switcherValue?: string;
  onSwitcherClick?: () => void;
  /** Sign out row pinned at the bottom. Default route "/" */
  signOutTo?: string;
  onSignOut?: () => void;
  logoTo?: string;
  className?: string;
};

/** HC/Console Side Nav (Figma 41:589) — Console Support × 7 items, Console Admin × 6 items. */
export function ConsoleSideNav<C extends ConsoleType = 'support'>({
  console: consoleType,
  switcherLabel,
  switcherValue,
  signOutTo = '/',
  onSignOut,
  ...props
}: ConsoleSideNavProps<C>) {
  const c = (consoleType ?? 'support') as ConsoleType;
  const items = consoleNavItems[c] as NavItem<ConsoleNavKey[C]>[];
  return (
    <SideNavShell
      items={items}
      aria-label={c === 'support' ? 'Support console' : 'Admin console'}
      switcherLabel={switcherLabel ?? defaultSwitcher[c].label}
      switcherValue={switcherValue ?? defaultSwitcher[c].value}
      footer={<SideNavFooterItem label="Sign out" icon="lock" iconTone="danger" to={signOutTo} onClick={onSignOut} />}
      {...props}
    />
  );
}
