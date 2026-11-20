import { Fragment, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AgentFab } from '../../../components/AgentFab/AgentFab';
import { Button } from '../../../components/Button/Button';
import { ListRow } from '../../../components/ListRow/ListRow';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';
import { StatTile } from '../../../components/StatTile/StatTile';
import { StateBlock } from '../../../components/StateBlock/StateBlock';
import { StatusPill, type StatusTone } from '../../../components/StatusPill/StatusPill';
import { Select } from '../../../components/Select/Select';
import { findProperty, portfolioProperties, type PortfolioProperty, type SpendPeriod } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { removeProperty, revokeTenant, saveTenant, setDetails, tenantsOf, useAddedProperties, useDetails, useCompanyName, useTenants, withoutRemoved } from '../../prototype/portfolio';
import { FormDialog } from '../../shells/EditDialog';
import { TenantAccessForm } from './_tenants-access-dialog';
import { PropertyDetailsEditor } from './_property-details';
import { PropertyRulesPanel } from './_property-rules-panel';
import { jobPlace, portfolioJobs, SECTIONS, STAGES } from './_jobs';
import './C86-approval-queue.css';
import { JobsBoard } from './C86-approval-queue';
import { usePrototype } from '../../prototype/PrototypeContext';
import { screenPath } from '../../prototype/journeys';
import { MobileShell } from '../../shells/MobileShell';
import { Banner } from '../../../components/Banner/Banner';
import { ConsoleBreadcrumb } from '../../../components/ConsoleBreadcrumb/ConsoleBreadcrumb';
import { Icon, type IconName } from '../../../components/Icon/Icon';
import { PageBackButton } from '../../shells/SetupFlow';
import { UnitDetail } from './_unit-detail';
import { PageTabs, type PageTab } from './_page-tabs';
import { NoticesList, useNotices, useVendors, VendorsList } from './_property-alerts-vendors';
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

/** Review change: each unit of a multi-unit building gets its own row under the building, with its tenant and tenancy */
/**
 * Review change: the Status column flags an issue on a property or unit with a short tag led by a coloured dot (amber
 * needs you, red urgent); hover gives the full issue. Units and single-unit buildings show the issue itself; a building
 * with units shows how many of its units have one. No issue, no tag. Matches the Jobs page (invented sample data).
 */
type Issue = { label: string; detail: string; tone: 'warning' | 'danger' | 'info' };
/** Review change: a property (and each of its doors) added on Add property shows a blue New dot */
const NEW_DOOR: Issue = { label: 'New', detail: 'Added today · no issues yet', tone: 'info' };
const ISSUES: Record<string, Issue> = {
  'roosevelt-A': { label: 'Approve', detail: 'Kitchen sink leaking · needs your approval', tone: 'warning' },
  'pima-1': { label: 'Sign off', detail: 'Bathroom faucet drip · confirm the work is done', tone: 'warning' },
  'pima-2': { label: 'Quotes', detail: 'Roof leak over bedroom · 3 quotes to pick from', tone: 'warning' },
  'pima-3': { label: 'Approve', detail: 'Dishwasher won’t drain · needs your approval', tone: 'warning' },
  ninth: { label: 'Urgent', detail: 'Outlet sparks when used · urgent, needs your approval', tone: 'danger' },
  fourth: { label: 'No access', detail: 'Water heater pilot out · the plumber couldn’t get in', tone: 'warning' },
  fairmount: { label: 'Budget', detail: 'Over budget by $8 this month · roof drains overdue', tone: 'danger' },
};
function IssueTag({ issue }: { issue?: Issue }) {
  if (!issue) return null;
  return (
    // Review change: just the coloured dot (no text). A tooltip names the status on hover or keyboard focus (it opens to
    // the right of the dot); screen readers read the same text
    <span className={`hc-c79-issue hc-c79-issue--${issue.tone}`} tabIndex={0} onClick={(e) => e.stopPropagation()}>
      <span className="hc-c79-issue__dot" aria-hidden />
      <span className="hc-c79-sr">
        {issue.label} · {issue.detail}
      </span>
      <span className="hc-c79-tip" aria-hidden>
        <span className="hc-c79-tip__title">{issue.label}</span>
        <span className="hc-c79-tip__detail">{issue.detail}</span>
      </span>
    </span>
  );
}
/** A building with units: how many of its units have an issue (red if any is urgent) */
const buildingIssue = (p: PortfolioProperty): Issue | undefined => {
  if (p.isNew) {
    const n = p.doors?.length ?? (parseInt(p.units, 10) || 1);
    return { ...NEW_DOOR, detail: `Added today · ${n} new ${n === 1 ? 'door' : 'doors'}` };
  }
  const units = unitsOf(p);
  if (!units.length) return ISSUES[p.id];
  const found = units.map((t) => ISSUES[`${p.id}-${t.unit}`]).filter(Boolean) as Issue[];
  if (!found.length) return undefined;
  return { label: `${found.length} ${found.length === 1 ? 'issue' : 'issues'}`, detail: found.map((i) => i.detail).join('\n'), tone: found.some((i) => i.tone === 'danger') ? 'danger' : 'warning' };
};

