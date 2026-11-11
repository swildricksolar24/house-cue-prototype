import { useState } from 'react';
import { AgentFab } from '../../../components/AgentFab/AgentFab';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { CreditsMeter } from '../../../components/CreditsMeter/CreditsMeter';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { Input } from '../../../components/Input/Input';
import { ListRow } from '../../../components/ListRow/ListRow';
import { MetricRow } from '../../../components/MetricRow/MetricRow';
import { StatTile } from '../../../components/StatTile/StatTile';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { screenPath } from '../../prototype/journeys';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C89-portfolio-billing.css';

const invoices = [
  { date: 'Nov 1, 2026', doors: '8', amount: '$25.99', mobileMeta: '8 doors · Paid · Visa 4242' },
  { date: 'Oct 1, 2026', doors: '8', amount: '$25.99', mobileMeta: '8 doors · Paid' },
  { date: 'Sep 1, 2026', doors: '6', amount: '$21.99', mobileMeta: '6 doors · Paid' },
];

/** C89 Portfolio billing — Figma mobile 272:32256, web 272:33291 (J1 Landlord portfolio step 8). Billing is bought and managed on the web only (#192). */
export default function PortfolioBilling(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [editingEmail, setEditingEmail] = useState(false);
  const [email, setEmail] = useState('billing@mesaverde.example');

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Portfolio billing' }} bottom={<BottomActions primaryLabel="Manage on web" onPrimary={flow.goNext} />}>
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
        <header className="hc-c89-web__head">
          <div className="hc-c89-web__title">
            <h1 className="hc-h2">Portfolio billing</h1>
            <p className="hc-medium hc-muted">
              Mesa Verde Holdings · billed monthly · bought and managed on the web only (#192) · required from 2+ rental properties (#185)
            </p>
          </div>
          <Button variant="secondary" onClick={flow.goNext}>
            Edit payment method
          </Button>
        </header>
        <div className="hc-c89-web__stats">
          <StatTile label="Monthly total" value="$27.99" meta="$9.99 base + 9 doors × $2" />
          <StatTile label="Doors billed" value="9" meta="+1 door Nov 18 · prorated daily" />
          <StatTile label="Agent credits" value="212" meta="One 240 / yr pool · 300 cap" />
          <StatTile label="Next charge" value="Dec 1" meta="Visa ending 4242" />
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
              <h2 className="hc-large-bold">Plan</h2>
              <MetricRow label="Plan" value="Portfolio" />
              <MetricRow label="Base" value="$9.99 / mo" />
              <MetricRow label="Per door" value="$2.00 / mo" />
              <MetricRow label="Includes" value="Repairs & maintenance only" />
              <Banner tone="info" title="What counts as a door">
                Each separately leased unit is a door, so a duplex counts as 2 (#190). Adding or removing a door is prorated daily (#191). Back to one
                rental: switch to a $4.99 membership.
              </Banner>
            </section>
            <section className="hc-c89-card">
              <h2 className="hc-large-bold">Payment</h2>
              <DetailRow label="Payment method" value="Visa ending 4242" actionLabel="Edit" onAction={flow.goNext} />
              {editingEmail ? (
                <div className="hc-c89-email">
                  <Input label="Billing email" type="email" value={email} onValueChange={setEmail} />
                  <Button variant="secondary" onClick={() => setEditingEmail(false)}>
                    Save
                  </Button>
                </div>
              ) : (
                <DetailRow label="Billing email" value={email} actionLabel="Edit" onAction={() => setEditingEmail(true)} />
              )}
            </section>
          </aside>
        </div>
      </div>
      <AgentFab size="extended" to={screenPath('C09')} className="hc-c89-fab" />
    </WebShell>
  );
}
