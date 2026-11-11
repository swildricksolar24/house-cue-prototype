import type { ReactNode } from 'react';
import { Logo } from '../Logo/Logo';
import './AgentCard.css';

export type AgentCardProps = {
  /** Sender label above the message */
  name?: string;
  /** Message body (text or richer content, e.g. a follow-up action) */
  children: ReactNode;
  className?: string;
};

/**
 * HC/Agent Card (Figma 6:95) — agent speech: HouseCue symbol avatar + tinted bubble.
 * Also used as the agent's message bubble in chat (C09) and on the home dashboard (C08); pair with UserBubble.
 */
export function AgentCard({ name = 'HouseCue agent', children, className }: AgentCardProps) {
  return (
    <div className={['hc-agent-card', className].filter(Boolean).join(' ')}>
      <span className="hc-agent-card__avatar">
        <Logo type="symbol" height={36} />
      </span>
      <div className="hc-agent-card__bubble">
        <p className="hc-agent-card__name">{name}</p>
        <div className="hc-agent-card__message">{children}</div>
      </div>
    </div>
  );
}
