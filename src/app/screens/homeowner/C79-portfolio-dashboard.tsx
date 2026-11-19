import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AgentFab } from '../../../components/AgentFab/AgentFab';
import { Button } from '../../../components/Button/Button';
import { ListRow } from '../../../components/ListRow/ListRow';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';
import { StatTile } from '../../../components/StatTile/StatTile';
import { StateBlock } from '../../../components/StateBlock/StateBlock';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { Select } from '../../../components/Select/Select';
import { TaskRow } from '../../../components/TaskRow/TaskRow';
import { findProperty, portfolioProperties, portfolioTasks, type PortfolioProperty, type SpendPeriod } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { BILLING_PLAN_OPTIONS, BILLING_START_OPTIONS, setBilling, useAddedProperties, useBilling, usePropertyRules, type Billing, useCompanyName } from '../../prototype/portfolio';
import { usePrototype } from '../../prototype/PrototypeContext';
import { screenPath } from '../../prototype/journeys';
import { MobileShell } from '../../shells/MobileShell';
import { Banner } from '../../../components/Banner/Banner';
import { ConsoleBreadcrumb } from '../../../components/ConsoleBreadcrumb/ConsoleBreadcrumb';
import { Icon } from '../../../components/Icon/Icon';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C79-portfolio-dashboard.css';

type Period = SpendPeriod;

/**
 * Mesa Verde Holdings rentals (Figma C79 web table 262:2724). Review changes: what each property spent this month
 * (November) and this year (to date) sits in the table, against an invented maintenance budget; the list now lives in
 * data/sample.ts (portfolioProperties), shared with the property detail page, Property rules and Tenants & access.
 */

const sum = (list: PortfolioProperty[], p: Period, key: 'spent' | 'budget') => list.reduce((t, r) => t + r[key][p], 0);
/** 1184 → "$1,184" */
const usd = (n: number) => `$${n.toLocaleString('en-US')}`;

/** Spent column cell: "$412 of $500" and a bar of the budget used under it, red with "Over by …" past the budget */
function SpendCell({ label, spent, budget }: { label: string; spent: number; budget: number }) {
  const used = Math.round((spent / budget) * 100);
  const over = spent > budget;
  return (
    <span className={['hc-c79-spend', over && 'hc-c79-spend--over'].filter(Boolean).join(' ')}>
      {/* Amount and % (or "Over by …") on one line, so every bar below runs the full column width */}
      <span className="hc-c79-spend__line">
        <span>
          <span className="hc-medium-semibold">{usd(spent)}</span>
          <span className="hc-muted"> of {usd(budget)}</span>
        </span>
        <span className={['hc-small', over ? 'hc-c79-spend__over' : 'hc-muted'].join(' ')}>{over ? `Over by ${usd(spent - budget)}` : `${used}%`}</span>
      </span>
      <span className="hc-c79-spend__bar" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(used, 100)} aria-label={`${label}: ${used}% of budget`}>
        <span style={{ width: `${Math.min(used, 100)}%` }} />
      </span>
    </span>
  );
}
type Property = PortfolioProperty;

/**
 * Review change: the property detail page (C79 ?property=<id>), opened from a row on the Portfolio dashboard (web table
 * and mobile list; was a dialog, before that straight to Tenants & access). Back goes to the Portfolio. It shows the
 * property at a glance (tenancy, open items, spent this month and this year against its budget), then Set up: Tenants &
 * access (who lives there, invites, vacant units) and Property rules (approval ceilings, own or portfolio defaults),
 * each opening its screen for this property (C82 / C81 ?property=), and its upcoming maintenance (each task opens its
 * row on the Jobs page). ?saved=rules shows a confirmation after saving Property rules.
 */