const unitsOf = (p: PortfolioProperty) => {
  // Review change: with the tenant changes made on unit pages this visit
  const tenants = tenantsOf(p);
  // An added property lists its doors instead (its invited tenants are on those rows)
  if (p.doors) return [];
  const seen = new Map<string, PortfolioProperty['tenants'][number]>();
  for (const t of tenants) if (t.unit !== '—' && !seen.has(t.unit)) seen.set(t.unit, t);
  return seen.size > 1 ? [...seen.values()] : [];
};

/** Spent column cell: "$412 of $500" and a bar of the budget used under it, red with "Over by …" past the budget */
/** Review change: a stat tile's label row with its own Month / Year option, right-aligned (Spent and Occupancy tiles) */
export function PeriodHead({ title, name, period, onChange }: { title: string; name: string; period: Period; onChange: (p: Period) => void }) {
  return (
    <span className="hc-c79-spent-tile__head">
      {title} · {period === 'month' ? 'November' : '2026'}
      <span className="hc-c79-chips hc-c79-chips--head" role="group" aria-label={name}>
        <button type="button" className="hc-c79-chip" aria-pressed={period === 'month'} onClick={() => onChange('month')}>
          <StatusPill label="Month" tone={period === 'month' ? 'info' : 'neutral'} />
        </button>
        <button type="button" className="hc-c79-chip" aria-pressed={period === 'year'} onClick={() => onChange('year')}>
          <StatusPill label="Year" tone={period === 'year' ? 'info' : 'neutral'} />
        </button>
      </span>
    </span>
  );
}

