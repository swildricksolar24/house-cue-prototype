import type { ReactNode } from 'react';
import './StatTile.css';

export type StatTileProps = {
  label: ReactNode;
  value: ReactNode;
  /** Supporting line under the value */
  meta?: ReactNode;
  className?: string;
};

/** HC/Stat Tile (Figma 261:1038) — KPI tile for dashboards (portfolio, billing, admin). Fills its grid cell. */
export function StatTile({ label, value, meta, className }: StatTileProps) {
  return (
    <div className={['hc-stat-tile', className].filter(Boolean).join(' ')}>
      <span className="hc-stat-tile__label">{label}</span>
      <span className="hc-stat-tile__value">{value}</span>
      {meta && <span className="hc-stat-tile__meta">{meta}</span>}
    </div>
  );
}
