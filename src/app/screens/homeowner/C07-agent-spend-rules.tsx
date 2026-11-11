import { useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { NumberStepper } from '../../../components/NumberStepper/NumberStepper';
import { OptionCard } from '../../../components/OptionCard/OptionCard';
import { SettingRow } from '../../../components/SettingRow/SettingRow';
import { money } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import { WebCard, WebStepHeader } from './_onboarding';
import './C07-agent-spend-rules.css';

const PRESETS = [0, 150, 300, 500];
const STEP = 50;

/**
 * C07 Agent spend and approval rules — Figma mobile 215:12232 (+ "Scrolled" frame 101:7276), web 215:14876
 * (J1 Onboarding step 10). Mobile frame starts at $0 / auto-book off; web frame at $300 / auto-book on.
 */
export default function AgentSpendRules(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const mobile = device === 'mobile';

  const [limit, setLimit] = useState(mobile ? 0 : 300);
  const [autoBook, setAutoBook] = useState(!mobile);
  const [quotes, setQuotes] = useState(5);
  const [negotiate, setNegotiate] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);
  const [onCancel, setOnCancel] = useState<'ask' | 'rebook'>('ask');

  const amountStepper = (
    <div className="hc-c07-amount" role="group" aria-label="Spending limit">
      <button type="button" className="hc-c07-step" aria-label="Lower limit" onClick={() => setLimit((v) => Math.max(0, v - STEP))}>
        −
      </button>
      <output className="hc-h1" aria-live="polite">
        {money(limit)}
      </output>
      <button type="button" className="hc-c07-step" aria-label="Raise limit" onClick={() => setLimit((v) => v + STEP)}>
        +
      </button>
    </div>
  );

  const chips = (
    <div className="hc-onb-chips" role="radiogroup" aria-label="Quick amounts">
      {PRESETS.map((p) => (
        <button
          key={p}
          type="button"
          role="radio"
          aria-checked={limit === p}
          className={`hc-onb-chip${limit === p ? ' hc-onb-chip--selected' : ''}`}
          onClick={() => setLimit(p)}
        >
          {money(p)}
        </button>
      ))}
    </div>
  );

  const rules = (
    <>
      <SettingRow
        title="Auto-book within my limit"
        description={autoBook ? `On: I book quotes up to ${money(limit)} and tell you right away.` : 'Off: I always ask you first.'}
        checked={autoBook}
        onCheckedChange={setAutoBook}
      />
      <NumberStepper
        title="Quotes per request"
        helper="3–10 · default 5. Your agent contacts twice this many pros."
        value={quotes}
        onValueChange={setQuotes}
        min={3}
        max={10}
      />
      <SettingRow
        title="Price negotiation"
        description="Asks for a better price when a quote is more than 20% above the median. You approve."
        checked={negotiate}
        onCheckedChange={setNegotiate}
      />
      <SettingRow
        title="Auto-accept free estimates"
        description="Off: your agent asks you first."
        checked={autoAccept}
        onCheckedChange={setAutoAccept}
      />
    </>
  );

  const vendorCancels = (
    <div className="hc-c07-cancels">
      <h2 className="hc-medium-semibold">If a booked vendor cancels</h2>
      <div role="radiogroup" aria-label="If a booked vendor cancels" className="hc-onb-stack">
        <OptionCard
          title="Ask me first"
          description="Your agent tells you and waits for your choice. (Default)"
          selected={onCancel === 'ask'}
          onClick={() => setOnCancel('ask')}
        />
        <OptionCard
          title="Auto-rebook within my spend rules"
          description="Your agent books the next-ranked quote if it fits your limits, then lets you know."
          selected={onCancel === 'rebook'}
          onClick={() => setOnCancel('rebook')}
        />
      </div>
    </div>
  );

  const title = 'How much can your agent spend without asking?';

  if (mobile) {
    return (
      <MobileShell
        className="hc-onb-mobile"
        header={{ title: 'Spending', step: '6 of 6', progress: 1 }}
        bottom={
          <BottomActions
            primaryLabel="Finish setup"
            onPrimary={flow.goNext}
            secondaryLabel="Keep $0 and finish"
            onSecondary={() => {
              setLimit(0);
              flow.goNext();
            }}
          />
        }
      >
        <h1 className="hc-h3">{title}</h1>
        {amountStepper}
        <p className="hc-medium hc-muted">
          At $0, every booking waits for your approval. The limit covers your total out-of-pocket: job price plus surcharges, trip
          and estimate fees.
        </p>
        {chips}
        {rules}
        {vendorCancels}
      </MobileShell>
    );
  }

  return (
    <WebShell layout="onboarding" className="hc-onb-web">
      <WebCard>
        <WebStepHeader step={6} />
        <h1 className="hc-h2">{title}</h1>
        {amountStepper}
        {chips}
        {rules}
        <Banner>
          Your limit is a ceiling on total out-of-pocket, including surcharges, trip and estimate fees. Category preferences can only
          lower it.
        </Banner>
        {vendorCancels}
        <div className="hc-onb-actions">
          <Button fullWidth onClick={flow.goNext}>
            Finish setup
          </Button>
        </div>
      </WebCard>
    </WebShell>
  );
}
