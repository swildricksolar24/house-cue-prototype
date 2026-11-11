import { useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { ImagePlaceholder } from '../../../components/ImagePlaceholder/ImagePlaceholder';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C60-inspection-import.css';

const FILTERS = ['Items · 18', 'Defects · 4', 'Safety · 2'];

const FINDINGS = [
  { id: 'wh', title: 'Water heater: sediment noise', type: 'Defect', becomes: 'Task on your calendar' },
  { id: 'roof', title: 'Roof: lifted shingles', type: 'Defect', becomes: 'Quote request' },
  { id: 'gfci', title: 'No GFCI near kitchen sink', type: 'Safety', becomes: 'Quote request' },
  { id: 'dryer', title: 'Dryer vent lint build-up', type: 'Defect', becomes: 'Task' },
];

const tone = (type: string) => (type === 'Safety' ? 'danger' : 'warning') as 'danger' | 'warning';

/** C60 Inspection import review — Figma mobile 215:13645 (batch 211:38888), web 215:17184 (batch 211:38889). J1 Onboarding step 23. */
export default function InspectionImport(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [filter, setFilter] = useState(device === 'mobile' ? FILTERS[2] : FILTERS[1]);
  const [decided, setDecided] = useState<Record<string, 'kept' | 'ignored'>>({});

  const chips = (
    <div className="hc-c60-chips" role="radiogroup" aria-label="Show">
      {FILTERS.map((f) => (
        <button
          key={f}
          type="button"
          role="radio"
          aria-checked={filter === f}
          className={['hc-c60-chip', filter === f && 'hc-c60-chip--selected'].filter(Boolean).join(' ')}
          onClick={() => setFilter(f)}
        >
          {f}
        </button>
      ))}
    </div>
  );

  if (device === 'mobile') {
    const gfci = FINDINGS[2];
    return (
      <MobileShell header={{ title: 'Your inspection' }} bottom={<BottomActions primaryLabel="Add 10 items · 6 findings" onPrimary={flow.goNext} />}>
        <div className="hc-c60-content">
          {chips}
          <article className="hc-c60-card">
            <div className="hc-c60-card__row">
              <h2 className="hc-large-bold">{gfci.title}</h2>
              <StatusPill label={gfci.type} tone={tone(gfci.type)} />
            </div>
            <ImagePlaceholder label="Inspector photo" height={90} />
            {decided[gfci.id] ? (
              <StatusPill label={decided[gfci.id] === 'kept' ? 'Kept' : 'Ignored'} tone={decided[gfci.id] === 'kept' ? 'success' : 'neutral'} />
            ) : (
              <div className="hc-c60-card__actions">
                <Button onClick={() => setDecided((d) => ({ ...d, [gfci.id]: 'kept' }))}>Keep</Button>
                <Button variant="secondary">Edit</Button>
                <Button variant="secondary" onClick={() => setDecided((d) => ({ ...d, [gfci.id]: 'ignored' }))}>
                  Ignore
                </Button>
              </div>
            )}
          </article>
          <Banner tone="warning">Free keeps 10 items per home. Pick which 10, or become a member to keep all 18.</Banner>
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="home">
      <div className="hc-c60-web">
        <header className="hc-c60-web__head">
          <div>
            <h1 className="hc-h2">Review your inspection</h1>
            <p className="hc-medium hc-muted">From Desert Home Inspections · Oct 30, 2026</p>
          </div>
          <Button onClick={flow.goNext}>Add to my home</Button>
        </header>
        {chips}
        <div className="hc-c60-table" role="table" aria-label="Findings">
          <div className="hc-c60-table__head" role="row">
            {['Finding', 'Type', 'Becomes', 'Action'].map((h) => (
              <span key={h} role="columnheader">
                {h}
              </span>
            ))}
          </div>
          {FINDINGS.map((f) => (
            <div key={f.id} className="hc-c60-table__row" role="row">
              <span role="cell" className="hc-medium-semibold">
                {f.title}
              </span>
              <span role="cell">
                <StatusPill label={f.type} tone={tone(f.type)} />
              </span>
              <span role="cell">{f.becomes}</span>
              <span role="cell">
                {decided[f.id] ? (
                  <StatusPill label="Kept" tone="success" />
                ) : (
                  <Button variant="secondary" onClick={() => setDecided((d) => ({ ...d, [f.id]: 'kept' }))}>
                    Keep
                  </Button>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </WebShell>
  );
}
