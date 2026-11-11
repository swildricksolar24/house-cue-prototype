import { useState } from 'react';
import { ActionCard } from '../../../components/ActionCard/ActionCard';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { Checkbox } from '../../../components/Checkbox/Checkbox';
import { ConsoleBreadcrumb } from '../../../components/ConsoleBreadcrumb/ConsoleBreadcrumb';
import { Input } from '../../../components/Input/Input';
import { SettingRow } from '../../../components/SettingRow/SettingRow';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C85-access-windows.css';

const WINDOWS = ['Weekdays 7–9 AM', 'Weekdays after 5 PM', 'Sat 9 AM–1 PM'];
/** Prototype fill-in for "+ Add a window" */
const EXTRA_WINDOW = 'Sun 10 AM–2 PM';

const notices = [
  { notice: 'Thu Nov 13, 8–10 AM · AC repair', vendor: 'Bluequail Air', sent: 'Nov 10' },
  { notice: 'Oct 28, 1–3 PM · bath fan', vendor: 'Copperwick Pipe', sent: 'Oct 26' },
];

/** C85 Access windows and entry notice — Figma mobile 272:34311, web 272:35329 (J1 Tenant step 5) */
export default function AccessWindows(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [windows, setWindows] = useState(WINDOWS);
  const [selected, setSelected] = useState<string[]>(WINDOWS);
  const [entryWhenOut, setEntryWhenOut] = useState(true);
  const [entryDetails, setEntryDetails] = useState('Lockbox on side gate · code 4 digits');
  const [waive, setWaive] = useState(false);
  const [slot, setSlot] = useState<'proposed' | 'confirmed'>('proposed');

  const toggle = (w: string) => setSelected((s) => (s.includes(w) ? s.filter((x) => x !== w) : [...s, w]));
  const addWindow = () => {
    if (windows.includes(EXTRA_WINDOW)) return;
    setWindows((w) => [...w, EXTRA_WINDOW]);
    setSelected((s) => [...s, EXTRA_WINDOW]);
  };

  // HC/Action Card always renders three buttons; Figma shows two, so the third is hidden in CSS
  const visit = (
    <ActionCard
      className="hc-c85-visit"
      status={slot === 'confirmed' ? 'Confirmed' : 'Proposed'}
      meta="Visit proposed · Bluequail Air Service"
      title="Thu Nov 13, 8–10 AM"
      body="Bedroom AC check. Entry notice sent Nov 10 (Arizona: 2 days)."
      approveLabel="Confirm slot"
      editLabel="Offer another time"
      onApprove={() => setSlot('confirmed')}
      onEdit={() => flow.go('C09')}
    />
  );

  const chips = (withAdd: boolean) => (
    <div className="hc-c85-chips" role="group" aria-label="Usual times you’re home">
      {windows.map((w) => {
        const on = selected.includes(w);
        return (
          <button key={w} type="button" className="hc-c85-chip" aria-pressed={on} onClick={() => toggle(w)}>
            <StatusPill label={w} tone={on ? 'info' : 'neutral'} />
          </button>
        );
      })}
      {withAdd && (
        <button type="button" className="hc-c85-chip" onClick={addWindow}>
          <StatusPill label="+ Add a window" tone="neutral" />
        </button>
      )}
    </div>
  );

  if (device === 'mobile') {
    return (
      <MobileShell
        header={{ title: 'Access & entry' }}
        bottom={<BottomActions primaryLabel="Save access" onPrimary={flow.goNext} secondaryLabel="Skip for now" onSecondary={flow.goNext} />}
      >
        {visit}
        <h2 className="hc-c85-label">Usual times you’re home</h2>
        {chips(false)}
        <SettingRow
          title="Allow entry when I’m out"
          description="Code shared with the pro on the visit day only"
          checked={entryWhenOut}
          onCheckedChange={setEntryWhenOut}
        />
      </MobileShell>
    );
  }

  return (
    <WebShell role="tenant" nav="home">
      <div className="hc-c85-web">
        <header className="hc-c85-web__head">
          <div className="hc-c85-web__title">
            <ConsoleBreadcrumb parent="Your home" onParentClick={flow.goBack} current="Access & entry" />
            <h1 className="hc-h2">Access windows and entry notice</h1>
            <p className="hc-medium hc-muted">
              Pros visit inside these windows. Entry needs 2 days’ notice in Arizona unless you waive it or it is an emergency.
            </p>
          </div>
          <Button onClick={flow.goNext}>Save access</Button>
        </header>
        <div className="hc-c85-web__cols">
          <div className="hc-c85-web__main">
            {visit}
            <section className="hc-c85-card">
              <h2 className="hc-large-bold">Usual times you’re home</h2>
              {chips(true)}
            </section>
            <section className="hc-c85-card">
              <h2 className="hc-large-bold">Entry permission</h2>
              <SettingRow
                title="Allow entry when I’m out"
                description="Lockbox or code, shared with the pro on the visit day only"
                checked={entryWhenOut}
                onCheckedChange={setEntryWhenOut}
              />
              {entryWhenOut && <Input label="Entry details (encrypted)" value={entryDetails} onValueChange={setEntryDetails} />}
            </section>
          </div>
          <aside className="hc-c85-web__side">
            <section className="hc-c85-card">
              <h2 className="hc-large-bold">Notices received</h2>
              <div className="hc-c85-table" role="table" aria-label="Notices received">
                <div className="hc-c85-table__row hc-c85-table__row--head" role="row">
                  <span role="columnheader">Notice</span>
                  <span role="columnheader">Vendor</span>
                  <span role="columnheader">Sent</span>
                </div>
                {notices.map((n) => (
                  <div key={n.notice} className="hc-c85-table__row" role="row">
                    <span role="cell" className="hc-medium-semibold">
                      {n.notice}
                    </span>
                    <span role="cell">{n.vendor}</span>
                    <span role="cell">{n.sent}</span>
                  </div>
                ))}
              </div>
              <Checkbox label="Waive the 2-day notice for this visit" checked={waive} onChange={(e) => setWaive(e.target.checked)} />
            </section>
          </aside>
        </div>
      </div>
    </WebShell>
  );
}
