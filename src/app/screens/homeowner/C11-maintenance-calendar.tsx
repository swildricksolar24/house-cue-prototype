import { Fragment, useState, type ReactNode } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { StatTile } from '../../../components/StatTile/StatTile';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';
import { StateBlock } from '../../../components/StateBlock/StateBlock';
import { TaskRow, type TaskRowTagTone } from '../../../components/TaskRow/TaskRow';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C11-maintenance-calendar.css';

type PlanTask = {
  id: string;
  title: string;
  meta: string;
  tag: string;
  tone?: TaskRowTagTone;
  month: 'November' | 'December';
  day: number;
  /** Shown on web only (Figma web frame adds the overdue dryer vent and coil cleaning) */
  webOnly?: boolean;
  mobileOnly?: boolean;
  /** Screen the row opens */
  opens: string;
};

const tasks: PlanTask[] = [
  { id: 'dryer-vent', title: 'Clean dryer vent', meta: 'Dryer · Overdue since Nov 1', tag: 'Overdue', tone: 'danger', month: 'November', day: 1, webOnly: true, opens: 'C12' },
  { id: 'hvac-filter', title: 'Replace HVAC filter', meta: 'AC / heat pump · Due Nov 28', tag: 'DIY', month: 'November', day: 28, opens: 'C12' },
  { id: 'pool-basket', title: 'Clean pool pump basket', meta: 'Pool pump · Due Nov 30', tag: 'DIY', month: 'November', day: 30, opens: 'C12' },
  { id: 'gfci', title: 'Test GFCI outlets', meta: 'Electrical · Due Nov 30', tag: 'Pro', month: 'November', day: 30, opens: 'C12' },
  { id: 'flush-wh', title: 'Flush water heater', meta: 'Water heater · Due Dec 3', tag: 'Pro', month: 'December', day: 3, opens: 'C12' },
  { id: 'coils', title: 'Clean AC condenser coils', meta: 'AC / heat pump · Due Dec 10', tag: 'Pro', month: 'December', day: 10, webOnly: true, opens: 'C12' },
  { id: 'roof-check', title: 'Roof line photo check-up', meta: 'Roof · Due Dec 12', tag: 'Check-up', tone: 'success', month: 'December', day: 12, mobileOnly: true, opens: 'C61' },
];

/** Weekday of the 1st (0 = Sunday) and length, for the 2026 months shown */
const monthGrid = { November: { first: 0, days: 30 }, December: { first: 2, days: 31 } } as const;

type View = 'list' | 'month';

/** C11 Maintenance calendar (Plan tab) — Figma mobile 216:14971, web 216:16496 (J1 Home record step 1). States 110:4451… on B2. */
export default function MaintenanceCalendar(_: ScreenProps) {
  const { device, screenState, setScreenState } = usePrototype();
  const flow = useFlow();
  const [view, setView] = useState<View>('list');
  const visible = tasks.filter((t) => (device === 'mobile' ? !t.webOnly : !t.mobileOnly));

  const open = (t: PlanTask) => (t.opens === 'C12' ? flow.goNext() : flow.go(t.opens));

  const chips = (
    <div className="hc-c11-chips" role="group" aria-label="View">
      {(['list', 'month'] as View[]).map((v) => (
        <button key={v} type="button" className="hc-c11-chip" aria-pressed={view === v} onClick={() => setView(v)}>
          {v === 'list' ? 'List' : 'Month'}
        </button>
      ))}
    </div>
  );

  const rows = (month: PlanTask['month']) =>
    visible
      .filter((t) => t.month === month)
      .map((t) => <TaskRow key={t.id} title={t.title} meta={t.meta} tag={t.tag} tagTone={t.tone} onClick={() => open(t)} />);

  const monthView = (month: PlanTask['month']) => {
    const { first, days } = monthGrid[month];
    const due = new Set(visible.filter((t) => t.month === month).map((t) => t.day));
    return (
      <div className="hc-c11-month" aria-label={`${month} calendar`}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={i} className="hc-c11-month__dow" aria-hidden>
            {d}
          </span>
        ))}
        {Array.from({ length: first }, (_, i) => (
          <span key={`pad-${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const day = i + 1;
          const has = due.has(day);
          const task = visible.find((t) => t.month === month && t.day === day);
          return has && task ? (
            <button
              key={day}
              type="button"
              className={`hc-c11-month__day hc-c11-month__day--task${task.tone === 'danger' ? ' hc-c11-month__day--overdue' : ''}`}
              aria-label={`${month} ${day}: ${task.title}`}
              onClick={() => open(task)}
            >
              {day}
              <span className="hc-c11-month__dot" />
            </button>
          ) : (
            <span key={day} className="hc-c11-month__day">
              {day}
            </span>
          );
        })}
      </div>
    );
  };

  /** First month's list, replaced by the Empty / Loading / Error frame; later sections are hidden in those frames */
  const sections = (): ReactNode => {
    if (screenState === 'loading') {
      return (
        <>
          <h2 className="hc-large-bold">November</h2>
          <SkeletonCard label="Loading tasks" />
          <SkeletonCard label="Loading tasks" />
          <SkeletonCard label="Loading tasks" />
        </>
      );
    }
    if (screenState === 'empty' || screenState === 'error') {
      return (
        <>
          <h2 className="hc-large-bold">November</h2>
          {screenState === 'empty' ? (
            <StateBlock
              title="No tasks scheduled"
              body="Add systems and appliances to get a care plan."
              actionLabel="Add a system"
              onAction={() => flow.go('C05')}
            />
          ) : (
            <StateBlock
              kind="error"
              title="Couldn’t load your care plan"
              body="Check your connection and try again. Nothing was lost."
              actionLabel="Try again"
              onAction={() => setScreenState('default')}
            />
          )}
        </>
      );
    }
    // Month view (review change): the two months sit side by side as compact calendars, one under the other on mobile
    if (view === 'month') {
      return (
        <div className="hc-c11-months">
          {(['November', 'December'] as const).map((m) => (
            <section key={m} className="hc-c11-months__month">
              <h2 className="hc-large-bold">{m}</h2>
              {monthView(m)}
            </section>
          ))}
        </div>
      );
    }
    return (['November', 'December'] as const).map((m) => (
      <Fragment key={m}>
        <h2 className="hc-large-bold">{m}</h2>
        {rows(m)}
      </Fragment>
    ));
  };

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Plan', showBack: false }} tab="plan">
        {chips}
        {sections()}
      </MobileShell>
    );
  }

  return (
    <WebShell nav="plan">
      <div className="hc-c11-web">
        <header className="hc-c11-web__head">
          <h1 className="hc-h2">Plan</h1>
          {chips}
        </header>
        {/* Review change: "This year" sits at the top as three stat tiles across the column */}
        <section className="hc-c11-year" aria-labelledby="hc-c11-year-title">
          <h2 id="hc-c11-year-title" className="hc-large-bold">
            This year
          </h2>
          <div className="hc-c11-year__tiles">
            <StatTile label="Done" value="12" meta="tasks" />
            <StatTile label="Due this month" value="4" meta="tasks" />
            <StatTile label="Skipped" value="1" meta="task" />
          </div>
        </section>
        <div className="hc-c11-web__cols">
          <section className="hc-c11-web__main hc-c11-card">{sections()}</section>
          <aside className="hc-c11-web__side">
            <Banner title="Bundle 2 HVAC tasks?">
              Coil cleaning and the next filter change are both due in December. I can ask one pro to do both.
            </Banner>
          </aside>
        </div>
      </div>
    </WebShell>
  );
}
