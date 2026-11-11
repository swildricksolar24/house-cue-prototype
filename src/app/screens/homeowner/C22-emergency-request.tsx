import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { ListRow } from '../../../components/ListRow/ListRow';
import { OptionCard } from '../../../components/OptionCard/OptionCard';
import { QuoteRow } from '../../../components/QuoteRow/QuoteRow';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C22-emergency-request.css';

const KINDS = [
  { id: 'water', title: 'Water leak', description: 'Water where it shouldn’t be' },
  { id: 'hvac', title: 'No heat or cooling', description: 'System down in extreme weather' },
  { id: 'electrical', title: 'Electrical', description: 'Sparks, burning smell, no power' },
  { id: 'other', title: 'Something else', description: 'Sewage, roof, broken lock' },
];

const STEPS = [
  '1. Shut off the water at the main: front yard, by the sidewalk (from your shutoff map).',
  '2. Turn off power to wet areas at the breaker panel in the garage.',
  '3. Move valuables away from the water and take photos.',
];

/** Invented sample 24/7 pros from the Figma frames */
const PROS = [
  {
    vendor: 'Monsoon Plumbing',
    price: '+$95',
    trust: 88,
    rating: '★ 4.7 (210) · 24/7 · Licensed · Insured',
    details: 'Can arrive in about 35 min · $95 emergency surcharge plus the job price',
  },
  {
    vendor: 'Quillfeather Drain Co.',
    price: '+$0',
    trust: 79,
    rating: '★ 4.5 (84) · 24/7 · Licensed · Insured',
    details: 'Can arrive in about 50 min · no surcharge set, normal rates apply',
  },
];

/** Kill-switch fallback list (Figma 230:40090) */
const DIRECT_PROS = [
  { name: 'Valley 24/7 Plumbing', meta: '(602) 555-0142 · surcharge $95' },
  { name: 'Copper State Rooter', meta: '(602) 555-0188 · surcharge $120' },
  { name: 'Dry Wash Water Damage', meta: '(520) 555-0117 · surcharge $150' },
];

/** C22 Emergency request — Figma mobile 218:15991, web 218:16363 (J1 Emergency step 1).
 *  State ?state=paused = "Agent paused (kill switch)" (mobile 230:40090; web is a matching layout, no Figma frame). */
export default function EmergencyRequest(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [params] = useSearchParams();
  const [paused] = useState(params.get('state') === 'paused');
  const [kind, setKind] = useState('water');
  const [showSteps, setShowSteps] = useState(false);

  const gasBanner = (
    <Banner tone="error" title="Smell gas? Leave the house now.">
      Then call your gas company or 911 from outside. Don’t use switches or flames.
    </Banner>
  );
  const pausedBanner = (
    <Banner tone="warning" title="Your agent is paused right now">
      HouseCue has paused agent outreach. Call one of these 24/7 pros directly. Their emergency surcharge is shown before you agree.
    </Banner>
  );
  const directPros = (
    <div>
      {DIRECT_PROS.map((p) => (
        <ListRow key={p.name} title={p.name} description={p.meta} />
      ))}
    </div>
  );
  const stepsCard = (
    <section className="hc-c22-card">
      <h2 className="hc-large-bold">Do this now</h2>
      {STEPS.map((s) => (
        <p key={s} className="hc-medium">
          {s}
        </p>
      ))}
    </section>
  );

  if (device === 'mobile') {
    if (paused) {
      return (
        <MobileShell
          header={{ title: 'Emergency' }}
          bottom={
            <BottomActions
              primaryLabel={`Call ${DIRECT_PROS[0].name}`}
              onPrimary={flow.goNext}
              secondaryLabel="Safety steps"
              onSecondary={() => setShowSteps((v) => !v)}
            />
          }
        >
          {gasBanner}
          {pausedBanner}
          {showSteps && stepsCard}
          {directPros}
        </MobileShell>
      );
    }

    return (
      <MobileShell
        header={{ title: 'Emergency' }}
        bottom={<BottomActions primaryLabel="Find a pro now" onPrimary={flow.goNext} secondaryLabel="Add a photo or voice note" />}
      >
        {gasBanner}
        <h2 className="hc-large-bold">What’s happening?</h2>
        <div className="hc-c22-options" role="radiogroup" aria-label="What’s happening?">
          {KINDS.map((k) => (
            <OptionCard
              key={k.id}
              role="radio"
              aria-checked={kind === k.id}
              title={k.title}
              description={k.description}
              selected={kind === k.id}
              onClick={() => setKind(k.id)}
            />
          ))}
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="home">
      <div className="hc-c22-web">
        <header className="hc-c22-web__head">
          <h1 className="hc-h2">Water leak · started 2:14 AM</h1>
          <Button variant="secondary" onClick={() => flow.go('C32')}>
            Get help from a person
          </Button>
        </header>
        <div className="hc-c22-web__cols">
          <div className="hc-c22-web__left">
            {paused && gasBanner}
            {stepsCard}
            {!paused && (
              <Banner tone="info" title="Free to cancel">
                You can cancel at no charge until a pro is dispatched.
              </Banner>
            )}
          </div>
          <section className="hc-c22-card hc-c22-web__right">
            {paused ? (
              <>
                {pausedBanner}
                {directPros}
                <div>
                  <Button onClick={flow.goNext}>{`Call ${DIRECT_PROS[0].name}`}</Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="hc-large-bold">Pros who can come now</h2>
                <p className="hc-small hc-muted">Each pro sets its own emergency surcharge. Nothing is booked until you accept.</p>
                {PROS.map((p) => (
                  <QuoteRow
                    key={p.vendor}
                    vendor={p.vendor}
                    price={p.price}
                    trustScore={p.trust}
                    rating={p.rating}
                    reviews="HouseCue job reviews ★ 4.8 · 126 jobs"
                    nearby="3 recent jobs within 2 miles"
                    details={p.details}
                    chooseLabel="Accept"
                    onChoose={flow.goNext}
                    onProfile={() => flow.go('C15')}
                  />
                ))}
              </>
            )}
          </section>
        </div>
      </div>
    </WebShell>
  );
}
