import horizontalLight from './svg/hc-horizontal-light.svg';
import horizontalDark from './svg/hc-horizontal-dark.svg';
import horizontalMono from './svg/hc-horizontal-mono.svg';
import symbolLight from './svg/hc-symbol-light.svg';
import symbolDark from './svg/hc-symbol-dark.svg';
import symbolMono from './svg/hc-symbol-mono.svg';
import './Logo.css';

export type LogoProps = {
  /** Horizontal 143×32 for top bars; Symbol 32×32 for compact slots and avatars */
  type?: 'horizontal' | 'symbol';
  /** Auto follows the theme (Light: Mesquite tile + Sky dots; Dark: Sky tile). Light/Dark are fixed artwork; Mono follows color/text. */
  color?: 'auto' | 'light' | 'dark' | 'mono';
  /** Box height in px (min 24 horizontal, 16 symbol). Default 32. */
  height?: number;
  /**
   * Review change: fill the parent's width instead (height follows the artwork's proportions, 143:32 horizontal),
   * e.g. across the side nav column. `height` is ignored.
   */
  fill?: boolean;
  className?: string;
};

const art = {
  horizontal: { light: horizontalLight, dark: horizontalDark, mono: horizontalMono },
  symbol: { light: symbolLight, dark: symbolDark, mono: symbolMono },
};

/** HC/Logo (Figma 145:472) */
export function Logo({ type = 'horizontal', color = 'auto', height = 32, fill = false, className }: LogoProps) {
  const width = type === 'horizontal' ? (height * 143) / 32 : height;
  const classes = ['hc-logo', `hc-logo--${type}`, fill && 'hc-logo--fill', className].filter(Boolean).join(' ');
  const size = fill ? { width: '100%', aspectRatio: type === 'horizontal' ? '143 / 32' : '1' } : { width, height };
  const set = art[type];

  return (
    <span className={classes} style={size} role="img" aria-label="HouseCue">
      {color === 'mono' ? (
        <span className="hc-logo__art hc-logo__mono" style={{ WebkitMaskImage: `url(${set.mono})`, maskImage: `url(${set.mono})` }} />
      ) : color === 'auto' ? (
        <>
          <img className="hc-logo__art hc-logo__auto-light" src={set.light} alt="" />
          <img className="hc-logo__art hc-logo__auto-dark" src={set.dark} alt="" />
        </>
      ) : (
        <img className="hc-logo__art" src={set[color]} alt="" />
      )}
    </span>
  );
}
