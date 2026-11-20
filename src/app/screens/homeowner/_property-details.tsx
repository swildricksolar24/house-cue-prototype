import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '../../../components/Button/Button';
import { Icon } from '../../../components/Icon/Icon';
import { ImagePlaceholder } from '../../../components/ImagePlaceholder/ImagePlaceholder';
import { Input } from '../../../components/Input/Input';
import { NumberStepper } from '../../../components/NumberStepper/NumberStepper';
import { Select } from '../../../components/Select/Select';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import type { ApplianceItem, JobItem, PropertyDetails, VendorItem } from '../../prototype/portfolio';
import './_property-details.css';

/**
 * Review change: the Property details section (Add property, under Doors; a property's page). More about the home, in
 * groups that open and close: Map, Building, Systems, Utilities & access, Appliances, Job history, Vendors. An import
 * bar fills them: Look up public records (year built, roof, foundation, sewer, pool, gas, solar) and Upload a document
 * (an inspection report: HVAC, AC units, electric provider, appliances); Job history can import a CSV. Imported fields
 * show a "From records" / "From document" tag until edited. Everything stays editable. Prototype only: the lookups and
 * file reading are invented, nothing leaves the page, and the map is a placeholder (a real one needs a Google Maps key).
 */

const opts = (list: string[]) => list.map((v) => ({ value: v, label: v }));
const ROOF = opts(['Asphalt shingle', 'Tile', 'Foam (flat)', 'Metal', 'Other']);
const FOUNDATION = opts(['Slab', 'Crawl space', 'Basement']);
const SEWER = opts(['City sewer', 'Septic tank']);
const HVAC = opts(['Central air', 'Heat pump', 'Evaporative cooler', 'Mini-split', 'None']);
const YES_NO = opts(['Yes', 'No']);
const SOLAR = opts(['None', 'Owned', 'Leased']);
const POOL = opts(['None', 'In-ground', 'Above-ground', 'Spa only']);
const ELECTRIC = opts(['APS', 'SRP', 'TEP', 'Other']);
const INTERNET = opts(['Cox', 'Quantum Fiber', 'Xfinity', 'Other']);

