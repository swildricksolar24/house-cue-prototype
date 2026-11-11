import { Button } from '../../../components/Button/Button';
import { MetricRow } from '../../../components/MetricRow/MetricRow';
import { currentHome } from '../../data/sample';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C51-money-saved.css';

const SAVINGS = [{ date: 'Aug 30', source: 'Warranty claim · dishwasher pump', amount: '$86' }];

/** C51 Money saved — Figma mobile 218:19730, web 218:21096 (J1 Membership & credits step 5) */
export default function MoneySaved(_: ScreenProps) {
  const { device } = usePrototype();

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Money saved' }} tab="home">
        <div className="hc-c51-stack">
          <div className="hc-c51-row">
            <div className="hc-c51-card">
              <p className="hc-small hc-muted">Saved this year</p>
              <p className="hc-large-bold">$86</p>
            </div>
            <div className="hc-c51-card">
              <p className="hc-small hc-muted">Guarantee</p>
              <p className="hc-large-bold">$49 a year</p>
            </div>
          </div>
          <div className="hc-c51-details">
            <MetricRow label="Warranty claims paid" value="$86" />
            <MetricRow label="Fair-price savings · from Wave 2" value="Not counted at launch" />
            <MetricRow label="Rebates and deals" value="Not counted at launch" />
          </div>
          <p className="hc-small hc-muted">On an annual membership, if you save less than $49 this year, claim the difference at renewal.</p>
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="home">
      <div className="hc-c51-web">
        <header className="hc-c51-web__head">
          <h1 className="hc-h2">Money saved</h1>
          <p className="hc-medium hc-muted">{currentHome.address} · membership year ends Mar 15, 2027</p>
        </header>
        <div className="hc-c51-web__cols">
          <div className="hc-c51-web__main">
            <div className="hc-c51-row">
              <div className="hc-c51-card">
                <p className="hc-small hc-muted">Saved this year</p>
                <p className="hc-h3">$86</p>
                <p className="hc-small hc-muted">Warranty claims</p>
              </div>
              <div className="hc-c51-card">
                <p className="hc-small hc-muted">Guarantee</p>
                <p className="hc-h3">$49</p>
                <p className="hc-small hc-muted">Annual members</p>
              </div>
            </div>
            <table className="hc-c51-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Source</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {SAVINGS.map((s) => (
                  <tr key={s.date + s.source}>
                    <td>{s.date}</td>
                    <td>{s.source}</td>
                    <td>{s.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <section className="hc-c51-card hc-c51-card--gap hc-c51-web__side">
            <h2 className="hc-large-bold">Savings guarantee</h2>
            <p className="hc-medium">At renewal, if you saved less than $49, you can claim the difference.</p>
            <Button variant="secondary">
              Claim refund
            </Button>
            <p className="hc-small hc-muted">Shows at the end of the annual term. Disagree with a saving? Contact support.</p>
          </section>
        </div>
      </div>
    </WebShell>
  );
}
