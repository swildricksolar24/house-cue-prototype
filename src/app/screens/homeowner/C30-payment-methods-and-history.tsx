import { useState } from 'react';
import { Button } from '../../../components/Button/Button';
import type { IconName } from '../../../components/Icon/Icon';
import { OptionCard } from '../../../components/OptionCard/OptionCard';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';
import { StateBlock } from '../../../components/StateBlock/StateBlock';
import { TaskRow, type TaskRowTagTone } from '../../../components/TaskRow/TaskRow';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C30-payment-methods-and-history.css';

type Row = { id: string; title: string; meta: string; icon: IconName; tag: string; tone: TaskRowTagTone };

/** Web history (also the mobile History chip) */
const history: Row[] = [
  { id: 'ac', title: 'AC repair', meta: '$374 held · Nov 13 · releases at sign-off', icon: 'credit-card', tag: 'Hold', tone: 'warning' },
  { id: 'garage', title: 'Garage door spring', meta: '$310 frozen · dispute open', icon: 'credit-card', tag: 'Frozen', tone: 'danger' },
  { id: 'pool', title: 'Pool pump repair', meta: '$288 paid · Feb 10, 2026', icon: 'dollar-sign', tag: 'Paid', tone: 'success' },
  { id: 'pool-hold', title: 'Pool pump holdback', meta: '$32 released · Mar 12, 2026', icon: 'dollar-sign', tag: 'Released', tone: 'info' },
  { id: 'credits', title: 'Credit pack · 40 credits', meta: '$9.99 · Jan 8, 2026', icon: 'orders', tag: 'Paid', tone: 'success' },
  { id: 'membership', title: 'Membership, annual', meta: '$49 · Mar 15, 2026 · web checkout', icon: 'orders', tag: 'Paid', tone: 'success' },
];

/** Mobile "Money on hold" */
const onHold: Row[] = [
  { id: 'ac', title: 'AC repair · $374 held', meta: 'Released when you sign off', icon: 'credit-card', tag: 'Hold', tone: 'warning' },
  { id: 'pool', title: 'Pool pump repair · $32', meta: 'Holdback released Mar 12, 2026', icon: 'dollar-sign', tag: 'Released', tone: 'info' },
];

const cards = [
  { id: 'visa', title: 'Visa •• 4242', mobile: 'Default for 2218 W Palm Ln · expires 08/28', web: 'Default for 2218 W Palm Ln · expires 08/28' },
  { id: 'mc', title: 'Mastercard •• 5100', mobile: 'Expires 02/27', web: 'Default for 81 N Mesa Vista · expires 02/27' },
];

/**
 * C30 Payment methods and history — Figma mobile 217:32220, web 217:32814 (J1 Payment & review step 2).
 * States (batch B5): Empty 110:11727 / 110:11986, Loading 110:11810 / 110:12109, Error 110:11903 / 110:12242.
 */
export default function PaymentMethodsAndHistory(_: ScreenProps) {
  const { device, screenState, setScreenState } = usePrototype();
  const flow = useFlow();
  const [tab, setTab] = useState<'methods' | 'history'>('methods');
  const [selected, setSelected] = useState('visa');

  const pills = (items: Row[]) => (
    <div>
      {items.map((r) => (
        <TaskRow
          key={r.id}
          title={r.title}
          meta={r.meta}
          icon={r.icon}
          tag={r.tag}
          tagTone={r.tone}
          // the held AC job continues the journey (review the pro after sign-off)
          onClick={r.id === 'ac' ? flow.goNext : undefined}
        />
      ))}
    </div>
  );

  const methodCards = (key: 'mobile' | 'web') => (
    <div role="radiogroup" aria-label="Payment methods" className="hc-c30-cards">
      {cards.map((c) => (
        <OptionCard
          key={c.id}
          title={c.title}
          description={c[key]}
          selected={selected === c.id}
          role="radio"
          aria-checked={selected === c.id}
          onClick={() => setSelected(c.id)}
        />
      ))}
    </div>
  );

  const retry = () => setScreenState('default');
  const emptyBlock = (
    <StateBlock
      title="No payments yet"
      body="Holds, charges and receipts show up here after your first booking."
      actionLabel="Add a card"
      onAction={() => {}}
    />
  );
  const errorBlock = (
    <StateBlock kind="error" title="Couldn’t load payments" body="Check your connection and try again. Nothing was lost." onAction={retry} />
  );
  const loading = (
    <div className="hc-c30-cards">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
  const stateContent = screenState === 'empty' ? emptyBlock : screenState === 'error' ? errorBlock : screenState === 'loading' ? loading : null;

  const addButton = (
    <Button variant="secondary" fullWidth onClick={() => {}}>
      Add a card or bank account
    </Button>
  );

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Payments' }} tab="account" className="hc-c30-mobile">
        <div className="hc-c30-chips" role="tablist" aria-label="Payments">
          {(['methods', 'history'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              className={['hc-c30-chip', tab === t && 'hc-c30-chip--selected'].filter(Boolean).join(' ')}
              onClick={() => setTab(t)}
            >
              {t === 'methods' ? 'Methods' : 'History'}
            </button>
          ))}
        </div>
        {tab === 'methods' ? (
          <>
            {stateContent ?? methodCards('mobile')}
            {addButton}
            {!stateContent && <h2 className="hc-large-bold">Money on hold</h2>}
            {pills(onHold)}
          </>
        ) : (
          (stateContent ?? pills(history))
        )}
      </MobileShell>
    );
  }

  return (
    <WebShell nav="account">
      <div className="hc-c30-web">
        <h1 className="hc-h2">Payments</h1>
        <div className="hc-c30-web__cols">
          <section className="hc-c30-card hc-c30-card--methods">
            <h2 className="hc-large-bold">Payment methods</h2>
            {methodCards('web')}
            {addButton}
            <p className="hc-small hc-muted">A card with an active hold can’t be removed until the job is settled.</p>
          </section>
          <section className="hc-c30-card hc-c30-card--history">
            <div className="hc-c30-card__head">
              <h2 className="hc-large-bold">History</h2>
              <Button variant="secondary" onClick={() => {}}>
                Download receipts
              </Button>
            </div>
            {stateContent ?? pills(history)}
          </section>
        </div>
      </div>
    </WebShell>
  );
}
