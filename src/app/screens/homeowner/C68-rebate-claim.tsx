import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { ListRow } from '../../../components/ListRow/ListRow';
import { MetricRow } from '../../../components/MetricRow/MetricRow';
import { TimelineStep } from '../../../components/TimelineStep/TimelineStep';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C68-rebate-claim.css';

const PROOF = [
  { title: 'Invoice', description: 'Found in your vault · job J-20411' },
  { title: 'AHRI certificate', description: 'Agent asked Desert Air for it' },
  { title: 'Model and serial', description: 'From your AC record' },
  { title: 'Installer license', description: 'ROC 312845 · verified' },
];

/** C68 Rebate claim — Figma mobile 218:19987, web 218:21431 (J1 Membership & credits step 7) */
export default function RebateClaim(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();

  const proof = (items: typeof PROOF) => items.map((p) => <ListRow key={p.title} title={p.title} description={p.description} />);

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Rebate claim' }} tab="plan" background="page">
        <div className="hc-c68-stack">
          <section className="hc-c68-card">
            <h2 className="hc-large-bold">SRP AC rebate · $400</h2>
            <MetricRow label="Sponsor" value="SRP" />
            <MetricRow label="Deadline" value="Mar 31, 2027" />
            <MetricRow label="Status" value="Ready to submit" />
          </section>
          <h3 className="hc-medium-semibold">Proof checklist</h3>
          <div>{proof(PROOF.slice(0, 3))}</div>
          <Button fullWidth onClick={flow.goNext}>
            Submit with agent
          </Button>
          <p className="hc-small hc-muted">If SRP doesn’t accept agent submissions, you submit the pack the agent prepared.</p>
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="plan">
      <div className="hc-c68-web">
        <header className="hc-c68-web__head">
          <h1 className="hc-h2">Rebate claim</h1>
          <p className="hc-medium hc-muted">SRP AC rebate · $400 · deadline Mar 31, 2027</p>
        </header>
        <div className="hc-c68-web__cols">
          <div className="hc-c68-web__main">
            <section className="hc-c68-card">
              <h2 className="hc-large-bold">Proof checklist</h2>
              {proof(PROOF)}
            </section>
            <div className="hc-c68-actions">
              <Button onClick={flow.goNext}>Submit with agent</Button>
              <Button variant="secondary">Download claim pack</Button>
            </div>
          </div>
          <div className="hc-c68-web__side">
            <section className="hc-c68-card">
              <h2 className="hc-large-bold">Status</h2>
              <ol className="hc-c68-timeline">
                <TimelineStep state="current" title="Ready to submit" meta="Checklist complete" />
                <TimelineStep state="upcoming" title="Approved" />
                <TimelineStep state="upcoming" title="Paid" meta="Added to Money saved" />
              </ol>
            </section>
            <Banner>Denied claims show the reason, with an option to resubmit.</Banner>
          </div>
        </div>
      </div>
    </WebShell>
  );
}
