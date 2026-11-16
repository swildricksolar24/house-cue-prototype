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
import { WebCard } from './_onboarding';
import { SpendLimit } from './_spend-limit';
import './C07-agent-spend-rules.css';

/**
 * C07 Agent spend and approval rules — Figma mobile 215:12232 (+ "Scrolled" frame 101:7276), web 215:14876
 * (J1 Onboarding step 10). Mobile frame starts at $0 / auto-book off; web frame at $300 / auto-book on.
 *
 * Review change (shorter onboarding, Option A): no longer an onboarding step. The limit and auto-book moved into C06;
 * this full set of rules now lives under Settings & account (reached from Home and Agent chat "spend rules" links),
 * so it has no step counter and Save goes back.
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
        header={{ title: 'Spending' }}
        bottom={<BottomActions primaryLabel="Save" onPrimary={flow.goBack} />}
      >
        <h1 className="hc-h3">{title}</h1>
        <SpendLimit value={limit} onChange={setLimit} />
        <p className="hc-medium hc-muted">
          At $0, every booking waits for your approval. The limit covers your total out-of-pocket: job price plus surcharges, trip
          and estimate fees.
        </p>
        {rules}
        {vendorCancels}
      </MobileShell>
    );
  }

  return (
    <WebShell layout="onboarding" className="hc-onb-web">
      <WebCard>
        <h1 className="hc-h2">{title}</h1>
        <SpendLimit value={limit} onChange={setLimit} />
        {rules}
        <Banner>
          Your limit is a ceiling on total out-of-pocket, including surcharges, trip and estimate fees. Category preferences can only
          lower it.
        </Banner>
        {vendorCancels}
        <div className="hc-onb-actions">
          <Button fullWidth onClick={flow.goBack}>
            Save
          </Button>
        </div>
      </WebCard>
    </WebShell>
  );
}
