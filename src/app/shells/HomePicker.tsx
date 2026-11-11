import { useEffect, useRef } from 'react';
import { Button } from '../../components/Button/Button';
import { Radio } from '../../components/Radio/Radio';
import { useCurrentHome } from '../prototype/HomeContext';
import { utilityPaths } from './navPaths';
import './HomePicker.css';

/**
 * Home picker opened from the home switcher (HC/Home Header on mobile, HC/Web Side Nav on web): the account's homes
 * as a radio list. Picking one makes it the current home and closes the picker. "Manage homes" opens C38.
 * Mobile: bottom sheet inside the phone frame. Web: panel under the side nav's switcher card.
 */
export function HomePicker({ variant, onClose }: { variant: 'sheet' | 'popover'; onClose: () => void }) {
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
    <div className={`hc-home-picker hc-home-picker--${variant}`}>
      <div className="hc-home-picker__scrim" onClick={onClose} aria-hidden />
      <div ref={panel} className="hc-home-picker__panel" role="dialog" aria-modal="true" aria-labelledby="hc-home-picker-title">
        {variant === 'sheet' && <span className="hc-home-picker__grabber" aria-hidden />}
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
