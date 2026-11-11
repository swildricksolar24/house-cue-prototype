import { useState } from 'react';
import { AgentFab } from '../../../components/AgentFab/AgentFab';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { Checkbox } from '../../../components/Checkbox/Checkbox';
import { ConsoleBreadcrumb } from '../../../components/ConsoleBreadcrumb/ConsoleBreadcrumb';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { Input } from '../../../components/Input/Input';
import { ListRow } from '../../../components/ListRow/ListRow';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { screenPath } from '../../prototype/journeys';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C87-move-out-turnover.css';

const checklist = [
  { id: 'paint', label: 'Paint touch-up', done: false },
  { id: 'clean', label: 'Deep clean', done: true },
  { id: 'filter', label: 'Replace HVAC filter', done: false },
  { id: 'alarms', label: 'Test smoke alarms', done: true },
  { id: 'rekey', label: 'Rekey locks', done: false },
];

const openItems: { item: string; type: string; after: string; tone: 'warning' | 'info' | 'neutral' }[] = [
  { item: 'Smoke alarm test · Dec 2', type: 'Visit', after: 'Reassign to you', tone: 'warning' },
  { item: 'Closet door off track', type: 'Request', after: 'Stays with property', tone: 'info' },
  { item: 'Likely tenant-caused: wall gouge', type: 'Damage flag', after: 'Kept on your record', tone: 'neutral' },
];

/** C87 Move-out and turnover — Figma mobile 272:32315, web 272:33422 (J1 Landlord portfolio step 9, last step) */
export default function MoveOutTurnover(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [done, setDone] = useState<string[]>(checklist.filter((c) => c.done).map((c) => c.id));
  const [date, setDate] = useState('Nov 30, 2026');
  const [editingDate, setEditingDate] = useState(false);

  const toggle = (id: string) => setDone((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
  const shortDate = date.replace(/, \d{4}$/, '');
  const endLabel = `End tenancy on ${shortDate}`;
  // Last step of the journey: ending the tenancy returns to the portfolio dashboard
  const endTenancy = () => flow.go('C79');

  const dateRow = editingDate ? (
    <div className="hc-c87-date">
      <Input label="Move-out date" value={date} onValueChange={setDate} />
      <Button variant="secondary" onClick={() => setEditingDate(false)}>
        Save
      </Button>
    </div>
  ) : (
    <DetailRow label="Move-out date" value={date} actionLabel="Edit" onAction={() => setEditingDate(true)} />
  );


  if (device === 'mobile') {
    return (
      <MobileShell
        header={{ title: 'Move-out' }}
        bottom={<BottomActions primaryLabel={endLabel} onPrimary={endTenancy} secondaryLabel="Cancel" onSecondary={flow.goBack} />}
      >
        <DetailRow label="Tenant" value="Theo Brandt · Unit B" />
        {dateRow}
        <h2 className="hc-c87-label">Open items</h2>
        <ListRow title="Visit Dec 2 · smoke alarm test" description="Reassign to you as the contact" />
        <Banner tone="warning" title={`Access ends ${shortDate}`}>
          Their requests, messages and photos stay with the property as “Previous tenant”, hidden from the next tenant.
        </Banner>
        <h2 className="hc-c87-label">Turnover checklist</h2>
        <div>
          {checklist.slice(0, 2).map((c) => (
            <Checkbox key={c.id} label={c.label} checked={done.includes(c.id)} onChange={() => toggle(c.id)} />
          ))}
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell role="landlord" nav="portfolio">
      <div className="hc-c87-web">
        <header className="hc-c87-web__head">
          <div className="hc-c87-web__title">
            <ConsoleBreadcrumb parent="Tenants & access" parentTo={screenPath('C82')} current="Move-out" />
            <h1 className="hc-h2">Move-out and turnover</h1>
            <p className="hc-medium hc-muted">1418 E Roosevelt St, Unit B · Theo Brandt (and co-tenant Lena Brandt)</p>
          </div>
          <Button variant="secondary" onClick={flow.goBack}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={endTenancy}>
            {endLabel}
          </Button>
        </header>
        <div className="hc-c87-web__cols">
          <div className="hc-c87-web__main">
            <section className="hc-c87-card">
              <h2 className="hc-large-bold">Tenancy</h2>
              {dateRow}
              <DetailRow label="Access revoked" value={`${shortDate} at 11:59 PM`} />
              <DetailRow label="Tenant told" value="Yes · Nov 9" />
            </section>
            <section className="hc-c87-card">
              <h2 className="hc-large-bold">Open items</h2>
              <div className="hc-c87-table" role="table" aria-label="Open items">
                <div className="hc-c87-table__row hc-c87-table__row--head" role="row">
                  <span role="columnheader">Item</span>
                  <span role="columnheader">Type</span>
                  <span role="columnheader">After move-out</span>
                </div>
                {openItems.map((o) => (
                  <div key={o.item} className="hc-c87-table__row" role="row">
                    <span role="cell" className="hc-medium-semibold">
                      {o.item}
                    </span>
                    <span role="cell">{o.type}</span>
                    <span role="cell">
                      <StatusPill label={o.after} tone={o.tone} />
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <aside className="hc-c87-web__side">
            <Banner tone="info" title="History stays with the property">
              The next tenant sees prior maintenance jobs only. You keep the full history, including “Previous tenant” items (#189).
            </Banner>
            <section className="hc-c87-card">
              <h2 className="hc-large-bold">Turnover checklist</h2>
              <div>
                {checklist.map((c) => (
                  <Checkbox key={c.id} label={c.label} checked={done.includes(c.id)} onChange={() => toggle(c.id)} />
                ))}
              </div>
              <Button variant="secondary" fullWidth onClick={() => flow.go('C82')}>
                Invite next tenant
              </Button>
            </section>
          </aside>
        </div>
      </div>
      <AgentFab size="extended" to={screenPath('C09')} className="hc-c87-fab" />
    </WebShell>
  );
}
