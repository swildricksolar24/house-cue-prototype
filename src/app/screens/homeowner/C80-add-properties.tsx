import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AgentFab } from '../../../components/AgentFab/AgentFab';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { ConsoleBreadcrumb } from '../../../components/ConsoleBreadcrumb/ConsoleBreadcrumb';
import { Input } from '../../../components/Input/Input';
import { NumberStepper } from '../../../components/NumberStepper/NumberStepper';
import { Icon, type IconName } from '../../../components/Icon/Icon';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { Select } from '../../../components/Select/Select';
import { Upload } from '../../../components/Upload/Upload';
import { useDemoActions } from '../../prototype/DemoTools';
import { portfolioProperties } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { addProperties, BILLING_START_OPTIONS, doorName, EMPTY_DETAILS, resizeDoors, splitAddress, usePortfolioPlan, type DoorTenancy, type Invitee, type PropertyDetails } from '../../prototype/portfolio';
import { PropertyDetailsEditor } from './_property-details';
import { isEmail } from './_editable-row';
import { usePrototype } from '../../prototype/PrototypeContext';
import { screenPath } from '../../prototype/journeys';
import { MobileShell } from '../../shells/MobileShell';
import { FormDialog } from '../../shells/EditDialog';
import { PageBackButton } from '../../shells/SetupFlow';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C80-add-properties.css';

type Mode = 'one' | 'several';

/** Doors on the Portfolio plan today (C89 Portfolio billing: $9.99 base + 9 × $2) */
const PORTFOLIO_DOORS = 9;
/** Next month's Portfolio bill with this property's units added: $9.99 + $2 a door */
const nextCycle = (units: number) => `$${(9.99 + 2 * (PORTFOLIO_DOORS + units)).toFixed(2)}`;

/**
 * Review change: the One property card's Plan and Billing starts drop-downs (invented options). Portfolio monthly is
 * $9.99 + $2 a door a month; yearly $99 + $20 a door a year (2 months free). Billing starts on the next cycle (Dec 1)
 * or today, with the new doors prorated: monthly for the rest of November (11 of 30 days), yearly for the rest of 2026
 * (43 of 365 days). The Portfolio plan is the only landlord plan, so the options name the billing period.
 */
type BillingPlan = 'monthly' | 'yearly';
type BillingStart = 'next' | 'today';
// The options are shared with the property detail page (prototype/portfolio.ts)
const START_OPTIONS = BILLING_START_OPTIONS;
/** Option label ↔ value, for the Fix this address dialog's drop-downs (FormDialog selects work on labels) */
const labelOf = (options: { value: string; label: string }[], value: string) => options.find((o) => o.value === value)?.label ?? options[0].label;
const valueOf = (options: { value: string; label: string }[], label: string) => options.find((o) => o.label === label)?.value ?? options[0].value;
const money = (n: number) => `$${n.toFixed(2)}`;
function billingNote(plan: BillingPlan, start: BillingStart, units: number) {
  const doors = PORTFOLIO_DOORS + units;
  const price = plan === 'monthly' ? `${nextCycle(units)} a month` : `${money(99 + 20 * doors)} a year`;
  const nowAmount = plan === 'monthly' ? 2 * units * (11 / 30) : 20 * units * (43 / 365);
  const rest = plan === 'monthly' ? 'November' : 'this year';
  const today = start === 'today' ? ` Today you pay ${money(nowAmount)} for the new ${units === 1 ? 'door' : 'doors'} for the rest of ${rest}.` : '';
  return `You’ll pay ${price} for ${doors} doors, starting ${start === 'next' ? 'Dec 1' : 'today'}.${today}`;
}

/** The sample address Landlord Demo fills in (the journey's property) */
const SAMPLE_ADDRESS = '1418 E Roosevelt St, Phoenix, AZ 85006';

