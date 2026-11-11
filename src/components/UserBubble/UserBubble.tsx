import type { ReactNode } from 'react';
import './UserBubble.css';

export type UserBubbleProps = {
  /** The homeowner's message */
  children: ReactNode;
  className?: string;
};

/** HC/User Bubble (Figma 19:119) — the homeowner's own chat message, right-aligned. Agent replies use AgentCard. */
export function UserBubble({ children, className }: UserBubbleProps) {
  return (
    <div className={['hc-user-bubble', className].filter(Boolean).join(' ')}>
      <div className="hc-user-bubble__bubble">{children}</div>
    </div>
  );
}
