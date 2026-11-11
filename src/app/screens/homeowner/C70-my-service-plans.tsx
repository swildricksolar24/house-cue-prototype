import { useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { MetricRow } from '../../../components/MetricRow/MetricRow';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { TimelineStep } from '../../../components/TimelineStep/TimelineStep';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C70-my-service-plans.css';

/**
 * C70 My service plans — Figma mobile 218:20250, web 218:21760 (J1 Membership & credits step 9, last step).
 * Pause toggles the Desert Air plan between Active and Paused; Cancel goes back to the offer (C69).
 */
export default function MyServicePlans(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [paused, setPaused] = useState(false);

  const desertStatus = paused ? 'Paused' : 'Active';
  const pauseLabel = paused ? 'Resume' : 'Pause';

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'My service plans' }} tab="jobs" background="page">
        <div className="hc-c70-stack">
          <section className="hc-c70-card">
            <h2 className="hc-large-bold">Desert Air · HVAC care plan</h2>
            <MetricRow label="Next visit" value="Mar 4 · 9–11 am" />
            <MetricRow label="Price" value="$15 a month" />
            <div className="hc-c70-pills">
              <StatusPill label={desertStatus} tone={paused ? 'warning' : 'success'} />
            </div>
            <div className="hc-c70-actions">
              <Button variant="secondary" onClick={() => setPaused((p) => !p)}>
                {pauseLabel}
              </Button>
              <Button variant="secondary" onClick={flow.goBack}>
                Cancel
              </Button>
            </div>
          </section>
          <section className="hc-c70-card">
            <h2 className="hc-large-bold">Glasswing Pools · Monthly service</h2>
            <MetricRow label="Next visit" value="Paused until Jan 5" />
            <MetricRow label="Price" value="$95 a month" />
            <div className="hc-c70-pills">
              <StatusPill label="Paused" tone="warning" />
            </div>
          </section>
          <p className="hc-small hc-muted">Plan visits also appear in My jobs.</p>
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="jobs">
      <div className="hc-c70-web">
        <header className="hc-c70-web__head">
          <h1 className="hc-h2">My service plans</h1>
          <p className="hc-medium hc-muted">Active plans, next visits, pause or cancel · visits also show in My jobs</p>
        </header>
        <div className="hc-c70-web__cols">
          <div className="hc-c70-web__main">
            <table className="hc-c70-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Next visit</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Desert Air · HVAC care</td>
                  <td>Mar 4 · 9–11 am</td>
                  <td>$15/mo</td>
                  <td>{desertStatus}</td>
                </tr>
                <tr>
                  <td>Glasswing Pools · Monthly</td>
                  <td>Jan 5</td>
                  <td>$95/mo</td>
                  <td>Paused</td>
                </tr>
              </tbody>
            </table>
            <div className="hc-c70-actions">
              <Button variant="secondary" onClick={() => setPaused((p) => !p)}>
                {pauseLabel}
              </Button>
              <Button variant="secondary" onClick={flow.goBack}>
                Cancel plan
              </Button>
            </div>
          </div>
          <div className="hc-c70-web__side">
            <section className="hc-c70-card">
              <h2 className="hc-large-bold">Desert Air visits</h2>
              <ol className="hc-c70-timeline">
                <TimelineStep state="done" title="Fall furnace check" meta="Oct 2 · completed" />
                <TimelineStep state="upcoming" title="Spring AC tune-up" meta="Mar 4 · 9–11 am" />
              </ol>
            </section>
            <Banner title="Renewal Mar 1">Price stays $15 a month. Any change needs your approval.</Banner>
          </div>
        </div>
      </div>
    </WebShell>
  );
}
