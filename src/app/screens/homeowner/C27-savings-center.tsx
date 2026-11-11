import type { KeyboardEvent } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { ListRow } from '../../../components/ListRow/ListRow';
import { MetricRow } from '../../../components/MetricRow/MetricRow';
import { currentHome } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C27-savings-center.css';

const REBATES = [
  { id: 'srp-ac', name: 'SRP AC rebate', amount: '$400', deadline: 'Mar 31', status: 'Ready', note: 'Needs AHRI certificate · deadline Mar 31' },
  { id: 'rheem', name: 'Rheem water heater', amount: '$150', deadline: 'Jun 30', status: 'Needs proof', note: 'Manufacturer rebate · model match' },
  { id: 'tep', name: 'TEP smart thermostat', amount: '$75', deadline: 'Paid', status: 'Paid Nov 2', note: '' },
];

/** Enter / Space activate a div that acts as a button */
const onKey = (open: () => void) => (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    open();
  }
};

/** C27 Savings center — Figma mobile 218:19856, web 218:21231 (J1 Membership & credits step 6). Rebates open C68. */
export default function SavingsCenter(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Savings center' }} tab="plan" background="page">
        <div className="hc-c27-stack">
          <div className="hc-c27-row">
            <div className="hc-c27-card hc-c27-card--stat">
              <p className="hc-small hc-muted">Saved this year</p>
              <p className="hc-large-bold">$312</p>
            </div>
            <div className="hc-c27-card hc-c27-card--stat">
              <p className="hc-small hc-muted">Rebates open</p>
              <p className="hc-large-bold">2</p>
            </div>
          </div>
          <Banner tone="warning" title="Deadline in 12 days">
            SRP AC rebate closes Mar 31.
          </Banner>
          <section className="hc-c27-card">
            <h2 className="hc-large-bold">Rebates for your home</h2>
            {REBATES.slice(0, 2).map((r) => (
              <div key={r.id} role="button" tabIndex={0} className="hc-c27-rowbtn" onClick={flow.goNext} onKeyDown={onKey(flow.goNext)}>
                <ListRow title={`${r.name} · ${r.amount}`} description={r.note} />
              </div>
            ))}
          </section>
          <section className="hc-c27-card">
            <h2 className="hc-large-bold">Fair-price checks</h2>
            <MetricRow label="AC tune-up quote" value="$129" />
            <MetricRow label="Local median" value="$149" />
          </section>
          <p className="hc-small hc-muted">Neighborhood deals arrive in Wave 3.</p>
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="plan">
      <div className="hc-c27-web">
        <header className="hc-c27-web__head">
          <h1 className="hc-h2">Savings center</h1>
          <p className="hc-medium hc-muted">Members · rebates and fair-price checks for {currentHome.address}</p>
        </header>
        <div className="hc-c27-web__cols">
          <div className="hc-c27-web__main">
            <div className="hc-c27-row">
              <div className="hc-c27-card hc-c27-card--stat">
                <p className="hc-small hc-muted">Saved this year</p>
                <p className="hc-h3">$312</p>
                <p className="hc-small hc-muted">Fair price $90 · warranty $222</p>
              </div>
              <div className="hc-c27-card hc-c27-card--stat">
                <p className="hc-small hc-muted">Rebates open</p>
                <p className="hc-h3">2</p>
                <p className="hc-small hc-muted">$550 available</p>
              </div>
            </div>
            <table className="hc-c27-table">
              <thead>
                <tr>
                  <th>Rebate</th>
                  <th>Amount</th>
                  <th>Deadline</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {REBATES.map((r) => (
                  <tr key={r.id} tabIndex={0} onClick={flow.goNext} onKeyDown={onKey(flow.goNext)}>
                    <td>{r.name}</td>
                    <td>{r.amount}</td>
                    <td>{r.deadline}</td>
                    <td>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="hc-c27-web__side">
            <section className="hc-c27-card">
              <h2 className="hc-large-bold">Fair-price checks</h2>
              <MetricRow label="AC tune-up · Desert Air" value="$129" />
              <MetricRow label="Local median" value="$149" />
              <MetricRow label="Permit needed" value="No" />
            </section>
            <Banner title="Deals">Neighborhood deals join this page in Wave 3.</Banner>
          </div>
        </div>
      </div>
    </WebShell>
  );
}