function PropertyDetail({ property: p, saved }: { property: Property; saved: string | null }) {
  const { device } = usePrototype();
  const flow = useFlow();
  const back = () => flow.go('C79');
  const tenants = () => flow.go('C82', `?property=${p.id}`);
  const rules = () => flow.go('C81', `?property=${p.id}`);
  const tasks = portfolioTasks.filter((t) => p.address.startsWith(t.property));

  const people = p.tenants.filter((t) => t.status !== 'Vacant');
  const pending = p.tenants.filter((t) => t.status === 'Invite pending').length;
  const vacant = p.tenants.filter((t) => t.status === 'Vacant').length;
  const tenantsSummary = p.tenants.length
    ? [
        people.length - pending ? `${people.length - pending} active` : '',
        pending ? `${pending} invite${pending > 1 ? 's' : ''} pending` : '',
        vacant ? `${vacant} unit vacant` : '',
      ]
        .filter(Boolean)
        .join(' · ')
    : 'No tenants · the unit is vacant (turnover)';
  // Review change: rules saved on this property's Property rules page (this visit) count as its own rules
  const savedRules = usePropertyRules(p.id);
  const ownRules = !!savedRules || p.rules.own;
  const routineCeiling = savedRules?.routine ?? p.rules.routine;
  const emergencyCeiling = savedRules?.emergency ?? p.rules.emergency;
  const rulesSummary = `${ownRules ? 'Own rules' : 'Portfolio defaults'} · routine ceiling ${usd(routineCeiling)} · emergency ${usd(emergencyCeiling)}`;

  const notice =
    saved === 'rules' ? (
      <Banner tone="success" title="Rules saved">
        {p.short} uses its new approval rules from now on.
      </Banner>
    ) : null;

  const glance = (
    <div className="hc-c79-detail__glance">
      <section className="hc-c79-card">
        <p className="hc-small hc-muted">Tenancy</p>
        <StatusPill label={p.tenancy[0]} tone={p.tenancy[1]} />
      </section>
      <section className="hc-c79-card">
        <p className="hc-small hc-muted">Open</p>
        {/* Review change: Nothing open is a neutral badge too (was plain text) */}
        {typeof p.open === 'string' ? <StatusPill label={p.open} tone="neutral" /> : <StatusPill label={p.open[0]} tone={p.open[1]} />}
      </section>
      <section className="hc-c79-card">
        <p className="hc-small hc-muted">Spent · Nov</p>
        <SpendCell label={`${p.short} this month`} spent={p.spent.month} budget={p.budget.month} />
      </section>
      <section className="hc-c79-card">
        <p className="hc-small hc-muted">Spent · 2026</p>
        <SpendCell label={`${p.short} this year`} spent={p.spent.year} budget={p.budget.year} />
      </section>
    </div>
  );

  const setUp = (
    <section className="hc-c79-detail__setup" aria-labelledby="hc-c79-setup">
      <h2 id="hc-c79-setup" className="hc-large-bold">
        Set up
      </h2>
      <div className="hc-c79-detail__setup-cards">
        <section className="hc-c79-card hc-c79-detail__setup-card">
          <span className="hc-c79-detail__icon" aria-hidden>
            <Icon name="users" size={20} />
          </span>
          <h3 className="hc-medium-semibold">Tenants &amp; access</h3>
          <p className="hc-small hc-muted">Invite tenants, see who lives here and when pros can come in.</p>
          <p className="hc-small">{tenantsSummary}</p>
          {people.length > 0 && <p className="hc-small hc-muted">{people.map((t) => t.name.replace(' (co-tenant)', '')).join(', ')}</p>}
          <Button size="small" onClick={tenants}>
            {p.tenants.length ? 'Manage tenants & access' : 'Invite a tenant'}
          </Button>
        </section>
        <section className="hc-c79-card hc-c79-detail__setup-card">
          <span className="hc-c79-detail__icon" aria-hidden>
            <Icon name="shield" size={20} />
          </span>
          <h3 className="hc-medium-semibold">Property rules</h3>
          <p className="hc-small hc-muted">Approval ceilings, what tenants may report and what they see.</p>
          <p className="hc-small">{rulesSummary}</p>
          <Button size="small" variant="secondary" onClick={rules}>
            {ownRules ? 'Edit rules' : 'Set up rules'}
          </Button>
        </section>
      </div>
    </section>
  );

  // Review change: Plan & billing for this property, editable here (chosen on Add property for a new one; Monthly from
  // the next cycle otherwise). A change saves straight away and the line under it says what this property costs.
  const billing = useBilling(p.id);
  const [billingSaved, setBillingSaved] = useState(false);
  const doors = parseInt(p.units, 10) || 1;
  const changeBilling = (next: Billing) => {
    setBilling(p.id, next);
    setBillingSaved(true);
  };
  const billingCard = (
    <section className="hc-c79-card hc-c79-billing" aria-labelledby="hc-c79-billing">
      <div className="hc-c79-billing__head">
        <h2 id="hc-c79-billing" className="hc-large-bold">
          Plan &amp; billing
        </h2>
        {billingSaved && (
          <span className="hc-small hc-c79-billing__saved" role="status">
            Saved
          </span>
        )}
      </div>
      <div className="hc-c79-billing__row">
        <span className="hc-medium hc-muted">Plan</span>
        <Select
          label="Plan"
          hideLabel
          placeholder=""
          options={BILLING_PLAN_OPTIONS}
          value={billing.plan}
          onValueChange={(v) => changeBilling({ ...billing, plan: v as Billing['plan'] })}
          className="hc-c79-billing__select"
        />
      </div>
      <div className="hc-c79-billing__row">
        <span className="hc-medium hc-muted">Billing starts</span>
        <Select
          label="Billing starts"
          hideLabel
          placeholder=""
          options={BILLING_START_OPTIONS}
          value={billing.start}
          onValueChange={(v) => changeBilling({ ...billing, start: v as Billing['start'] })}
          className="hc-c79-billing__select"
        />
      </div>
      <p className="hc-small hc-muted">
        {doors} {doors === 1 ? 'door' : 'doors'} ×{' '}
        {billing.plan === 'monthly' ? `$2 = ${usd(2 * doors)} a month` : `$20 = ${usd(20 * doors)} a year`} for this property on the Portfolio
        plan, {billing.start === 'next' ? 'starting Dec 1' : 'starting today (prorated)'}.
      </p>
    </section>
  );

  const maintenance = (
    <section className="hc-c79-card">
      <h2 className="hc-large-bold">Upcoming maintenance</h2>
      {tasks.length ? (
        tasks.map((t) => <TaskRow key={t.id} title={t.title} meta={t.due} tag="DIY" onClick={() => flow.go('C86', `?job=${t.id}`)} />)
      ) : (
        <p className="hc-medium hc-muted">Nothing due in the next 30 days.</p>
      )}
    </section>
  );

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: p.short, onBack: back }} role="landlord" tab="portfolio" background="page">
        <p className="hc-medium hc-muted">
          {p.city} · {p.mobileMeta}
        </p>
        {notice}
        {glance}
        {setUp}
        {billingCard}
        {maintenance}
      </MobileShell>
    );
  }

  return (
    <WebShell role="landlord" nav="portfolio">
      <div className="hc-c79-web hc-c79-detail">
        <header className="hc-c79-web__head">
          <div className="hc-c79-web__title">
            <ConsoleBreadcrumb homeTo={screenPath('C79')} homeLabel="Portfolio" parent="Portfolio" onParentClick={back} current={p.short} />
            <h1 className="hc-h2">{p.address}</h1>
            <p className="hc-medium hc-muted">{p.mobileMeta}</p>
          </div>
        </header>
        {notice}
        {glance}
        {setUp}
        {billingCard}
        {maintenance}
      </div>
      <AgentFab size="extended" to={screenPath('C09')} className="hc-c79-fab" />
    </WebShell>
  );
}

