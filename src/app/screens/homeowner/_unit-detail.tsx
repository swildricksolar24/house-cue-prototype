import { useState } from 'react';
import type { SpendPeriod } from '../../data/sample';
import { AgentFab } from '../../../components/AgentFab/AgentFab';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { ConsoleBreadcrumb } from '../../../components/ConsoleBreadcrumb/ConsoleBreadcrumb';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import type { PortfolioProperty } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { screenPath } from '../../prototype/journeys';
import { MobileShell } from '../../shells/MobileShell';
import { PageBackButton } from '../../shells/SetupFlow';
import { WebShell } from '../../shells/WebShell';
import { JobsBoard } from './C86-approval-queue';
import { jobPlace, portfolioJobs, STAGES } from './_jobs';
import { revokeTenant, saveTenant, setDetails, useDetails, useTenants } from '../../prototype/portfolio';
import { PeriodHead, SpendCell } from './C79-portfolio-dashboard';
import { PageTabs, type PageTab } from './_page-tabs';
import { NoticesList, useNotices, useVendors, VendorsList } from './_property-alerts-vendors';
import { PropertyDetailsEditor } from './_property-details';
import { PropertyRulesPanel } from './_property-rules-panel';
import { TenantAccessForm } from './_tenants-access-dialog';
import './C86-approval-queue.css';
import './_tenants-access-dialog.css';

type Property = PortfolioProperty;

/**
 * Review change: one unit's page (C79 ?property=<id>&unit=<unit>; unit "—" is a one-unit home), opened from a tenant
 * on the property page or a unit row on the Portfolio. Laid out like the property page for just that unit: Back to the
 * property, the Spent (its share of the property's spend and budget, Month / Year), Tenancy and Open cards, then the
 * same tabs: Tenant (the Tenants & access form), Jobs, Lifecycle Notices, Vendors & Contractors, Details and Rules.
 * Each unit has its own Details and Rules (kept under "<property>:<unit>"; its rules start from the property's).
 * Edits last for the visit.
 */
