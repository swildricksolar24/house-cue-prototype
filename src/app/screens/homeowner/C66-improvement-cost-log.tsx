import { useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { MetricRow } from '../../../components/MetricRow/MetricRow';
import { TaskRow } from '../../../components/TaskRow/TaskRow';
import { currentHome } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C66-improvement-cost-log.css';

type Improvement = { id: string; name: string; date: string; cost: string; proof: string; mobileMeta?: string };

const IMPROVEMENTS: Improvement[] = [
  {
    id: 'ac',
    name: 'New AC condenser',
    date: 'Jun 2026',
    cost: '$6,200',
    proof: 'Receipt · permit',
    mobileMeta: '$6,200 · Desert Air · permit P-24-1182',
  },
  { id: 'counters', name: 'Kitchen counters', date: 'Feb 2025', cost: '$4,800', proof: 'Receipt', mobileMeta: '$4,800 · receipt attached' },
  { id: 'water-heater', name: 'Water heater', date: 'Aug 2024', cost: '$1,650', proof: 'No receipt', mobileMeta: '$1,650 · no receipt' },
  { id: 'patio', name: 'Patio cover', date: 'May 2023', cost: '$5,800', proof: 'Receipt · permit' },
];

type Choice = 'improvement' | 'repair';

/**
 * C66 Improvement cost log — Figma mobile 216:16130 (batch 211:54170), web 216:18227 (batch 211:54171).
 * J1 Home record & maintenance step 11. No Empty/Loading/Error frames are drawn for this screen.
 * "Improvement or repair?" is a two-way choice (the picked one shows as primary); web "Add improvement" is the
 * primary CTA (next step). Mobile has no single CTA, so the prototype bar moves on.
 */
export default function ImprovementCostLog(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [choice, setChoice] = useState<Choice>('improvement');

  const choiceButtons = (full: boolean) => (
    <div className="hc-c66-actions" role="group" aria-label="Improvement or repair?">
      {(['improvement', 'repair'] as const).map((c) => (
        <Button
          key={c}
          variant={choice === c ? 'primary' : 'secondary'}
          aria-pressed={choice === c}
          fullWidth={full}
          onClick={() => setChoice(c)}
        >
          {c === 'improvement' ? 'Improvement' : 'Repair'}
        </Button>
      ))}
    </div>
  );

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Improvement cost log' }} tab="home" background="page">
        <div className="hc-c66-content">
          <div className="hc-c66-stats">
            <div className="hc-c66-stat">
              <span className="hc-small hc-muted">All improvements</span>
              <span className="hc-large-bold">$18,450</span>
            </div>
            <div className="hc-c66-stat">
              <span className="hc-small hc-muted">This year</span>
              <span className="hc-large-bold">$6,200</span>
            </div>
          </div>
          <Banner tone="info" title="Improvement or repair?">
            Your Nov 12 plumbing job was added. Choose how it counts.
          </Banner>
          {choiceButtons(true)}
          {IMPROVEMENTS.filter((i) => i.mobileMeta).map((i) => (
            <TaskRow key={i.id} title={`${i.name} · ${i.date}`} meta={i.mobileMeta} tag="DIY" />
          ))}
          <button type="button" className="hc-c66-link">
            Export PDF or CSV
          </button>
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="home">
      <div className="hc-c66-web">
        <header className="hc-c66-web__head">
          <h1 className="hc-h2">Improvement cost log</h1>
          <p className="hc-medium hc-muted">Capital improvements for {currentHome.address} · receipts and permits attached</p>
        </header>
        <div className="hc-c66-web__cols">
          <div className="hc-c66-web__main">
            <table className="hc-c66-table">
              <thead>
                <tr>
                  <th scope="col">Improvement</th>
                  <th scope="col">Date</th>
                  <th scope="col">Cost</th>
                  <th scope="col">Proof</th>
                </tr>
              </thead>
              <tbody>
                {IMPROVEMENTS.map((i) => (
                  <tr key={i.id}>
                    <th scope="row">{i.name}</th>
                    <td>{i.date}</td>
                    <td>{i.cost}</td>
                    <td>{i.proof}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="hc-c66-actions">
              <Button onClick={flow.goNext}>Add improvement</Button>
              <Button variant="secondary">Export PDF or CSV</Button>
            </div>
          </div>
          <aside className="hc-c66-web__side">
            <section className="hc-c66-card">
              <h2 className="hc-large-bold">Improvement or repair?</h2>
              <p className="hc-medium">Nov 12 · Copperwick Pipe Co. · repipe kitchen line · $1,240</p>
              {choiceButtons(false)}
              <p className="hc-small hc-muted">Check with a tax adviser on what counts.</p>
            </section>
            <section className="hc-c66-card">
              <h2 className="hc-large-bold">Totals</h2>
              <MetricRow label="Improvements" value="$18,450" />
              <MetricRow label="With receipts" value="3 of 4" />
            </section>
          </aside>
        </div>
      </div>
    </WebShell>
  );
}
