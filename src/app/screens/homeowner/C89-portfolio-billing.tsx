import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AgentFab } from '../../../components/AgentFab/AgentFab';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { CreditsMeter } from '../../../components/CreditsMeter/CreditsMeter';
import { ListRow } from '../../../components/ListRow/ListRow';
import { MetricRow } from '../../../components/MetricRow/MetricRow';
import { Select } from '../../../components/Select/Select';
import { StatTile } from '../../../components/StatTile/StatTile';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { portfolioInvoices } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { screenPath } from '../../prototype/journeys';
import { MobileShell } from '../../shells/MobileShell';
import { PageBackButton } from '../../shells/SetupFlow';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import { EditableRow, isEmail } from './_editable-row';
import { cardLabel, PaymentMethodEditor, SAMPLE_CARDS } from './_payment-method-editor';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import './C89-portfolio-billing.css';
import { setPortfolioPlan, useCompanyName, usePortfolioPlan } from '../../prototype/portfolio';

/**
 * Review change: the Plan table's items are dropdowns: the plan (Portfolio monthly or yearly) and how many doors are
 * billed. Rates and totals follow the choice (prototype only; nothing is charged).
 */
const PLANS = {
  monthly: { label: 'Portfolio · monthly', base: 9.99, door: 2, period: 'mo', total: 'Monthly total' },
  yearly: { label: 'Portfolio · yearly', base: 99, door: 20, period: 'yr', total: 'Yearly total' },
} as const;
type PlanKey = keyof typeof PLANS;
const DOOR_OPTIONS = Array.from({ length: 20 }, (_, i) => ({ value: String(i + 1), label: `${i + 1} ${i === 0 ? 'door' : 'doors'}` }));
const usd = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
const usd2 = (n: number) => `$${n.toFixed(2)}`;

// Review change: the invoices moved to sample.ts (portfolioInvoices), shared with the Settings billing dialog
const invoices = portfolioInvoices;

