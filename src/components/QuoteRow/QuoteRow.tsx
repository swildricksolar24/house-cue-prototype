import type { ReactNode } from 'react';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import './QuoteRow.css';

export type QuoteRowNetwork = 'in-network' | 'out-of-network';

export type QuoteRowProps = {
  network?: QuoteRowNetwork;
  vendor: ReactNode;
  /** Quoted job price only; the booking fee is never shown (D21) */
  price: ReactNode;
  /** Trust score shown in the pill as "Trust {n}" */
  trustScore?: number | string;
  /** Rating and verified badges, e.g. "★ 4.8 (126) · Licensed · Insured" */
  rating?: ReactNode;
  /** HouseCue job reviews line */
  reviews?: ReactNode;
  /** Nearby jobs line (link colour), e.g. "3 recent jobs within 2 miles"; omit to hide */
  nearby?: ReactNode;
  /** Makes the nearby line a button (e.g. opens the nearby-jobs map) */
  onNearbyClick?: () => void;
  /** Earliest date and warranty */
  details?: ReactNode;
  /** Shows the "Updated" badge after a vendor revises the quote */
  updated?: boolean;
  /** Required out-of-network label (decision 2026-11-06-oon-booking-unchecked-labelled) */
  outOfNetworkLabel?: string;
  chooseLabel?: string;
  profileLabel?: string;
  onChoose?: () => void;
  onProfile?: () => void;
  className?: string;
};

/**
 * HC/Quote Row (Figma 99:370) — Network In network / Out of network (C14). OON adds the required
 * "Not background-checked" label; OON quotes can still be chosen (C16 asks for an acknowledgement).
 */
export function QuoteRow({
  network = 'in-network',
  vendor,
  price,
  trustScore,
  rating,
  reviews,
  nearby,
  onNearbyClick,
  details,
  updated = false,
  outOfNetworkLabel = 'Not background-checked · out of network',
  chooseLabel = 'Choose',
  profileLabel = 'Profile',
  onChoose,
  onProfile,
  className,
}: QuoteRowProps) {
  const classes = ['hc-quote-row', `hc-quote-row--${network}`, className].filter(Boolean).join(' ');

  return (
    <section className={classes}>
      <div className="hc-quote-row__top">
        <p className="hc-quote-row__vendor">{vendor}</p>
        {updated && <span className="hc-quote-row__updated">Updated</span>}
        <p className="hc-quote-row__price">{price}</p>
      </div>

      {network === 'out-of-network' && (
        <div className="hc-quote-row__oon">
          <Icon name="error" size={20} />
          <span>{outOfNetworkLabel}</span>
        </div>
      )}

      {(trustScore != null || rating) && (
        <div className="hc-quote-row__trust">
          {trustScore != null && <span className="hc-quote-row__pill">Trust {trustScore}</span>}
          {rating && <span className="hc-quote-row__muted">{rating}</span>}
        </div>
      )}

      {reviews && <p className="hc-quote-row__muted">{reviews}</p>}

      {nearby &&
        (onNearbyClick ? (
          <button type="button" className="hc-quote-row__nearby" onClick={onNearbyClick}>
            {nearby}
          </button>
        ) : (
          <p className="hc-quote-row__nearby">{nearby}</p>
        ))}

      {details && <p className="hc-quote-row__muted">{details}</p>}

      <div className="hc-quote-row__actions">
        <Button className="hc-quote-row__button" onClick={onChoose}>{chooseLabel}</Button>
        <Button className="hc-quote-row__button" variant="secondary" onClick={onProfile}>{profileLabel}</Button>
      </div>
    </section>
  );
}
