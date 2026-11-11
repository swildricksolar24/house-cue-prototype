import { Link } from 'react-router-dom';
import { Icon } from '../Icon/Icon';
import './HomeHeader.css';

export type HomeHeaderProps = {
  /** Muted line above the address. Default "Home" */
  label?: string;
  /** Current home; a ▾ is appended. Default "2218 W Palm Ln" */
  address?: string;
  /** Opens the home switcher (C38) */
  onSwitchHome?: () => void;
  /** Emergency (C22). Default route "/emergency" */
  emergencyTo?: string;
  onEmergency?: () => void;
  /** Notifications (C33). Default route "/notifications" */
  notificationsTo?: string;
  onNotifications?: () => void;
  className?: string;
};

/** HC/Home Header (Figma 5:248) — signed-in mobile header: home switcher, Emergency and notifications (44pt targets). */
export function HomeHeader({
  label = 'Home',
  address = '2218 W Palm Ln',
  onSwitchHome,
  emergencyTo = '/emergency',
  onEmergency,
  notificationsTo = '/notifications',
  onNotifications,
  className,
}: HomeHeaderProps) {
  return (
    <header className={['hc-home-header', className].filter(Boolean).join(' ')}>
      <button type="button" className="hc-home-header__switcher" onClick={onSwitchHome} aria-haspopup="listbox">
        <span className="hc-home-header__label">{label}</span>
        <span className="hc-home-header__address">
          {address} <span aria-hidden>▾</span>
        </span>
      </button>
      <Link to={emergencyTo} className="hc-home-header__action hc-home-header__action--emergency" aria-label="Emergency" onClick={onEmergency}>
        <Icon name="caution" size={24} />
      </Link>
      <Link to={notificationsTo} className="hc-home-header__action" aria-label="Notifications" onClick={onNotifications}>
        <Icon name="notification" size={24} />
      </Link>
    </header>
  );
}
