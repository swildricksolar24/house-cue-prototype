import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { ImagePlaceholder } from '../../../components/ImagePlaceholder/ImagePlaceholder';
import { Input } from '../../../components/Input/Input';
import { TimelineStep } from '../../../components/TimelineStep/TimelineStep';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C73-insurance-claim.css';

/** C73 Insurance claim — Figma mobile 218:17147, web 218:17910 (J1 Warranty / dispute, step 4). No state frames. */

// Figma keeps an empty meta line (zero-width space) under steps without detail, so every step has the same height
const BLANK = '​';

const PREPARE_TITLE = "We'll prepare your claim; you submit it to your insurer";

export default function InsuranceClaim(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();

  const insurer = <Input label="Insurer" defaultValue="Desert Mutual" />;
  const deductible = <Input label="Deductible" type="number" defaultValue="$1,000" />;

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Insurance claim' }} tab="jobs" background="page" padding="none">
        <div className="hc-c73-mobile">
          <ol className="hc-c73-timeline">
            <TimelineStep state="done" title="Damage captured" meta="14 photos, 2 videos · 2 rooms" />
            <TimelineStep state="current" title="Policy details" meta={BLANK} />
            <TimelineStep state="upcoming" title="Claim pack" meta={BLANK} />
            <TimelineStep state="upcoming" title="You file · adjuster visit" meta={BLANK} />
          </ol>
          {insurer}
          {deductible}
          <Banner tone="info" title={PREPARE_TITLE}>
            Review the claim pack, download it, then file it with your insurer. HouseCue never submits it for you.
          </Banner>
          <Button fullWidth onClick={flow.goNext}>
            Review &amp; file
          </Button>
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="jobs">
      <div className="hc-c73-web">
        <header className="hc-c73-web__head">
          <h1 className="hc-h2">Insurance claim</h1>
          <p className="hc-medium hc-muted">Water damage · Jan 4, 2027 · kitchen and hallway</p>
        </header>
        <div className="hc-c73-web__cols">
          <div className="hc-c73-web__main">
            <section className="hc-c73-card">
              <h2 className="hc-large-bold">Damage</h2>
              <ImagePlaceholder label="Kitchen · 9 photos" />
              <div className="hc-c73-kv">
                <span className="hc-medium hc-muted">Date and cause</span>
                <span className="hc-medium-semibold">Jan 4 · supply line burst</span>
              </div>
              <div className="hc-c73-kv">
                <span className="hc-medium hc-muted">Items affected</span>
                <span className="hc-medium-semibold">Cabinets, flooring, dishwasher</span>
              </div>
              <p className="hc-small hc-muted">Maintenance history is attached to show the home was kept up.</p>
            </section>
            {insurer}
            <Input label="Policy number" defaultValue="HO-••••-2291" />
            {deductible}
          </div>
          <aside className="hc-c73-web__side">
            <section className="hc-c73-card">
              <h2 className="hc-large-bold">Status</h2>
              <ol className="hc-c73-timeline">
                <TimelineStep state="done" title="Damage captured" meta={BLANK} />
                <TimelineStep state="current" title="Policy details" meta={BLANK} />
                <TimelineStep state="upcoming" title="Claim pack (PDF)" meta={BLANK} />
                <TimelineStep state="upcoming" title="You file · adjuster visit" meta={BLANK} />
                <TimelineStep state="upcoming" title="Decision and payout" meta={BLANK} />
              </ol>
            </section>
            <Banner tone="warning">Take photos before any repair starts.</Banner>
            <Banner tone="info" title={PREPARE_TITLE}>
              Review the claim pack, download it, then file it with your insurer using the link or phone number shown.
              HouseCue never submits the claim for you.
            </Banner>
            <div>
              <Button onClick={flow.goNext}>Review &amp; file</Button>
            </div>
          </aside>
        </div>
      </div>
    </WebShell>
  );
}
