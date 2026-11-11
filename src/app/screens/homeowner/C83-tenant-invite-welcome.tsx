import { AgentCard } from '../../../components/AgentCard/AgentCard';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { ListRow } from '../../../components/ListRow/ListRow';
import { TimelineStep } from '../../../components/TimelineStep/TimelineStep';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import type { ScreenProps } from '../registry';
import './C83-tenant-invite-welcome.css';

/** C83 Tenant invite accept and welcome — Figma mobile 272:33818, web 272:34637 (J1 Tenant step 1). The web frame has no side nav or top bar. */
export default function TenantInviteWelcome(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  // Leaving the invite: back to the public splash (C01)
  const notMine = () => flow.go('C01');

  if (device === 'mobile') {
    return (
      <MobileShell
        header={{ title: 'Welcome', showBack: false }}
        bottom={<BottomActions primaryLabel="Accept and continue" onPrimary={flow.goNext} secondaryLabel="This isn’t my home" onSecondary={notMine} />}
      >
        <AgentCard>Hi Marisol. Mesa Verde Holdings invited you to HouseCue for 1418 E Roosevelt St, Unit A, Phoenix.</AgentCard>
        <h2 className="hc-large-bold">What you can do here</h2>
        <div>
          <ListRow title="Report an issue" description="Photos, video or voice. I send it to your landlord." />
          <ListRow title="Set access windows" description="When a pro can visit, and if they may enter when you’re out" />
          <ListRow title="Track repairs" description="Status and visit times, in one place" />
        </div>
        <p className="hc-medium hc-muted">Your landlord approves and pays for repairs. You never pay in HouseCue.</p>
      </MobileShell>
    );
  }

  return (
    <div className="hc-c83-web">
      <header className="hc-c83-web__head">
        <div className="hc-c83-web__title">
          <h1 className="hc-h2">Welcome to HouseCue</h1>
          <p className="hc-medium hc-muted">
            Invited by Mesa Verde Holdings · 1418 E Roosevelt St, Unit A, Phoenix · works in your browser, no app needed
          </p>
        </div>
        <Button variant="secondary" onClick={notMine}>
          This isn’t my home
        </Button>
        <Button onClick={flow.goNext}>Accept and continue</Button>
      </header>
      <div className="hc-c83-web__cols">
        <div className="hc-c83-web__col hc-c83-web__col--left">
          <AgentCard>Hi Marisol. Mesa Verde Holdings invited you to HouseCue for 1418 E Roosevelt St, Unit A. It takes about a minute.</AgentCard>
          <section className="hc-c83-card">
            <h2 className="hc-large-bold">What you can do</h2>
            <ListRow title="Report an issue" description="Photos, video or voice. The agent triages it and sends it to your landlord." />
            <ListRow title="Set access windows" description="When a pro can visit, and whether they may enter when you’re out" />
            <ListRow title="Track repairs" description="Status, vendor and visit times" />
          </section>
        </div>
        <div className="hc-c83-web__col hc-c83-web__col--right">
          <section className="hc-c83-card">
            <h2 className="hc-large-bold">Your tenancy</h2>
            <DetailRow label="Property" value="1418 E Roosevelt St, Unit A" />
            <DetailRow label="Landlord" value="Mesa Verde Holdings" />
            <DetailRow label="Move-in" value="Mar 1, 2026" />
            <DetailRow label="Your costs" value="None. Your landlord pays for repairs." />
          </section>
          <section className="hc-c83-card">
            <h2 className="hc-large-bold">Three quick steps</h2>
            <p className="hc-medium hc-muted">Next: sign in with a code (no password), agree to tenant terms, then set your access windows.</p>
            <ol className="hc-c83-steps">
              <TimelineStep state="current" title="Sign in" meta="Passwordless, full account (#183)" />
              <TimelineStep state="upcoming" title="Tenant consents" meta="Terms, vendor contact for access, entry notices" />
              <TimelineStep state="upcoming" title="Access windows" meta="Optional, asked again at first visit" />
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
