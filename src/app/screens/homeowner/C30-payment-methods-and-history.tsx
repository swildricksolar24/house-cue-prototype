import { useState } from 'react';
import { Button } from '../../../components/Button/Button';
import type { IconName } from '../../../components/Icon/Icon';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';
import { StateBlock } from '../../../components/StateBlock/StateBlock';
import { TaskRow, type TaskRowTagTone } from '../../../components/TaskRow/TaskRow';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { useCurrentHome } from '../../prototype/HomeContext';
import { AddPaymentDialog } from '../../shells/AddPaymentDialog';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import { ReceiptsDownload } from './_c30-receipts';
import { CardChoice, CardEditForm, expiresSoon, type CardDetails } from './_payment-method-editor';
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

/** Review change: name on card and billing ZIP, for each card's Edit form (invented; Marty McFly, 85004 when unset) */
type Method = { id: string; title: string; mobile: string; web: string; name?: string; zip?: string };

const CARDS: Method[] = [
  { id: 'visa', title: 'Visa •• 4242', mobile: 'Default for 2218 W Palm Ln · expires 08/28', web: 'Default for 2218 W Palm Ln · expires 08/28' },
  { id: 'mc', title: 'Mastercard •• 5100', mobile: 'Expires 02/27', web: 'Default for 81 N Mesa Vista · expires 02/27' },
  // Review change: a third card (not anyone's default) that expires soon, so Remove and Expires soon show here too
  { id: 'amex', title: 'Amex •• 3007', mobile: 'Expires 12/26', web: 'Expires 12/26 · Marty McFly' },
];

/**
 * C30 Payment methods and history — Figma mobile 217:32220, web 217:32814 (J1 Payment & review step 2).
 * States (batch B5): Empty 110:11727 / 110:11986, Loading 110:11810 / 110:12109, Error 110:11903 / 110:12242.
 * Review change: "Add a card or bank account" (and the empty state's "Add a card") opens AddPaymentDialog. The new
 * method joins the list and is selected; "Make this the default" moves the "Default for <home>" note to it.
 */
export default function PaymentMethodsAndHistory(_: ScreenProps) {
  const { device, screenState, setScreenState } = usePrototype();
  const flow = useFlow();
  const [tab, setTab] = useState<'methods' | 'history'>('methods');
  const [selected, setSelected] = useState('visa');
  const [cards, setCards] = useState(CARDS);
  // Review change: the card whose Edit form is open (name on card, expiry, billing ZIP)
  const [editingId, setEditingId] = useState<string | null>(null);
  const saveCard = (c: Method, d: CardDetails) => {
    const oldName = c.name ?? 'Marty McFly';
    const swap = (text: string) => text.replace(/\d{2}\/\d{2}/, d.exp).split(oldName).join(d.name);
    setCards((list) => list.map((x) => (x.id === c.id ? { ...x, name: d.name, zip: d.zip, mobile: swap(x.mobile), web: swap(x.web) } : x)));
    setEditingId(null);
  };
  const [adding, setAdding] = useState(false);
  // Review change: Download receipts opens the receipts dialogs (_c30-receipts.tsx)
  const [downloading, setDownloading] = useState(false);
  const receiptsDialog = downloading && <ReceiptsDownload onClose={() => setDownloading(false)} />;
  const { home } = useCurrentHome();
  const addDialog = adding && (
    <AddPaymentDialog
      homeAddress={home.address}
      onCancel={() => setAdding(false)}
      onAdd={(m) => {
        const id = `added-${cards.length + 1}`;
        const defaultNote = `Default for ${home.address}`;
        const own = m.makeDefault ? `${defaultNote} · ${m.detail.charAt(0).toLowerCase()}${m.detail.slice(1)}` : m.detail;
        setCards((list) => [
          // A new default takes the home's "Default for …" note from the old one
          ...list.map((c) =>
            m.makeDefault && c.web.startsWith(defaultNote)
              ? { ...c, web: c.web.replace(`${defaultNote} · e`, 'E'), mobile: c.mobile.replace(`${defaultNote} · e`, 'E') }
              : c,
          ),
          { id, title: m.title, mobile: own, web: own },
        ]);
        setSelected(id);
        setAdding(false);
        if (screenState === 'empty') setScreenState('default');
      }}
    />
  );

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

  /**
   * Review change: each method uses the same card row as the landlord's Billing page (CardChoice): card or bank icon,
   * "Visa ending 4242", the detail line, a Default tag for this home, Expires soon, and Remove on methods that aren't
   * selected or anyone's default (was an Option Card).
   */
  const methodCards = (key: 'mobile' | 'web') => (
    <div role="radiogroup" aria-label="Payment methods" className="hc-c30-cards">
      {cards.map((c) => {
        const exp = c[key].match(/(\d{2}\/\d{2})/)?.[1];
        const isDefaultHere = c.web.startsWith(`Default for ${home.address}`);
        const removable = selected !== c.id && !c.web.startsWith('Default for');
        return (
          <CardChoice
            key={c.id}
            title={c.title.replace(' •• ', ' ending ')}
            detail={c[key].charAt(0).toUpperCase() + c[key].slice(1)}
            icon={c[key].includes('Bank account') ? 'dollar-sign' : 'credit-card'}
            tags={[
              ...(isDefaultHere ? [{ label: 'Default', tone: 'neutral' as const }] : []),
              ...(exp && expiresSoon(exp) ? [{ label: 'Expires soon', tone: 'warning' as const }] : []),
            ]}
            selected={selected === c.id}
            onSelect={() => setSelected(c.id)}
            onRemove={removable ? () => setCards((l) => l.filter((x) => x.id !== c.id)) : undefined}
            // Review change: Edit on every card (not bank accounts) opens its form inside the row
            onEdit={exp ? () => setEditingId(c.id) : undefined}
            editForm={
              editingId === c.id &&
              exp && (
                <CardEditForm
                  details={{ name: c.name ?? 'Marty McFly', exp, zip: c.zip ?? '85004' }}
                  onSave={(d) => saveCard(c, d)}
                  onCancel={() => setEditingId(null)}
                />
              )
            }
          />
        );
      })}
    </div>
  );

  const retry = () => setScreenState('default');
  const emptyBlock = (
    <StateBlock
      title="No payments yet"
      body="Holds, charges and receipts show up here after your first booking."
      actionLabel="Add a card"
      onAction={() => setAdding(true)}
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
    <Button variant="secondary" fullWidth leadingIcon="plus" onClick={() => setAdding(true)}>
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
          <>
            {stateContent ?? pills(history)}
            {/* Review change: mobile gets Download receipts too, under the history (web has it in the History card) */}
            {!stateContent && (
              <Button variant="secondary" fullWidth onClick={() => setDownloading(true)}>
                Download receipts
              </Button>
            )}
          </>
        )}
        {addDialog}
        {receiptsDialog}
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
              <Button variant="secondary" onClick={() => setDownloading(true)}>
                Download receipts
              </Button>
            </div>
            {stateContent ?? pills(history)}
          </section>
        </div>
      </div>
      {addDialog}
      {receiptsDialog}
    </WebShell>
  );
}
