import './StatusBar.css';

export type StatusBarProps = {
  /** Clock text. Default "9:41" */
  time?: string;
  /** Right-side status text (network, signal, battery). Default "5G  ▮▮▮  100%" */
  status?: string;
  className?: string;
};

/**
 * HC/Status Bar (Figma 5:55) — device status bar placeholder for mobile mockups (iOS 47pt).
 * Android uses 24dp; this prototype renders the iOS size only.
 */
export function StatusBar({ time = '9:41', status = '5G  ▮▮▮  100%', className }: StatusBarProps) {
  return (
    <div className={['hc-status-bar', className].filter(Boolean).join(' ')} aria-hidden>
      <span className="hc-status-bar__time">{time}</span>
      <span className="hc-status-bar__status">{status}</span>
    </div>
  );
}
