import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AgentFab } from '../../../components/AgentFab/AgentFab';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { CreditsMeter } from '../../../components/CreditsMeter/CreditsMeter';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { Select } from '../../../components/Select/Select';
import { StatTile } from '../../../components/StatTile/StatTile';
import { StatusPill, type StatusTone } from '../../../components/StatusPill/StatusPill';
import { accountHomes, currentHome, homeowner } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { screenPath } from '../../prototype/journeys';
import { MobileShell } from '../../shells/MobileShell';
import { PageBackButton } from '../../shells/SetupFlow';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import { EditableRow, isEmail } from './_editable-row';
import { cardLabel, HOMEOWNER_CARDS, PaymentMethodEditor } from './_payment-method-editor';
import './C29-subscription-management.css';
// Review change: the combined Billing page uses the landlord Billing page's layout and tables (hc-c89-*)
import './C89-portfolio-billing.css';

/**
 * Review change: membership is per home, so the Plan table has a row per home you own, each with its plan dropdown.
 * Prices from C28 Membership plans ($4.99 a month or $49 a year per home; Free is $0). Caregiver homes aren't billed
 * to you.
 */
const PLANS = {
  annual: { label: 'Member · annual', price: 49, period: 'yr', perYear: 49 },
  monthly: { label: 'Member · monthly', price: 4.99, period: 'mo', perYear: 4.99 * 12 },
  free: { label: 'Free', price: 0, period: '', perYear: 0 },
} as const;
type PlanKey = keyof typeof PLANS;
const OWNED = accountHomes.filter((h) => h.meta.startsWith('Owner'));
const START: Record<string, PlanKey> = Object.fromEntries(OWNED.map((h) => [h.id, h.meta.includes('Member') ? 'annual' : 'free']));
const usd = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

/** Payment history: membership, credit packs and job payments (from C29's invoices and C30's history; invented) */
const HISTORY: { date: string; item: string; amount: string; status: string; tone: StatusTone }[] = [
  { date: 'Nov 13, 2026', item: 'AC repair · held until sign-off', amount: '$374', status: 'Hold', tone: 'warning' },
  { date: 'Mar 15, 2026', item: 'Membership, annual · 2218 W Palm Ln', amount: '$49.00', status: 'Paid', tone: 'success' },
  { date: 'Mar 12, 2026', item: 'Pool pump holdback', amount: '$32', status: 'Released', tone: 'info' },
  { date: 'Feb 10, 2026', item: 'Pool pump repair', amount: '$288', status: 'Paid', tone: 'success' },
  { date: 'Jan 8, 2026', item: 'Credit pack · 40 credits', amount: '$9.99', status: 'Paid', tone: 'success' },
];

/**
 * C29 Subscription management — Figma mobile 218:19402, web 218:20578 (J1 Membership & credits step 2).
 * Review change: now the homeowner's single **Billing** page, matching the landlord's (C89): this year at a glance,
 * the plan per home (dropdowns), payment (cards on file with the same editor, billing email), payment history, credits,
 * savings and Cancel membership. Settings' Billing card opens it (?from=settings adds Back to settings).
 * "Cancel membership" continues to C54 (choose the 10 items that stay active on Free).
 */
