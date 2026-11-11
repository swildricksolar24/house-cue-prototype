import { useState } from 'react';
import { Button } from '../../../components/Button/Button';
import { Input } from '../../../components/Input/Input';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';
import { StateBlock } from '../../../components/StateBlock/StateBlock';
import { TaskRow, type TaskRowTagTone } from '../../../components/TaskRow/TaskRow';
import { Upload } from '../../../components/Upload/Upload';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C24-document-vault.css';

type Doc = { id: string; title: string; meta: string; webMeta: string; tag: string; tone: TaskRowTagTone | 'neutral'; mobile: boolean };

/** Invented sample docs from the Figma frames */
const DOCS: Doc[] = [
  { id: 'manual', title: 'Trane XR14 owner’s manual', meta: 'AC / heat pump · from email', webMeta: 'AC / heat pump · from email · Mar 2023', tag: 'Manual', tone: 'info', mobile: true },
  { id: 'wh-receipt', title: 'Water heater receipt', meta: '$1,240 · Jun 4, 2020', webMeta: 'Water heater · $1,240 · Jun 4, 2020', tag: 'Receipt', tone: 'success', mobile: true },
  { id: 'wh-warranty', title: 'Rheem water heater warranty', meta: '', webMeta: 'Water heater · ends Jun 2026', tag: 'Warranty', tone: 'success', mobile: false },
  { id: 'permit', title: 'Pool barrier permit', meta: 'City of Phoenix · 2019', webMeta: 'City of Phoenix · 2019', tag: 'Permit', tone: 'neutral', mobile: true },
  { id: 'ac-invoice', title: 'AC tune-up invoice', meta: '', webMeta: 'Zephyrline HVAC · $149 · Mar 12, 2025', tag: 'Invoice', tone: 'info', mobile: false },
  { id: 'inspection', title: 'Home inspection report', meta: 'Mar 2023 · 42 pages', webMeta: 'Whole home · Mar 2023 · 42 pages', tag: 'Inspection', tone: 'warning', mobile: true },
];

const MOBILE_FILTERS = ['All', 'Receipts', 'Manuals', 'Warranties'];
const WEB_FILTERS = [...MOBILE_FILTERS, 'Permits', 'Invoices'];

/** "Receipts" → "Receipt" to match a document tag */
const matches = (filter: string, d: Doc) => filter === 'All' || d.tag === filter.replace(/s$/, '');

/**
 * C24 Document vault — Figma mobile 215:12885 (batch 211:6296), web 215:15893 (batch 211:6297).
 * States: Empty 110:5156, Loading 110:5253, Error 110:5360 (+ web 110:5457/5592/5737). J1 Onboarding step 15.
 */
export default function DocumentVault(_: ScreenProps) {
  const { device, screenState } = usePrototype();
  const flow = useFlow();
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');

  const state =
    screenState === 'empty' ? (
      <StateBlock title="No documents yet" body="Add receipts, manuals and warranties, or import them from email." actionLabel="Add a document" onAction={flow.goNext} />
    ) : screenState === 'error' ? (
      <StateBlock kind="error" title="Couldn’t load your documents" body="Check your connection and try again. Nothing was lost." actionLabel="Try again" />
    ) : screenState === 'loading' ? (
      <>
        <SkeletonCard label="Loading documents" />
        <SkeletonCard label="Loading documents" />
        <SkeletonCard label="Loading documents" />
      </>
    ) : null;

  const search = <Input label="Search documents" hideLabel type="search" placeholder="Search documents" value={query} onValueChange={setQuery} />;

  const chips = (filters: string[]) => (
    <div className="hc-c24-chips" role="radiogroup" aria-label="Document type">
      {filters.map((f) => (
        <button
          key={f}
          type="button"
          role="radio"
          aria-checked={filter === f}
          className={['hc-c24-chip', filter === f && 'hc-c24-chip--selected'].filter(Boolean).join(' ')}
          onClick={() => setFilter(f)}
        >
          {f}
        </button>
      ))}
    </div>
  );

  const rows = (docs: Doc[], web: boolean) =>
    docs
      .filter((d) => matches(filter, d) && d.title.toLowerCase().includes(query.trim().toLowerCase()))
      .map((d) => (
        <TaskRow
          key={d.id}
          title={d.title}
          meta={web ? d.webMeta : d.meta}
          icon="document"
          tag={d.tag}
          // TaskRow has no neutral tag tone; a scoped rule in the screen CSS styles it (reported as a gap)
          tagTone={d.tone as TaskRowTagTone}
        />
      ));

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Documents' }} tab="home" className="hc-c24">
        {search}
        {chips(MOBILE_FILTERS)}
        {state ?? <div>{rows(DOCS.filter((d) => d.mobile), false)}</div>}
        <Button fullWidth onClick={flow.goNext}>
          Add a document
        </Button>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="home" className="hc-c24">
      <div className="hc-c24-web">
        <div className="hc-c24-web__head">
          <h1 className="hc-h2">Documents</h1>
          <Button variant="secondary" onClick={() => flow.go('C44')}>
            Import from email
          </Button>
          <Button onClick={flow.goNext}>Upload</Button>
        </div>
        <div className="hc-c24-web__filters">
          <div className="hc-c24-web__search">{search}</div>
          {chips(WEB_FILTERS)}
        </div>
        <div className="hc-c24-web__cols">
          <section className="hc-c24-card hc-c24-card--list">{state ?? rows(DOCS, true)}</section>
          <aside className="hc-c24-web__side">
            <section className="hc-c24-card">
              <h2 className="hc-large-bold">Add documents</h2>
              <Upload onFiles={flow.goNext} />
              <p className="hc-small hc-muted">
                Or take a photo in the app, or forward receipts to your HouseCue import address (set up in Settings).
              </p>
            </section>
          </aside>
        </div>
      </div>
    </WebShell>
  );
}
