import { money } from '../../data/sample';
import './_spend-limit.css';

const PRESETS = [0, 150, 300, 500];
const STEP = 50;

/**
 * The agent's spending limit: big − / amount / + stepper (Figma "amount stepper") and quick-amount chips.
 * Shared by C06 (onboarding, Option A: agent intro + limit on one screen) and C07 (spend and approval rules).
 * Not a screen: the registry only picks up files named <CODE>-<slug>.tsx.
 */
export function SpendLimit({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <>
      <div className="hc-spend-amount" role="group" aria-label="Spending limit">
        <button type="button" className="hc-spend-step" aria-label="Lower limit" onClick={() => onChange(Math.max(0, value - STEP))}>
          −
        </button>
        <output className="hc-h1" aria-live="polite">
          {money(value)}
        </output>
        <button type="button" className="hc-spend-step" aria-label="Raise limit" onClick={() => onChange(value + STEP)}>
          +
        </button>
      </div>
      <div className="hc-onb-chips" role="radiogroup" aria-label="Quick amounts">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={value === p}
            className={`hc-onb-chip${value === p ? ' hc-onb-chip--selected' : ''}`}
            onClick={() => onChange(p)}
          >
            {money(p)}
          </button>
        ))}
      </div>
    </>
  );
}
