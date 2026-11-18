import { AgentCard } from '../../../components/AgentCard/AgentCard';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { SetupChecklist } from '../../../components/SetupChecklist/SetupChecklist';
import { TaskRow } from '../../../components/TaskRow/TaskRow';
import { agent, dueSoon, homeowner, money, setupChecklist } from '../../data/sample';
import { useCurrentHome } from '../../prototype/HomeContext';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { setupScreens, setupSearch, useSetupProgress } from '../../shells/SetupFlow';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C08-home-dashboard.css';

const AGENT_TIP = 'Your AC is 14 years old. Want me to get tune-up quotes before summer?';

/** C08 Home dashboard — Figma mobile 211:6284, web 211:6285 (J1 Onboarding step 11) */
export default function HomeDashboard(_: ScreenProps) {
  const { device } = usePrototype();
  const { home } = useCurrentHome();
  const flow = useFlow();
  // Review change: steps saved in the setup flow count as done (sample data + saved steps)
  const { items: setupItems, completed: done } = useSetupProgress();
  // Review change: the card lists all 9 items, numbered (no "See all" link); each item's Edit opens its setup screen as
  // a step of the setup flow (step tracker, Cancel / Save; see shells/SetupFlow.tsx)

  const checklist = (
    <SetupChecklist
      // Review change: once all 9 items are done the title says so
      title={done >= setupChecklist.length ? 'You’re all set' : 'Finish setting up your home'}
      completed={done}
      total={setupChecklist.length}
      numbered
      // Review change: the status ("Done" / time estimate) is a tag next to the task, and each row has an Edit button
      // on the right that opens the item's setup screen
      metaAsTag
      // Review change: one list, numbered 1–9 in the order set in review (data/sample.ts setupChecklist)
      items={setupItems.map((i, n) => ({
        id: i.id,
        label: i.label,
        meta: i.meta,
        done: i.done,
        onEdit: () => flow.go(setupScreens[i.id] ?? 'C05', setupSearch(n + 1)),
      }))}
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
              {/* Review change: the address is already on the side nav's home switcher, so this line shows the
                  current home's details instead (role · plan · items), and follows the switcher */}
              {home.meta}
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
            {/* Review change: the HouseCue agent tip card and the Systems card (sample systems with model and age, not
                clickable) are removed from the web dashboard; the mobile dashboard keeps the tip */}
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