/** What the invented public-records lookup returns */
const RECORDS: Partial<PropertyDetails> = { yearBuilt: '1978', roof: 'Tile', foundation: 'Slab', sewer: 'City sewer', pool: 'None', gas: 'Yes', solar: 'None' };
/** What the invented inspection report contains */
const DOCUMENT: Partial<PropertyDetails> = {
  hvac: 'Central air',
  acUnits: 2,
  electric: 'APS',
  appliances: [
    { id: 'doc-fridge', name: 'Refrigerator', brand: 'Whirlpool', age: '6 years' },
    { id: 'doc-dish', name: 'Dishwasher', brand: 'Bosch', age: '3 years' },
    { id: 'doc-wh', name: 'Water heater (50 gal)', brand: 'Rheem', age: '9 years' },
    { id: 'doc-range', name: 'Range', brand: 'GE', age: '7 years' },
  ],
};
/** What the invented job-history CSV contains */
const JOB_FILE: JobItem[] = [
  { id: 'csv-1', date: 'Mar 2025', job: 'HVAC tune-up', vendor: 'Desert Air Co.', cost: '$129' },
  { id: 'csv-2', date: 'Aug 2024', job: 'Water heater flush', vendor: 'Sonoran Plumbing Co.', cost: '$95' },
  { id: 'csv-3', date: 'Jan 2024', job: 'Roof inspection', vendor: 'Desert Roof Co.', cost: '$150' },
];
const TRADES: Record<string, string> = { 'Desert Air Co.': 'HVAC', 'Sonoran Plumbing Co.': 'Plumbing', 'Desert Roof Co.': 'Roofing' };
const newId = () => `i-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
const FROM_LABEL = { records: 'From records', document: 'From document', file: 'From file' } as const;

type Busy = 'records' | 'document' | null;

export function PropertyDetailsEditor({
  value: d,
  onChange,
  address,
  defaultOpen = [],
  inCard = false,
}: {
  value: PropertyDetails;
  onChange: (next: PropertyDetails) => void;
  /** The address the map shows (empty until one is entered) */
  address: string;
  /** Groups open at first */
  defaultOpen?: string[];
  /** Review change: inside a card that has its own "Property details" title (the property page), so no heading here */
  inCard?: boolean;
}) {
  const [open, setOpen] = useState<string[]>(defaultOpen);
  const [busy, setBusy] = useState<Busy>(null);
  const [note, setNote] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // A field edited by hand loses its import tag
  const set = <K extends keyof PropertyDetails>(key: K, v: PropertyDetails[K]) => {
    const { [key as string]: _, ...from } = d.from;
    onChange({ ...d, [key]: v, from });
  };
  const fill = (data: Partial<PropertyDetails>, source: 'records' | 'document', keys: string[]) => {
    const from = { ...d.from };
    keys.forEach((k) => (from[k] = source));
    onChange({ ...d, ...data, from });
  };
  const toggle = (id: string) => setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));

  const lookUp = () => {
    setBusy('records');
    setNote(null);
    timer.current = window.setTimeout(() => {
      fill(RECORDS, 'records', Object.keys(RECORDS));
      setOpen((o) => [...new Set([...o, 'building', 'systems'])]);
      setNote('Found the county record: year built, roof, foundation, sewer, pool, gas and solar filled in. Check them below.');
      setBusy(null);
    }, 1500);
  };
  const readDocument = (fileName: string) => {
    setBusy('document');
    setNote(null);
    timer.current = window.setTimeout(() => {
      fill(
        { ...DOCUMENT, appliances: [...d.appliances, ...(DOCUMENT.appliances ?? []).filter((a) => !d.appliances.some((x) => x.id === a.id))] },
        'document',
        ['hvac', 'acUnits', 'electric', 'appliances'],
      );
      setOpen((o) => [...new Set([...o, 'systems', 'utilities', 'appliances'])]);
      setNote(`Read ${fileName}: HVAC, AC units, electric provider and 4 appliances filled in.`);
      setBusy(null);
    }, 1500);
  };

  // Labels with their import tag
  const label = (text: string, key: string) =>
    d.from[key] ? (
      <span className="hc-pd__label">
        {text}
        <StatusPill label={FROM_LABEL[d.from[key]]} tone="info" />
      </span>
    ) : (
      text
    );
  const select = (key: keyof PropertyDetails, text: string, options: { value: string; label: string }[]) => (
    <Select label={label(text, key)} placeholder="Choose…" options={options} value={d[key] as string} onValueChange={(v) => set(key, v as never)} />
  );

  // Rows of a list (appliances, jobs, vendors)
  const listEditor = <T extends { id: string }>(
    key: 'appliances' | 'jobs' | 'vendors',
    items: T[],
    columns: { field: keyof T & string; label: string; placeholder: string }[],
    blank: () => T,
    addLabel: string,
    extra?: ReactNode,
  ) => (
    <div className="hc-pd__list">
      {items.length > 0 && (
        <div className="hc-pd__rows" role="table" aria-label={key}>
          {items.map((item, i) => (
            <div key={item.id} className="hc-pd__row" role="row" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr)) auto` }}>
              {columns.map((c) => (
                <Input
                  key={c.field}
                  label={c.label}
                  hideLabel={i > 0}
                  placeholder={c.placeholder}
                  value={String(item[c.field] ?? '')}
                  onValueChange={(v) => set(key, items.map((x) => (x.id === item.id ? { ...x, [c.field]: v } : x)) as never)}
                />
              ))}
              <button type="button" className="hc-pd__remove" aria-label={`Remove ${String(item[columns[0].field]) || 'row'}`} onClick={() => set(key, items.filter((x) => x.id !== item.id) as never)}>
                <Icon name="delete" size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="hc-pd__list-actions">
        <Button size="small" variant="secondary" onClick={() => set(key, [...items, blank()] as never)}>
          {addLabel}
        </Button>
        {extra}
      </div>
    </div>
  );

  // Vendors named in Job history that aren't in Vendors yet
  const suggested = [...new Set(d.jobs.map((j) => j.vendor.trim()).filter(Boolean))].filter((v) => !d.vendors.some((x) => x.name.trim().toLowerCase() === v.toLowerCase()));

  const filled = (keys: (keyof PropertyDetails)[]) => keys.filter((k) => (k === 'acUnits' ? d.acUnits > 0 : String(d[k] ?? '').trim() !== '')).length;
  const groups: { id: string; title: string; summary: string; body: ReactNode }[] = [
    {
      id: 'map',
      title: 'Map',
      summary: address ? 'From the address' : 'Needs an address',
      body: address ? (
        <div className="hc-pd__maps">
          <ImagePlaceholder label={`Map · ${address}`} height={180} />
          <ImagePlaceholder label={`Street view · ${address}`} height={180} />
        </div>
      ) : (
        <p className="hc-medium hc-muted">Enter an address above to see the map and street view.</p>
      ),
    },
    {
      id: 'building',
      title: 'Building',
      summary: `${filled(['yearBuilt', 'roof', 'foundation', 'sewer'])} of 4`,
      body: (
        <div className="hc-pd__grid">
          <Input label={label('Year built', 'yearBuilt')} inputMode="numeric" maxLength={4} placeholder="e.g. 1985" value={d.yearBuilt} onValueChange={(v) => set('yearBuilt', v)} />
          {select('roof', 'Roof type', ROOF)}
          {select('foundation', 'Foundation', FOUNDATION)}
          {select('sewer', 'Septic tank', SEWER)}
        </div>
      ),
    },
    {
      id: 'systems',
      title: 'Systems',
      summary: `${filled(['hvac', 'acUnits', 'gas', 'solar', 'pool'])} of 5`,
      body: (
        <div className="hc-pd__grid">
          {select('hvac', 'HVAC', HVAC)}
          <div className="hc-pd__stepper">
            <NumberStepper title={label('AC units', 'acUnits')} helper="Outdoor condensers" value={d.acUnits} onValueChange={(v) => set('acUnits', v)} min={0} max={10} />
          </div>
          {select('gas', 'Gas line', YES_NO)}
          {select('solar', 'Solar', SOLAR)}
          {select('pool', 'Pool', POOL)}
        </div>
      ),
    },
    {
      id: 'utilities',
      title: 'Utilities & access',
      summary: `${filled(['electric', 'internet', 'gate'])} of 3`,
      body: (
        <div className="hc-pd__grid">
          {select('electric', 'Electric provider', ELECTRIC)}
          {select('internet', 'Internet / cable provider', INTERNET)}
          <Input label="Gate access (optional)" placeholder="Gate code or how to get in" value={d.gate} onValueChange={(v) => set('gate', v)} />
        </div>
      ),
    },
    {
      id: 'appliances',
      title: 'Appliances',
      summary: d.appliances.length ? `${d.appliances.length} listed` : 'None yet',
      body: (
        <>
          {d.from.appliances && <StatusPill label={FROM_LABEL[d.from.appliances]} tone="info" />}
          {listEditor<ApplianceItem>(
            'appliances',
            d.appliances,
            [
              { field: 'name', label: 'Appliance', placeholder: 'e.g. Refrigerator' },
              { field: 'brand', label: 'Brand', placeholder: 'e.g. Whirlpool' },
              { field: 'age', label: 'Age', placeholder: 'e.g. 6 years' },
            ],
            () => ({ id: newId(), name: '', brand: '', age: '' }),
            'Add appliance',
          )}
        </>
      ),
    },
    {
      id: 'jobs',
      title: 'Job history',
      summary: d.jobs.length ? `${d.jobs.length} ${d.jobs.length === 1 ? 'job' : 'jobs'}` : 'None yet',
      body: listEditor<JobItem>(
        'jobs',
        d.jobs,
        [
          { field: 'date', label: 'When', placeholder: 'e.g. Mar 2025' },
          { field: 'job', label: 'Job', placeholder: 'e.g. HVAC tune-up' },
          { field: 'vendor', label: 'Vendor', placeholder: 'e.g. Desert Air Co.' },
          { field: 'cost', label: 'Cost', placeholder: 'e.g. $129' },
        ],
        () => ({ id: newId(), date: '', job: '', vendor: '', cost: '' }),
        'Add job',
        <Button
          size="small"
          variant="secondary"
          onClick={() => {
            const fresh = JOB_FILE.filter((j) => !d.jobs.some((x) => x.id === j.id));
            onChange({ ...d, jobs: [...d.jobs, ...fresh] });
            setNote(`Imported ${fresh.length} jobs from job-history.csv.`);
          }}
        >
          Import a CSV
        </Button>,
      ),
    },
    {
      id: 'vendors',
      title: 'Vendors',
      summary: d.vendors.length ? `${d.vendors.length} listed` : suggested.length ? `${suggested.length} suggested` : 'None yet',
      body: (
        <>
          {suggested.length > 0 && (
            <div className="hc-pd__suggest">
              <span className="hc-small hc-muted">From job history:</span>
              {suggested.map((v) => (
                <button key={v} type="button" className="hc-pd__chip" onClick={() => onChange({ ...d, vendors: [...d.vendors, { id: newId(), name: v, trade: TRADES[v] ?? '', phone: '' }] })}>
                  <StatusPill label={`+ ${v}`} tone="neutral" />
                </button>
              ))}
            </div>
          )}
          {listEditor<VendorItem>(
            'vendors',
            d.vendors,
            [
              { field: 'name', label: 'Vendor', placeholder: 'e.g. Desert Air Co.' },
              { field: 'trade', label: 'Trade', placeholder: 'e.g. HVAC' },
              { field: 'phone', label: 'Phone', placeholder: '(602) 555-0142' },
            ],
            () => ({ id: newId(), name: '', trade: '', phone: '' }),
            'Add vendor',
          )}
        </>
      ),
    },
  ];

  return (
    <section className="hc-pd" aria-labelledby={inCard ? undefined : 'hc-pd-title'} aria-label={inCard ? 'Property details' : undefined}>
      <div className="hc-pd__head">
        {!inCard && (
          <h2 id="hc-pd-title" className="hc-large-bold">
            Property details <span className="hc-small hc-muted hc-pd__optional">Optional</span>
          </h2>
        )}
        <p className="hc-small hc-muted">Import what’s on record or in a document, then check it. Your agent uses these to plan maintenance and brief pros.</p>
      </div>
      {/* Import bar */}
      <div className="hc-pd__import">
        <Button size="small" variant="secondary" onClick={lookUp} disabled={!!busy || !address} loading={busy === 'records'}>
          Look up public records
        </Button>
        <Button size="small" variant="secondary" onClick={() => fileInput.current?.click()} disabled={!!busy} loading={busy === 'document'}>
          Upload a document
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.png"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) readDocument(file.name);
            e.target.value = '';
          }}
        />
        <span className="hc-small hc-muted" aria-live="polite">
          {busy === 'records' ? 'Searching county records…' : busy === 'document' ? 'Reading the document…' : !address ? 'Enter an address to look up records.' : 'Inspection report or seller disclosure'}
        </span>
      </div>
      {note && <p className="hc-small hc-pd__note" role="status">{note}</p>}
      <div className="hc-pd__groups">
        {groups.map((g) => {
          const isOpen = open.includes(g.id);
          return (
            <div key={g.id} className={isOpen ? 'hc-pd__group is-open' : 'hc-pd__group'}>
              <button type="button" className="hc-pd__group-head" aria-expanded={isOpen} aria-controls={`hc-pd-${g.id}`} onClick={() => toggle(g.id)}>
                <span className="hc-medium-semibold">{g.title}</span>
                <span className="hc-small hc-muted hc-pd__summary">{g.summary}</span>
                <span className="hc-pd__chevron" aria-hidden />
              </button>
              {isOpen && (
                <div id={`hc-pd-${g.id}`} className="hc-pd__group-body">
                  {g.body}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