export default function SubscriptionManagement(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const fromSettings = useSearchParams()[0].get('from') === 'settings';
  const [plans, setPlans] = useState<Record<string, PlanKey>>(START);
  const [cards, setCards] = useState(HOMEOWNER_CARDS);
  const [cardId, setCardId] = useState(HOMEOWNER_CARDS[0].id);
  const [editingCard, setEditingCard] = useState(false);
  const [email, setEmail] = useState(homeowner.email);
  const current = cards.find((c) => c.id === cardId) ?? cards[0];
  const card = cardLabel(current);
  const perYear = OWNED.reduce((sum, h) => sum + PLANS[plans[h.id]].perYear, 0);
  const members = OWNED.filter((h) => plans[h.id] !== 'free').length;
  const back = () => flow.go('C34');

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Billing', ...(fromSettings ? { onBack: back } : {}) }} tab="account">
        <DetailRow label="Home" value={currentHome.address} />
        <DetailRow label="Plan" value="Member · annual · $49" actionLabel="Edit" onAction={() => flow.go('C28')} />
        <DetailRow label="Renews" value="Mar 15, 2027" />
        <DetailRow label="Billed to" value={`${card} (web checkout)`} actionLabel="Edit" onAction={() => flow.go('C30')} />
        <CreditsMeter size="compact" balance="180 · usage and packs in C50" onAction={() => flow.go('C50')} />
        <section className="hc-c29-card hc-c29-card--saved">
          <p className="hc-medium-semibold">Saved this year: $86</p>
          <p className="hc-small hc-muted">From 1 warranty claim filed for you</p>
        </section>
        <button type="button" className="hc-c29-cancel" onClick={() => flow.go('C54')}>
          Cancel membership
        </button>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="account">
      <div className="hc-c89-web">
        {fromSettings && <PageBackButton label="Back to settings" onClick={back} />}
        <header className="hc-c89-web__head">
          <div className="hc-c89-web__title">
            <h1 className="hc-h2">Billing</h1>
            <p className="hc-medium hc-muted">
              {homeowner.firstName} {homeowner.lastName} · membership is per home · billed on the web
            </p>
          </div>
        </header>
        <div className="hc-c89-web__stats">
          <StatTile label="Yearly total" value={usd(Math.round(perYear * 100) / 100)} meta={`${members} member ${members === 1 ? 'home' : 'homes'} · Free is $0`} />
          <StatTile label="Homes" value={`${members} of ${OWNED.length}`} meta="Member homes you own" />
          <StatTile label="Agent credits" value="180" meta="240 / yr per member home" />
          <StatTile label="Next charge" value="Mar 15" meta={card} />
        </div>
        <div className="hc-c89-web__cols">
          <div className="hc-c89-web__main">
            <h2 className="hc-large-bold">Payment history</h2>
            <div className="hc-c89-table hc-c29-history" role="table" aria-label="Payment history">
              <div className="hc-c89-table__row hc-c89-table__row--head" role="row">
                <span role="columnheader">Date</span>
                <span role="columnheader">Item</span>
                <span role="columnheader">Amount</span>
                <span role="columnheader">Status</span>
              </div>
              {HISTORY.map((h) => (
                <div key={h.date + h.item} className="hc-c89-table__row" role="row">
                  <span role="cell" className="hc-medium-semibold">
                    {h.date}
                  </span>
                  <span role="cell">{h.item}</span>
                  <span role="cell">{h.amount}</span>
                  <span role="cell">
                    <StatusPill label={h.status} tone={h.tone} />
                  </span>
                </div>
              ))}
            </div>
            <Banner tone="success" title="Saved this year: $86">
              From 1 warranty claim filed for you. If an annual membership saves you less than $49, you get the difference back.
            </Banner>
            <section className="hc-c89-card hc-c29-cancel-card">
              <h2 className="hc-large-bold">Cancel membership</h2>
              <p className="hc-small hc-muted">
                You keep member features until Mar 15, 2027. After that, household access for Jennifer and George ends, and only 10 items stay active.
              </p>
              <Button variant="secondary" onClick={() => flow.go('C54')}>
                Cancel membership
              </Button>
            </section>
          </div>
          <aside className="hc-c89-web__side">
            <section className="hc-c89-card">
              <h2 id="hc-c29-plan" className="hc-large-bold">
                Plan
              </h2>
              <div className="hc-c89-table hc-c89-table--plan hc-c29-plan" role="table" aria-labelledby="hc-c29-plan">
                <div className="hc-c89-table__row hc-c89-table__row--head" role="row">
                  <span role="columnheader">Home</span>
                  <span role="columnheader">Plan</span>
                  <span role="columnheader">Cost</span>
                </div>
                {OWNED.map((h) => {
                  const p = PLANS[plans[h.id]];
                  return (
                    <div key={h.id} className="hc-c89-table__row" role="row">
                      <span role="cell">
                        {h.address}
                        <span className="hc-small hc-muted hc-c29-city"> · {h.city}</span>
                      </span>
                      <span role="cell">
                        <Select
                          label={`Plan for ${h.address}`}
                          hideLabel
                          placeholder=""
                          className="hc-c89-plan-select"
                          options={Object.entries(PLANS).map(([value, x]) => ({ value, label: x.label }))}
                          value={plans[h.id]}
                          onValueChange={(v) => setPlans((all) => ({ ...all, [h.id]: v as PlanKey }))}
                        />
                      </span>
                      <span role="cell">{p.price ? `${usd(p.price)} / ${p.period}` : '$0'}</span>
                    </div>
                  );
                })}
                <div className="hc-c89-table__row hc-c89-table__row--total" role="row">
                  <span role="cell">Yearly total</span>
                  <span role="cell" />
                  <span role="cell">{usd(Math.round(perYear * 100) / 100)}</span>
                </div>
              </div>
              <p className="hc-small hc-muted">Membership is per home: $4.99 a month or $49 a year (save 18%). Homes you help care for are billed to their owner.</p>
            </section>
            <section className="hc-c89-card">
              <h2 className="hc-large-bold">Payment</h2>
              {editingCard ? (
                <PaymentMethodEditor
                  cards={cards}
                  currentId={cardId}
                  nextCharge="$49 on Mar 15"
                  onSave={(next, id) => {
                    setCards(next);
                    setCardId(id);
                    setEditingCard(false);
                  }}
                  onCancel={() => setEditingCard(false)}
                />
              ) : (
                <DetailRow label="Payment method" value={`${card} · Expires ${current.exp}`} actionLabel="Edit" onAction={() => setEditingCard(true)} />
              )}
              <EditableRow kind="email" label="Billing email" display={email} value={email} validate={isEmail} onSave={setEmail} />
            </section>
            <section className="hc-c89-card">
              <h2 className="hc-large-bold">Agent credits</h2>
              <CreditsMeter balance="180 credits" level={0.34} onAction={() => flow.go('C50')} />
            </section>
          </aside>
        </div>
      </div>
      <AgentFab size="extended" to={screenPath('C09')} className="hc-c89-fab" />
    </WebShell>
  );
}
