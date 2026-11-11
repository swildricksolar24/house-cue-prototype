import { useState } from 'react';
import { Button } from '../../../components/Button/Button';
import type { IconName } from '../../../components/Icon/Icon';
import { SettingRow } from '../../../components/SettingRow/SettingRow';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';
import { StateBlock } from '../../../components/StateBlock/StateBlock';
import { TaskRow, type TaskRowTagTone } from '../../../components/TaskRow/TaskRow';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C33-notification-center.css';

type Filter = 'all' | 'action';
type Tone = TaskRowTagTone | 'neutral';
type Notice = {
  id: string;
  group: 'Today' | 'Earlier';
  title: string;
  meta: string;
  /** Web meta when it differs from mobile */
  webMeta?: string;
  icon: IconName;
  tag: string;
  tone: Tone;
  needsAction?: boolean;
  /** Only in the web frame */
  webOnly?: boolean;
  to: string;
};

const notices: Notice[] = [
  { id: 'quotes', group: 'Today', title: '3 quotes are in for AC repair', meta: 'Compare by 6 PM · 10 min ago', icon: 'notification', tag: 'New', tone: 'info', to: 'C14' },
  {
    id: 'booking',
    group: 'Today',
    title: 'Approve a $189 booking',
    meta: 'Zephyrline HVAC · Thu 8–10 AM',
    webMeta: 'Zephyrline HVAC · Thu 8–10 AM · 1 h ago',
    icon: 'calendar',
    tag: 'Action',
    tone: 'warning',
    needsAction: true,
    to: 'C16',
  },
  { id: 'agent', group: 'Today', title: 'Your agent emailed 5 HVAC pros', meta: 'Agent · 9:14 AM', icon: 'chat', tag: 'Agent', tone: 'info', webOnly: true, to: 'C10' },
  { id: 'filter', group: 'Earlier', title: 'Filter change due Nov 28', meta: 'Plan · Yesterday', icon: 'tasks', tag: 'Task', tone: 'neutral', to: 'C11' },
  { id: 'warranty', group: 'Earlier', title: 'Warranty ends in 30 days', meta: 'Water heater · Nov 3', icon: 'shield', tag: 'Warranty', tone: 'success', to: 'C25' },
  { id: 'export', group: 'Earlier', title: 'Your data export is ready', meta: 'Settings · Nov 1', icon: 'document', tag: 'Account', tone: 'neutral', webOnly: true, to: 'C34' },
];

/** C33 Notification center — Figma mobile 218:22046, web 218:22964 (J1 Settings & account step 2). States: Empty / Loading / Error (B2 110:6515…110:7068). */
export default function NotificationCenter(_: ScreenProps) {
  const { device, screenState } = usePrototype();
  const flow = useFlow();
  const [filter, setFilter] = useState<Filter>('all');
  const [read, setRead] = useState(false);
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);
  const web = device === 'web';

  const chips = (
    <div className="hc-c33-chips" role="radiogroup" aria-label="Filter notifications">
      {(
        [
          ['all', 'All'],
          ['action', 'Needs action'],
        ] as const
      ).map(([key, label]) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={filter === key}
          className={['hc-c33-chip', filter === key && 'hc-c33-chip--selected'].filter(Boolean).join(' ')}
          onClick={() => setFilter(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );

  const visible = notices.filter((n) => (web || !n.webOnly) && (filter === 'all' || n.needsAction));

  const group = (name: Notice['group']) => {
    const items = visible.filter((n) => n.group === name);
    if (!items.length) return null;
    return (
      <>
        <h2 className="hc-large-bold">{name}</h2>
        <div>
          {items.map((n) => {
            const tag = read && n.tag === 'New' ? undefined : n.tag;
            return (
              <TaskRow
                key={n.id}
                className={n.tone === 'neutral' ? 'hc-c33-row--neutral' : undefined}
                title={n.title}
                meta={web && n.webMeta ? n.webMeta : n.meta}
                icon={n.icon}
                tag={tag}
                // TaskRow has no neutral tone; the neutral pill is styled locally (see CSS)
                tagTone={n.tone === 'neutral' ? 'info' : n.tone}
                onClick={() => flow.go(n.to)}
              />
            );
          })}
        </div>
      </>
    );
  };

  let list;
  if (screenState === 'loading') {
    list = (
      <>
        <h2 className="hc-large-bold">Today</h2>
        <div className="hc-c33-skeletons">
          <SkeletonCard label="Loading notifications" />
          <SkeletonCard label="Loading notifications" />
          <SkeletonCard label="Loading notifications" />
        </div>
      </>
    );
  } else if (screenState === 'error') {
    list = (
      <>
        <h2 className="hc-large-bold">Today</h2>
        <StateBlock
          kind="error"
          title="Couldn’t load notifications"
          body="Check your connection and try again. Nothing was lost."
          actionLabel="Try again"
          onAction={() => undefined}
        />
      </>
    );
  } else if (screenState === 'empty') {
    list = (
      <>
        <h2 className="hc-large-bold">Today</h2>
        <StateBlock title="You’re all caught up" body="Updates about your home and jobs show up here." />
      </>
    );
  } else {
    list = (
      <>
        {group('Today')}
        {group('Earlier')}
      </>
    );
  }

  const listReady = screenState === 'default';

  if (!web) {
    return (
      <MobileShell header={{ title: 'Notifications' }} tab="home">
        {chips}
        {list}
        {listReady && (
          <button type="button" className="hc-c33-link" onClick={() => setRead(true)}>
            Mark all as read
          </button>
        )}
      </MobileShell>
    );
  }

  return (
    <WebShell nav="home">
      <div className="hc-c33-web">
        <header className="hc-c33-web__head">
          <h1 className="hc-h2">Notifications</h1>
          {chips}
          <Button variant="secondary" onClick={() => setRead(true)}>
            Mark all as read
          </Button>
        </header>
        <div className="hc-c33-web__cols">
          <section className="hc-c33-card hc-c33-web__main">{list}</section>
          <aside className="hc-c33-card hc-c33-web__side">
            <h2 className="hc-large-bold">How we reach you</h2>
            <SettingRow title="Push notifications" description="Quotes, approvals and job updates" checked={push} onCheckedChange={setPush} />
            <SettingRow
              title="Email"
              description="Receipts, summaries and anything you miss in the app"
              checked={email}
              onCheckedChange={setEmail}
            />
            <SettingRow
              title="Text messages"
              description="Only urgent: emergencies and same-day changes"
              checked={sms}
              onCheckedChange={setSms}
            />
            <button type="button" className="hc-c33-link" onClick={() => flow.go('C34')}>
              More in Settings
            </button>
          </aside>
        </div>
      </div>
    </WebShell>
  );
}