export function UnitDetail({ property: p, unit }: { property: Property; unit: string }) {
  const { device } = usePrototype();
  const flow = useFlow();
  const back = () => flow.go('C79', `?property=${p.id}`);
  const name = unit === '—' ? p.short : `Unit ${unit}`;

  // The unit's tenants (an empty unit's "No tenant" entry isn't one), with this visit's changes (kept for the visit,
  // so the property page and the Portfolio show them too)
  const all = useTenants(p);
  const [notice, setNotice] = useState<{ title: string; body: string } | null>(null);
  const tenants = all.filter((t) => t.unit === unit && t.name !== 'No tenant');
  const tenant = tenants[0];
  const tenancy: Property['tenancy'] = tenant ? [tenant.status.replace(/^Moving out .*/, 'Moving out'), tenant.tone] : ['Vacant', 'neutral'];

  // This unit's jobs (a one-unit home: all of the property's jobs)
  const match = (prop: string) => {
    const { street, unit: u } = jobPlace(prop);
    return p.address.startsWith(street) && (unit === '—' || u === unit);
  };
  const jobs = portfolioJobs().filter((j) => match(j.property));
  const openJobs = jobs.filter((j) => STAGES[j.stage].section !== 'closed').length;
  const doors = parseInt(p.units, 10) || 1;
  // The unit's share of the property's spend and budget (the sample data has no per-unit spend)
  const [period, setPeriod] = useState<SpendPeriod>('month');
  const share = (n: number) => Math.round(n / doors);

  const glance = (
    <div className="hc-c79-detail__glance">
      <section className="hc-c79-card hc-c79-detail__spent">
        <p className="hc-small hc-muted">
          <PeriodHead title="Spent" name="Spent period" period={period} onChange={setPeriod} />
        </p>
        <SpendCell label={`${name} ${period === 'month' ? 'this month' : 'this year'}`} spent={share(p.spent[period])} budget={share(p.budget[period])} />
      </section>
      <section className="hc-c79-card">
        <p className="hc-small hc-muted">Tenancy</p>
        <StatusPill label={tenancy[0]} tone={tenancy[1]} />
      </section>
      <section className="hc-c79-card">
        <p className="hc-small hc-muted">Open</p>
        <StatusPill label={openJobs ? `${openJobs} open` : 'Nothing open'} tone={openJobs ? 'warning' : 'neutral'} />
      </section>
    </div>
  );

  const tenantCard = (
    <section className="hc-c79-card hc-c79-unit__tenant hc-c79-tabcard" aria-label="Tenant">
      {/* Review change: the tenant's Tenants & access form right here (was read-only details and an Edit dialog) */}
      {!tenant && <p className="hc-medium hc-muted">No one lives in {name} right now. Invite the tenant so they can report issues and set access windows.</p>}
      <TenantAccessForm
        key={tenant?.id ?? 'new'}
        property={p}
        unit={unit}
        tenant={tenant}
        onSave={(t, isNew) => {
          saveTenant(p, t, isNew);
          setNotice(isNew ? { title: `Invite sent to ${t.name}`, body: `We emailed ${t.email}.` } : { title: `Saved ${t.name}’s details`, body: `Access windows: ${t.windows}.` });
        }}
        onRevoke={(id) => {
          revokeTenant(p, id);
          setNotice(null);
        }}
        onMoveOut={p.id === 'roosevelt' && unit === 'B' ? () => flow.go('C87') : undefined}
      />
    </section>
  );

  const jobsCard = (
    <section className="hc-c79-card hc-c79-jobs" aria-label="Jobs">
      {jobs.length === 0 ? (
        <p className="hc-medium hc-muted">No jobs for {name} right now.</p>
      ) : device === 'mobile' ? (
        jobs.map((j) => (
          <button key={j.id} type="button" className="hc-c79-unit__job" onClick={() => flow.go('C86', `?job=${j.id}`)}>
            <span className="hc-medium-semibold">{j.title}</span>
            <StatusPill label={STAGES[j.stage].label} tone={STAGES[j.stage].tone} />
          </button>
        ))
      ) : (
        <JobsBoard
          embedded
          match={match}
          placeLabel={{ header: 'Unit', cell: (prop) => (jobPlace(prop).unit ? `Unit ${jobPlace(prop).unit}` : 'Whole home') }}
        />
      )}
    </section>
  );

  // Review change: the same tabs as the property page, for this unit
  const detailsKey = `${p.id}:${unit}`;
  const details = useDetails(detailsKey);
  const notices = useNotices(p, unit);
  const vendors = useVendors(p, unit);
  const TABS: PageTab[] = [
    { id: 'tenant', label: 'Tenant', content: tenantCard },
    { id: 'jobs', label: 'Jobs', count: jobs.length, content: jobsCard },
    { id: 'notices', label: 'Lifecycle Notices', count: notices.length, content: <section className="hc-c79-card hc-c79-tabcard"><NoticesList property={p} unit={unit} /></section> },
    { id: 'vendors', label: 'Vendors & Contractors', count: vendors.length, content: <section className="hc-c79-card hc-c79-tabcard"><VendorsList property={p} unit={unit} /></section> },
    {
      id: 'details',
      label: 'Details',
      content: (
        <section className="hc-c79-card hc-c79-tabcard">
          <p className="hc-small hc-muted">Details for {name} only (its own appliances, systems and history).</p>
          <PropertyDetailsEditor value={details} onChange={(next) => setDetails(detailsKey, next)} address={unit === '—' ? p.short : `${p.short} · Unit ${unit}`} inCard />
        </section>
      ),
    },
    {
      id: 'rules',
      label: 'Rules',
      content: (
        <section className="hc-c79-card hc-c79-tabcard">
          <p className="hc-small hc-muted">Starts from {p.short}’s rules; changes here apply to {name} only.</p>
          <PropertyRulesPanel key={detailsKey} property={p} unit={unit} />
        </section>
      ),
    },
  ];
  const tabsEl = <PageTabs tabs={TABS} label={`${name} sections`} />;

  const banner = notice && (
    <Banner tone="success" title={notice.title}>
      {notice.body}
    </Banner>
  );

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: name, onBack: back }} role="landlord" tab="portfolio" background="page">
        <p className="hc-medium hc-muted">{p.address}</p>
        {banner}
        {glance}
        {tabsEl}
      </MobileShell>
    );
  }

  return (
    <WebShell role="landlord" nav="portfolio">
      <div className="hc-c79-web hc-c79-detail">
        <PageBackButton label={`Back to ${p.short}`} onClick={back} />
        <header className="hc-c79-web__head">
          <div className="hc-c79-web__title">
            <ConsoleBreadcrumb homeTo={screenPath('C79')} homeLabel="Portfolio" parent={p.short} onParentClick={back} current={name} />
            {/* Review change: the title is just the unit ("Unit 3"); the address is in the breadcrumb. A one-unit home keeps its address. */}
            <h1 className="hc-h2">{unit === '—' ? p.address : `Unit ${unit}`}</h1>
            <p className="hc-medium hc-muted">{tenant ? `${tenant.name} · ${tenancy[0]}` : 'Vacant'}</p>
          </div>
        </header>
        {banner}
        {glance}
        {tabsEl}
      </div>
      <AgentFab size="extended" to={screenPath('C09')} className="hc-c79-fab" />
    </WebShell>
  );
}
