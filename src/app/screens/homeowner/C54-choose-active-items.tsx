import { useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { Checkbox } from '../../../components/Checkbox/Checkbox';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';
import { StateBlock } from '../../../components/StateBlock/StateBlock';
import { currentHome } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C54-choose-active-items.css';

const LIMIT = 10;

/** The 14 items in the home (Figma web frame); the first 10 start selected */
const ITEMS = [
  'HVAC system',
  'Water heater',
  'Dishwasher',
  'Refrigerator',
  'Washer',
  'Dryer',
  'Roof',
  'Smoke alarms',
  'Garbage disposal',
  'Pool pump',
  'Garage door opener',
  'Water softener',
  'Ceiling fans',
  'Irrigation',
];

/** Mobile shows the list in the same order as Figma (garage door opener after the first four) */
const MOBILE_ORDER = [0, 1, 2, 3, 10, 4, 5, 6, 7, 8, 9, 11, 12, 13];

/**
 * C54 Choose active items — Figma mobile 218:19504, web 218:20814 (J1 Membership & credits step 3).
 * States: empty / loading / error (B10 111:12583…111:13000). At most 10 items can be selected.
 */
export default function ChooseActiveItems(_: ScreenProps) {
  const { device, screenState, setScreenState } = usePrototype();
  const flow = useFlow();
  const [selected, setSelected] = useState<Set<string>>(() => new Set(ITEMS.slice(0, LIMIT)));

  const toggle = (item: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else if (next.size < LIMIT) next.add(item);
      return next;
    });

  const box = (item: string) => (
    <Checkbox key={item} label={item} checked={selected.has(item)} onChange={() => toggle(item)} />
  );

  const state =
    screenState === 'empty' ? (
      <StateBlock
        kind="empty"
        title="No items yet"
        body="Add systems and appliances first, then choose which 10 stay active."
        actionLabel="Add an item"
        onAction={() => flow.go('C05')}
      />
    ) : screenState === 'error' ? (
      <StateBlock
        kind="error"
        title="Couldn’t load your items"
        body="Check your connection and try again. Nothing was lost."
        actionLabel="Try again"
        onAction={() => setScreenState('default')}
      />
    ) : screenState === 'loading' ? (
      <>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </>
    ) : null;

  const counter = <p className="hc-small hc-muted">{`${selected.size} of ${LIMIT} selected`}</p>;
  const keepLabel = `Keep these ${LIMIT}`;

  if (device === 'mobile') {
    return (
      <MobileShell
        header={{ title: 'Choose 10 items' }}
        bottom={<BottomActions primaryLabel={keepLabel} onPrimary={flow.goNext} secondaryLabel="Stay a member" onSecondary={flow.goBack} />}
      >
        <div className="hc-c54-list">
          <Banner tone="warning" title="Pick 10 items to keep active">
            You have 14 items in {currentHome.address}. On Free, 10 stay active per home; the rest stay saved, read-only.
          </Banner>
          {state ?? (
            <>
              {counter}
              {MOBILE_ORDER.map((i) => box(ITEMS[i]))}
            </>
          )}
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="account">
      <div className="hc-c54-web">
        <header className="hc-c54-web__head">
          <div className="hc-c54-web__title">
            <h1 className="hc-h2">Choose 10 active items · {currentHome.address}</h1>
            <p className="hc-medium hc-muted">Free keeps 10 items active per home. Inactive items stay saved and read-only.</p>
          </div>
          <Button variant="secondary" onClick={flow.goBack}>
            Stay a member
          </Button>
          <Button onClick={flow.goNext}>{keepLabel}</Button>
        </header>
        <div className="hc-c54-web__cols">
          <div className="hc-c54-web__col">{state ?? ITEMS.slice(0, 7).map(box)}</div>
          <div className="hc-c54-web__col">{!state && ITEMS.slice(7).map(box)}</div>
        </div>
      </div>
    </WebShell>
  );
}
