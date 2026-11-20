import { Fragment } from 'react';
import { StatusPill, type StatusTone } from '../../../components/StatusPill/StatusPill';
import type { PortfolioProperty } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { useDetails, useTenants } from '../../prototype/portfolio';
import { jobPlace, OTHER_JOBS, portfolioJobs, reports } from './_jobs';
import { KNOWN_VENDORS } from './_known-vendor-dialog';
import './_property-alerts-vendors.css';

const usd = (n: number) => `$${n.toLocaleString('en-US')}`;

/** unit: the unit it's about ('A', '—' for a one-unit home), none for the whole property (budget) */
type Alert = { id: string; tone: StatusTone; level: string; title: string; detail: string; unit?: string; action?: { label: string; onClick: () => void } };

/**
 * Review change: a property page's Lifecycle Notices (was Alerts; now a tab): what needs attention at this property, worst first. From its jobs (approval
 * needed, quotes ready, work to sign off, a pro who couldn't get in, overdue maintenance, a frozen payment), its budget
 * (spent more than budgeted this month) and its tenants (moving out, invite not accepted, a vacant unit). Each says
 * what's up and offers the next step (open the job on Jobs, or the unit's page). Invented sample data.
 */
/** Review change: with `unit`, only that unit's notices (a unit's page) */
export function useNotices(p: PortfolioProperty, unit?: string): Alert[] {
  const flow = useFlow();
  const tenants = useTenants(p);
  const openJob = (id: string) => () => flow.go('C86', `?job=${id}`);
  // A one-door home's tenant is on its property page (Tenant tab)
  const openUnit = (unit: string) => () => flow.go('C79', unit === '—' ? `?property=${p.id}&tab=tenant` : `?property=${p.id}&unit=${encodeURIComponent(unit)}`);
  const unitOf = (prop: string) => jobPlace(prop).unit;
  const where = (prop: string) => (unitOf(prop) ? `Unit ${unitOf(prop)} · ` : '');

  const alerts: Alert[] = [];
  for (const j of portfolioJobs().filter((x) => p.address.startsWith(jobPlace(x.property).street))) {
    const job = (level: string, tone: StatusTone, detail: string, label = 'Open job') =>
      alerts.push({ id: j.id, tone, level, title: j.title, detail: `${where(j.property)}${detail}`, unit: unitOf(j.property) || '—', action: { label, onClick: openJob(j.id) } });
    if (j.stage === 'approval') job(j.tag.tone === 'danger' ? 'Urgent' : 'Needs you', j.tag.tone === 'danger' ? 'danger' : 'warning', `Needs your approval · waiting ${j.when}`, 'Review');
    else if (j.stage === 'quotes-ready') job('Needs you', 'warning', 'Quotes are in · pick one to book');
    else if (j.stage === 'sign-off') job('Needs you', 'warning', 'Work is done · sign off to release the payment');
    else if (j.stage === 'needs-access') job('Needs you', 'warning', 'The pro couldn’t get in · reschedule the visit');
    else if (j.stage === 'overdue') job('Overdue', 'danger', `Planned maintenance · ${j.when.toLowerCase()}`);
    else if (j.stage === 'disputed') job('Heads up', 'info', 'Payment frozen while the dispute is open');
  }
  const over = p.spent.month - p.budget.month;
  if (over > 0) alerts.push({ id: 'budget', tone: 'danger', level: 'Budget', title: `Over budget by ${usd(over)} this month`, detail: `${usd(p.spent.month)} spent of ${usd(p.budget.month)} in November` });
  for (const t of tenants) {
    const unit = t.unit === '—' ? '' : `Unit ${t.unit} · `;
    if (/^Moving out/.test(t.status))
      alerts.push({ id: `move-${t.id}`, unit: t.unit, tone: 'info', level: 'Heads up', title: `${t.name} is moving out`, detail: `${unit}${t.status.replace(/^Moving out/, 'Leaving')} · plan the turnover`, action: { label: t.unit === '—' ? 'View tenant' : 'View unit', onClick: openUnit(t.unit) } });
    else if (t.status === 'Invite pending')
      alerts.push({ id: `invite-${t.id}`, unit: t.unit, tone: 'info', level: 'Heads up', title: `${t.name} hasn’t joined yet`, detail: `${unit}Invite ${t.since.replace(/^Sent/, 'sent')} · resend it from ${t.unit === '—' ? 'the Tenant tab' : 'the unit'}`, action: { label: t.unit === '—' ? 'View tenant' : 'View unit', onClick: openUnit(t.unit) } });
    else if (t.status === 'Vacant')
      alerts.push({ id: `vacant-${t.id}`, unit: t.unit, tone: 'neutral', level: 'Vacant', title: `${t.unit === '—' ? 'The home' : `Unit ${t.unit}`} is empty`, detail: `${t.since} · invite the next tenant when it’s ready`, action: { label: t.unit === '—' ? 'View tenant' : 'View unit', onClick: openUnit(t.unit) } });
  }
  const rank: Record<StatusTone, number> = { danger: 0, warning: 1, info: 2, neutral: 3, success: 4 };
  alerts.sort((a, b) => rank[a.tone] - rank[b.tone]);
  if (unit !== undefined && unit !== '—') return alerts.filter((a) => a.unit === unit);

  return alerts;
}

