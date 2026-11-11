import { Link } from 'react-router-dom';
import { Icon } from '../Icon/Icon';
import './AgentFab.css';

export type AgentFabProps = {
  /** Compact 56pt (mobile) or Extended 48 tall with label (web) */
  size?: 'compact' | 'extended';
  /** Extended label. Default "Agent" */
  label?: string;
  /** Route of the agent chat (C09). When omitted renders a button calling onClick */
  to?: string;
  onClick?: () => void;
  /** Accessible name. Default "Ask your agent" */
  'aria-label'?: string;
  className?: string;
};

/**
 * HC/Agent FAB (Figma 278:3570) — persistent floating Agent button, landlord role only.
 * Position is up to the screen: mobile 16pt from the right and above the tab bar; web 24px from bottom-right.
 */
export function AgentFab({ size = 'compact', label = 'Agent', to, onClick, 'aria-label': ariaLabel = 'Ask your agent', className }: AgentFabProps) {
  const classes = ['hc-agent-fab', `hc-agent-fab--${size}`, className].filter(Boolean).join(' ');
  const content = (
    <>
      <Icon name="chat" size={24} />
      {size === 'extended' && <span className="hc-agent-fab__label">{label}</span>}
    </>
  );
  return to ? (
    <Link to={to} className={classes} aria-label={ariaLabel} onClick={onClick}>
      {content}
    </Link>
  ) : (
    <button type="button" className={classes} aria-label={ariaLabel} onClick={onClick}>
      {content}
    </button>
  );
}