/** The two tab cards at the top (review change: were radio OptionCards) */
const MODES: { id: Mode; title: string; description: string; icon: IconName }[] = [
  { id: 'one', title: 'One property', description: 'Address, units and occupancy', icon: 'home' },
  { id: 'several', title: 'Several at once', description: 'Paste a list or upload a CSV', icon: 'document' },
];

/** Rows of the uploaded CSV (Figma web 263:1145) */
const csvRows = [
  { address: '1418 E Roosevelt St, Phoenix', units: '2', occupied: 'Yes', matched: true },
  { address: '5602 E Pima St, Tucson', units: '4', occupied: '3 of 4', matched: true },
  { address: '2207 N 9th Ave, Phoenix', units: '1', occupied: 'Yes', matched: true },
  { address: '812 S 4th Ave, Tucson', units: '1', occupied: 'Yes', matched: true },
  { address: '3315 E Fairmount, Phx', units: '1', occupied: 'No', matched: false },
];

/** C80 Add properties — Figma mobile 272:31845, web 272:32449 (J1 Landlord portfolio step 2) */
/**
 * Review change: what a CSV import "reads" (invented Phoenix-area homes, the same six whatever the file holds). Five
 * import; the Glendale row has no street number and needs a fix (Fix this address opens it on One property).
 */
type ImportedHome = { address: string; city: string; units: number; occupied: string; fix?: string; fixed?: boolean; start?: BillingStart };
const IMPORTED_HOMES: ImportedHome[] = [
  { address: '4521 N 44th St', city: 'Phoenix', units: 1, occupied: 'Yes' },
  { address: '1902 E Apache Blvd', city: 'Tempe', units: 4, occupied: '3 of 4' },
  { address: '738 W Main St', city: 'Mesa', units: 2, occupied: 'Yes' },
  { address: '2650 S Arizona Ave', city: 'Chandler', units: 1, occupied: 'No' },
  { address: '8130 E Indian School Rd', city: 'Scottsdale', units: 3, occupied: 'Yes' },
  { address: '59th Ave & Bell', city: 'Glendale', units: 1, occupied: '—', fix: 'No street number' },
];
/** An imported row's "Occupied" (Yes, No, "3 of 4") as door tenancy: the first n doors occupied */
const doorsFromFile = (units: number, occupied: string): DoorTenancy[] => {
  const n = occupied === 'Yes' ? units : /^(\d+) of/.test(occupied) ? Number(occupied.match(/^(\d+)/)![1]) : 0;
  return Array.from({ length: units }, (_, i) => (i < n ? 'occupied' : 'vacant'));
};
/** Review change: the Monthly budget drop-down (invented amounts); the current value is added if it isn't one of them */
const BUDGETS = [100, 150, 200, 250, 300, 400, 500, 600, 800, 1000, 1500, 2000];
const budgetOptions = (current: number) =>
  [...new Set([...BUDGETS, current])].sort((a, b) => a - b).map((n) => ({ value: String(n), label: `$${n.toLocaleString('en-US')} a month` }));