/** Review change: the Lifecycle Notices tab's content on a property's page */
export function NoticesList({ property: p, unit }: { property: PortfolioProperty; unit?: string }) {
  const alerts = useNotices(p, unit);
  return (
    <div className="hc-pav">
      {alerts.length === 0 ? (
        <p className="hc-medium hc-muted">No notices. Everything at {p.short} is on track.</p>
      ) : (
        // Review change: a table with a header row, like the Tenants and Jobs tabs
        <div className="hc-pav__table" role="table" aria-label="Lifecycle notices">
          <div className="hc-pav__row hc-pav__row--notice hc-pav__row--head" role="row">
            <span role="columnheader">Level</span>
            <span role="columnheader">Notice</span>
            <span role="columnheader">Next step</span>
          </div>
          {alerts.map((a) => (
            <div key={a.id} className="hc-pav__row hc-pav__row--notice" role="row">
              <span role="cell">
                <StatusPill label={a.level} tone={a.tone} />
              </span>
              <span role="cell" className="hc-pav__text">
                <span className="hc-medium-semibold">{a.title}</span>
                <span className="hc-small hc-muted">{a.detail}</span>
              </span>
              <span role="cell">
                {a.action && (
                  <button type="button" className="hc-pav__action" onClick={a.action.onClick}>
                    <StatusPill label={a.action.label} tone="neutral" />
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Trades and phones for the pros in the sample jobs (invented) */
const PRO_INFO: Record<string, { trade: string; rating?: number; phone: string }> = {
  'Sonoran Plumbing Co.': { trade: 'Plumbing', rating: 4.8, phone: '(602) 555-0118' },
  'Roadrunner Rooter': { trade: 'Plumbing', rating: 4.6, phone: '(602) 555-0163' },
  'Camelback Electric': { trade: 'Electrical', rating: 4.9, phone: '(602) 555-0177' },
  'Mesa Spark Electrical': { trade: 'Electrical', rating: 4.5, phone: '(480) 555-0129' },
  'Saguaro Appliance Repair': { trade: 'Appliances', rating: 4.7, phone: '(520) 555-0145' },
  'Valley Fix-It': { trade: 'Handyman', rating: 4.4, phone: '(602) 555-0190' },
  'Bluequail Air': { trade: 'HVAC', rating: 4.8, phone: '(602) 555-0152' },
  'Desert Roof Co.': { trade: 'Roofing', rating: 4.8, phone: '(520) 555-0104' },
  'Desert Air Co.': { trade: 'HVAC', rating: 4.6, phone: '(602) 555-0136' },
};

type VendorRow = { name: string; trade: string; rating?: number; phone: string; note: string; group: 'worked' | 'usual' };

/**
 * Review change: a property page's Vendors & Contractors (now a tab): the pros who've worked here (from its jobs and the vendors
 * saved in Property details), with their trade, rating, phone and what they did here, then your usual pros for the
 * kinds of jobs open here (from the known-vendor list) that haven't been here yet. Invented sample data.
 */
/** Review change: with `unit`, only that unit's jobs and the vendors saved in its own Details (a unit's page) */
export function useVendors(p: PortfolioProperty, unit?: string): VendorRow[] {
  const details = useDetails(unit ? `${p.id}:${unit}` : p.id);
  const here = (prop: string) => p.address.startsWith(jobPlace(prop).street) && (!unit || unit === '—' || jobPlace(prop).unit === unit);
  const rows = new Map<string, VendorRow>();
  for (const j of OTHER_JOBS.filter((x) => here(x.property))) {
    const pro = j.facts.find(([label]) => label === 'Pro')?.[1];
    if (!pro || rows.has(pro)) continue;
    const info = PRO_INFO[pro];
    rows.set(pro, { name: pro, trade: info?.trade ?? 'Contractor', rating: info?.rating, phone: info?.phone ?? '—', note: `${j.title} · ${j.when}`, group: 'worked' });
  }
  for (const v of details.vendors.filter((x) => x.name.trim())) {
    if (rows.has(v.name)) continue;
    const info = PRO_INFO[v.name];
    rows.set(v.name, { name: v.name, trade: v.trade || info?.trade || 'Contractor', rating: info?.rating, phone: v.phone || info?.phone || '—', note: 'From Property details', group: 'worked' });
  }
  // Your usual pros for the trades of this property's open tenant reports
  const trades = [...new Set(reports.filter((r) => here(r.property)).map((r) => r.trade))];
  for (const trade of trades) {
    for (const v of KNOWN_VENDORS[trade]) {
      if (rows.has(v.name)) continue;
      rows.set(v.name, { name: v.name, trade, rating: v.rating, phone: PRO_INFO[v.name]?.phone ?? '—', note: `${v.jobs} ${v.jobs === 1 ? 'job' : 'jobs'} for you · usually ${v.usual}`, group: 'usual' });
    }
  }
  return [...rows.values()];
}

/** Review change: the Vendors & Contractors tab's content on a property's page */
export function VendorsList({ property: p, unit }: { property: PortfolioProperty; unit?: string }) {
  const list = useVendors(p, unit);
  const groups: { id: VendorRow['group']; title: string }[] = [
    { id: 'worked', title: 'Worked here' },
    { id: 'usual', title: 'Your usual pros for jobs open here' },
  ];
  return (
    <div className="hc-pav">
      {list.length === 0 ? (
        <p className="hc-medium hc-muted">No pros have worked at {p.short} yet. Vendors you add in Property details show here.</p>
      ) : (
        // Review change: one table with a header row; each group is a tinted row inside it
        <div className="hc-pav__table" role="table" aria-label="Vendors and contractors">
          <div className="hc-pav__row hc-pav__row--vendor hc-pav__row--head" role="row">
            <span role="columnheader">Vendor</span>
            <span role="columnheader">Trade</span>
            <span role="columnheader">Rating</span>
            <span role="columnheader">Phone</span>
          </div>
          {groups.map((g) => {
            const items = list.filter((v) => v.group === g.id);
            if (!items.length) return null;
            return (
              <Fragment key={g.id}>
                <div className="hc-pav__row hc-pav__row--group" role="row">
                  <span role="cell" className="hc-small hc-muted">
                    {g.title}
                  </span>
                </div>
                {items.map((v) => (
                  <div key={v.name} className="hc-pav__row hc-pav__row--vendor" role="row">
                    <span role="cell" className="hc-pav__text">
                      <span className="hc-medium-semibold">{v.name}</span>
                      <span className="hc-small hc-muted">{v.note}</span>
                    </span>
                    <span role="cell">
                      <StatusPill label={v.trade} tone="neutral" />
                    </span>
                    <span role="cell" className="hc-small hc-pav__meta">
                      {v.rating ? `★ ${v.rating}` : '—'}
                    </span>
                    <span role="cell" className="hc-small hc-pav__meta">
                      {v.phone}
                    </span>
                  </div>
                ))}
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
