import { useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { CreditsMeter } from '../../../components/CreditsMeter/CreditsMeter';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { Input } from '../../../components/Input/Input';
import { OptionCard } from '../../../components/OptionCard/OptionCard';
import { Upload } from '../../../components/Upload/Upload';
import { systems } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C13-request-a-service.css';

const TENANT_VARIANT = 'Report an issue (tenant mode)';

const URGENCY = ['This week (your preference)', 'Today', 'Within 2 weeks'];
const WINDOWS = ['Default: 24 hours', '12 hours', '48 hours'];
const CATEGORIES = ['Plumbing', 'HVAC', 'Electrical', 'Appliances', 'Pests', 'Locks'];

const items = [
  ...systems
    .filter((s) => s.id !== 'pool-pump')
    .map((s) => ({ id: s.id, title: s.name, description: `${s.model} · ${s.age}` })),
  { id: 'not-sure', title: 'Not sure', description: 'Describe it and your agent will work it out' },
];

/**
 * C13 Request a service — Figma mobile 216:18644, web 216:19860 (J1 Request quotes step 2).
 * Variant "Report an issue (tenant mode)" — Figma mobile 272:34220, web 272:35171 (Tenant journey step 4).
 */
export default function RequestAService({ variant }: ScreenProps) {
  return variant === TENANT_VARIANT ? <TenantReport /> : <HomeownerRequest />;
}

function HomeownerRequest() {
  const { device } = usePrototype();
  const flow = useFlow();
  const [item, setItem] = useState('ac');
  const [details, setDetails] = useState('Warm air from the upstairs vents since yesterday. The unit outside is running.');
  const [urgency, setUrgency] = useState(0);
  const [quoteWindow, setQuoteWindow] = useState(0);
  const [saved, setSaved] = useState(false);

  const description = (
    <Input
      type="multiline"
      label="What’s happening?"
      hideLabel
      rows={3}
      value={details}
      onValueChange={setDetails}
    />
  );

  const rows = (
    <>
      <DetailRow
        label="Urgency"
        value={URGENCY[urgency]}
        actionLabel="Edit"
        onAction={() => setUrgency((i) => (i + 1) % URGENCY.length)}
      />
      <DetailRow
        label="Quote window"
        value={WINDOWS[quoteWindow]}
        actionLabel="Edit"
        onAction={() => setQuoteWindow((i) => (i + 1) % WINDOWS.length)}
      />
      <CreditsMeter className="hc-c13-credits" size="compact" balance="180 · this search uses 10 credits, only if a quote arrives" />
    </>
  );

  const optionCards = (list: typeof items) => (
    <div role="radiogroup" aria-label="Which item?" className="hc-c13-options">
      {list.map((i) => (
        <OptionCard
          key={i.id}
          role="radio"
          aria-checked={item === i.id}
          icon="home"
          title={i.title}
          description={i.description}
          selected={item === i.id}
          onClick={() => setItem(i.id)}
        />
      ))}
    </div>
  );

  if (device === 'mobile') {
    return (
      <MobileShell
        header={{ title: 'New request' }}
        bottom={
          <BottomActions
            primaryLabel="Continue with the agent"
            onPrimary={flow.goNext}
            secondaryLabel={saved ? 'Draft saved' : 'Save draft'}
            onSecondary={() => setSaved(true)}
          />
        }
      >
        <h2 className="hc-large-bold">What needs help?</h2>
        {optionCards(items.filter((i) => i.id === item))}
        {description}
        <div className="hc-c13-media hc-c13-media--fill">
          <Button variant="secondary">Add photo</Button>
          <Button variant="secondary">Record sound</Button>
        </div>
        {rows}
      </MobileShell>
    );
  }

  return (
    <WebShell nav="plan">
      <div className="hc-c13-web">
        <h1 className="hc-h2">New request</h1>
        <div className="hc-c13-web__cols">
          <div className="hc-c13-web__main">
            <section className="hc-c13-card">
              <h2 className="hc-large-bold">Which item?</h2>
              {optionCards(items)}
            </section>
            <section className="hc-c13-card">
              <h2 className="hc-large-bold">What’s happening?</h2>
              {description}
              <div className="hc-c13-media">
                <Button variant="secondary">Add photo</Button>
                <Button variant="secondary">Add video</Button>
                <Button variant="secondary">Record sound</Button>
              </div>
            </section>
          </div>
          <aside className="hc-c13-web__side">
            <section className="hc-c13-card hc-c13-card--rows">{rows}</section>
            <Banner title="What happens next">
              Your agent asks up to 3 questions, then drafts a brief for you to check. Nothing goes to pros until you tap Find
              pros.
            </Banner>
            <Button fullWidth onClick={flow.goNext}>
              Continue with the agent
            </Button>
          </aside>
        </div>
      </div>
    </WebShell>
  );
}

function TenantReport() {
  const { device } = usePrototype();
  const flow = useFlow();
  const [issue, setIssue] = useState('Water under the kitchen sink; cabinet floor is wet');
  const [room, setRoom] = useState('Kitchen · sink');
  const [category, setCategory] = useState('Plumbing');

  const issueField = <Input type="multiline" label="What’s wrong?" rows={3} value={issue} onValueChange={setIssue} />;

  const categories = (label: string) => (
    <div className="hc-c13-category">
      <p className="hc-medium-semibold" id="hc-c13-category-label">
        {label}
      </p>
      <div className="hc-c13-chips" role="radiogroup" aria-labelledby="hc-c13-category-label">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={category === c}
            className={['hc-c13-chip', category === c && 'hc-c13-chip--selected'].filter(Boolean).join(' ')}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );

  const upload = <Upload state="done" fileName="sink-leak.jpg" meta="3 photos · 1 video" />;

  if (device === 'mobile') {
    return (
      <MobileShell
        role="tenant"
        header={{ title: 'Report an issue' }}
        bottom={<BottomActions primaryLabel="Send to landlord" onPrimary={flow.goNext} />}
      >
        {issueField}
        {categories('Category')}
        {upload}
        <p className="hc-small hc-muted">Your landlord gets this with the agent’s triage. You won’t see quotes or prices.</p>
      </MobileShell>
    );
  }

  return (
    <WebShell role="tenant" nav="home">
      <div className="hc-c13-web">
        <h1 className="hc-h2">Report an issue</h1>
        <div className="hc-c13-web__cols">
          <div className="hc-c13-web__main hc-c13-web__main--form">
            {issueField}
            <Input label="Room or item" value={room} onValueChange={setRoom} />
            {categories('Category (allowed by your landlord)')}
          </div>
          <aside className="hc-c13-web__side hc-c13-web__side--tenant">
            {upload}
            <Banner title="Goes to your landlord">
              The agent triages it and sends it to Mesa Verde Holdings. You won’t see quotes or prices.
            </Banner>
            <Button fullWidth onClick={flow.goNext}>
              Send to landlord
            </Button>
          </aside>
        </div>
      </div>
    </WebShell>
  );
}
