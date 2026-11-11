import { useState } from 'react';
import { AgentFab } from '../../../components/AgentFab/AgentFab';
import { Button } from '../../../components/Button/Button';
import { ListRow } from '../../../components/ListRow/ListRow';
import { MetricRow } from '../../../components/MetricRow/MetricRow';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';
import { StatTile } from '../../../components/StatTile/StatTile';
import { StateBlock } from '../../../components/StateBlock/StateBlock';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { TaskRow } from '../../../components/TaskRow/TaskRow';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { screenPath } from '../../prototype/journeys';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C79-portfolio-dashboard.css';

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

/** Mesa Verde Holdings rentals (Figma C79 web table 262:2724) */
const properties: {
  address: string;
  short: string;
  mobileMeta: string;
  doors: string;
  tenancy: [string, Tone];
  open: [string, Tone] | string;
  spend: string;
  allClear?: boolean;
}[] = [
  {
    address: '1418 E Roosevelt St, Phoenix',
    short: '1418 E Roosevelt St',
    mobileMeta: '2 units · 2 tenants · 2 open',
    doors: '2',
    tenancy: ['2 active', 'success'],
    open: ['1 awaiting you', 'warning'],
    spend: '$412',
  },
  {
    address: '5602 E Pima St, Tucson',
    short: '5602 E Pima St',
    mobileMeta: '4 units · 3 tenants · 1 vacant',
    doors: '4',
    tenancy: ['3 active', 'success'],
    open: ['1 scheduled', 'info'],
    spend: '$368',
  },
  {
    address: '2207 N 9th Ave, Phoenix',
    short: '2207 N 9th Ave',
    mobileMeta: '1 unit · Priya H. · 1 open',
    doors: '1',
    tenancy: ['Active', 'success'],
    open: ['1 awaiting you', 'warning'],
    spend: '$96',
  },
  {
    address: '812 S 4th Ave, Tucson',
    short: '812 S 4th Ave',
    mobileMeta: '1 unit · Jonah W. · nothing open',
    doors: '1',
    tenancy: ['Invite pending', 'warning'],
    open: 'Nothing open',
    spend: '$0',
    allClear: true,
  },
  {
    address: '3315 E Fairmount Ave, Phoenix',
    short: '3315 E Fairmount Ave',
    mobileMeta: 'Vacant · turnover 2 of 5 done',
    doors: '1',
    tenancy: ['Vacant · turnover', 'neutral'],
    open: ['2 make-ready', 'info'],
    spend: '$308',
  },
];

const spendRows = [
  { label: '1418 E Roosevelt St', month: '$412', year: '$3,210' },
  { label: '5602 E Pima St', month: '$368', year: '$2,940' },
  { label: '3315 E Fairmount Ave', month: '$308', year: '$2,180' },
  { label: '2207 N 9th Ave', month: '$96', year: '$1,090' },
];

const filters = ['All properties', 'Status: any', 'Category: any', 'Last 30 days'];

