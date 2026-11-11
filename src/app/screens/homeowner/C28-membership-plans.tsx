import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { MetricRow } from '../../../components/MetricRow/MetricRow';
import { OptionCard } from '../../../components/OptionCard/OptionCard';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C28-membership-plans.css';

type Billing = 'monthly' | 'annual';
type PortfolioChoice = 'free' | 'member' | 'portfolio';

const BILLING: { id: Billing; label: string }[] = [
  { id: 'monthly', label: 'Monthly · $4.99' },
  { id: 'annual', label: 'Annual · $49 · save 18%' },
];

const MOBILE_FEATURES = [
  '✓ 240 AI credits a year, roll over up to 300',
  '✓ Credit packs from $2.99 · emergencies free',
  '✓ Warranty claims filed for you',
  '✓ Household and caregiver access',
  '✓ Annual: save $49 a year or get it back',
];

const WEB_FEATURES = [
  '✓ 240 AI credits a year (20 a month); unused credits roll over up to 300',
  '✓ Buy credit packs: 10, 40 or 120 for $2.99, $9.99 or $24.99 · emergencies always free',
  '○ Coming soon: fair-price, permit and rebate checks on quotes',
  '✓ Warranty claims filed for you',
  '✓ Household and caregiver access',
  '✓ Annual: savings guarantee, save $49 a year or get it back',
];

const FREE_FEATURES = [
  '✓ Home record, maintenance plan and agent chat',
  '✓ 10 items per home',
  '✓ 20 credits a month',
  '✓ Emergency help in Phoenix and Tucson',
];

const BANNER_BODY =
  'Join to keep getting quotes for 5530 E Saguaro Dr. Members get 240 credits a year and can buy credit packs. Emergencies are always free.';

/**
 * C28 Membership plans — Figma mobile 218:19286, web 218:20393 (J1 Membership & credits step 1).
 * Branch "Second rental → Portfolio plan" (mobile 269:24003, web 269:24267) renders with ?state=portfolio.
 */