/** C89 Portfolio billing — Figma mobile 272:32256, web 272:33291 (J1 Landlord portfolio step 8). Billing is bought and managed on the web only (#192). */
export default function PortfolioBilling(_: ScreenProps) {
  const company = useCompanyName();
  const { device } = usePrototype();
  const flow = useFlow();
  const [email, setEmail] = useState('billing@mesaverde.example');
  // Review change: the cards on file and the one charged; Edit opens the payment method editor inside the card
  const [cards, setCards] = useState(SAMPLE_CARDS);
  const [cardId, setCardId] = useState(SAMPLE_CARDS[0].id);
  const [editingCard, setEditingCard] = useState(false);
  const current = cards.find((c) => c.id === cardId) ?? cards[0];
  const card = cardLabel(current);
  // Review change: opened from Settings' Portfolio billing card (?from=settings): Back returns there
  const fromSettings = useSearchParams()[0].get('from') === 'settings';
  // Review change: the plan and doors chosen in the Plan table
  // Review change: the plan is the account's (shared with Add property and the property pages, which link here to change it)
  const planKey: PlanKey = usePortfolioPlan();
  const setPlanKey = setPortfolioPlan;
  const [doors, setDoors] = useState(9);
  const plan = PLANS[planKey];
  const money = planKey === 'monthly' ? usd2 : usd;
  const doorsCost = plan.door * doors;
  const total = plan.base + doorsCost;

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Billing', ...(fromSettings ? { onBack: () => flow.go('C34') } : {}) }} bottom={<BottomActions primaryLabel="Manage on web" onPrimary={flow.goNext} />}>
        <Banner tone="info" title="Billing is managed on the web">
          To change your plan, doors or payment method, sign in at housecue.ai on a computer. The app shows your plan and invoices (#192).
        </Banner>
        <section className="hc-c89-card">
          <h2 className="hc-large-bold">This month</h2>
          <MetricRow label="Plan" value="Portfolio" />
          <MetricRow label="Base" value="$9.99 / mo" />
          <MetricRow label="Doors" value="9 × $2.00" />
          <MetricRow label="Monthly total" value="$27.99" />
          <MetricRow label="Next charge" value="Dec 1, 2026" />
        </section>
        <CreditsMeter size="compact" balance="212 credits" />
        <h2 className="hc-c89-label">Invoices</h2>
        <div>
          {invoices.slice(0, 2).map((i) => (
            <ListRow key={i.date} title={`${i.date} · ${i.amount}`} description={i.mobileMeta} />
          ))}
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell role="landlord" nav="account">
      <div className="hc-c89-web">
        {fromSettings && <PageBackButton label="Back to settings" onClick={() => flow.go('C34')} />}
        <header className="hc-c89-web__head">
          <div className="hc-c89-web__title">
            {/* Review change: titled Billing (was Portfolio billing) */}
            <h1 className="hc-h2">Billing</h1>
            <p className="hc-medium hc-muted">
              {company} · billed monthly · bought and managed on the web only (#192) · required from 2+ rental properties (#185)
            </p>
          </div>
          {/* Review change: no Edit payment method button in the header; the Payment card's Edit stays */}
        </header>
        <div className="hc-c89-web__stats">
          <StatTile label={plan.total} value={money(total)} meta={`${money(plan.base)} base + ${doors} ${doors === 1 ? 'door' : 'doors'} × ${usd(plan.door)}`} />
          <StatTile label="Doors billed" value={String(doors)} meta="+1 door Nov 18 · prorated daily" />
          <StatTile label="Agent credits" value="212" meta="One 240 / yr pool · 300 cap" />
          <StatTile label="Next charge" value="Dec 1" meta={card} />
        </div>
        <div className="hc-c89-web__cols">
          <div className="hc-c89-web__main">
            <h2 className="hc-large-bold">Invoices</h2>
            <div className="hc-c89-table" role="table" aria-label="Invoices">
              <div className="hc-c89-table__row hc-c89-table__row--head" role="row">
                <span role="columnheader">Date</span>
                <span role="columnheader">Doors</span>
                <span role="columnheader">Amount</span>
                <span role="columnheader">Status</span>
              </div>
              {invoices.map((i) => (
                <div key={i.date} className="hc-c89-table__row" role="row">
                  <span role="cell" className="hc-medium-semibold">
                    {i.date}
                  </span>
                  <span role="cell">{i.doors}</span>
                  <span role="cell">{i.amount}</span>
                  <span role="cell">
                    <StatusPill label="Paid" tone="success" />
                  </span>
                </div>
              ))}
            </div>
            <Banner tone="warning" title="If a payment fails">
              You get a 7-day grace period. After that the account is read-only: no new routine requests or approvals. Tenant emergencies keep working
              under each property’s emergency ceiling (#191).
            </Banner>
          </div>
          <aside className="hc-c89-web__side">
            <section className="hc-c89-card">
              <h2 id="hc-c89-plan" className="hc-large-bold">
                Plan
              </h2>
              {/* Review change: the plan as a table (item, rate, this month, total) instead of label / value rows */}
              <div className="hc-c89-table hc-c89-table--plan" role="table" aria-labelledby="hc-c89-plan">
                <div className="hc-c89-table__row hc-c89-table__row--head" role="row">
                  <span role="columnheader">Item</span>
                  <span role="columnheader">Rate</span>
                  <span role="columnheader">Cost</span>
                </div>
                {/* Review change: each item is a dropdown; rate and cost follow it */}
                <div className="hc-c89-table__row" role="row">
                  <span role="cell">
                    <Select
                      label="Plan"
                      hideLabel
                      placeholder=""
                      className="hc-c89-plan-select"
                      options={Object.entries(PLANS).map(([value, p]) => ({ value, label: p.label }))}
                      value={planKey}
                      onValueChange={(v) => setPlanKey(v as PlanKey)}
                    />
                  </span>
                  <span role="cell">
                    {money(plan.base)} / {plan.period}
                  </span>
                  <span role="cell">{money(plan.base)}</span>
                </div>
                <div className="hc-c89-table__row" role="row">
                  <span role="cell">
                    <Select
                      label="Doors"
                      hideLabel
                      placeholder=""
                      className="hc-c89-plan-select"
                      options={DOOR_OPTIONS}
                      value={String(doors)}
                      onValueChange={(v) => setDoors(Number(v))}
                    />
                  </span>
                  <span role="cell">
                    {usd(plan.door)} / door / {plan.period}
                  </span>
                  <span role="cell">{money(doorsCost)}</span>
                </div>
                <div className="hc-c89-table__row hc-c89-table__row--total" role="row">
                  <span role="cell">{plan.total}</span>
                  <span role="cell" />
                  <span role="cell">{money(total)}</span>
                </div>
              </div>
              <p className="hc-small hc-muted">Includes repairs &amp; maintenance only.</p>
              <Banner tone="info" title="What counts as a door">
                Each separately leased unit is a door, so a duplex counts as 2 (#190). Adding or removing a door is prorated daily (#191). Back to one
                rental: switch to a $4.99 membership.
              </Banner>
            </section>
            <section className="hc-c89-card">
              <h2 className="hc-large-bold">Payment</h2>
              {/* Review change: Edit opens the editor inside the card (a dropdown of cards, the email field), with Cancel
                  and Save, like Settings */}
              {editingCard ? (
                <PaymentMethodEditor
                  cards={cards}
                  currentId={cardId}
                  nextCharge={`${money(total)} on Dec 1`}
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
          </aside>
        </div>
      </div>
      <AgentFab size="extended" to={screenPath('C09')} className="hc-c89-fab" />
    </WebShell>
  );
}
