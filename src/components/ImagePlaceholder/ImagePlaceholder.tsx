import type { CSSProperties } from 'react';
import './ImagePlaceholder.css';

export type ImagePlaceholderProps = {
  /** What the final image should show */
  label: string;
  /** Box height (px or any CSS length). Default 200. */
  height?: number | string;
  className?: string;
  style?: CSSProperties;
};

/** HC/Image Placeholder (Figma 6:126) — stand-in for photos/illustrations until the designer supplies art. */
export function ImagePlaceholder({ label, height = 200, className, style }: ImagePlaceholderProps) {
  return (
    <div
      className={['hc-image-placeholder', className].filter(Boolean).join(' ')}
      style={{ height, ...style }}
      role="img"
      aria-label={label}
    >
      <span className="hc-image-placeholder__label" aria-hidden>
        {label}
      </span>
    </div>
  );
}
