import type { ReactNode } from 'react';
import { usePrototype } from './PrototypeContext';
import './prototype.css';

/**
 * Mobile: the screen renders inside a 390×844 phone viewport (scrolls inside, like the Figma frames).
 * Web: the screen fills the browser window (designed at 1440×900).
 */
export function DeviceFrame({ children }: { children: ReactNode }) {
  const { device } = usePrototype();
  if (device === 'web') return <div className="hc-proto-web">{children}</div>;
  return (
    <div className="hc-proto-stage">
      <div className="hc-proto-phone">{children}</div>
    </div>
  );
}
