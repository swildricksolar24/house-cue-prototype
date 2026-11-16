import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { Icon } from '../../components/Icon/Icon';
import { Radio } from '../../components/Radio/Radio';
import { useCurrentHome } from '../prototype/HomeContext';
import { utilityPaths } from './navPaths';
import './HomePicker.css';

/**
 * Home picker opened from the home switcher: the account's homes. Picking one makes it the current home and closes
 * the picker. "Manage homes" opens C38.
 * - "sheet" (mobile, HC/Home Header): bottom sheet inside the phone frame, radio list.
 * - "dropdown" (web, HC/Web Side Nav): review change, a menu attached right under the switcher card (same left edge,
 *   280px wide) with a ✓ on the current home. It used to be a separate panel pinned 16px from the window's left
 *   edge, which drifted away from the card once the signed-in pages were centred. Arrow keys move, Enter picks,
 *   Escape / a click outside closes, and focus goes back to the card.
 */
export function HomePicker({
  variant,
  onClose,
  anchor,
}: {
  variant: 'sheet' | 'dropdown';
  onClose: () => void;
  /** The switcher card the dropdown hangs from (web) */
  anchor?: HTMLElement | null;
}) {
  if (variant === 'dropdown') return <HomeDropdown anchor={anchor ?? null} onClose={onClose} />;
  return <HomeSheet onClose={onClose} />;
}

function HomeSheet({ onClose }: { onClose: () => void }) {
  const { home, homes, setHomeId } = useCurrentHome();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    // Move focus to the selected home so keyboard users land in the list
    panel.current?.querySelector<HTMLInputElement>('input:checked')?.focus({ preventScroll: true });
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="hc-home-picker hc-home-picker--sheet">
      <div className="hc-home-picker__scrim" onClick={onClose} aria-hidden />
      <div ref={panel} className="hc-home-picker__panel" role="dialog" aria-modal="true" aria-labelledby="hc-home-picker-title">
        <span className="hc-home-picker__grabber" aria-hidden />
        <h2 id="hc-home-picker-title" className="hc-large-bold">
          Your homes
        </h2>
        <div className="hc-home-picker__list" role="radiogroup" aria-labelledby="hc-home-picker-title">
          {homes.map((h) => (
            <Radio
              key={h.id}
              name="current-home"
              value={h.id}
              checked={h.id === home.id}
              onChange={() => {
                setHomeId(h.id);
                onClose();
              }}
              label={
                <span className="hc-home-picker__option">
                  <span className="hc-medium-semibold">
                    {h.address}, {h.city}
                  </span>
                  <span className="hc-small hc-muted">{h.meta}</span>
                </span>
              }
            />
          ))}
        </div>
        <Button variant="secondary" fullWidth to={utilityPaths.homeSwitcher} onClick={onClose}>
          Manage homes
        </Button>
      </div>
    </div>
  );
}

function HomeDropdown({ anchor, onClose }: { anchor: HTMLElement | null; onClose: () => void }) {
  const { home, homes, setHomeId } = useCurrentHome();
  const navigate = useNavigate();
  const menu = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  // Hang from the card: same left edge, 6px below; follow it if the window scrolls or resizes
  useLayoutEffect(() => {
    const place = () => {
      const r = anchor?.getBoundingClientRect();
      if (r) setPos({ left: r.left, top: r.bottom + 6 });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [anchor]);

  const close = (refocus = true) => {
    onClose();
    if (refocus) anchor?.focus({ preventScroll: true });
  };

  // Start on the current home, once the menu is placed (it can't take focus while hidden)
  const focused = useRef(false);
  useEffect(() => {
    if (!pos || focused.current) return;
    focused.current = true;
    menu.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus({ preventScroll: true });
  }, [pos]);

  // Close on a click anywhere outside the menu and the card (the card's own click toggles it)
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (menu.current?.contains(t) || anchor?.contains(t)) return;
      close(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchor]);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const items = [...(menu.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]') ?? [])];
    const i = items.indexOf(document.activeElement as HTMLElement);
    const go = (n: number) => items[(n + items.length) % items.length]?.focus();
    if (e.key === 'ArrowDown') go(i + 1);
    else if (e.key === 'ArrowUp') go(i - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(items.length - 1);
    else if (e.key === 'Escape') close();
    else if (e.key === 'Tab') close(false);
    else return;
    if (e.key !== 'Tab') e.preventDefault();
  };

  return (
    <div
      ref={menu}
      className="hc-home-dropdown"
      role="menu"
      aria-label="Your homes"
      style={pos ? { left: pos.left, top: pos.top } : { visibility: 'hidden' }}
      onKeyDown={onKeyDown}
    >
      <p className="hc-home-dropdown__label" aria-hidden>
        Your homes
      </p>
      {homes.map((h) => {
        const current = h.id === home.id;
        return (
          <button
            key={h.id}
            type="button"
            role="menuitemradio"
            aria-checked={current}
            tabIndex={current ? 0 : -1}
            className={['hc-home-dropdown__item', current && 'is-current'].filter(Boolean).join(' ')}
            onClick={() => {
              setHomeId(h.id);
              close();
            }}
          >
            <span className="hc-home-dropdown__text">
              <span className="hc-home-dropdown__address">
                {h.address}, {h.city}
              </span>
              <span className="hc-home-dropdown__meta">{h.meta}</span>
            </span>
            <span className="hc-home-dropdown__check" aria-hidden>
              {current && <Icon name="check" size={20} />}
            </span>
          </button>
        );
      })}
      <div className="hc-home-dropdown__divider" role="separator" />
      <button
        type="button"
        role="menuitem"
        tabIndex={-1}
        className="hc-home-dropdown__item hc-home-dropdown__manage"
        onClick={() => {
          close(false);
          navigate(utilityPaths.homeSwitcher);
        }}
      >
        Manage homes
      </button>
    </div>
  );
}
