import { Button } from '../../../components/Button/Button';
import { CreditsMeter } from '../../../components/CreditsMeter/CreditsMeter';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { TaskRow } from '../../../components/TaskRow/TaskRow';
import { currentHome } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C29-subscription-management.css';

const INVOICES = [
  { id: 'annual', title: 'Membership, annual', meta: '$49.00 · Mar 15, 2026' },
  { id: 'pack', title: 'Credit pack · 40 credits', meta: '$9.99 · Jan 8, 2026' },
];

/**
 * C29 Subscription management — Figma mobile 218:19402, web 218:20578 (J1 Membership & credits step 2).
 * "Cancel membership" continues to C54 (choose the 10 items that stay active on Free).
 */
export default function SubscriptionManagement(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Subscription' }} tab="account">
        <DetailRow label="Home" value={currentHome.address} />
        <DetailRow label="Plan" value="Member · annual · $49" actionLabel="Edit" onAction={() => flow.go('C28')} />
        <DetailRow label="Renews" value="Mar 15, 2027" />
        <DetailRow label="Billed to" value="Visa •• 4242 (web checkout)" actionLabel="Edit" onAction={() => flow.go('C30')} />
        <CreditsMeter size="compact" balance="180 · usage and packs in C50" onAction={() => flow.go('C50')} />
        <section className="hc-c29-card hc-c29-card--saved">
          <p className="hc-medium-semibold">Saved this year: $86</p>
          <p className="hc-small hc-muted">From 1 warranty claim filed for you</p>
        </section>
        <button type="button" className="hc-c29-cancel" onClick={flow.goNext}>
          Cancel membership
        </button>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="account">
      <div className="hc-c29-web">
        <h1 className="hc-h2">Subscription · {currentHome.address}</h1>
        <div className="hc-c29-web__cols">
          <div className="hc-c29-web__col">
            <section className="hc-c29-card hc-c29-card--web">
              <h2 className="hc-large-bold">Your plan</h2>
              <DetailRow label="Plan" value="Member · annual · $49" actionLabel="Switch to monthly" onAction={() => flow.go('C28')} />
              <DetailRow label="Renews" value="Mar 15, 2027" />
              <DetailRow label="Billed to" value="Visa •• 4242 (web checkout)" actionLabel="Edit" onAction={() => flow.go('C30')} />
              <CreditsMeter balance="180 credits" level={0.34} onAction={() => flow.go('C50')} />
            </section>
            <section className="hc-c29-card hc-c29-card--web hc-c29-card--saved">
              <h2 className="hc-large-bold">Saved this year: $86</h2>
              <p className="hc-small hc-muted">
                From 1 warranty claim filed for you. If an annual membership saves you less than $49, you get the difference back.
              </p>
            </section>
          </div>
          <div className="hc-c29-web__col hc-c29-web__col--side">
            <section className="hc-c29-card hc-c29-card--web">
              <h2 className="hc-large-bold">Invoices</h2>
              {INVOICES.map((i) => (
                <TaskRow key={i.id} title={i.title} meta={i.meta} icon="orders" tag="Paid" tagTone="success" />
              ))}
            </section>
            <section className="hc-c29-card hc-c29-card--web hc-c29-card--gap">
              <h2 className="hc-large-bold">Cancel membership</h2>
              <p className="hc-small hc-muted">
                You keep member features until Mar 15, 2027. After that, household access for Sam and Riley ends, and only 10 items stay active.
              </p>
              <Button variant="secondary" onClick={flow.goNext}>
                Cancel membership
              </Button>
            </section>
          </div>
        </div>
      </div>
    </WebShell>
  );
}
