import type { HTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import './Banner.css';

export type BannerTone = 'info' | 'success' | 'warning' | 'error';

export type BannerProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
  tone?: BannerTone;
  /** Optional title above the body */
  title?: ReactNode;
  /** One short sentence that says what happened and what to do */
  children: ReactNode;
};

const icons: Record<BannerTone, IconName> = {
  info: 'information',
  success: 'success',
  warning: 'caution',
  error: 'error',
};

/** HC/Banner (Figma 6:125) — inline message, Tone Info / Success / Warning / Error. Icon + title + body, so tone never relies on colour alone. */
export function Banner({ tone = 'info', title, children, className, ...props }: BannerProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      {...props}
      className={['hc-banner', `hc-banner--${tone}`, className].filter(Boolean).join(' ')}
    >
      <Icon name={icons[tone]} size={20} className="hc-banner__icon" />
      <div className="hc-banner__text">
        {title && <p className="hc-banner__title">{title}</p>}
        <p className="hc-banner__body">{children}</p>
      </div>
    </div>
  );
}
