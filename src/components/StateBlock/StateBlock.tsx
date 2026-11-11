import type { ReactNode } from 'react';
import { Button } from '../Button/Button';
import { Icon, type IconName } from '../Icon/Icon';
import './StateBlock.css';

export type StateBlockKind = 'empty' | 'error';

export type StateBlockProps = {
  kind?: StateBlockKind;
  title: ReactNode;
  body?: ReactNode;
  /** Button label; omit to hide the action (defaults: "Get started" / "Try again" when `onAction` is set) */
  actionLabel?: ReactNode;
  onAction?: () => void;
  /** Override the icon (defaults: information / error) */
  icon?: IconName;
  className?: string;
};

/** HC/State Block (Figma 108:372) — per-screen Empty and Error states for list screens. Loading uses HC/Skeleton Card. */
export function StateBlock({ kind = 'empty', title, body, actionLabel, onAction, icon, className }: StateBlockProps) {
  const label = actionLabel ?? (onAction ? (kind === 'error' ? 'Try again' : 'Get started') : undefined);
  return (
    <div
      role={kind === 'error' ? 'alert' : undefined}
      className={['hc-state-block', `hc-state-block--${kind}`, className].filter(Boolean).join(' ')}
    >
      <span className="hc-state-block__icon">
        <Icon name={icon ?? (kind === 'error' ? 'error' : 'information')} size={28} />
      </span>
      <p className="hc-state-block__title">{title}</p>
      {body && <p className="hc-state-block__body">{body}</p>}
      {label && (
        <Button variant="secondary" onClick={onAction}>
          {label}
        </Button>
      )}
    </div>
  );
}
