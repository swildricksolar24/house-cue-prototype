import { useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { Input } from '../../../components/Input/Input';
import { OptionCard } from '../../../components/OptionCard/OptionCard';
import { Select } from '../../../components/Select/Select';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C90-recommend-vendor.css';

type Source = 'jobs' | 'outside';

/** Pros from the homeowner's jobs (Figma C90). `mobileOnly` / `webOnly` follow which frame lists them. */
const pros = [
  { id: 'zephyrline', name: 'Zephyrline HVAC', meta: 'HVAC · 2 jobs · last Oct 2026' },
  { id: 'bluequail', name: 'Bluequail Air Service', meta: 'HVAC · 1 job · Aug 2' },
  { id: 'fernhollow', name: 'Fernhollow Pool Care', meta: 'Pool care · 1 job · May 30', webOnly: true },
  {
    id: 'copperwick',
    name: 'Copperwick Pipe Co.',
    meta: 'Plumbing · recommended Nov 9',
    mobileMeta: 'Plumbing · you recommended them Nov 9',
    disabled: true,
  },
];

const trades = ['Electrical', 'HVAC', 'Plumbing', 'Pool care', 'Roofing', 'Appliances', 'Pest control'].map((t) => ({ value: t, label: t }));

/**
 * C90 Recommend a vendor — Figma mobile 300:32033, web 300:32750 (J1 Community contributions step 2);
 * "Business not on HouseCue" state 290:231 (mobile) / 290:535 (web) via the segmented control.
 */
export default function RecommendVendor(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [source, setSource] = useState<Source>('jobs');
  const [proId, setProId] = useState('zephyrline');
  const [why, setWhy] = useState('On time, explained the repair, fair price.');
  const [business, setBusiness] = useState('Saguaro Spark Electric');
  const [trade, setTrade] = useState('Electrical');
  const [contact, setContact] = useState('(480) 555-0147');
  const [outsideWhy, setOutsideWhy] = useState('Rewired our panel, clean work');

  const isWeb = device === 'web';
  const pro = pros.find((p) => p.id === proId) ?? pros[0];
  const primaryLabel = source === 'jobs' ? `Recommend ${pro.name}` : 'Send recommendation';

  const segmented = (
    <div className="hc-c90-segmented" role="tablist" aria-label="Who do you recommend?">
      {(
        [
          ['jobs', isWeb ? 'A pro from my jobs' : 'From my jobs'],
          ['outside', isWeb ? 'A business not on HouseCue' : 'Not on HouseCue'],
        ] as const
      ).map(([key, label]) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={source === key}
          className={['hc-c90-segment', source === key && 'hc-c90-segment--selected'].filter(Boolean).join(' ')}
          onClick={() => setSource(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );

  const proOptions = (
    <div className={isWeb ? 'hc-c90-options hc-c90-options--web' : 'hc-c90-options'} role="radiogroup" aria-label="Pros from your jobs">
      {pros
        .filter((p) => isWeb || !p.webOnly)
        .map((p) => (
          <OptionCard
            key={p.id}
            role="radio"
            aria-checked={proId === p.id}
            selected={proId === p.id}
            disabled={p.disabled}
            className={p.disabled ? 'hc-c90-option--disabled' : undefined}
            title={p.name}
            description={!isWeb && p.mobileMeta ? p.mobileMeta : p.meta}
            onClick={() => setProId(p.id)}
          />
        ))}
    </div>
  );

  const fromJobs = (
    <>
      {proOptions}
      <Input
        label="Why? (optional, one line)"
        value={why}
        onValueChange={setWhy}
        helper={isWeb ? 'Shown on their profile without your name' : undefined}
      />
    </>
  );

  const outside = (
    <>
      <Input label="Business name" value={business} onValueChange={setBusiness} />
      <Select label="Trade" options={trades} value={trade} onValueChange={setTrade} />
      <Input label="Phone or email" type="phone" value={contact} onValueChange={setContact} />
      <Input label="Why? (optional, one line)" value={outsideWhy} onValueChange={setOutsideWhy} />
    </>
  );

  if (!isWeb) {
    return (
      <MobileShell
        header={{ title: 'Recommend a pro' }}
        bottom={<BottomActions primaryLabel={primaryLabel} onPrimary={flow.goNext} secondaryLabel="Cancel" onSecondary={flow.goBack} />}
      >
        <h1 className="hc-h3">Who do you recommend?</h1>
        {segmented}
        {source === 'jobs' ? fromJobs : outside}
        <Banner tone="info">
          {source === 'jobs'
            ? 'Pros see “A homeowner in 85254”, never your name. If you delete your account, it keeps counting, de-identified.'
            : 'We’ll invite them: “A HouseCue homeowner recommended you.” Your recommendation is held and counts when they join. Your name is never shared.'}
        </Banner>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="account">
      <div className="hc-c90-web">
        <button type="button" className="hc-c90-back" onClick={() => flow.go('C91')}>
          ‹ Account · My contributions
        </button>
        <header className="hc-c90-web__head">
          <h1 className="hc-h2">Recommend a pro</h1>
          <p className="hc-medium hc-muted">
            Your recommendation shows as “Recommended by N HouseCue homeowners” on their profile and quotes, and feeds their reputation. One per pro.
          </p>
        </header>
        <div className="hc-c90-web__cols">
          <section className="hc-c90-card hc-c90-card--main">
            <h2 className="hc-large-bold">Who do you recommend?</h2>
            {segmented}
            {source === 'jobs' ? fromJobs : outside}
            {source === 'outside' && (
              <Banner tone="info">
                We’ll invite them: “A HouseCue homeowner recommended you.” Your recommendation is held and counts when they join. Your name is never
                shared.
              </Banner>
            )}
            <div className="hc-c90-actions">
              <Button onClick={flow.goNext}>{primaryLabel}</Button>
              <Button variant="tertiary" onClick={flow.goBack}>
                Cancel
              </Button>
            </div>
          </section>
          <aside className="hc-c90-web__side">
            <section className="hc-c90-card hc-c90-card--side">
              <h2 className="hc-large-bold">How recommendations work</h2>
              <p className="hc-medium">• Shown as a count on the pro’s profile and quote cards.</p>
              <p className="hc-medium">
                • Counts toward their Reputation score. Homeowners with a verified home and completed HouseCue jobs count fully; others count partly.
              </p>
              <p className="hc-medium">• One per pro. Remove it any time in My contributions.</p>
            </section>
            <Banner tone="info" title="Your name stays private">
              Pros see “A homeowner in 85254, Nov 2026”. If you later delete your account, the recommendation keeps counting, de-identified.
            </Banner>
          </aside>
        </div>
      </div>
    </WebShell>
  );
}
