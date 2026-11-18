import { useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { CreditsMeter } from '../../../components/CreditsMeter/CreditsMeter';
import { Input } from '../../../components/Input/Input';
import { OptionCard } from '../../../components/OptionCard/OptionCard';
import { systems } from '../../data/sample';
import { FormDialog } from '../../shells/EditDialog';
import './_new-request-dialog.css';

const URGENCY = ['This week (your preference)', 'Today', 'Within 2 weeks'];
const WINDOWS = ['Default: 24 hours', '12 hours', '48 hours'];

const ITEMS = [
  ...systems
    .filter((s) => s.id !== 'pool-pump')
    .map((s) => ({ id: s.id, title: s.name, description: `${s.model} · ${s.age}` })),
  { id: 'not-sure', title: 'Not sure', description: 'Describe it and your agent will work it out' },
];

/**
 * Review change: "New request" on C40 My jobs opens this dialog over the page instead of going to C13. Same content as
 * C13 Request a service: Which item? (your systems, or Not sure), What's happening? (required), Add photo / video /
 * sound, Urgency and Quote window, the credits note and "What happens next". Continue with the agent starts the request
 * (C48 Outreach progress, as C13 does); Cancel, × or Esc keeps you on My jobs.
 */
export function NewRequestDialog({ onContinue, onCancel }: { onContinue: () => void; onCancel: () => void }) {
  const [item, setItem] = useState('ac');
  const [details, setDetails] = useState('');
  const [detailsError, setDetailsError] = useState<string | undefined>();

  return (
    <FormDialog
      title="New job"
      description="Tell your agent what needs help. It drafts a brief for you to check before anything goes to pros."
      width="wide"
      fields={[
        { key: 'urgency', label: 'Urgency', field: { kind: 'select', options: URGENCY } },
        { key: 'window', label: 'Quote window', field: { kind: 'select', options: WINDOWS } },
      ]}
      values={{ urgency: URGENCY[0], window: WINDOWS[0] }}
      submitLabel="Continue with the agent"
      countsAsEdit={false}
      beforeSave={() => {
        if (details.trim()) return true;
        setDetailsError('Describe what’s happening.');
        return false;
      }}
      onSave={onContinue}
      onCancel={onCancel}
      after={
        <>
          <CreditsMeter size="compact" balance="180 · this search uses 10 credits, only if a quote arrives" />
          <Banner title="What happens next">
            Your agent asks up to 3 questions, then drafts a brief for you to check. Nothing goes to pros until you tap Find pros.
          </Banner>
        </>
      }
    >
      <section className="hc-new-request__section" aria-labelledby="hc-new-request-item">
        <h3 id="hc-new-request-item" className="hc-medium-semibold">
          Which item?
        </h3>
        <div role="radiogroup" aria-labelledby="hc-new-request-item" className="hc-new-request__items">
          {ITEMS.map((i) => (
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
      </section>
      <section className="hc-new-request__section">
        <Input
          type="multiline"
          label="What’s happening?"
          placeholder="e.g. Warm air from the upstairs vents since yesterday. The unit outside is running."
          rows={3}
          value={details}
          onValueChange={(v) => {
            setDetails(v);
            if (detailsError) setDetailsError(undefined);
          }}
          error={detailsError}
        />
        <div className="hc-new-request__media">
          <Button variant="secondary" size="small">
            Add photo
          </Button>
          <Button variant="secondary" size="small">
            Add video
          </Button>
          <Button variant="secondary" size="small">
            Record sound
          </Button>
        </div>
      </section>
    </FormDialog>
  );
}