export function SpendCell({ label, spent, budget }: { label: string; spent: number; budget: number }) {
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
 * (the rules now edited in place; the C81 page is removed), and its upcoming maintenance (each task opens its
 * row on the Jobs page). ?saved=rules shows a confirmation after saving Property rules.
 */
function PropertyDetail({ property: p, saved }: { property: Property; saved: string | null }) {
  const { device } = usePrototype();
  const flow = useFlow();
  const back = () => flow.go('C79');
  const details = useDetails(p.id);

  const notice =
    saved === 'rules' ? (
      <Banner tone="success" title="Rules saved">
        {p.short} uses its new approval rules from now on.
      </Banner>
    ) : null;

  const [spentPeriod, setSpentPeriod] = useState<Period>('month');
  const glance = (
    <div className="hc-c79-detail__glance">
      {/* Review change: spent this month and this year share one card with a Month / Year toggle, like the dashboard
          (were two cards); first in the row (review change) */}
      <section className="hc-c79-card hc-c79-detail__spent">
        <p className="hc-small hc-muted">
          <PeriodHead title="Spent" name="Spent period" period={spentPeriod} onChange={setSpentPeriod} />
        </p>
        <SpendCell
          label={`${p.short} ${spentPeriod === 'month' ? 'this month' : 'this year'}`}
          spent={p.spent[spentPeriod]}
          budget={p.budget[spentPeriod]}
        />
      </section>
      <section className="hc-c79-card">
        <p className="hc-small hc-muted">Tenancy</p>
        <StatusPill label={p.tenancy[0]} tone={p.tenancy[1]} />
      </section>
      <section className="hc-c79-card">
        <p className="hc-small hc-muted">Open</p>
        {/* Review change: Nothing open is a neutral badge too (was plain text) */}
        {typeof p.open === 'string' ? <StatusPill label={p.open} tone="neutral" /> : <StatusPill label={p.open[0]} tone={p.open[1]} />}
      </section>
    </div>
  );

  /**
   * Review change: the property's tenants as a table, built like the Doors table on Add property: a Tenants heading,
   * the property's row (its street address and tenancy tag), then one row per tenant (or empty unit) with its unit and
   * tenancy tag. A one-unit home shows no unit name. Added properties list their doors and invited tenants.
   */
  // Review change: a unit's tenant is edited on its own page (View); changes made there are kept for the visit
  const allTenants = useTenants(p);
  /** unitKey: the unit's name, or '—' for a one-unit home (what the dialog and the tenants' unit field use) */
  type TenantRow = { key: string; unit?: string; unitKey: string; tenantId?: string; name: string; windows: string; pill: Property['tenancy'] };
  const tenantRows: TenantRow[] = p.doors
    ? p.doors.map((d) => {
        const unitKey = p.doors!.length > 1 ? d.unit : '—';
        const t = allTenants.filter((x) => x.unit === unitKey).pop();
        return {
          key: d.unit,
          unit: unitKey === '—' ? undefined : unitKey,
          unitKey,
          tenantId: t?.id,
          windows: t?.windows ?? '—',
          name: t?.name ?? (d.tenancy === 'occupied' ? 'No tenant invited' : 'No tenant'),
          pill: t ? [t.status, t.tone] : d.tenancy === 'occupied' ? ['Occupied', 'warning'] : ['Vacant', 'neutral'],
        };
      })
    : allTenants.length
      ? allTenants.map((t) => ({
          key: t.id,
          unit: t.unit === '—' ? undefined : t.unit,
          unitKey: t.unit,
          tenantId: t.id,
          windows: t.windows,
          name: t.name,
          pill: [t.status.replace(/^Moving out .*/, 'Moving out'), t.tone],
        }))
      : [{ key: 'none', unitKey: '—', name: 'No tenant', windows: '—', pill: p.tenancy }];
  const single = tenantRows.length === 1 ? tenantRows[0] : null;
  // Review change: View on every unit opens that unit's page (its tenant form and its jobs); Edit is gone. An empty unit
  // gets View too, where the tenant can be invited.
  const openUnitPage = (unitKey: string) => () => flow.go('C79', `?property=${p.id}&unit=${encodeURIComponent(unitKey)}`);
  const viewButton = (r: TenantRow) => (
    <button type="button" className="hc-c79-tenants__edit" onClick={() => flow.go('C79', `?property=${p.id}&unit=${encodeURIComponent(r.unitKey)}`)} aria-label={`View ${r.unit ? `Unit ${r.unit}` : p.short}`}>
      <StatusPill label="View" tone="neutral" />
    </button>
  );
  const tenantsTable = (
    <section className="hc-c79-tenants" aria-label="Tenants">
      {/* Review change: no "Tenants" heading; the tab names it */}
      <div className="hc-c79-tenants__table" role="table" aria-label="Tenants">
        <div className="hc-c79-tenants__row hc-c79-tenants__row--head" role="row">
          <span role="columnheader">Property</span>
          {/* Review change: an Access windows column (when pros can come in) */}
          <span role="columnheader">Access windows</span>
          <span role="columnheader">Tenancy</span>
        </div>
        {/* Review change: with only one tenant (or one empty unit) there's no row under the address: the tenant's name
            and its View sit at the end of the address row */}
        <div className={single ? "hc-c79-tenants__row hc-c79-tenants__row--link" : "hc-c79-tenants__row"} role="row" tabIndex={single ? 0 : undefined} onClick={single ? openUnitPage(single.unitKey) : undefined} onKeyDown={single ? (e) => e.key === 'Enter' && openUnitPage(single.unitKey)() : undefined}>
          <span role="cell" className="hc-c79-tenants__address">
            {p.short}
            {single && (
              <>
                <span className="hc-c79-tenants__unit-tenant">· {single.name}</span>
                {viewButton(single)}
              </>
            )}
          </span>
          <span role="cell" className="hc-c79-tenants__windows">
            {single ? single.windows : ''}
          </span>
          <span role="cell">
            <StatusPill label={single ? single.pill[0] : p.tenancy[0]} tone={single ? single.pill[1] : p.tenancy[1]} />
          </span>
        </div>
        {(single ? [] : tenantRows).map((r) => (
          // Review change: the whole row opens the unit's page (as does View)
          <div key={r.key} className="hc-c79-tenants__row hc-c79-tenants__row--unit hc-c79-tenants__row--link" role="row" tabIndex={0} onClick={openUnitPage(r.unitKey)} onKeyDown={(e) => e.key === 'Enter' && openUnitPage(r.unitKey)()}>
            <span role="cell" className="hc-c79-tenants__unit">
              {r.unit && <span className="hc-c79-tenants__unit-name">Unit {r.unit}</span>}
              <span className="hc-c79-tenants__unit-tenant">{r.name}</span>
              {viewButton(r)}
            </span>
            <span role="cell" className="hc-c79-tenants__windows">
              {r.windows}
            </span>
            <span role="cell">
              <StatusPill label={r.pill[0]} tone={r.pill[1]} />
            </span>
          </div>
        ))}
      </div>
    </section>
  );

  /**
   * Review change: Remove property at the bottom of the Details tab, on the right (was at the very bottom of the
   * page), after a confirmation dialog: it comes off the
   * Portfolio (kept for the visit) and you're taken back there with a confirmation. Prototype only.
   */
  const [removing, setRemoving] = useState(false);
  const doorCount = p.doors ? p.doors.length : parseInt(p.units, 10) || 1;
  const removeArea = (
    <div className="hc-c79-remove">
      <Button variant="destructive" onClick={() => setRemoving(true)}>
        Remove property
      </Button>
      {removing && (
        <FormDialog
          title={`Remove ${p.short}?`}
          description={`It comes off your portfolio. Its tenants lose access to HouseCue for this home (they’re told by email), open jobs are cancelled, and your Portfolio bill drops by ${doorCount} ${doorCount === 1 ? 'door' : 'doors'} from Dec 1. Its history is kept for 90 days.`}
          fields={[]}
          values={{}}
          submitLabel="Remove property"
          submitVariant="destructive"
          countsAsEdit={false}
          onSave={() => {
            removeProperty(p.id);
            setRemoving(false);
            flow.go('C79', `?removed=${encodeURIComponent(p.short)}`);
          }}
          onCancel={() => setRemoving(false)}
        />
      )}
    </div>
  );

  // Review change: Rules and Details are tabs now (were collapsible cards with Show / Hide)
  const rulesContent = (
    <section className="hc-c79-card hc-c79-tabcard">
      <p className="hc-small hc-muted">Inherits your portfolio defaults; changes here apply to {p.short} only.</p>
      <PropertyRulesPanel key={p.id} property={p} />
    </section>
  );
  const detailsContent = (
    <section className="hc-c79-card hc-c79-tabcard">
      <PropertyDetailsEditor value={details} onChange={(next) => setDetails(p.id, next)} address={p.short} inCard />
      {removeArea}
    </section>
  );

  // Review change: no Plan & billing card here any more (the plan is set on Account › Billing)

  /**
   * Review change: "Jobs" (was Upcoming maintenance, planned tasks only): every job on the Jobs page for this property,
   * grouped like the Jobs page (Awaiting Approval, Active, Upcoming Maintenance, Recently Closed), each with its unit,
   * "when" line and status; a row opens that job on the Jobs page
   */
  const jobs = portfolioJobs().filter((j) => p.address.startsWith(jobPlace(j.property).street));
  const maintenance = (
    <section className="hc-c79-card hc-c79-jobs" aria-label="Jobs">
      {/* Review change: no "Jobs" heading (the tab names it) and no Open Jobs button (the jobs work in place) */}
      {jobs.length && device !== 'mobile' ? (
        // Review change: on the web, the Jobs page's own sections and rows for this property, working the same (open a
        // job, its actions and dialogs, conversations) without leaving the page
        <JobsBoard
          embedded
          match={(prop) => p.address.startsWith(jobPlace(prop).street)}
          // Review change: the Unit column shows "Unit A" (the address is the page's); a job for the whole building or a
          // one-unit home says so
          placeLabel={{ header: 'Unit', cell: (prop) => (jobPlace(prop).unit ? `Unit ${jobPlace(prop).unit}` : (parseInt(p.units, 10) || 1) > 1 ? 'All units' : 'Whole home') }}
        />
      ) : jobs.length ? (
        SECTIONS.map((sec) => {
          const rows = jobs.filter((j) => STAGES[j.stage].section === sec.id).sort((a, b) => STAGES[a.stage].order - STAGES[b.stage].order);
          if (!rows.length) return null;
          return (
            <div key={sec.id} className="hc-c79-jobs__group">
              {/* Review change: the same table and rows as the Jobs page (Property, Job tag, Status, When, conversation);
                  a row opens that job on the Jobs page */}
              <div className="hc-c86-table" role="table" aria-label={sec.title}>
                <div className="hc-c86-table__row hc-c86-table__row--head" role="row">
                  <span role="columnheader">Property</span>
                  <span role="columnheader">Job</span>
                  <span role="columnheader">Status</span>
                  <span role="columnheader">When</span>
                  <span role="columnheader" aria-label="Conversation" />
                </div>
                {rows.map((j) => (
                  <div
                    key={j.id}
                    role="row"
                    tabIndex={0}
                    className="hc-c86-table__row hc-c86-table__row--link"
                    onClick={() => flow.go('C86', `?job=${j.id}`)}
                    onKeyDown={(e) => {
                      if (e.target !== e.currentTarget || (e.key !== 'Enter' && e.key !== ' ')) return;
                      e.preventDefault();
                      flow.go('C86', `?job=${j.id}`);
                    }}
                  >
                    <span role="cell">{j.property}</span>
                    <span role="cell" className="hc-c86-table__job">
                      <span title={j.tag.title}>
                        <StatusPill label={j.title} tone={j.tag.tone} />
                      </span>
                    </span>
                    <span role="cell">
                      <StatusPill label={STAGES[j.stage].label} tone={STAGES[j.stage].tone} />
                    </span>
                    <span role="cell" className="hc-c86-table__when">
                      {j.when}
                    </span>
                    <span role="cell" className="hc-c86-table__chat-cell">
                      {j.hasThread && (
                        <Button
                          size="tiny"
                          variant="secondary"
                          icon="chat"
                          className="hc-c86-table__chat"
                          aria-label="View conversation"
                          title="View conversation"
                          onClick={(e) => {
                            e.stopPropagation();
                            flow.go('C86', `?job=${j.id}`);
                          }}
                        />
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <p className="hc-medium hc-muted">No jobs at {p.short} right now.</p>
      )}
    </section>
  );

  /**
   * Review change: the sections are tabs in a row under the dashboard cards: Tenants, Jobs, Rules, Details, Lifecycle
   * Notices and Vendors & Contractors. Only the chosen one shows (with a short fade); it's kept in the address (?tab=)
   * so a reload, or coming back from a unit or a job, opens the same tab. Arrow keys move between tabs.
   */
  const notices = useNotices(p);
  const vendors = useVendors(p);
  const people = allTenants.filter((t) => t.name !== 'No tenant').length;
  /**
   * Review change: a home with no units (one door) shows its tenant's form right in the first tab, filled in (name,
   * email, phone, access windows, move-in date, Save; Send invite when empty; Resend / Revoke for a pending invite),
   * instead of a table and a separate unit page. Saves are kept for the visit like a unit page's.
   */
  const oneDoor = (p.doors ? p.doors.length : parseInt(p.units, 10) || 1) === 1;
  const soleTenant = allTenants.find((t) => t.name !== 'No tenant');
  const [tenantSaved, setTenantSaved] = useState<{ title: string; body: string } | null>(null);
  const oneTenantCard = (
    <section className="hc-c79-card hc-c79-unit__tenant hc-c79-tabcard" aria-label="Tenant">
      {tenantSaved && (
        <Banner tone="success" title={tenantSaved.title}>
          {tenantSaved.body}
        </Banner>
      )}
      {!soleTenant && <p className="hc-medium hc-muted">No one lives at {p.short} right now. Invite the tenant so they can report issues and set access windows.</p>}
      <TenantAccessForm
        key={soleTenant?.id ?? 'new'}
        property={p}
        unit="—"
        tenant={soleTenant}
        onSave={(t, isNew) => {
          saveTenant(p, t, isNew);
          setTenantSaved(isNew ? { title: `Invite sent to ${t.name}`, body: `We emailed ${t.email}.` } : { title: `Saved ${t.name}’s details`, body: `Access windows: ${t.windows}.` });
        }}
        onRevoke={(id) => {
          revokeTenant(p, id);
          setTenantSaved(null);
        }}
      />
    </section>
  );
  const TABS: PageTab[] = [
    // Review change: a one-door home has one Tenant tab with the tenant form showing (like a unit page's)
    oneDoor ? { id: 'tenant', label: 'Tenant', content: oneTenantCard } : { id: 'tenants', label: 'Tenants', count: people, content: tenantsTable },
    { id: 'jobs', label: 'Jobs', count: jobs.length, content: maintenance },
    { id: 'notices', label: 'Lifecycle Notices', count: notices.length, content: <section className="hc-c79-card hc-c79-tabcard"><NoticesList property={p} /></section> },
    { id: 'vendors', label: 'Vendors & Contractors', count: vendors.length, content: <section className="hc-c79-card hc-c79-tabcard"><VendorsList property={p} /></section> },
    // Review change: Details second to last, Rules last
    { id: 'details', label: 'Details', content: detailsContent },
    { id: 'rules', label: 'Rules', content: rulesContent },
  ];
  const tabsEl = <PageTabs tabs={TABS} label={`${p.short} sections`} />;


  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: p.short, onBack: back }} role="landlord" tab="portfolio" background="page">
        <p className="hc-medium hc-muted">
          {p.city} · {p.mobileMeta}
        </p>
        {notice}
        {glance}
        {/* Review change: the sections as tabs under the dashboard cards */}
        {tabsEl}
      </MobileShell>
    );
  }

  return (
    <WebShell role="landlord" nav="portfolio">
      <div className="hc-c79-web hc-c79-detail">
        {/* Review change: a Back to portfolio button at the top, like Add property */}
        <PageBackButton label="Back to portfolio" onClick={back} />
        <header className="hc-c79-web__head">
          <div className="hc-c79-web__title">
            <ConsoleBreadcrumb homeTo={screenPath('C79')} homeLabel="Portfolio" parent="Portfolio" onParentClick={back} current={p.short} />
            <h1 className="hc-h2">{p.address}</h1>
            <p className="hc-medium hc-muted">{p.mobileMeta}</p>
          </div>
        </header>
        {notice}
        {glance}
        {/* Review change: the sections as tabs under the dashboard cards */}
        {tabsEl}
      </div>
      <AgentFab size="extended" to={screenPath('C09')} className="hc-c79-fab" />
    </WebShell>
  );
}

/** C79 Portfolio dashboard — Figma mobile 272:31993, web 272:32756; states 262:2940/3021/3106 (mobile), 262:3196/3402/3620 (web) */
export default function PortfolioDashboard(_: ScreenProps) {
  const [params] = useSearchParams();
  const propertyId = params.get('property');
  // Review change: ?property=<id>&unit=<unit> is one unit's page (View on a tenant)
  const unit = params.get('unit');
  // Review change: a one-door home has no unit page; its tenant is on the property page's Tenant tab
  if (propertyId && unit && unit !== '—') return <UnitDetail key={`${propertyId}-${unit}`} property={findProperty(propertyId)} unit={unit} />;
  // Review change: ?property=<id> is that property's detail page
  if (propertyId) return <PropertyDetail key={propertyId} property={findProperty(propertyId)} saved={params.get('saved')} />;
  return <Dashboard />;
}

function Dashboard() {
  const company = useCompanyName();
  const { device, screenState } = usePrototype();
  const flow = useFlow();
  const [period, setPeriod] = useState<Period>('month');
  // Review change: the Spent tile has its own Month / Year option (this month, or the year to date)
  const [spentPeriod, setSpentPeriod] = useState<Period>('month');
  const [occupancyPeriod, setOccupancyPeriod] = useState<Period>('month');
  // Review change: the portfolio's five, then any added on Add property this visit (no New badge); header counts and the
  // total include them, and ?added=<n> confirms what was just added
  const added = useAddedProperties();
  // Review change: properties removed this visit are left out
  const properties = withoutRemoved([...portfolioProperties, ...added]);
  const doors = properties.reduce((t, p) => t + (parseInt(p.units, 10) || 0), 0);
  const [params] = useSearchParams();
  const justAdded = Number(params.get('added') ?? -1);
  const justRemoved = params.get('removed');
  const addedNote = justRemoved ? (
      <Banner tone="success" title={`Removed ${justRemoved} from your portfolio`}>
        Its tenants have been told, and your Portfolio bill updates from Dec 1.
      </Banner>
    ) :
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
  // Review change: a unit row opens that unit's page (its tenant and jobs), not the property's
  const openUnit = (p: Property, unit: string) => () => flow.go('C79', `?property=${p.id}&unit=${encodeURIComponent(unit)}`);

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
          <StatTile label="Active" value="6" meta="2 urgent" />
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
              {company} · {properties.length} properties · {doors} doors
            </p>
          </div>
          {/* Review change: Add property moved down to the Properties heading */}
          <Button onClick={() => flow.go('C86')}>Review approvals (3)</Button>
        </header>
        {addedNote}
        {/* Review change: Spent and Occupancy on the top row, the jobs tiles on the bottom row */}
        <div className="hc-c79-web__stats hc-c79-web__stats--two">
          <StatTile
            label={<PeriodHead title="Spent" name="Spent period" period={spentPeriod} onChange={setSpentPeriod} />}
            value={usd(sum(properties, spentPeriod, 'spent'))}
            meta={
              spentPeriod === 'month'
                ? `Of ${usd(sum(properties, 'month', 'budget'))} budget · year to date ${usd(sum(properties, 'year', 'spent'))}`
                : `Of ${usd(sum(properties, 'year', 'budget'))} budget · January to November`
            }
          />
          {/* Review change: Occupancy in the Spent tile's format: Month / Year option, a headline figure, then the detail */}
          <StatTile
            label={<PeriodHead title="Occupancy" name="Occupancy period" period={occupancyPeriod} onChange={setOccupancyPeriod} />}
            value={occupancyPeriod === 'month' ? '78%' : '91%'}
            meta={occupancyPeriod === 'month' ? 'Of 9 doors · 7 occupied, 2 vacant' : 'Of 9 doors on average · January to November'}
          />
        </div>
        <div className="hc-c79-web__stats">
          <StatTile label="Active" value="6" meta="2 urgent" />
          <StatTile label="Awaiting approval" value="3" meta="Oldest 26 h · C86" />
          <StatTile label="Upcoming maintenance" value="4" meta="Next 30 days" />
        </div>
        {/* Review change: the display-only filter tags (All properties, Status: any, Category: any, Last 30 days) are
            removed; they didn't filter anything */}
        <div className="hc-c79-web__cols hc-c79-web__cols--full">
          <div className="hc-c79-web__main">
            {/* Review change: Properties and Spent by property are one card. Month / Year switches the Spent column and
                the total. */}
            <div className="hc-c79-section-head">
              <h2 className="hc-large-bold">Properties</h2>
              {/* Review change: the Month / Year toggle moved into the table's heading row, after Spent of budget */}
              {/* Review change: the (disabled) Search link that sat after Year is removed */}
            </div>
            {stateList(4) ?? (
              <div className="hc-c79-table" role="table" aria-label="Properties">
                <div className="hc-c79-table__row hc-c79-table__row--head" role="row">
                  <span role="columnheader">Property</span>
                  <span role="columnheader">Tenancy</span>
                  {/* Review change: no Open column (what's open is on the Jobs page); Status flags an issue */}
                  <span role="columnheader">Status</span>
                  <span role="columnheader" className="hc-c79-table__spent-head">
                    {period === 'month' ? 'Spent of budget · Nov' : 'Spent of budget · 2026'}
                    <span className="hc-c79-chips hc-c79-chips--head" role="group" aria-label="Spent period">
                      <button type="button" className="hc-c79-chip" aria-pressed={period === 'month'} onClick={() => setPeriod('month')}>
                        <StatusPill label="Month" tone={period === 'month' ? 'info' : 'neutral'} />
                      </button>
                      <button type="button" className="hc-c79-chip" aria-pressed={period === 'year'} onClick={() => setPeriod('year')}>
                        <StatusPill label="Year" tone={period === 'year' ? 'info' : 'neutral'} />
                      </button>
                    </span>
                  </span>
                </div>
                {properties.map((p) => (
                  <Fragment key={p.address}>
                  <div className="hc-c79-table__row hc-c79-table__row--link" role="row" tabIndex={0} onClick={openProperty(p)} onKeyDown={(e) => e.key === 'Enter' && openProperty(p)()}>
                    <span role="cell" className="hc-c79-table__address">
                      {p.address}
                    </span>
                    <span role="cell">
                      <StatusPill label={p.tenancy[0]} tone={p.tenancy[1]} />
                    </span>
                    <span role="cell">
                      <IssueTag issue={buildingIssue(p)} />
                    </span>
                    <span role="cell">
                      <SpendCell label={p.short} spent={p.spent[period]} budget={p.budget[period]} />
                    </span>
                  </div>
                  {/* Review change: one row per unit under a multi-unit building (tenant and tenancy) */}
                  {unitsOf(p).map((t) => {
                    return (
                      <div key={`${p.id}-${t.unit}`} className="hc-c79-table__row hc-c79-table__row--link hc-c79-table__row--unit" role="row" tabIndex={0} onClick={openUnit(p, t.unit)} onKeyDown={(e) => e.key === 'Enter' && openUnit(p, t.unit)()}>
                        <span role="cell" className="hc-c79-table__unit">
                          <span className="hc-c79-table__unit-name">Unit {t.unit}</span>
                          <span className="hc-c79-table__unit-tenant">{t.name === 'No tenant' ? 'No tenant' : t.name}</span>
                        </span>
                        <span role="cell">
                          {/* the Tenancy column fits short tags; "Moving out Nov 30" shows as "Moving out" (the date is on the property page) */}
                          <StatusPill label={t.status.replace(/^Moving out .*/, 'Moving out')} tone={t.tone} />
                        </span>
                        <span role="cell">
                          <IssueTag issue={ISSUES[`${p.id}-${t.unit}`]} />
                        </span>
                        <span role="cell" />
                      </div>
                    );
                  })}
                  {/* Review change: an added property's doors, one row each (unit, tenancy, a New dot); one door shows as the property row */}
                  {(p.doors && p.doors.length > 1 ? p.doors : []).map((d) => (
                    <div key={`${p.id}-${d.unit}`} className="hc-c79-table__row hc-c79-table__row--link hc-c79-table__row--unit" role="row" tabIndex={0} onClick={openUnit(p, d.unit)} onKeyDown={(e) => e.key === 'Enter' && openUnit(p, d.unit)()}>
                      <span role="cell" className="hc-c79-table__unit">
                        <span className="hc-c79-table__unit-name">Unit {d.unit}</span>
                        <span className="hc-c79-table__unit-tenant">{d.tenant ?? (d.tenancy === 'occupied' ? 'No tenant invited' : 'No tenant')}</span>
                      </span>
                      <span role="cell">
                        <StatusPill label={d.tenant ? 'Invite pending' : d.tenancy === 'occupied' ? 'Occupied' : 'Vacant'} tone={d.tenancy === 'occupied' ? 'warning' : 'neutral'} />
                      </span>
                      <span role="cell">
                        <IssueTag issue={NEW_DOOR} />
                      </span>
                      <span role="cell" />
                    </div>
                  ))}
                  </Fragment>
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
          {/* Review change: the Upcoming maintenance card moved to the Jobs page (its Upcoming Maintenance section, as job
              rows), so the Properties table uses the full width */}
        </div>
      </div>
      <AgentFab size="extended" to={screenPath('C09')} className="hc-c79-fab" />
    </WebShell>
  );
}
