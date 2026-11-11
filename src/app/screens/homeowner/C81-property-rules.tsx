import { useState } from 'react';
import { AgentFab } from '../../../components/AgentFab/AgentFab';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { Checkbox } from '../../../components/Checkbox/Checkbox';
import { ConsoleBreadcrumb } from '../../../components/ConsoleBreadcrumb/ConsoleBreadcrumb';
import { NumberStepper } from '../../../components/NumberStepper/NumberStepper';
import { Radio } from '../../../components/Radio/Radio';
import { SettingRow } from '../../../components/SettingRow/SettingRow';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { screenPath } from '../../prototype/journeys';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C81-property-rules.css';

/** Report categories: mobile chip label, web checkbox label */
const categories = [
  { id: 'plumbing', chip: 'Plumbing', label: 'Plumbing' },
  { id: 'hvac', chip: 'HVAC', label: 'HVAC' },
  { id: 'electrical', chip: 'Electrical', label: 'Electrical' },
  { id: 'appliances', chip: 'Appliances', label: 'Appliances' },
  { id: 'pests', chip: 'Pests', label: 'Pests' },
  { id: 'locks', chip: 'Locks', label: 'Locks and doors' },
  { id: 'roofing', chip: 'Roofing', label: 'Roofing' },
];

const DEFAULTS = {
  routine: 150,
  emergency: 600,
  allowed: ['plumbing', 'hvac', 'electrical', 'appliances', 'pests', 'locks'],
  showCosts: false,
  emergencyRules: true,
};

/** C81 Property rules — Figma mobile 272:31914, web 272:32602 (J1 Landlord portfolio step 3) */
export default function PropertyRules(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [routine, setRoutine] = useState(DEFAULTS.routine);
  const [emergency, setEmergency] = useState(DEFAULTS.emergency);
  const [allowed, setAllowed] = useState<string[]>(DEFAULTS.allowed);
  const [showCosts, setShowCosts] = useState(DEFAULTS.showCosts);
  const [emergencyRules, setEmergencyRules] = useState(DEFAULTS.emergencyRules);

  const toggle = (id: string) => setAllowed((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  const useDefaults = () => {
    setRoutine(0);
    setEmergency(DEFAULTS.emergency);
    setAllowed(DEFAULTS.allowed);
    setShowCosts(false);
    setEmergencyRules(true);
  };

  // NumberStepper shows a bare number; .hc-c81-money adds the $ (component has no value formatter)
  const routineStepper = (helper: string) => (
    <NumberStepper
      className="hc-c81-money"
      title="Routine auto-approve ceiling"
      helper={helper}
      value={routine}
      onValueChange={setRoutine}
      min={0}
      max={2000}
      step={25}
    />
  );
  const emergencyStepper = (title: string, helper: string) => (
    <NumberStepper
      className="hc-c81-money"
      title={title}
      helper={helper}
      value={emergency}
      onValueChange={setEmergency}
      min={0}
      max={5000}
      step={50}
    />
  );

  if (device === 'mobile') {
    return (
      <MobileShell
        header={{ title: 'Property rules' }}
        bottom={<BottomActions primaryLabel="Save rules" onPrimary={flow.goNext} secondaryLabel="Use portfolio defaults" onSecondary={useDefaults} />}
      >
        <p className="hc-medium hc-muted">1418 E Roosevelt St · overrides portfolio defaults</p>
        {routineStepper('Default $0: you approve every report')}
        {emergencyStepper('Emergency ceiling', 'Agent books within this after 15 min with no answer')}
        <h2 className="hc-c81-label">Tenants may report</h2>
        <div className="hc-c81-chips" role="group" aria-label="Tenants may report">
          {categories.map((c) => {
            const on = allowed.includes(c.id);
            return (
              <button key={c.id} type="button" className="hc-c81-chip" aria-pressed={on} onClick={() => toggle(c.id)}>
                <StatusPill label={on ? c.chip : `${c.chip} · off`} tone={on ? 'info' : 'neutral'} />
              </button>
            );
          })}
        </div>
        <div>
          <SettingRow title="Show costs to tenant" description="Off: tenant sees status only" checked={showCosts} onCheckedChange={setShowCosts} />
          <SettingRow
            title="Emergency rules"
            description="Gas, flooding, no heat or AC, sewage go straight to dispatch"
            checked={emergencyRules}
            onCheckedChange={setEmergencyRules}
          />
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell role="landlord" nav="portfolio">
      <div className="hc-c81-web">
        <header className="hc-c81-web__head">
          <div className="hc-c81-web__title">
            <ConsoleBreadcrumb parent="1418 E Roosevelt St" onParentClick={flow.goBack} current="Property rules" />
            <h1 className="hc-h2">Property rules</h1>
            <p className="hc-medium hc-muted">
              1418 E Roosevelt St, Phoenix · 2 units · inherits portfolio defaults; changes here apply to this property only
            </p>
          </div>
          <Button variant="secondary" onClick={useDefaults}>
            Use portfolio defaults
          </Button>
          <Button onClick={flow.goNext}>Save rules</Button>
        </header>
        <div className="hc-c81-web__cols">
          <div className="hc-c81-web__col hc-c81-web__col--left">
            <section className="hc-c81-card">
              <h2 className="hc-large-bold">Approval ceilings</h2>
              {routineStepper('Default $0, so you approve every tenant report')}
              {emergencyStepper('Emergency ceiling (#182)', 'Separate from routine; used after 15 min with no answer')}
              <Banner tone="info" title="Cap order">
                Account cap (C07), then property ceiling, then category cap, then per-request cap, then manager limit. The lowest wins.
              </Banner>
            </section>
            <section className="hc-c81-card">
              <h2 className="hc-large-bold">Emergency rules</h2>
              <SettingRow
                title="Emergency rules on"
                description="Gas, flooding, no heat or AC, sewage: safety steps, dispatch, you are notified throughout"
                checked={emergencyRules}
                onCheckedChange={setEmergencyRules}
              />
            </section>
          </div>
          <div className="hc-c81-web__col hc-c81-web__col--right">
            <section className="hc-c81-card">
              <h2 className="hc-large-bold">What tenants may report</h2>
              {categories.map((c) => (
                <Checkbox key={c.id} label={c.label} checked={allowed.includes(c.id)} onChange={() => toggle(c.id)} />
              ))}
            </section>
            <section className="hc-c81-card" role="radiogroup" aria-label="What the tenant sees">
              <h2 className="hc-large-bold">What the tenant sees</h2>
              <Radio name="c81-tenant-sees" label="Status only (default)" checked={!showCosts} onChange={() => setShowCosts(false)} />
              <Radio name="c81-tenant-sees" label="Costs shown, read-only" checked={showCosts} onChange={() => setShowCosts(true)} />
              <p className="hc-small hc-muted">Quote comparisons always stay with you. Vendors are told the setting (VW8).</p>
            </section>
          </div>
        </div>
      </div>
      <AgentFab size="extended" to={screenPath('C09')} className="hc-c81-fab" />
    </WebShell>
  );
}