export default function MembershipPlans(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [params] = useSearchParams();
  const [billing, setBilling] = useState<Billing>('monthly');
  const [choice, setChoice] = useState<PortfolioChoice>('portfolio');

  if (params.get('state') === 'portfolio') {
    return <PortfolioPlan device={device} choice={choice} setChoice={setChoice} onSwitch={flow.goNext} />;
  }

  const ctaLabel = `Continue with ${billing === 'monthly' ? 'Monthly · $4.99' : 'Annual · $49'}`;

  const chips = (stack = false) => (
    <div className={['hc-c28-chips', stack && 'hc-c28-chips--stack'].filter(Boolean).join(' ')} role="radiogroup" aria-label="Billing period">
      {BILLING.map((b) => (
        <button key={b.id} type="button" role="radio" aria-checked={billing === b.id} className="hc-c28-chip" onClick={() => setBilling(b.id)}>
          {b.label}
        </button>
      ))}
    </div>
  );

  const memberHead = (
    <>
      <div className="hc-c28-card__head">
        <h2 className="hc-large-bold">Member</h2>
        <StatusPill label="Best value" tone="success" />
      </div>
      <p className="hc-h3">$4.99 a month</p>
      <p className="hc-small hc-muted">per home · or $49 a year and save 18%</p>
    </>
  );

  const banner = <Banner title="You’ve used this month’s free credits">{BANNER_BODY}</Banner>;

  if (device === 'mobile') {
    return (
      <MobileShell
        header={{ title: 'Membership' }}
        bottom={<BottomActions primaryLabel={ctaLabel} onPrimary={flow.goNext} secondaryLabel="Pay on the web instead" onSecondary={flow.goNext} />}
      >
        <div className="hc-c28-options">
          {banner}
          {chips()}
          <section className="hc-c28-card hc-c28-card--featured">
            {memberHead}
            {MOBILE_FEATURES.map((f) => (
              <p key={f} className="hc-small">
                {f}
              </p>
            ))}
          </section>
          <section className="hc-c28-card">
            <h2 className="hc-large-bold">Free</h2>
            <p className="hc-h3">$0</p>
            <p className="hc-small hc-muted">20 credits a month · 10 items per home</p>
          </section>
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="account">
      <div className="hc-c28-web">
        <WebHead />
        {banner}
        <div className="hc-c28-web__cols">
          <section className="hc-c28-card">
            <h2 className="hc-large-bold">Free</h2>
            <p className="hc-h3">$0</p>
            <p className="hc-small hc-muted">Always free</p>
            {FREE_FEATURES.map((f) => (
              <p key={f} className="hc-small">
                {f}
              </p>
            ))}
          </section>
          <section className="hc-c28-card hc-c28-card--featured">
            {memberHead}
            {WEB_FEATURES.map((f) => (
              <p key={f} className="hc-small">
                {f}
              </p>
            ))}
            {chips(true)}
            <Button fullWidth onClick={flow.goNext}>
              {ctaLabel}
            </Button>
          </section>
          <section className="hc-c28-card hc-c28-card--pad-lg hc-c28-web__aside">
            <h2 className="hc-large-bold">How you pay</h2>
            <p className="hc-small hc-muted">
              On the web you pay by card. In the app you can use Apple or Google, or open web checkout. Membership starts right away.
            </p>
            <p className="hc-small hc-muted">Cancel anytime in a few taps. You keep member features until the end of the period.</p>
          </section>
        </div>
      </div>
    </WebShell>
  );
}

function WebHead() {
  return (
    <header className="hc-c28-web__head">
      <h1 className="hc-h2">Membership for 5530 E Saguaro Dr, Tucson</h1>
      <p className="hc-medium hc-muted">Membership is per home. Your other homes keep their own plans.</p>
    </header>
  );
}

function PortfolioPlan({
  device,
  choice,
  setChoice,
  onSwitch,
}: {
  device: 'mobile' | 'web';
  choice: PortfolioChoice;
  setChoice: (c: PortfolioChoice) => void;
  onSwitch: () => void;
}) {
  const option = (id: PortfolioChoice, title: string, description: string) => (
    <OptionCard key={id} icon="home" title={title} description={description} selected={choice === id} onClick={() => setChoice(id)} />
  );

  if (device === 'mobile') {
    return (
      <MobileShell
        header={{ title: 'Portfolio plan' }}
        bottom={
          <BottomActions
            primaryLabel="Switch to Portfolio"
            onPrimary={onSwitch}
            secondaryLabel="Keep one rental on membership"
            onSecondary={() => setChoice('member')}
          />
        }
      >
        <div className="hc-c28-options">
          <Banner title="You added a second rental">Two or more rental properties need the Portfolio plan (#185).</Banner>
          <div className="hc-c28-options" role="radiogroup" aria-label="Plan">
            {option('member', 'Member · $4.99 / mo', 'Per home · includes one tenant')}
            {option('portfolio', 'Portfolio · $9.99 / mo + $2 per door', '2 properties, 3 doors = $15.99 / mo')}
          </div>
          <MetricRow label="Covers" value="Repairs and maintenance" />
          <MetricRow label="Agent credits" value="One 240 / yr pool · 300 cap" />
          <MetricRow label="Tenants" value="Never metered" />
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="account">
      <div className="hc-c28-web">
        <WebHead />
        <div className="hc-c28-web__portfolio">
          <Banner title="You added a second rental">
            Two or more rental properties need the Portfolio plan. One rental can stay on membership with one tenant (#185).
          </Banner>
          <div className="hc-c28-web__portfolio-cols">
            <div className="hc-c28-options" role="radiogroup" aria-label="Plan">
              {option('free', 'Free', 'Up to 10 items per home')}
              {option('member', 'Member · $4.99 / mo', 'Per home · includes one tenant on that home')}
              {option('portfolio', 'Portfolio · $9.99 / mo + $2 per door', 'Required for 2+ rental properties')}
            </div>
            <section className="hc-c28-card">
              <h2 className="hc-large-bold">Portfolio plan</h2>
              <MetricRow label="Base" value="$9.99 / mo" />
              <MetricRow label="Doors" value="3 × $2.00" />
              <MetricRow label="Monthly total" value="$15.99" />
              <MetricRow label="Covers" value="Repairs and maintenance only" />
              <MetricRow label="Agent credits" value="One 240 / yr pool · 300 cap" />
              <MetricRow label="Tenants" value="Never metered" />
              <Button fullWidth onClick={onSwitch}>
                Switch to Portfolio
              </Button>
            </section>
          </div>
        </div>
      </div>
    </WebShell>
  );
}