/** C79 Portfolio dashboard — Figma mobile 272:31993, web 272:32756; states 262:2940/3021/3106 (mobile), 262:3196/3402/3620 (web) */
export default function PortfolioDashboard(_: ScreenProps) {
  const [params] = useSearchParams();
  const propertyId = params.get('property');
  // Review change: ?property=<id> is that property's detail page
  if (propertyId) return <PropertyDetail key={propertyId} property={findProperty(propertyId)} saved={params.get('saved')} />;
  return <Dashboard />;
}

function Dashboard() {
  const company = useCompanyName();
  const { device, screenState } = usePrototype();
  const flow = useFlow();
  const [period, setPeriod] = useState<Period>('month');
  // Review change: the portfolio's five, then any added on Add property this visit (no New badge); header counts and the
  // total include them, and ?added=<n> confirms what was just added
  const added = useAddedProperties();
  const properties = [...portfolioProperties, ...added];
  const doors = properties.reduce((t, p) => t + (parseInt(p.units, 10) || 0), 0);
  const [params] = useSearchParams();
  const justAdded = Number(params.get('added') ?? -1);
  const addedNote =
    justAdded > 0 ? (
      <Banner tone="success" title={`Added ${justAdded} ${justAdded === 1 ? 'property' : 'properties'} to your portfolio`}>
        {justAdded === 1 ? 'It’s' : 'They’re'} at the end of the list below. Open one to invite tenants and set its rules.
      </Banner>
    ) : justAdded === 0 ? (
      <Banner tone="info" title="Already on your portfolio">
        Those addresses were already here, so nothing new was added.
      </Banner>
    ) : null;

  // Review change: Add property is opened from here with ?from=portfolio, so saving comes back here
  const addProperty = () => flow.go('C80', '?from=portfolio');
  // Review change: a property row opens its detail page (was a dialog; before that straight to C82 Tenants & access)
  const openProperty = (p: Property) => () => flow.go('C79', `?property=${p.id}`);

  const stateList = (rows: number) => {
    if (screenState === 'loading') {
      return (
        <div className="hc-c79-skeletons">
          {Array.from({ length: rows }, (_, i) => (
            <SkeletonCard key={i} label="Loading properties" />
          ))}
        </div>
      );
    }
    if (screenState === 'empty') {
      return (
        <StateBlock
          title="Add your first rental"
          body="Add a property to see requests, spend and upcoming maintenance here."
          actionLabel="Get started"
          onAction={addProperty}
        />
      );
    }
    if (screenState === 'error') {
      return (
        <StateBlock
          kind="error"
          title="Could not load your properties"
          body="Check your connection and try again. Your data is safe."
          actionLabel="Try again"
        />
      );
    }
    return null;
  };

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Portfolio', showBack: false }} role="landlord" tab="portfolio">
        {addedNote}
        <div className="hc-c79-stats">
          <StatTile label="Open requests" value="6" meta="2 urgent" />
          <StatTile label="Awaiting you" value="3" meta="Oldest 26 h" />
          <StatTile label="Spent · Nov" value="$1,184" meta="9 doors" />
          <StatTile label="Upcoming" value="4" meta="Next 30 days" />
        </div>
        <div className="hc-c79-section-head">
          <h2 className="hc-large-bold">Properties</h2>
          <button type="button" className="hc-c79-link" onClick={addProperty}>
            Add property
          </button>
        </div>
        {stateList(4) ?? (
          <div>
            {properties.map((p) => (
              <button key={p.address} type="button" className="hc-c79-row" onClick={openProperty(p)}>
                <ListRow title={p.address} description={p.mobileMeta} icon={p.allClear ? 'check' : 'home'} />
              </button>
            ))}
          </div>
        )}
        <AgentFab to={screenPath('C09')} className="hc-c79-fab hc-c79-fab--mobile" />
      </MobileShell>
    );
  }

  return (
    <WebShell role="landlord" nav="portfolio">
      <div className="hc-c79-web">
        <header className="hc-c79-web__head">
          <div className="hc-c79-web__title">
            <h1 className="hc-h2">Portfolio dashboard</h1>
            <p className="hc-medium hc-muted">
              {company} · {properties.length} properties · {doors} doors · Portfolio plan
            </p>
          </div>
          {/* Review change: Add property moved down to the Properties heading */}
          <Button onClick={() => flow.go('C86')}>Review approvals (3)</Button>
        </header>
        {addedNote}
        <div className="hc-c79-web__stats">
          <StatTile label="Open requests" value="6" meta="2 urgent" />
          <StatTile label="Awaiting approval" value="3" meta="Oldest 26 h · C86" />
          <StatTile label="Spent · November" value="$1,184" meta="Year to date $9,420" />
          <StatTile label="Upcoming maintenance" value="4" meta="Next 30 days" />
          <StatTile label="Occupancy" value="7 of 9" meta="2 doors vacant" />
        </div>
        {/* Review change: the display-only filter tags (All properties, Status: any, Category: any, Last 30 days) are
            removed; they didn't filter anything */}
        <div className="hc-c79-web__cols">
          <div className="hc-c79-web__main">
            {/* Review change: Properties and Spent by property are one card. Month / Year switches the Spent column and
                the total. */}
            <div className="hc-c79-section-head">
              <h2 className="hc-large-bold">Properties</h2>
              <div className="hc-c79-chips" role="group" aria-label="Spent period">
                <button type="button" className="hc-c79-chip" aria-pressed={period === 'month'} onClick={() => setPeriod('month')}>
                  <StatusPill label="Month" tone={period === 'month' ? 'info' : 'neutral'} />
                </button>
                <button type="button" className="hc-c79-chip" aria-pressed={period === 'year'} onClick={() => setPeriod('year')}>
                  <StatusPill label="Year" tone={period === 'year' ? 'info' : 'neutral'} />
                </button>
              </div>
              {/* Review change: the (disabled) Search link that sat after Year is removed */}
            </div>
            {stateList(4) ?? (
              <div className="hc-c79-table" role="table" aria-label="Properties">
                <div className="hc-c79-table__row hc-c79-table__row--head" role="row">
                  <span role="columnheader">Property</span>
                  <span role="columnheader">Tenancy</span>
                  <span role="columnheader">Open</span>
                  <span role="columnheader">{period === 'month' ? 'Spent of budget · Nov' : 'Spent of budget · 2026'}</span>
                </div>
                {properties.map((p) => (
                  <div key={p.address} className="hc-c79-table__row hc-c79-table__row--link" role="row" tabIndex={0} onClick={openProperty(p)} onKeyDown={(e) => e.key === 'Enter' && openProperty(p)()}>
                    <span role="cell" className="hc-c79-table__address">
                      {p.address}
                    </span>
                    <span role="cell">
                      <StatusPill label={p.tenancy[0]} tone={p.tenancy[1]} />
                    </span>
                    {/* Review change: Nothing open is a neutral badge too (was plain text) */}
                    <span role="cell">{typeof p.open === 'string' ? <StatusPill label={p.open} tone="neutral" /> : <StatusPill label={p.open[0]} tone={p.open[1]} />}</span>
                    <span role="cell">
                      <SpendCell label={p.short} spent={p.spent[period]} budget={p.budget[period]} />
                    </span>
                  </div>
                ))}
                <div className="hc-c79-table__row hc-c79-table__row--total" role="row">
                  <span role="cell" className="hc-medium-semibold">
                    Portfolio total
                  </span>
                  <span role="cell" />
                  <span role="cell" />
                  <span role="cell">
                    <SpendCell label="Portfolio total" spent={sum(properties, period, 'spent')} budget={sum(properties, period, 'budget')} />
                  </span>
                </div>
                {/* Review change: Add property sits at the bottom of the Properties card (was in the page header) */}
                <div className="hc-c79-table__foot">
                  <Button size="small" variant="secondary" onClick={addProperty}>
                    Add property
                  </Button>
                </div>
              </div>
            )}
          </div>
          <aside className="hc-c79-web__side">
            <section className="hc-c79-card">
              <h2 className="hc-large-bold">Upcoming maintenance</h2>
              {/* Review change: each DIY task opens the landlord Jobs page (C86) with that task's row open (?job=) (was
                  the homeowner Plan, C11); the tasks are listed there as rows */}
              {portfolioTasks.map((t) => (
                <TaskRow key={t.id} title={t.cardTitle} meta={t.due} tag="DIY" onClick={() => flow.go('C86', `?job=${t.id}`)} />
              ))}
            </section>
          </aside>
        </div>
      </div>
      <AgentFab size="extended" to={screenPath('C09')} className="hc-c79-fab" />
    </WebShell>
  );
}
