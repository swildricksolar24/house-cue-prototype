import { useState } from 'react';
import { Button } from '../../../components/Button/Button';
import { Input } from '../../../components/Input/Input';
import { TaskRow } from '../../../components/TaskRow/TaskRow';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C71-replacement-budget.css';

type Item = { id: string; name: string; year: string; cost: string; age: string; mobileMeta?: string };

const ITEMS: Item[] = [
  { id: 'water-heater', name: 'Water heater', year: '2028', cost: '$1,650', age: '9 of 12 yrs', mobileMeta: '$1,650 est. · age 9 of 12 years' },
  { id: 'ac', name: 'AC condenser', year: '2029', cost: '$6,200', age: '11 of 15 yrs', mobileMeta: '$6,200 est. · age 11 of 15 years' },
  { id: 'roof', name: 'Roof coating', year: '2031', cost: '$2,400', age: '5 of 10 yrs', mobileMeta: '$2,400 est. · last done 2021' },
  { id: 'dishwasher', name: 'Dishwasher', year: '2032', cost: '$900', age: '4 of 10 yrs' },
];

const STATS = [
  { label: 'Monthly target', value: '$118' },
  { label: 'Next 5 years', value: '$7,050' },
];

/**
 * C71 Replacement budget — Figma mobile 216:15974 (batch 211:56277), web 216:18076 (batch 211:56278).
 * J1 Home record & maintenance step 10. No Empty/Loading/Error frames are drawn for this screen.
 * Mobile "Adjust assumptions" opens the web Assumptions card inline; its Save is the primary CTA (next step).
 */
export default function ReplacementBudget(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [lifespan, setLifespan] = useState('15 years');
  const [saved, setSaved] = useState('$1,200');
  const [showAssumptions, setShowAssumptions] = useState(false);

  const stats = (
    <div className="hc-c71-stats">
      {STATS.map((s) => (
        <div key={s.label} className="hc-c71-stat">
          <span className="hc-small hc-muted">{s.label}</span>
          <span className="hc-large-bold">{s.value}</span>
        </div>
      ))}
    </div>
  );

  const assumptions = (
    <section className="hc-c71-card" aria-label="Assumptions">
      <h2 className="hc-large-bold">Assumptions</h2>
      <Input label="AC condenser lifespan" type="number" value={lifespan} onValueChange={setLifespan} />
      <Input label="Already saved" type="number" value={saved} onValueChange={setSaved} />
      <p className="hc-small hc-muted">Lifespans from the Care Library; costs from local fair-price data.</p>
      <div className="hc-c71-actions">
        <Button onClick={flow.goNext}>Save</Button>
      </div>
    </section>
  );

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Replacement budget' }} tab="home" background="page">
        <div className="hc-c71-content">
          {stats}
          {ITEMS.filter((i) => i.mobileMeta).map((i) => (
            <TaskRow key={i.id} title={`${i.name} · ${i.year}`} meta={i.mobileMeta} tag="DIY" />
          ))}
          <button
            type="button"
            className="hc-c71-link"
            aria-expanded={showAssumptions}
            onClick={() => setShowAssumptions((s) => !s)}
          >
            Adjust assumptions
          </button>
          {showAssumptions && assumptions}
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="home">
      <div className="hc-c71-web">
        <header className="hc-c71-web__head">
          <h1 className="hc-h2">Replacement budget</h1>
          <p className="hc-medium hc-muted">When big items are due and what to set aside each month</p>
        </header>
        <div className="hc-c71-web__cols">
          <div className="hc-c71-web__main">
            <table className="hc-c71-table">
              <thead>
                <tr>
                  <th scope="col">Item</th>
                  <th scope="col">Replace in</th>
                  <th scope="col">Est. cost</th>
                  <th scope="col">Age</th>
                </tr>
              </thead>
              <tbody>
                {ITEMS.map((i) => (
                  <tr key={i.id}>
                    <th scope="row">{i.name}</th>
                    <td>{i.year}</td>
                    <td>{i.cost}</td>
                    <td>{i.age}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <aside className="hc-c71-web__side">
            {stats}
            {assumptions}
          </aside>
        </div>
      </div>
    </WebShell>
  );
}
