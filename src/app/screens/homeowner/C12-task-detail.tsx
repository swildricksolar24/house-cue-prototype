import { useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { Input } from '../../../components/Input/Input';
import { Radio } from '../../../components/Radio/Radio';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { planTaskDetails } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { DialogClose } from '../../shells/DialogClose';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C12-task-detail.css';

/**
 * C12 Task detail — one screen, three journey variants:
 * - "Task detail" (J1 Home record step 2): Figma mobile 216:15078, web 216:16677
 * - "Guide step with footnote credit" (Community contributions step 4): mobile 300:32261, web 300:33124
 * - "Suggest a change (sheet)" (Community contributions step 5): mobile sheet 300:32329, web dialog 300:33277
 */

const TITLE = 'Replace HVAC filter';
const SAFETY = 'Turn the system off at the thermostat before you open the filter door.';

type GuideStep = { text: string; fn?: { mark: string; credit: string } };

const guideSteps: GuideStep[] = [
  { text: 'Turn the system off at the thermostat.' },
  {
    text: 'Open the filter door by the return vent in the hallway. Press the door in before turning the latch; it sticks on older units.',
    fn: { mark: '¹', credit: 'Thanks to Maria G.' },
  },
  { text: 'Note the airflow arrow, then slide the old filter out.' },
  {
    text: 'Slide in the new 16×25×1 filter with the arrow pointing toward the unit, and close the door.',
    fn: { mark: '²', credit: 'Thanks to Zephyrline HVAC' },
  },
  { text: 'Turn the system back on and mark the task done.' },
];

const taskSteps = [
  '1. Turn the system off at the thermostat.',
  '2. Open the filter door by the return vent in the hallway.',
  '3. Note the airflow arrow, then slide the old filter out.',
  '4. Slide in the new 16×25×1 filter with the arrow pointing toward the unit, and close the door.',
  '5. Turn the system back on and mark the task done.',
];

const changeTypes = ['Change the text', 'Add a warning', 'Add a tip', 'Add a photo'];

export default function TaskDetail({ variant }: ScreenProps) {
  if (variant === 'Guide step with footnote credit') return <Guide />;
  if (variant === 'Suggest a change (sheet)') return <Guide withSuggest />;
  return <Task />;
}

const safety = (
  <Banner tone="warning" title="Safety first">
    {SAFETY}
  </Banner>
);

function copyPart(name: string) {
  try {
    void navigator.clipboard?.writeText(name);
  } catch {
    /* clipboard unavailable */
  }
}

/* ---------- Task detail ---------- */

/**
 * Review change: the page shows the task you opened on Plan (C11 passes ?task=<id>; default the HVAC filter, as in
 * Figma): its title, kind (DIY / Pro / Check-up, Overdue), item, due date, time, cost, part, steps and safety note
 * (data/sample.ts planTaskDetails). The main action follows the kind: DIY → Mark done, Pro → Hire a pro (C13),
 * Check-up → Start check-up (C61 for that task). Mark done returns to Plan with ?done=<id>.
 */
function Task() {
  const { device } = usePrototype();
  const flow = useFlow();
  const [params] = useSearchParams();
  const id = params.get('task') && planTaskDetails[params.get('task')!] ? params.get('task')! : 'hvac-filter';
  const t = planTaskDetails[id];
  // Review change: the DIY coach walks through this task
  const doItMyself = () => flow.go('C26', `?task=${id}`);
  const hirePro = () => flow.go('C13');
  const backToPlan = () => flow.go('C11');
  const markDone = () => flow.go('C11', `?done=${id}`);
  const startCheckUp = () => flow.go('C61', `?task=${id}`);

  // Main action by kind, then the others
  const actions: { label: string; onClick: () => void }[] =
    t.kind === 'Pro'
      ? [{ label: 'Hire a pro', onClick: hirePro }, { label: 'Mark done', onClick: markDone }, { label: 'Do it myself', onClick: doItMyself }]
      : t.kind === 'Check-up'
        ? [{ label: 'Start check-up', onClick: startCheckUp }, { label: 'Mark done', onClick: markDone }, { label: 'Hire a pro', onClick: hirePro }]
        : [{ label: 'Mark done', onClick: markDone }, { label: 'Do it myself', onClick: doItMyself }, { label: 'Hire a pro', onClick: hirePro }];
  const [main, ...others] = actions;

  const pills = (
    <>
      <StatusPill label={t.kind} tone={t.kind === 'Check-up' ? 'success' : 'info'} />
      {t.overdue && <StatusPill label="Overdue" tone="danger" />}
    </>
  );
  const safetyNote = (
    <Banner tone="warning" title="Safety first">
      {t.safety}
    </Banner>
  );

  if (device === 'mobile') {
    return (
      <MobileShell
        header={{ title: 'Task' }}
        bottom={<BottomActions primaryLabel={main.label} onPrimary={main.onClick} secondaryLabel="Reschedule or skip" onSecondary={backToPlan} />}
      >
        <h1 className="hc-h3">{t.title}</h1>
        <div className="hc-c12-row">
          {pills}
          <p className="hc-small hc-muted">Due {t.due}</p>
        </div>
        <DetailRow label="Item" value={t.item} />
        <DetailRow label="Time" value={t.time} />
        <DetailRow label="Cost" value={t.cost} />
        {t.part && <DetailRow label="Part" value={`${t.part.name} · ${t.part.price}`} actionLabel="Buy from partner ↗" actionDisabled />}
        <section className="hc-c12-steps" aria-labelledby="hc-c12-steps-title">
          <h2 id="hc-c12-steps-title" className="hc-large-bold">
            Steps
          </h2>
          <ol className="hc-c12-steps__list">
            {t.steps.map((s) => (
              <li key={s} className="hc-medium">
                {s}
              </li>
            ))}
          </ol>
        </section>
        {safetyNote}
        <div className="hc-c12-pair">
          {others.map((a) => (
            <Button key={a.label} variant="secondary" onClick={a.onClick}>
              {a.label}
            </Button>
          ))}
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="plan">
      <div className="hc-c12-web">
        <div className="hc-c12-web__title">
          <h1 className="hc-h2">{t.title}</h1>
          {pills}
        </div>
        <div className="hc-c12-web__cols">
          <div className="hc-c12-web__main">
            <section className="hc-c12-card">
              <h2 className="hc-large-bold">Steps</h2>
              {t.steps.map((s, i) => (
                <p key={s} className="hc-medium">
                  {i + 1}. {s}
                </p>
              ))}
            </section>
            {safetyNote}
            {t.part && (
              <section className="hc-c12-card hc-c12-card--part">
                <h2 className="hc-large-bold">Need a part?</h2>
                <p className="hc-medium hc-muted">
                  {t.part.name} · {t.part.price} from our parts partner. HouseCue may earn a commission.
                </p>
                <Button>Buy from partner ↗</Button>
                <Button variant="secondary" onClick={() => copyPart(t.part!.name)}>
                  Copy part number
                </Button>
              </section>
            )}
          </div>
          <aside className="hc-c12-web__side">
            <section className="hc-c12-card hc-c12-card--rows">
              <DetailRow label="Item" value={t.item} />
              <DetailRow label="Due" value={t.due} />
              <DetailRow label="Time" value={t.time} />
              <DetailRow label="Cost" value={t.cost} />
            </section>
            <section className="hc-c12-card">
              <Button fullWidth onClick={main.onClick}>
                {main.label}
              </Button>
              {others.map((a) => (
                <Button key={a.label} variant="secondary" fullWidth onClick={a.onClick}>
                  {a.label}
                </Button>
              ))}
              <div className="hc-c12-links">
                <button type="button" onClick={backToPlan}>
                  Reschedule
                </button>
                <span aria-hidden>·</span>
                <button type="button" onClick={backToPlan}>
                  Skip this time
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </WebShell>
  );
}

/* ---------- Community guide (step with footnote credit) + Suggest a change ---------- */

function Guide({ withSuggest = false }: { withSuggest?: boolean }) {
  const { device } = usePrototype();
  const flow = useFlow();
  /** Mobile shows one step at a time; Figma draws step 2 */
  const [index, setIndex] = useState(1);
  const step = guideSteps[index];
  // Guide: "Suggest a change" opens the sheet (next journey step). Sheet: Cancel / scrim go back to the guide.
  const suggest = withSuggest ? undefined : flow.goNext;

  const sheet = withSuggest && <SuggestChange device={device} onSend={flow.goNext} onCancel={flow.goBack} />;

  if (device === 'mobile') {
    return (
      <MobileShell
        className="hc-c12-host"
        header={{ title: 'Guide' }}
        bottom={
          <BottomActions
            primaryLabel="Next step"
            onPrimary={() => setIndex((i) => Math.min(i + 1, guideSteps.length - 1))}
            secondaryLabel="Previous step"
            onSecondary={() => setIndex((i) => Math.max(i - 1, 0))}
          />
        }
      >
        <h1 className="hc-h3">{TITLE}</h1>
        <div className="hc-c12-row">
          <StatusPill label="Community-improved" tone="info" />
          <p className="hc-small hc-muted">
            Step {index + 1} of {guideSteps.length}
          </p>
        </div>
        <div className="hc-c12-step">
          <p className="hc-c12-step__text">
            {step.text}
            {step.fn && <span className="hc-c12-fn"> {step.fn.mark}</span>}
          </p>
          {step.fn && (
            <div className="hc-c12-footnotes">
              <p className="hc-small hc-muted">
                {step.fn.mark} {step.fn.credit}
              </p>
            </div>
          )}
          <Button variant="link" onClick={suggest}>
            Suggest a change
          </Button>
        </div>
        {safety}
        <p className="hc-small hc-muted">Community edits are checked by the Care Library agent and approved by HouseCue before they appear.</p>
        {sheet}
      </MobileShell>
    );
  }

  return (
    <WebShell nav="plan" className="hc-c12-host">
      <div className="hc-c12-web">
        <div className="hc-c12-web__title">
          <h1 className="hc-h2">{TITLE}</h1>
          <StatusPill label="DIY" tone="info" />
          <StatusPill label="Community-improved" tone="info" />
        </div>
        <div className="hc-c12-web__cols">
          <div className="hc-c12-web__main">
            <section className="hc-c12-card">
              <h2 className="hc-large-bold">Steps</h2>
              {guideSteps.map((s, i) => (
                <div key={i} className={['hc-c12-gstep', i === 1 && 'hc-c12-gstep--active'].filter(Boolean).join(' ')}>
                  <p className="hc-medium">
                    {i + 1}. {s.text}
                    {s.fn && <span className="hc-c12-fn"> {s.fn.mark}</span>}
                  </p>
                  <Button variant="link" size="small" onClick={suggest}>
                    Suggest a change
                  </Button>
                </div>
              ))}
              <div className="hc-c12-web-footnotes">
                {guideSteps
                  .filter((s) => s.fn)
                  .map((s) => (
                    <p key={s.fn!.mark} className="hc-small hc-muted">
                      {s.fn!.mark} {s.fn!.credit}
                    </p>
                  ))}
              </div>
            </section>
            {safety}
          </div>
          <aside className="hc-c12-web__side">
            <section className="hc-c12-card hc-c12-card--rows">
              <DetailRow label="Item" value="AC / heat pump · Trane XR14" />
              <DetailRow label="Time" value="About 15 minutes" />
              <DetailRow label="Cost" value="$12–$25 for the filter" />
            </section>
            <section className="hc-c12-card">
              <h2 className="hc-large-bold">Community-improved</h2>
              <p className="hc-medium hc-muted">
                3 accepted edits from homeowners and pros. Hover any step and choose Suggest a change; the Care Library agent checks it and
                HouseCue approves before it appears.
              </p>
            </section>
          </aside>
        </div>
      </div>
      {sheet}
    </WebShell>
  );
}

function SuggestChange({ device, onSend, onCancel }: { device: 'mobile' | 'web'; onSend: () => void; onCancel: () => void }) {
  const [type, setType] = useState(changeTypes[0]);
  const [text, setText] = useState('Filters by the return vent can be 1 or 4 inches thick; check the old one before you buy.');
  const web = device === 'web';

  const body: ReactNode = (
    <>
      <h2 className="hc-h4" id="hc-c12-suggest-title">
        Suggest a change to step 2
      </h2>
      <p className="hc-small hc-muted">
        {web
          ? '“Open the filter door by the return vent in the hallway. Press the door in before turning the latch…”'
          : '“Open the filter door by the return vent in the hallway…”'}
      </p>
      <div className={['hc-c12-radios', web && 'hc-c12-radios--row'].filter(Boolean).join(' ')} role="radiogroup" aria-label="Type of change">
        {changeTypes.map((t) => (
          <Radio key={t} name="hc-c12-change" label={t} checked={type === t} onChange={() => setType(t)} />
        ))}
      </div>
      <Input label="Your change" type="multiline" value={text} onValueChange={setText} />
      <p className="hc-small hc-muted">
        If approved, a footnote on this step thanks you as “Maria G.” If the step text changes later, your name comes off.
        {web && ' You can follow it in My contributions.'}
      </p>
    </>
  );

  if (web) {
    return (
      <div className="hc-c12-dialog-layer">
        <div className="hc-c12-dialog" role="dialog" aria-modal="true" aria-labelledby="hc-c12-suggest-title">
          <DialogClose onClick={onCancel} />
          {body}
          <div className="hc-c12-dialog__actions">
            <Button variant="tertiary" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onSend}>Send for review</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hc-c12-overlay">
      <button type="button" className="hc-c12-scrim" aria-label="Close" onClick={onCancel} />
      <div className="hc-c12-sheet" role="dialog" aria-modal="true" aria-labelledby="hc-c12-suggest-title">
        <button type="button" className="hc-c12-grabber" aria-label="Close" onClick={onCancel} />
        <DialogClose onClick={onCancel} />
        {body}
        <Button size="large" fullWidth onClick={onSend}>
          Send for review
        </Button>
        <Button variant="tertiary" fullWidth onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
