import type { CSSProperties } from 'react';
import './Icon.css';

// HC/Icon (Figma 329:1762): 37 Material-style icons exported at 24px, recolored to currentColor.
const raw = import.meta.glob<string>('./svg/*.svg', { query: '?raw', import: 'default', eager: true });

const icons: Record<string, string> = {};
for (const [path, svg] of Object.entries(raw)) {
  const name = path.slice(path.lastIndexOf('/') + 1, -4);
  // Size comes from the wrapper; the 24×24 viewBox scales.
  icons[name] = svg.replace(/width="24" height="24"/, 'width="100%" height="100%"');
}

export const iconNames = Object.keys(icons).sort() as IconName[];

export type IconName =
  | 'account' | 'calendar' | 'caution' | 'chat' | 'check' | 'checkbox' | 'checkbox-checked' | 'close'
  | 'close-small' | 'credit-card' | 'dashboard' | 'data' | 'delete' | 'devices' | 'document' | 'dollar-sign'
  | 'email' | 'error' | 'help' | 'home' | 'in-process' | 'information' | 'location' | 'lock' | 'notification'
  | 'orders' | 'plus' | 'rating-hollow' | 'review' | 'schedule' | 'search' | 'service' | 'shield' | 'star'
  | 'success' | 'tasks' | 'users' | 'visibility';

export type IconProps = {
  name: IconName;
  /** Figma sizes: 16, 20, 24, 28, 36 */
  size?: 16 | 20 | 24 | 28 | 36;
  /** Accessible label; omit for decorative icons */
  label?: string;
  className?: string;
  style?: CSSProperties;
};

export function Icon({ name, size = 24, label, className, style }: IconProps) {
  return (
    <span
      className={['hc-icon', className].filter(Boolean).join(' ')}
      style={{ width: size, height: size, ...style }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: icons[name] ?? '' }}
    />
  );
}
