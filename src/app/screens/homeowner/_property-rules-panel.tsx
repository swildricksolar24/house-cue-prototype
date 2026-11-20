import { useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { Checkbox } from '../../../components/Checkbox/Checkbox';
import { NumberStepper } from '../../../components/NumberStepper/NumberStepper';
import { Radio } from '../../../components/Radio/Radio';
import { SettingRow } from '../../../components/SettingRow/SettingRow';
import type { PortfolioProperty } from '../../data/sample';
import { getPropertyRules, setPropertyRules } from '../../prototype/portfolio';
import './_property-rules-panel.css';

/** Report categories */
const CATEGORIES = [
  { id: 'plumbing', label: 'Plumbing' },
  { id: 'hvac', label: 'HVAC' },
  { id: 'electrical', label: 'Electrical' },
  { id: 'appliances', label: 'Appliances' },
  { id: 'pests', label: 'Pests' },
  { id: 'locks', label: 'Locks and doors' },
  { id: 'roofing', label: 'Roofing' },
];
/** Review change: the Approval caps wording */
export const CAPS_INTRO = 'Your agent can book repairs up to these amounts without asking you. Anything that costs more waits for your OK.';
export const ROUTINE_HELP = 'A leaky faucet, a broken disposal. Set $0 to approve every repair yourself.';
export const EMERGENCY_HELP = 'Gas, flooding, no heat or AC. Only used if you don’t answer within 15 minutes.';
/** The "What this means" summary for the amounts set */
export const capsSummary = (routine: number, emergency: number) =>
  [
    routine > 0 ? `Your agent books everyday repairs up to $${routine.toLocaleString('en-US')} on its own.` : 'You approve every everyday repair yourself.',
    emergency > 0 ? `In an emergency, if you don’t answer within 15 minutes, it books up to $${emergency.toLocaleString('en-US')}.` : 'In an emergency it still waits for you.',
    'If you’ve set a lower limit elsewhere on your account, the lower one wins.',
  ].join(' ');
const DEFAULT_ALLOWED = ['plumbing', 'hvac', 'electrical', 'appliances', 'pests', 'locks'];

/**
 * Review change: the C81 Property rules, all in the property page's Property rules card (was an Edit rules button to
 * another page): Approval caps (routine and emergency, with the cap order), Emergency rules, What tenants may report
 * and What the tenant sees, then Use portfolio defaults / Save rules. Save keeps them for the visit and says Saved.
 */
export function PropertyRulesPanel({ property: p, unit }: { property: PortfolioProperty; unit?: string }) {
  // Review change: a unit has its own rules (kept under "<property>:<unit>"), starting from the property's
  const key = unit ? `${p.id}:${unit}` : p.id;
  const own = getPropertyRules(key) ?? (unit ? getPropertyRules(p.id) : undefined);
  const [routine, setRoutine] = useState(own?.routine ?? p.rules.routine);
  const [emergency, setEmergency] = useState(own?.emergency ?? p.rules.emergency);
  const [allowed, setAllowed] = useState<string[]>(own?.allowed ?? DEFAULT_ALLOWED);
  const [showCosts, setShowCosts] = useState(own?.showCosts ?? false);
  const [emergencyRules, setEmergencyRules] = useState(own?.emergencyRules ?? true);
  const [saved, setSaved] = useState<'saved' | 'defaults' | null>(null);
  const edit = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v);
    setSaved(null);
  };
  const toggle = (id: string) => {
    setAllowed((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
    setSaved(null);
  };
  const useDefaults = () => {
    setRoutine(0);
    setEmergency(600);
    setAllowed(DEFAULT_ALLOWED);
    setShowCosts(false);
    setEmergencyRules(true);
    setSaved('defaults');
  };
  const save = () => {
    setPropertyRules(key, { routine, emergency, emergencyRules, allowed, showCosts });
    setSaved('saved');
  };

  return (
    <div className="hc-rules">
      <div className="hc-rules__grid">
        {/* Review change: order is What tenants may report, Emergency rules, Approval caps, What the tenant sees */}
        <section className="hc-rules__part" aria-labelledby="hc-rules-report">
          <h4 id="hc-rules-report" className="hc-medium-semibold">
            What tenants may report
          </h4>
          <div className="hc-rules__body">
            <div className="hc-rules__checks">
              {CATEGORIES.map((c) => (
                <Checkbox key={c.id} label={c.label} checked={allowed.includes(c.id)} onChange={() => toggle(c.id)} />
              ))}
            </div>
            </div>
        </section>
        <section className="hc-rules__part" aria-labelledby="hc-rules-emergency">
          <h4 id="hc-rules-emergency" className="hc-medium-semibold">
            Emergency rules
          </h4>
          <div className="hc-rules__body">
            <SettingRow
              title="Emergency rules on"
              description="Gas, flooding, no heat or AC, sewage: safety steps, dispatch, you are notified throughout"
              checked={emergencyRules}
              onCheckedChange={edit(setEmergencyRules)}
            />
            </div>
        </section>
        <section className="hc-rules__part" aria-labelledby="hc-rules-ceilings">
          <h4 id="hc-rules-ceilings" className="hc-medium-semibold">
            Approval caps
          </h4>
          {/* Review change: in plain words: what a cap is, each cap as "approve … up to", a live summary of what happens
              with the amounts set, and the cap order as one short line (no internal codes) */}
          <div className="hc-rules__body">
            <p className="hc-small hc-muted">{CAPS_INTRO}</p>
            <NumberStepper className="hc-rules__money" title="Everyday repairs" helper={ROUTINE_HELP} value={routine} onValueChange={edit(setRoutine)} min={0} max={2000} step={25} />
            <NumberStepper className="hc-rules__money" title="Emergencies" helper={EMERGENCY_HELP} value={emergency} onValueChange={edit(setEmergency)} min={0} max={5000} step={50} />
            <Banner tone="info" title="What this means">
              {capsSummary(routine, emergency)}
            </Banner>
          </div>
        </section>
        <section className="hc-rules__part" role="radiogroup" aria-labelledby="hc-rules-sees">
          <h4 id="hc-rules-sees" className="hc-medium-semibold">
            What the tenant sees
          </h4>
          <div className="hc-rules__body">
            {/* Review change: the two options smaller, side by side */}
            <div className="hc-rules__radios">
              <Radio name={`rules-sees-${p.id}`} label="Status only" checked={!showCosts} onChange={() => edit(setShowCosts)(false)} />
              <Radio name={`rules-sees-${p.id}`} label="Status and costs" checked={showCosts} onChange={() => edit(setShowCosts)(true)} />
            </div>
            <p className="hc-small hc-muted">Costs are read-only. Quote comparisons always stay with you. Vendors are told the setting (VW8).</p>
            </div>
        </section>
      </div>
      <div className="hc-rules__actions">
        {saved && (
          <span className="hc-small hc-rules__saved" role="status">
            {saved === 'saved' ? `Saved. ${unit && unit !== '—' ? `Unit ${unit}` : p.short} uses these rules from now on.` : 'Portfolio defaults filled in. Save to use them.'}
          </span>
        )}
        <Button size="small" variant="secondary" onClick={useDefaults}>
          Use portfolio defaults
        </Button>
        <Button size="small" onClick={save}>
          Save rules
        </Button>
      </div>
    </div>
  );
}
