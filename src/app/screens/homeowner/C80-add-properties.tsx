import { useState } from 'react';
import { AgentFab } from '../../../components/AgentFab/AgentFab';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { ConsoleBreadcrumb } from '../../../components/ConsoleBreadcrumb/ConsoleBreadcrumb';
import { Input } from '../../../components/Input/Input';
import { MetricRow } from '../../../components/MetricRow/MetricRow';
import { NumberStepper } from '../../../components/NumberStepper/NumberStepper';
import { OptionCard } from '../../../components/OptionCard/OptionCard';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { Switch } from '../../../components/Switch/Switch';
import { Upload } from '../../../components/Upload/Upload';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { screenPath } from '../../prototype/journeys';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C80-add-properties.css';

type Mode = 'one' | 'several';

/** Rows of the uploaded CSV (Figma web 263:1145) */
const csvRows = [
  { address: '1418 E Roosevelt St, Phoenix', units: '2', occupied: 'Yes', matched: true },
  { address: '5602 E Pima St, Tucson', units: '4', occupied: '3 of 4', matched: true },
  { address: '2207 N 9th Ave, Phoenix', units: '1', occupied: 'Yes', matched: true },
  { address: '812 S 4th Ave, Tucson', units: '1', occupied: 'Yes', matched: true },
  { address: '3315 E Fairmount, Phx', units: '1', occupied: 'No', matched: false },
];

/** C80 Add properties — Figma mobile 272:31845, web 272:32449 (J1 Landlord portfolio step 2) */
export default function AddProperties(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [mode, setMode] = useState<Mode>(device === 'web' ? 'several' : 'one');
  const [address, setAddress] = useState('1418 E Roosevelt St, Phoenix, AZ 85006');
  const [units, setUnits] = useState(2);
  const [occupied, setOccupied] = useState(true);
  const [uploaded, setUploaded] = useState(true);

  const modeCards = (
    <div className="hc-c80-modes" role="radiogroup" aria-label="How to add properties">
      <OptionCard
        role="radio"
        aria-checked={mode === 'one'}
        selected={mode === 'one'}
        icon="home"
        title="One property"
        description="Address, units and occupancy"
        onClick={() => setMode('one')}
      />
      <OptionCard
        role="radio"
        aria-checked={mode === 'several'}
        selected={mode === 'several'}
        icon="home"
        title="Several at once"
        description="Paste a list or upload a CSV"
        onClick={() => setMode('several')}
      />
    </div>
  );

  const oneForm = (
    <>
      <Input label="Address" value={address} onValueChange={setAddress} />
      <NumberStepper title="Units (doors)" helper="Each rentable unit is one door" value={units} onValueChange={setUnits} min={1} />
      <Switch label="Occupied now" checked={occupied} onCheckedChange={setOccupied} />
      <Banner tone="info">Doors are billed at $2 a month on the Portfolio plan, from the next cycle.</Banner>
    </>
  );

  const upload = (
    <Upload
      className="hc-c80-upload"
      state={uploaded ? 'done' : 'idle'}
      accept=".csv,.txt"
      hint="CSV with address and unit count"
      fileName="mesa-verde-rentals.csv"
      meta="Uploaded · 5 rows · 2 KB"
      onFiles={() => setUploaded(true)}
      onReplace={() => setUploaded(false)}
    />
  );

  const table = (
    <div className="hc-c80-table" role="table" aria-label="Addresses in file">
      <div className="hc-c80-table__row hc-c80-table__row--head" role="row">
        <span role="columnheader">Address</span>
        <span role="columnheader">Units</span>
        <span role="columnheader">Occupied</span>
        <span role="columnheader">Match</span>
      </div>
      {csvRows.map((r) => (
        <div className="hc-c80-table__row" role="row" key={r.address}>
          <span role="cell" className="hc-medium-semibold">
            {r.address}
          </span>
          <span role="cell">{r.units}</span>
          <span role="cell">{r.occupied}</span>
          <span role="cell">
            {r.matched ? <StatusPill label="Confirmed" tone="success" /> : <StatusPill label="No match · enter manually" tone="danger" />}
          </span>
        </div>
      ))}
    </div>
  );

  if (device === 'mobile') {
    return (
      <MobileShell
        header={{ title: 'Add properties' }}
        bottom={
          mode === 'one' ? (
            <BottomActions primaryLabel="Confirm address" onPrimary={flow.goNext} secondaryLabel="Add several at once" onSecondary={() => setMode('several')} />
          ) : (
            <BottomActions primaryLabel="Save 4 properties" onPrimary={flow.goNext} secondaryLabel="Fix 1 address" onSecondary={() => setMode('one')} />
          )
        }
      >
        {modeCards}
        {mode === 'one' ? (
          oneForm
        ) : (
          <>
            {upload}
            {uploaded && (
              <div className="hc-c80-list">
                {csvRows.map((r) => (
                  <div className="hc-c80-list__row" key={r.address}>
                    <div>
                      <p className="hc-medium-semibold">{r.address}</p>
                      <p className="hc-small hc-muted">
                        {r.units} {r.units === '1' ? 'unit' : 'units'} · Occupied {r.occupied}
                      </p>
                    </div>
                    {r.matched ? <StatusPill label="Confirmed" tone="success" /> : <StatusPill label="No match" tone="danger" />}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </MobileShell>
    );
  }

  return (
    <WebShell role="landlord" nav="portfolio">
      <div className="hc-c80-web">
        <header className="hc-c80-web__head">
          <ConsoleBreadcrumb parent="Portfolio" parentTo={screenPath('C79')} current="Add properties" />
          <h1 className="hc-h2">Add properties</h1>
          <p className="hc-medium hc-muted">
            One at a time, or paste a list / upload a CSV with address and unit count. Each address gets a short confirm step.
          </p>
        </header>
        <div className="hc-c80-web__cols">
          <div className="hc-c80-web__main">
            {modeCards}
            {mode === 'several' ? (
              <>
                {upload}
                {uploaded && table}
              </>
            ) : (
              <section className="hc-c80-card hc-c80-card--form">{oneForm}</section>
            )}
          </div>
          <aside className="hc-c80-web__side">
            <section className="hc-c80-card">
              <h2 className="hc-large-bold">Summary</h2>
              {mode === 'several' ? (
                <>
                  <MetricRow label="Rows in file" value="5" />
                  <MetricRow label="Matched" value="4" />
                  <MetricRow label="Doors (matched)" value="8" />
                  <MetricRow label="Need manual entry" value="1" />
                </>
              ) : (
                <>
                  <MetricRow label="Address" value={address.split(',')[0]} />
                  <MetricRow label="Doors" value={String(units)} />
                  <MetricRow label="Occupied" value={occupied ? 'Yes' : 'No'} />
                </>
              )}
              <MetricRow label="Plan" value="Portfolio · $9.99 + $2/door" />
              <MetricRow label="From next cycle" value="$25.99 / mo" />
              <div className="hc-c80-buttons">
                {mode === 'several' ? (
                  <>
                    <Button onClick={flow.goNext}>Save 4 properties</Button>
                    <Button variant="secondary" onClick={() => setMode('one')}>
                      Fix 1 address
                    </Button>
                  </>
                ) : (
                  <Button onClick={flow.goNext}>Confirm address</Button>
                )}
              </div>
            </section>
            <Banner tone="warning" title="Address already in HouseCue?">
              If another owner holds a matched address, ask for access or start as the new owner (W32).
            </Banner>
          </aside>
        </div>
      </div>
      <AgentFab size="extended" to={screenPath('C09')} className="hc-c80-fab" />
    </WebShell>
  );
}
