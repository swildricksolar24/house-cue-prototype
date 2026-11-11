import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon, type IconName } from '../Icon/Icon';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'link';
export type ButtonSize = 'small' | 'medium' | 'large';

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  /** Primary = the one main action per view; Secondary = alternatives; Tertiary = low emphasis; Destructive = delete/remove (always confirm); Link = navigation in text */
  variant?: ButtonVariant;
  /** Medium 44 default · Large 52 for onboarding/hero CTAs · Small 36 only in dense web tables */
  size?: ButtonSize;
  children?: ReactNode;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  /** Icon-only button; pass aria-label */
  icon?: IconName;
  /** Keeps width, hides the label, shows a spinner */
  loading?: boolean;
  /** Fill the container width */
  fullWidth?: boolean;
  /** Render as a router link (prototype navigation) */
  to?: string;
};

/** HC/Button (Figma 176:2811) — Variant 5 × Size 3 × State 6 × Icon 4. Hover, pressed and focus come from CSS. */
export function Button({
  variant = 'primary',
  size = 'medium',
  children,
  leadingIcon,
  trailingIcon,
  icon,
  loading = false,
  fullWidth = false,
  to,
  className,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = [
    'hc-button',
    `hc-button--${variant}`,
    `hc-button--${size}`,
    icon && 'hc-button--icon-only',
    loading && 'hc-button--loading',
    fullWidth && 'hc-button--full',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {icon && <Icon name={icon} size={20} />}
      {!icon && leadingIcon && <Icon name={leadingIcon} size={20} />}
      {!icon && children != null && <span className="hc-button__label">{children}</span>}
      {!icon && trailingIcon && <Icon name={trailingIcon} size={20} />}
      {loading && <span className="hc-button__spinner" aria-hidden />}
    </>
  );

  if (to && !disabled) {
    return (
      <Link to={to} className={classes} aria-busy={loading || undefined} aria-label={props['aria-label']}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  );
}
