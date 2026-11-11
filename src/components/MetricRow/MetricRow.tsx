import type { ReactNode } from 'react';
import './MetricRow.css';

export type MetricRowProps = {
  label: ReactNode;
  value: ReactNode;
  className?: string;
};

/** HC/Metric Row (Figma 191:789) — label/value row for Quote Standing panels. Label wraps; value stays right-aligned. */
export function MetricRow({ label, value, className }: MetricRowProps) {
  return (
    <div className={['hc-metric-row', className].filter(Boolean).join(' ')}>
      <span className="hc-metric-row__label">{label}</span>
      <span className="hc-metric-row__value">{value}</span>
    </div>
  );
}