/** C79 Portfolio dashboard — Figma mobile 272:31993, web 272:32756; states 262:2940/3021/3106 (mobile), 262:3196/3402/3620 (web) */
export default function PortfolioDashboard(_: ScreenProps) {
  const { device, screenState } = usePrototype();
  const flow = useFlow();
  const [period, setPeriod] = useState<'month' | 'year'>('month');

  const addProperty = () => flow.go('C80');
  // Property rows lead to the next journey step (C82 Tenants & access)
  const openProperty = flow.goNext;

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
          onAction={() => undefined}
        />
      );
    }
    return null;
  };

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Portfolio', showBack: false }} role="landlord" tab="portfolio">
        <div className="hc-c79-stats">
          <StatTile label="Open requests" value="6" meta="2 urgent" />
          <StatTile label="Awaiting you" value="3" meta="Oldest 26 h" />
          <StatTile label="Spend · Nov" value="$1,184" meta="9 doors" />
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
              <button key={p.address} type="button" className="hc-c79-row" onClick={openProperty}>
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
            <p className="hc-medium hc-muted">Mesa Verde Holdings · 5 properties · 9 doors · Portfolio plan</p>
          </div>
          <Button variant="secondary" onClick={addProperty}>
            Add property
          </Button>
          <Button onClick={() => flow.go('C86')}>Review approvals (3)</Button>
        </header>
        <div className="hc-c79-web__stats">
          <StatTile label="Open requests" value="6" meta="2 urgent" />
          <StatTile label="Awaiting approval" value="3" meta="Oldest 26 h · C86" />
          <StatTile label="Spend · November" value="$1,184" meta="Year to date $9,420" />
          <StatTile label="Upcoming maintenance" value="4" meta="Next 30 days" />
          <StatTile label="Occupancy" value="7 of 9" meta="2 doors vacant" />
        </div>
        <div className="hc-c79-chips">
          {filters.map((f) => (
            <StatusPill key={f} label={f} tone="neutral" />
          ))}
        </div>
        <div className="hc-c79-web__cols">
          <div className="hc-c79-web__main">
            <div className="hc-c79-section-head">
              <h2 className="hc-large-bold">Properties</h2>
              <button type="button" className="hc-c79-link">
                Search
              </button>
            </div>
            {stateList(4) ?? (
              <div className="hc-c79-table" role="table" aria-label="Properties">
                <div className="hc-c79-table__row hc-c79-table__row--head" role="row">
                  <span role="columnheader">Property</span>
                  <span role="columnheader">Doors</span>
                  <span role="columnheader">Tenancy</span>
                  <span role="columnheader">Open</span>
                  <span role="columnheader">Spend · Nov</span>
                </div>
                {properties.map((p) => (
                  <div key={p.address} className="hc-c79-table__row hc-c79-table__row--link" role="row" tabIndex={0} onClick={openProperty} onKeyDown={(e) => e.key === 'Enter' && openProperty()}>
                    <span role="cell" className="hc-medium-semibold">
                      {p.address}
                    </span>
                    <span role="cell">{p.doors}</span>
                    <span role="cell">
                      <StatusPill label={p.tenancy[0]} tone={p.tenancy[1]} />
                    </span>
                    <span role="cell">{typeof p.open === 'string' ? p.open : <StatusPill label={p.open[0]} tone={p.open[1]} />}</span>
                    <span role="cell">{p.spend}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <aside className="hc-c79-web__side">
            <section className="hc-c79-card">
              <h2 className="hc-large-bold">Spend by property</h2>
              <div className="hc-c79-chips" role="group" aria-label="Period">
                <button type="button" className="hc-c79-chip" aria-pressed={period === 'month'} onClick={() => setPeriod('month')}>
                  <StatusPill label="Month" tone={period === 'month' ? 'info' : 'neutral'} />
                </button>
                <button type="button" className="hc-c79-chip" aria-pressed={period === 'year'} onClick={() => setPeriod('year')}>
                  <StatusPill label="Year" tone={period === 'year' ? 'info' : 'neutral'} />
                </button>
              </div>
              {spendRows.map((r) => (
                <MetricRow key={r.label} label={r.label} value={period === 'month' ? r.month : r.year} />
              ))}
              <MetricRow label="Portfolio total" value={period === 'month' ? '$1,184' : '$9,420'} />
            </section>
            <section className="hc-c79-card">
              <h2 className="hc-large-bold">Upcoming maintenance</h2>
              <TaskRow title="HVAC filter swap · 5602 E Pima (4 units)" meta="Due Nov 18" tag="DIY" onClick={() => flow.go('C11')} />
              <TaskRow title="Smoke alarm test · 2207 N 9th Ave" meta="Due Nov 24" tag="DIY" onClick={() => flow.go('C11')} />
            </section>
          </aside>
        </div>
      </div>
      <AgentFab size="extended" to={screenPath('C09')} className="hc-c79-fab" />
    </WebShell>
  );
}
