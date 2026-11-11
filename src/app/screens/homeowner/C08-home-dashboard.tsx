import { AgentCard } from '../../../components/AgentCard/AgentCard';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { ListRow } from '../../../components/ListRow/ListRow';
import { SetupChecklist } from '../../../components/SetupChecklist/SetupChecklist';
import { TaskRow } from '../../../components/TaskRow/TaskRow';
import { agent, dueSoon, homeowner, money, setupChecklist, systems } from '../../data/sample';
import { useCurrentHome } from '../../prototype/HomeContext';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C08-home-dashboard.css';

const AGENT_TIP = 'Your AC is 14 years old. Want me to get tune-up quotes before summer?';

/** C08 Home dashboard — Figma mobile 211:6284, web 211:6285 (J1 Onboarding step 11) */
export default function HomeDashboard(_: ScreenProps) {
  const { device } = usePrototype();
  const { home } = useCurrentHome();
  const flow = useFlow();
  const done = setupChecklist.filter((i) => i.done).length;

  const checklist = (
    <SetupChecklist
      title="Finish setting up your home"
      completed={done}
      total={setupChecklist.length}
      items={setupChecklist.slice(0, 3).map((i) => ({
        id: i.id,
        label: i.label,
        meta: i.meta,
        done: i.done,
        onClick: i.id === 'systems' ? () => flow.go('C05') : i.id === 'agent-prefs' ? () => flow.go('C42') : () => flow.go('C43'),
      }))}
      seeAllLabel={`See all ${setupChecklist.length} items`}
      onSeeAll={flow.goNext}
    />
  );

  const tasks = (items: typeof dueSoon) =>
    items.map((t) => (
      <TaskRow key={t.id} title={t.title} meta={`${t.system} · Due ${t.due}`} icon="tasks" tag={t.kind} onClick={() => flow.go('C12')} />
    ));

  const tip = <AgentCard>{AGENT_TIP}</AgentCard>;

  if (device === 'mobile') {
    return (
      <MobileShell header="home" tab="home">
        {checklist}
        <div className="hc-c08-section-head">
          <h2 className="hc-large-bold">Due soon</h2>
          <button className="hc-c08-link" onClick={() => flow.go('C11')}>
            See plan
          </button>
        </div>
        <div>{tasks(dueSoon.filter((t) => t.id !== 'pool-basket'))}</div>
        {tip}
      </MobileShell>
    );
  }

  return (
    <WebShell nav="home">
      <div className="hc-c08-web">
        <header className="hc-c08-web__head">
          <div>
            <h1 className="hc-h2">Good morning, {homeowner.firstName}</h1>
            <p className="hc-medium hc-muted">
              {home.address}, {home.city} · {home.label}
            </p>
          </div>
          <Button onClick={() => flow.go('C09')}>Ask the agent</Button>
        </header>
        <div className="hc-c08-web__cols">
          <div className="hc-c08-web__main">
            {checklist}
            <section className="hc-c08-card">
              <div className="hc-c08-section-head">
                <h2 className="hc-large-bold">Due soon</h2>
                <button className="hc-c08-link" onClick={() => flow.go('C11')}>
                  Open plan
                </button>
              </div>
              <div>{tasks(dueSoon)}</div>
            </section>
          </div>
          <aside className="hc-c08-web__side">
            {tip}
            <section className="hc-c08-card">
              <h2 className="hc-large-bold">Systems</h2>
              {systems.map((s) => (
                <ListRow key={s.id} title={s.name} description={`${s.model} · ${s.age}`} />
              ))}
            </section>
            <section className="hc-c08-card">
              <DetailRow
                label="Agent spending this month"
                value={`${money(agent.spentThisMonth)} of ${money(agent.spendCap)} cap`}
                actionLabel="Edit"
                onAction={() => flow.go('C07')}
              />
            </section>
          </aside>
        </div>
      </div>
    </WebShell>
  );
}
