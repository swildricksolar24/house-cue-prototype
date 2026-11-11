import { useNavigate } from 'react-router-dom';
import { AgentCard } from '../../../components/AgentCard/AgentCard';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { HomeHeader } from '../../../components/HomeHeader/HomeHeader';
import { ListRow } from '../../../components/ListRow/ListRow';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { stepPath } from '../../prototype/journeys';
import { MobileShell } from '../../shells/MobileShell';
import { utilityPaths } from '../../shells/navPaths';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C84-tenant-home.css';

const requests: { title: string; status: string; tone: 'warning' | 'info' | 'success'; next: string; mobile: string; done?: boolean }[] = [
  {
    title: 'Kitchen sink leaking',
    status: 'Awaiting landlord',
    tone: 'warning',
    next: 'Landlord reviewing · 26 h',
    mobile: 'Awaiting landlord · reported 26 h ago',
  },
  {
    title: 'Bedroom AC not cooling',
    status: 'Scheduled',
    tone: 'info',
    next: 'Thu Nov 13, 8–10 AM · Bluequail Air',
    mobile: 'Scheduled · Thu Nov 13, 8–10 AM · Bluequail Air',
  },
  { title: 'Bathroom fan noisy', status: 'Done', tone: 'success', next: 'Completed Oct 28', mobile: 'Done · Oct 28', done: true },
];

const history = [
  { title: 'Water heater flushed', meta: 'Jun 2026 · Copperwick Pipe Co.' },
  { title: 'HVAC filter replaced', meta: 'Apr 2026 · Bluequail Air Service' },
];

/** C84 Tenant home — Figma mobile 272:34071, web 272:34961 (J1 Tenant step 3) */
export default function TenantHome(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const navigate = useNavigate();

  /** Jump to a later step of this (tenant) journey, so C18/C85 open in their tenant variants */
  const goInJourney = (code: string) => {
    const i = flow.journey.steps.findIndex((s) => s.code === code);
    if (i >= 0) navigate(stepPath(flow.journey.slug, i + 1));
    else flow.go(code);
  };
  const openRequest = () => goInJourney('C18');

  if (device === 'mobile') {
    return (
      <MobileShell
        role="tenant"
        tab="home"
        header={
          <HomeHeader
            address="1418 E Roosevelt St, Unit A"
            emergencyTo={utilityPaths.emergency}
            notificationsTo={utilityPaths.notifications}
            onSwitchHome={() => navigate(utilityPaths.homeSwitcher)}
          />
        }
      >
        <Button size="large" fullWidth onClick={flow.goNext}>
          Report an issue
        </Button>
        <div className="hc-c84-section-head">
          <h2 className="hc-large-bold">My requests</h2>
          <button type="button" className="hc-c84-link" onClick={openRequest}>
            All
          </button>
        </div>
        <div>
          {requests.map((r) => (
            <button key={r.title} type="button" className="hc-c84-row" onClick={openRequest}>
              <ListRow title={r.title} description={r.mobile} icon={r.done ? 'check' : 'schedule'} />
            </button>
          ))}
        </div>
        <h2 className="hc-large-bold">Home history</h2>
        <div>
          {history.map((h) => (
            <ListRow key={h.title} title={h.title} description={h.meta} />
          ))}
        </div>
        <p className="hc-small hc-muted">Prior maintenance only. Earlier tenants’ requests are never shown.</p>
      </MobileShell>
    );
  }

  return (
    <WebShell role="tenant" nav="home">
      <div className="hc-c84-web">
        <header className="hc-c84-web__head">
          <div className="hc-c84-web__title">
            <h1 className="hc-h2">Your home</h1>
            <p className="hc-medium hc-muted">1418 E Roosevelt St, Unit A, Phoenix · managed by Mesa Verde Holdings</p>
          </div>
          <Button variant="secondary" onClick={() => goInJourney('C85')}>
            Access windows
          </Button>
          <Button onClick={flow.goNext}>Report an issue</Button>
        </header>
        <div className="hc-c84-web__cols">
          <div className="hc-c84-web__main">
            <h2 className="hc-large-bold">My requests</h2>
            <div className="hc-c84-table" role="table" aria-label="My requests">
              <div className="hc-c84-table__row hc-c84-table__row--head" role="row">
                <span role="columnheader">Request</span>
                <span role="columnheader">Status</span>
                <span role="columnheader">Next step</span>
              </div>
              {requests.map((r) => (
                <div
                  key={r.title}
                  className="hc-c84-table__row hc-c84-table__row--link"
                  role="row"
                  tabIndex={0}
                  onClick={openRequest}
                  onKeyDown={(e) => e.key === 'Enter' && openRequest()}
                >
                  <span role="cell" className="hc-medium-semibold">
                    {r.title}
                  </span>
                  <span role="cell">
                    <StatusPill label={r.status} tone={r.tone} />
                  </span>
                  <span role="cell">{r.next}</span>
                </div>
              ))}
            </div>
            <AgentCard>Your landlord shows job status only, so costs aren’t listed here. Ask them directly if you need a figure.</AgentCard>
          </div>
          <aside className="hc-c84-web__side">
            <section className="hc-c84-card">
              <h2 className="hc-large-bold">Access</h2>
              <DetailRow label="Usual times" value="Weekdays 7–9 AM" actionLabel="Edit" onAction={() => goInJourney('C85')} />
              <DetailRow label="Entry when out" value="Allowed · lockbox" actionLabel="Edit" onAction={() => goInJourney('C85')} />
              <DetailRow label="Next notice" value="Thu Nov 13 visit · sent Nov 10" />
            </section>
            <section className="hc-c84-card">
              <h2 className="hc-large-bold">Home history</h2>
              {history.map((h) => (
                <ListRow key={h.title} title={h.title} description={h.meta} />
              ))}
              <p className="hc-small hc-muted">Prior maintenance only. Earlier tenants’ requests are never shown (#189).</p>
            </section>
          </aside>
        </div>
      </div>
    </WebShell>
  );
}
