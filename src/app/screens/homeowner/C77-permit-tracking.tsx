import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { ListRow } from '../../../components/ListRow/ListRow';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { TimelineStep, type TimelineStepState } from '../../../components/TimelineStep/TimelineStep';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C77-permit-tracking.css';

/* C77 Permit tracking — Figma batch W2 (68:1659). J1 Job in progress step 4 (mobile 217:31259, web 217:31994). No state frames. */

const PERMIT_TITLE = 'AC replacement · P-24-1182';

type Step = { state: TimelineStepState; title: string; mobileMeta?: string; webMeta?: string };

const STEPS: Step[] = [
  { state: 'done', title: 'Applied', mobileMeta: 'Jun 3 · Desert Air pulled it', webMeta: 'Jun 3' },
  { state: 'done', title: 'Issued', mobileMeta: 'Jun 6', webMeta: 'Jun 6' },
  { state: 'current', title: 'Final inspection', mobileMeta: 'Jun 20 · 8 am–12 pm', webMeta: 'Jun 20 · 8 am–12 pm' },
  { state: 'upcoming', title: 'Closed' },
];

const PERMITS = [
  { project: 'AC replacement', permit: 'P-24-1182', pulledBy: 'Desert Air', status: 'Inspection Jun 20' },
  { project: 'Patio cover', permit: 'P-23-0711', pulledBy: 'You', status: 'Closed' },
  { project: 'Water heater swap', permit: '—', pulledBy: 'Not needed', status: '—' },
];

export default function PermitTracking(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const mobile = device === 'mobile';

  const timeline = (
    <ol className="hc-c77-timeline">
      {STEPS.map((s) => (
        <TimelineStep key={s.title} state={s.state} title={s.title} meta={mobile ? s.mobileMeta : s.webMeta} />
      ))}
    </ol>
  );

  if (mobile) {
    return (
      <MobileShell header={{ title: 'Permit tracking' }} tab="home" background="page">
        <section className="hc-c77-card">
          <h2 className="hc-large-bold">{PERMIT_TITLE}</h2>
          <StatusPill className="hc-c77-pill" label="Inspection booked" tone="warning" />
          {timeline}
        </section>
        <ListRow title="Water heater swap" description="Permit not needed · City of Tucson" />
        <Button fullWidth onClick={flow.goNext}>
          Add a permit
        </Button>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="home">
      <div className="hc-c77-web">
        <header className="hc-c77-web__head">
          <h1 className="hc-h2">Permit tracking</h1>
          <p className="hc-medium hc-muted">Permits for home projects, from application to final inspection</p>
        </header>
        <div className="hc-c77-web__cols">
          <div className="hc-c77-web__main">
            <table className="hc-c77-table">
              <thead>
                <tr>
                  <th scope="col">Project</th>
                  <th scope="col" className="hc-c77-table__permit">Permit</th>
                  <th scope="col" className="hc-c77-table__by">Pulled by</th>
                  <th scope="col" className="hc-c77-table__status">Status</th>
                </tr>
              </thead>
              <tbody>
                {PERMITS.map((p) => (
                  <tr key={p.project}>
                    <th scope="row">{p.project}</th>
                    <td>{p.permit}</td>
                    <td>{p.pulledBy}</td>
                    <td>{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div>
              <Button onClick={flow.goNext}>Add a permit</Button>
            </div>
          </div>
          <aside className="hc-c77-web__side">
            <section className="hc-c77-card">
              <h2 className="hc-large-bold">{PERMIT_TITLE}</h2>
              {timeline}
            </section>
            <Banner tone="info">Closed permits are saved to your vault and the improvement cost log.</Banner>
          </aside>
        </div>
      </div>
    </WebShell>
  );
}
