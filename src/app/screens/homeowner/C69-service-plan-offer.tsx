import { useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { Input } from '../../../components/Input/Input';
import { ListRow } from '../../../components/ListRow/ListRow';
import { MetricRow } from '../../../components/MetricRow/MetricRow';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C69-service-plan-offer.css';

/** C69 Service plan offer — Figma mobile 218:20139, web 218:21609 (J1 Membership & credits step 8) */
export default function ServicePlanOffer(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [start, setStart] = useState('Mar 1, 2027');
  const [visitWindow, setVisitWindow] = useState('Weekday mornings');

  const fields = (
    <>
      <Input label="Start date" value={start} onValueChange={setStart} />
      <Input label="Preferred visit window" value={visitWindow} onValueChange={setVisitWindow} />
    </>
  );

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Service plan offer' }} tab="plan" background="page">
        <div className="hc-c69-stack">
          <section className="hc-c69-card">
            <h2 className="hc-large-bold">Desert Air · HVAC care plan</h2>
            <MetricRow label="Visits" value="2 a year" />
            <MetricRow label="Price" value="$15 a month" />
            <MetricRow label="Billing" value="Billed monthly · set by Desert Air" />
            <MetricRow label="Term" value="12 months" />
            <MetricRow label="Repair discount" value="10%" />
          </section>
          <div>
            <ListRow title="AC tune-up · spring" description="Covers your C11 AC task" />
            <ListRow title="Furnace safety check · fall" />
          </div>
          {fields}
          <Button fullWidth onClick={flow.goNext}>
            Subscribe
          </Button>
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="plan">
      <div className="hc-c69-web">
        <header className="hc-c69-web__head">
          <h1 className="hc-h2">Service plan offer</h1>
          <p className="hc-medium hc-muted">Desert Air · HVAC care plan · offered after your Nov 2 tune-up</p>
        </header>
        <div className="hc-c69-web__cols">
          <div className="hc-c69-web__main">
            <section className="hc-c69-card">
              <h2 className="hc-large-bold">What’s included</h2>
              <ListRow title="AC tune-up · spring" description="Covers your AC maintenance task" />
              <ListRow title="Furnace safety check · fall" description="Covers your furnace task" />
              <MetricRow label="Repair discount" value="10%" />
              <p className="hc-small hc-muted">The vendor’s contract governs cancellation: 30 days’ notice.</p>
            </section>
            {fields}
          </div>
          <div className="hc-c69-web__side">
            <section className="hc-c69-card">
              <h2 className="hc-large-bold">Desert Air · HVAC care plan</h2>
              <MetricRow label="Price" value="$15 a month" />
              <MetricRow label="Billing" value="Billed monthly · set by Desert Air" />
              <MetricRow label="Term" value="12 months" />
              <MetricRow label="Rating" value="★ 4.8 · Preferred" />
            </section>
            <Banner>Desert Air bills this plan monthly: $15 covers both visits. On per-visit plans, each visit is held and paid at sign-off.</Banner>
            <Button className="hc-c69-start" onClick={flow.goNext}>
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </WebShell>
  );
}