/** $500 → "$500"; a unit's share: $500 / 3 → "$166.67" (whole dollars when it divides evenly) */
const usdWhole = (n: number) => `$${n.toLocaleString('en-US')}`;
const perUnit = (budget: number, units: number) => {
  const share = budget / units;
  return Number.isInteger(share) ? usdWhole(share) : `$${share.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
/** Review change: the Tenancy drop-down on each door row */
const TENANCY_OPTIONS = [
  { value: 'vacant', label: 'Vacant' },
  { value: 'occupied', label: 'Occupied' },
];
const IMPORT_STEPS = ['Reading the file', 'Matching addresses', 'Adding properties'];
/** How long the processing animation runs before the confirmation */
const IMPORT_MS = 4000;

type ImportState = 'idle' | 'processing' | 'done';

export default function AddProperties(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  // Review change: always opens on the One property tab (web used to open on Several at once)
  const [mode, setMode] = useState<Mode>('one');
  const toPortfolio = () => flow.go('C79');
  // Review change: saving really adds to the Portfolio (prototype/portfolio.ts). Opened from the Portfolio (?from=portfolio)
  // Save goes back there with a confirmation; in the landlord sign-up it carries on to the next step as before.
  const [params] = useSearchParams();
  const fromPortfolio = params.get('from') === 'portfolio';
  const saveOne = () => {
    const { address: street, city } = splitAddress(address);
    const added = addProperties([{ address: street, city, units, doors, tenants: doors.map((d, i) => (d === 'occupied' ? invitees[i] : undefined)), budget: monthlyBudget, billing: { plan, start }, details }], portfolioProperties);
    if (fromPortfolio) flow.go('C79', "?added=" + added);
    else flow.goNext();
  };
  const addImported = () => {
    const added = addProperties(
      imported.map((h) => ({
        address: h.address,
        city: h.city,
        units: h.units,
        doors: doorsFromFile(h.units, h.occupied),
        // A fixed home keeps the billing start chosen in its dialog (the plan is the account's)
        billing: h.start ? { plan, start: h.start } : undefined,
      })),
      portfolioProperties,
    );
    flow.go('C79', "?added=" + added);
  };
  // Review change: the address starts empty (was pre-filled with 1418 E Roosevelt St); Confirm address waits for one, and
  // the shortcuts panel's Landlord Demo fills the sample address in
  const [address, setAddress] = useState('');
  const hasAddress = address.trim().length > 0;
  useDemoActions(mode === 'one' ? [{ label: 'Landlord Demo', onClick: () => setAddress(SAMPLE_ADDRESS) }] : []);
  const [units, setUnits] = useState(2);
  // Review change: each door's tenancy (was one Occupied now toggle); the list follows the Units count, new doors vacant
  const [doors, setDoors] = useState<DoorTenancy[]>(['vacant', 'vacant']);
  // Review change: the address's monthly budget; null follows the Units count ($100 a door) until one is picked
  const [budget, setBudget] = useState<number | null>(null);
  // Review change: Property details (optional, under Doors): imported or typed in, saved with the property
  const [details, setDetailsDraft] = useState<PropertyDetails>(EMPTY_DETAILS);
  const monthlyBudget = budget ?? 100 * units;
  // Review change: tenants invited on occupied doors (by door index): Edit next to "No tenant invited" opens a dialog for
  // their name and email, and Send invite emails them to join (prototype: nothing is sent)
  const [invitees, setInvitees] = useState<Record<number, Invitee>>({});
  const [inviting, setInviting] = useState<number | null>(null);
  const dropInvitees = (keep: (i: number) => boolean) =>
    setInvitees((all) => Object.fromEntries(Object.entries(all).filter(([i]) => keep(Number(i)))));
  const changeUnits = (n: number) => {
    setUnits(n);
    setDoors((d) => resizeDoors(d, n));
    dropInvitees((i) => i < n);
  };
  const changeTenancy = (i: number, v: DoorTenancy) => {
    setDoors((list) => list.map((x, j) => (j === i ? v : x)));
    if (v === 'vacant') dropInvitees((j) => j !== i);
  };
  // Review change: the account's plan (set on Account › Billing), not chosen here
  const plan = usePortfolioPlan();
  const [start, setStart] = useState<BillingStart>('next');
  /** Several at once: the CSV chosen (none at first) */
  const [csv, setCsv] = useState<{ name: string; size: number; rows: number } | null>(null);
  // Review change: Cancel is off until something is entered or changed (an address, units, occupied, plan, start, or a
  // file); Back to portfolio at the top always leaves
  const edited = address.trim() !== '' || units !== 2 || doors.some((d) => d !== 'vacant') || budget !== null || details !== EMPTY_DETAILS || start !== 'next' || csv !== null;

  /**
   * Review change: Save on Several at once imports the file without leaving the page: the upload box shows a 4-second
   * processing animation (three steps tick off), then the confirmation of what was read and imported replaces it.
   */
  const [importState, setImportState] = useState<ImportState>('idle');
  const [importStep, setImportStep] = useState(0);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const startImport = () => {
    setImportState('processing');
    setImportStep(0);
    timers.current = [
      ...IMPORT_STEPS.slice(1).map((_, i) => window.setTimeout(() => setImportStep(i + 1), ((i + 1) * IMPORT_MS) / IMPORT_STEPS.length)),
      window.setTimeout(() => setImportState('done'), IMPORT_MS),
    ];
  };
  const resetImport = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    setImportState('idle');
    setCsv(null);
  };
  /**
   * Review change: Fix this address opens a dialog (was a jump to One property): the address with a street number, its
   * units, plan and billing start (doors added vacant). Saving marks the row Fixed; it's counted as imported and added with the others.
   */
  const [fixes, setFixes] = useState<Record<string, ImportedHome>>({});
  const [fixing, setFixing] = useState<ImportedHome | null>(null);
  const homes = IMPORTED_HOMES.map((h) => fixes[h.address] ?? h);
  const imported = homes.filter((h) => !h.fix);
  const needFix = homes.length - imported.length;
  const fixAddress = (home: ImportedHome) => setFixing(home);
  const fixDialog = fixing && (
    <FormDialog
      title="Fix this address"
      description={`This row in ${csv?.name ?? 'your file'} has no street number (“${fixing.address}, ${fixing.city}”). Enter the full address and it’ll be added with the others.`}
      fields={[
        {
          key: 'address',
          label: 'Address',
          field: { kind: 'text', placeholder: 'e.g. 5901 W Bell Rd, Glendale, AZ 85308' },
          validate: (v) => (/^\s*\d+\s+\S/.test(v) ? undefined : 'Start with the street number, e.g. 5901 W Bell Rd.'),
        },
        { key: 'units', label: 'Units (doors)', field: { kind: 'select', options: ['1', '2', '3', '4', '5', '6'] } },
        // Review change: the fixed home's Billing starts, the same options as on One property (the plan is the account's,
        // set on Account › Billing, so there's no Plan question here any more)
        { key: 'start', label: 'Billing starts', field: { kind: 'select', options: START_OPTIONS.map((o) => o.label) } },
      ]}
      values={{ address: `${fixing.address}, ${fixing.city}, AZ`, units: String(fixing.units), start: labelOf(START_OPTIONS, fixing.start ?? start) }}
      submitLabel="Save address"
      countsAsEdit={false}
      onSave={(v) => {
        const { address: street, city } = splitAddress(v.address);
        setFixes((f) => ({
          ...f,
          [fixing.address]: {
            address: street,
            city: city || fixing.city,
            units: Number(v.units),
            // Review change: no Occupied now question here any more; the fixed home's doors are added vacant
            occupied: 'No',
            fixed: true,
            start: valueOf(START_OPTIONS, v.start) as BillingStart,
          },
        }));
        setFixing(null);
      }}
      onCancel={() => setFixing(null)}
    />
  );

  // Review change: the two ways to add are two cards side by side that work like tabs (were stacked radio cards).
  // Clicking one (or ←/→ between them) switches the content below and what Save adds; the selected card has the
  // selected fill and blue outline, no radio.
  const modeCards = (
    <div className="hc-c80-tabs" role="tablist" aria-label="How to add properties">
      {MODES.map((m, i) => {
        const selected = mode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            role="tab"
            id={`hc-c80-tab-${m.id}`}
            aria-selected={selected}
            aria-controls="hc-c80-panel"
            tabIndex={selected ? 0 : -1}
            className={['hc-c80-tab', selected && 'hc-c80-tab--selected'].filter(Boolean).join(' ')}
            onClick={() => setMode(m.id)}
            onKeyDown={(e) => {
              if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
              e.preventDefault();
              const next = MODES[(i + (e.key === 'ArrowRight' ? 1 : MODES.length - 1)) % MODES.length];
              setMode(next.id);
              document.getElementById(`hc-c80-tab-${next.id}`)?.focus();
            }}
          >
            <span className="hc-c80-tab__icon" aria-hidden>
              <Icon name={m.icon} size={20} />
            </span>
            <span className="hc-c80-tab__text">
              <span className="hc-medium-semibold">{m.title}</span>
              <span className="hc-small hc-muted hc-c80-tab__desc">{m.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );

  const oneForm = (
    <>
      <Input label="Address" placeholder="Street address, city, ZIP" value={address} onValueChange={setAddress} />
      {/* Review change: the doors count (portfolio doors plus these units) sits in the middle of the Units row (was after
          From next cycle) */}
      <div className="hc-c80-units">
        <NumberStepper title="Units (doors)" helper="Each rentable unit is one door" value={units} onValueChange={changeUnits} min={1} />
        <span className="hc-small hc-muted hc-c80-units__doors" aria-live="polite">
          {PORTFOLIO_DOORS + units} doors on your plan
        </span>
      </div>
      {/* Review change: this address's monthly maintenance budget (what the Portfolio's Spent of budget measures against).
          It follows the Units count ($100 a door) until one is picked */}
      <div className="hc-c80-row hc-c80-row--select">
        {/* Review change: a line under the label says how the budget splits across the units (updates as either changes) */}
        <span className="hc-c80-budget">
          <span className="hc-medium hc-muted">Monthly budget</span>
          <span className="hc-small hc-muted" aria-live="polite">
            {units === 1
              ? `The whole ${usdWhole(monthlyBudget)} goes to this unit each month.`
              : `Divided evenly across the ${units} units: ${perUnit(monthlyBudget, units)} a unit each month.`}
          </span>
        </span>
        <Select
          label="Monthly budget"
          hideLabel
          placeholder=""
          options={budgetOptions(monthlyBudget)}
          value={String(monthlyBudget)}
          onValueChange={(v) => setBudget(Number(v))}
          className="hc-c80-row__select"
        />
      </div>
      {/* Review change: Plan and From next cycle sit in this card (were only in the Summary); the next bill counts the
          portfolio's 9 doors plus this property's units */}
      {/* Review change: each on its own row, with a line under it like the questions */}
      {/* Review change: Plan and Billing starts (was From next cycle) are drop-downs; the note under them says what
          you'll pay for the choices */}
      {/* Review change: no Plan row here; the plan is the account's, set on Account › Billing (the note below still
          prices the doors on it) */}
      <div className="hc-c80-row hc-c80-row--select">
        <span className="hc-medium hc-muted">Billing starts</span>
        <Select label="Billing starts" hideLabel placeholder="" options={START_OPTIONS} value={start} onValueChange={(v) => setStart(v as BillingStart)} className="hc-c80-row__select" />
      </div>
      <Banner tone="info">{billingNote(plan, start, units)}</Banner>
    </>
  );

  /**
   * Review change: the doors get their own table under the form card (was inside it), built like the Portfolio table:
   * a Doors heading, the property's row (its address, a tenancy tag summing the doors), then one row per door that
   * follows the Units count, each with its tenancy drop-down (review change: no Status column; it only ever said New). The Occupied now toggle is gone.
   */
  const occupiedCount = doors.filter((d) => d === 'occupied').length;
  const doorsTable = (
    <section className="hc-c80-doors-section" aria-labelledby="hc-c80-doors-title">
      <h2 id="hc-c80-doors-title" className="hc-large-bold">
        Doors
      </h2>
      <div className="hc-c80-doors" role="table" aria-label="Doors">
        <div className="hc-c80-doors__row hc-c80-doors__row--head" role="row">
          <span role="columnheader">Property</span>
          <span role="columnheader">Tenancy</span>
        </div>
        <div className="hc-c80-doors__row" role="row">
          <span role="cell" className={hasAddress ? 'hc-c80-doors__address' : 'hc-c80-doors__address hc-muted'}>
            {hasAddress ? splitAddress(address).address : 'Enter an address above'}
          </span>
          <span role="cell">
            <StatusPill
              label={occupiedCount ? `${occupiedCount} occupied` : units === 1 ? 'Vacant' : `${units} vacant`}
              tone={occupiedCount ? 'warning' : 'neutral'}
            />
          </span>
        </div>
        {doors.map((d, i) => (
          <div key={i} className="hc-c80-doors__row hc-c80-doors__row--unit" role="row">
            <span role="cell" className="hc-c80-doors__unit">
              {/* Review change: with one unit there's no "Unit A", just its tenant line */}
              {units > 1 && <span className="hc-c80-doors__unit-name">Unit {doorName(i)}</span>}
              <span className="hc-c80-doors__unit-tenant">
                {d === 'occupied' ? (invitees[i] ? `${invitees[i].name} · invite sent` : 'No tenant invited') : 'No tenant'}
              </span>
              {/* Review change: an occupied door gets Edit, to add its tenant and email them an invite */}
              {d === 'occupied' && (
                // Review change: Edit is a small pill button (like the Month / Year chips), not a link
                <button type="button" className="hc-c80-doors__edit" onClick={() => setInviting(i)} aria-label={`Edit Unit ${doorName(i)} tenant`}>
                  <StatusPill label="Edit" tone="neutral" />
                </button>
              )}
            </span>
            <span role="cell">
              <Select
                label={`Unit ${doorName(i)} tenancy`}
                hideLabel
                placeholder=""
                options={TENANCY_OPTIONS}
                value={d}
                onValueChange={(v) => changeTenancy(i, v as DoorTenancy)}
                className="hc-c80-doors__select"
              />
            </span>
          </div>
        ))}
      </div>
      {inviting !== null && (
        <FormDialog
          title={units > 1 ? `Invite a tenant · Unit ${doorName(inviting)}` : 'Invite a tenant'}
          description={`${hasAddress ? splitAddress(address).address : 'This property'}${units > 1 ? `, Unit ${doorName(inviting)}` : ''}. They get an email to join HouseCue, where they can report problems and set when pros can come in.`}
          fields={[
            { key: 'name', label: 'Tenant name', field: { kind: 'text', placeholder: 'e.g. Jordan Reyes' } },
            {
              key: 'email',
              label: 'Email',
              field: { kind: 'email', placeholder: 'name@example.com' },
              validate: (v) => (isEmail(v) ? undefined : 'Enter an email like name@example.com.'),
            },
          ]}
          values={{ name: invitees[inviting]?.name ?? '', email: invitees[inviting]?.email ?? '' }}
          submitLabel={invitees[inviting] ? 'Resend invite' : 'Send invite'}
          countsAsEdit={false}
          extraAction={invitees[inviting] ? { label: 'Remove tenant', onClick: () => { dropInvitees((j) => j !== inviting); setInviting(null); } } : undefined}
          onSave={(v) => {
            setInvitees((all) => ({ ...all, [inviting]: { name: v.name.trim(), email: v.email.trim() } }));
            setInviting(null);
          }}
          onCancel={() => setInviting(null)}
        />
      )}
    </section>
  );

  // Review change: Several at once shows only this upload box for now. It starts empty; choosing or dropping a CSV shows
  // that file's name, size and row count (read from the file, header row not counted) and turns Save on; Replace file
  // empties it again
  const upload = (
    <Upload
      className="hc-c80-upload"
      state={csv ? 'done' : 'idle'}
      accept=".csv,.txt"
      hint="CSV with address and unit count"
      fileName={csv?.name}
      meta={csv ? `Uploaded · ${csv.rows} ${csv.rows === 1 ? 'row' : 'rows'} · ${Math.max(1, Math.round(csv.size / 1024))} KB` : undefined}
      onFiles={(files) => {
        const file = files[0];
        if (!file) return;
        file.text().then((text) => {
          const lines = text.split(/\r?\n/).filter((l) => l.trim()).length;
          setCsv({ name: file.name, size: file.size, rows: Math.max(0, lines - 1) });
        });
      }}
      onReplace={() => setCsv(null)}
    />
  );

  // Review change: the processing animation in place of the upload box (same blue dashed box): a spinner, the file
  // name and three steps that tick off over the 4 seconds
  const processing = (
    <div className="hc-c80-upload hc-c80-processing" role="status" aria-live="polite">
      <span className="hc-c80-spinner" aria-hidden />
      <p className="hc-medium-semibold">Importing {csv?.name ?? 'your file'}…</p>
      <ol className="hc-c80-steps">
        {IMPORT_STEPS.map((s, i) => (
          <li key={s} className={i < importStep ? 'is-done' : i === importStep ? 'is-current' : undefined}>
            <span className="hc-c80-steps__mark" aria-hidden>
              {i < importStep ? <Icon name="check" size={16} /> : null}
            </span>
            <span className="hc-small">{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );

  // Review change: the confirmation in place of the upload box: what was read and imported, the counts, each home
  // with its result, and Fix this address for the one that didn't import
  const confirmation = (
    <section className="hc-c80-import" aria-labelledby="hc-c80-import-title">
      <Banner tone="success" title={`Imported ${imported.length} of ${homes.length} properties`}>
        From {csv?.name ?? 'your file'}.{' '}
        {needFix ? `${needFix === 1 ? 'One address needs' : `${needFix} addresses need`} a fix before it can be added.` : 'Every address is ready to add.'}
      </Banner>
      <div className="hc-c80-import__counts">
        {[
          ['Rows read', homes.length],
          ['Imported', imported.length],
          ['Doors added', imported.reduce((t, h) => t + h.units, 0)],
          ['Needs a fix', needFix],
        ].map(([label, value]) => (
          <div key={label} className="hc-c80-card hc-c80-import__count">
            <span className="hc-small hc-muted">{label}</span>
            <span className="hc-h4">{value}</span>
          </div>
        ))}
      </div>
      <h2 id="hc-c80-import-title" className="hc-medium-semibold">
        What we read
      </h2>
      <ul className="hc-c80-import__list">
        {homes.map((h, i) => (
          <li key={i} className="hc-c80-import__row">
            <span className="hc-c80-import__home">
              <span className="hc-medium-semibold">{h.address}</span>
              <span className="hc-small hc-muted">
                {h.city} · {h.units} {h.units === 1 ? 'unit' : 'units'} · Occupied {h.occupied}
                {/* Review change: a fixed row shows the billing start chosen in the dialog */}
                {h.fixed && h.start && ` · billing starts ${h.start === 'today' ? 'today' : 'Dec 1'}`}
              </span>
            </span>
            {h.fix ? (
              <span className="hc-c80-import__result">
                <StatusPill label={`Needs a fix · ${h.fix}`} tone="warning" />
                <Button size="small" variant="secondary" onClick={() => fixAddress(h)}>
                  Fix this address
                </Button>
              </span>
            ) : (
              <StatusPill label={h.fixed ? 'Fixed · imported' : 'Imported'} tone="success" />
            )}
          </li>
        ))}
      </ul>
      {fixDialog}
    </section>
  );

  const severalContent = importState === 'processing' ? processing : importState === 'done' ? confirmation : upload;

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
        // Review change: the back arrow always goes to the Portfolio dashboard (was the previous journey step)
        header={{ title: 'Add property', onBack: toPortfolio }}
        bottom={
          mode === 'one' ? (
            <BottomActions primaryLabel="Confirm address" onPrimary={saveOne} primaryDisabled={!hasAddress} secondaryLabel="Add several at once" onSecondary={() => setMode('several')} />
          ) : importState === 'done' ? (
            // Review change: after the import, Add and go to portfolio / Upload another file
            <BottomActions primaryLabel="Add and go to portfolio" onPrimary={addImported} secondaryLabel="Upload another file" onSecondary={resetImport} />
          ) : (
            // Review change: Save imports the file here (waits for one; both buttons off while it processes)
            <BottomActions
              primaryLabel="Save"
              onPrimary={startImport}
              primaryDisabled={!csv || importState === 'processing'}
              secondaryLabel="Cancel"
              onSecondary={importState === 'processing' || !edited ? undefined : toPortfolio}
            />
          )
        }
      >
        {modeCards}
        {/* Review change: the content for the selected tab; it fades in when the tab changes */}
        <div key={mode} id="hc-c80-panel" role="tabpanel" aria-labelledby={`hc-c80-tab-${mode}`} className="hc-c80-panel">
        {/* Review change: Several at once shows only the CSV upload box while its flow is worked out (the matched-address
            list and table are still defined above for when it comes back) */}
        {mode === 'one' ? (
          <>
            {oneForm}
            {doorsTable}
            <PropertyDetailsEditor value={details} onChange={setDetailsDraft} address={hasAddress ? splitAddress(address).address : ''} />
          </>
        ) : (
          severalContent
        )}
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell role="landlord" nav="portfolio">
      <div className="hc-c80-web">
        {/* Review change: a Back to portfolio button always at the top, like Back to plan on the Plan sub-pages */}
        <PageBackButton label="Back to portfolio" onClick={toPortfolio} />
        <header className="hc-c80-web__head">
          <ConsoleBreadcrumb homeTo={screenPath('C79')} homeLabel="Portfolio" parent="Portfolio" parentTo={screenPath('C79')} current="Add property" />
          <h1 className="hc-h2">Add property</h1>
          <p className="hc-medium hc-muted">
            One at a time, or paste a list / upload a CSV with address and unit count. Each address gets a short confirm step.
          </p>
        </header>
        <div className="hc-c80-web__cols">
          <div className="hc-c80-web__main">
            {modeCards}
            {/* Review change: the content for the selected tab; it fades in when the tab changes */}
            <div key={mode} id="hc-c80-panel" role="tabpanel" aria-labelledby={`hc-c80-tab-${mode}`} className="hc-c80-panel">
              {/* Review change: Several at once shows only the CSV upload box while its flow is worked out (table kept above) */}
              {/* Review change: Address, Units, Plan and Billing starts in one card, the Doors table in its own under it */}
              {mode === 'one' ? (
                <>
                  <section className="hc-c80-card hc-c80-card--form">{oneForm}</section>
                  {doorsTable}
                  <PropertyDetailsEditor value={details} onChange={setDetailsDraft} address={hasAddress ? splitAddress(address).address : ''} />
                </>
              ) : (
                severalContent
              )}
            </div>
          </div>
          <aside className="hc-c80-web__side">
            {/* Review change: the Summary card is gone; Save and Cancel sit here instead. Save adds what's on the selected
                tab (One property: needs an address); Cancel goes back to the Portfolio without saving. */}
            {/* Review change: the two buttons hug their labels, side by side: Cancel then Save, like the app's dialogs */}
            <div className="hc-c80-actions">
              {mode === 'several' && importState === 'done' ? (
                // Review change: after an import, Upload another file / Add and go to portfolio
                <>
                  <Button variant="secondary" onClick={resetImport}>
                    Upload another file
                  </Button>
                  <Button onClick={addImported}>Add and go to portfolio</Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" onClick={toPortfolio} disabled={!edited || (importState === 'processing' && mode === 'several')}>
                    Cancel
                  </Button>
                  {/* Review change: on Several at once, Save imports the file here (processing, then the confirmation) */}
                  <Button
                    onClick={mode === 'several' ? startImport : saveOne}
                    disabled={mode === 'several' ? !csv || importState === 'processing' : !hasAddress}
                  >
                    Save
                  </Button>
                </>
              )}
            </div>
            {/* Review change: the "Address already in HouseCue?" note under the buttons is removed */}
          </aside>
        </div>
      </div>
      <AgentFab size="extended" to={screenPath('C09')} className="hc-c80-fab" />
    </WebShell>
  );
}
