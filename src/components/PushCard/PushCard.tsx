import { Logo } from '../Logo/Logo';
import './PushCard.css';

export type PushCardProps = {
  /** App + time line. Default "HouseCue · now" */
  meta?: string;
  /** Default "Notification title" */
  title?: string;
  /** One or two lines. Default "Notification body, one or two lines." */
  body?: string;
  className?: string;
};

/**
 * HC/Push Card (Figma 6:140) — push notification preview for template review (X06).
 * The OS renders the real thing; use this to check copy length (EN/ES).
 */
export function PushCard({
  meta = 'HouseCue · now',
  title = 'Notification title',
  body = 'Notification body, one or two lines.',
  className,
}: PushCardProps) {
  return (
    <div className={['hc-push-card', className].filter(Boolean).join(' ')} role="group" aria-label="Notification preview">
      <span className="hc-push-card__avatar">
        <Logo type="symbol" height={36} />
      </span>
      <div className="hc-push-card__text">
        <p className="hc-push-card__meta">{meta}</p>
        <p className="hc-push-card__title">{title}</p>
        <p className="hc-push-card__body">{body}</p>
      </div>
    </div>
  );
}
