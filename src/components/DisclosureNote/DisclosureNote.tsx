import type { ReactNode } from 'react';
import './DisclosureNote.css';

export type DisclosureNoteProps = {
  /** Note = the dismissible message; Info icon = the 44px button that reopens it */
  variant?: 'note' | 'info-icon';
  children?: ReactNode;
  learnMoreLabel?: string;
  learnMoreHref?: string;
  onLearnMore?: () => void;
  /** Note: close button. Info icon: reopen the note. */
  onDismiss?: () => void;
  onOpen?: () => void;
  /** Accessible name of the Info icon button */
  infoLabel?: string;
  className?: string;
};

/** HC/Disclosure Note (Figma 206:1020) — quote-view disclosure. Note shows once and is dismissible; Info icon reopens it afterwards. */
export function DisclosureNote({
  variant = 'note',
  children = 'Pros can see when and how often you view their quotes.',
  learnMoreLabel = 'Learn more',
  learnMoreHref,
  onLearnMore,
  onDismiss,
  onOpen,
  infoLabel = 'Who can see my quote views',
  className,
}: DisclosureNoteProps) {
  if (variant === 'info-icon') {
    return (
      <button
        type="button"
        className={['hc-disclosure-note-button', className].filter(Boolean).join(' ')}
        aria-label={infoLabel}
        onClick={onOpen}
      >
        <span className="hc-disclosure-note__icon hc-disclosure-note__icon--muted" aria-hidden />
      </button>
    );
  }

  return (
    <div role="note" className={['hc-disclosure-note', className].filter(Boolean).join(' ')}>
      <span className="hc-disclosure-note__icon-slot">
        <span className="hc-disclosure-note__icon" aria-hidden />
      </span>
      <div className="hc-disclosure-note__copy">
        <p className="hc-disclosure-note__text">{children}</p>
        {learnMoreHref ? (
          <a className="hc-disclosure-note__link" href={learnMoreHref} onClick={onLearnMore}>
            {learnMoreLabel}
          </a>
        ) : (
          <button type="button" className="hc-disclosure-note__link" onClick={onLearnMore}>
            {learnMoreLabel}
          </button>
        )}
      </div>
      <button type="button" className="hc-disclosure-note__dismiss" aria-label="Dismiss" onClick={onDismiss}>
        <span className="hc-disclosure-note__close" aria-hidden />
      </button>
    </div>
  );
}
