import './SkeletonCard.css';

export type SkeletonCardProps = {
  /** Show the 40px avatar circle (default true) */
  avatar?: boolean;
  /** Accessible loading label */
  label?: string;
  className?: string;
};

/** HC/Skeleton Card (Figma 6:147) — loading placeholder for list rows and cards; shimmers left to right, static under Reduce Motion. */
export function SkeletonCard({ avatar = true, label = 'Loading', className }: SkeletonCardProps) {
  return (
    <div role="status" aria-label={label} aria-busy className={['hc-skeleton-card', className].filter(Boolean).join(' ')}>
      {avatar && <span className="hc-skeleton-card__avatar hc-skeleton-card__shape" />}
      <span className="hc-skeleton-card__lines">
        <span className="hc-skeleton-card__line hc-skeleton-card__shape" style={{ width: '70%' }} />
        <span className="hc-skeleton-card__line hc-skeleton-card__shape" style={{ width: '100%' }} />
        <span className="hc-skeleton-card__line hc-skeleton-card__shape" style={{ width: '46%' }} />
      </span>
    </div>
  );
}
