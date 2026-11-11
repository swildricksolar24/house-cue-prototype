import { useState } from 'react';
import { AgentFab } from '../../../components/AgentFab/AgentFab';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { HoldExplainer } from '../../../components/HoldExplainer/HoldExplainer';
import { ImagePlaceholder } from '../../../components/ImagePlaceholder/ImagePlaceholder';
import { Input } from '../../../components/Input/Input';
import { MetricRow } from '../../../components/MetricRow/MetricRow';
import { OptionCard } from '../../../components/OptionCard/OptionCard';
import { useFlow } from '../../prototype/flow';
import { screenPath } from '../../prototype/journeys';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C20-job-completion-and-sign-off.css';

const AUTO_APPROVE = 'No answer in 72 hours? The job is approved automatically.';

/**
 * C20 Job completion and sign-off — Figma mobile 217:32080, web 217:32589 (J1 Payment & review step 1).
 * Variants: "Landlord sign-off + damage flag" (mobile 272:32205, web 272:33211) and
 * "Confirm completion (tenant)" (mobile 272:34551, web 272:35731).
 */
export default function JobCompletionAndSignOff({ variant }: ScreenProps) {
  if (variant === 'Landlord sign-off + damage flag') return <LandlordSignOff />;
  if (variant === 'Confirm completion (tenant)') return <TenantConfirm />;
  return <HomeownerSignOff />;
}

function HomeownerSignOff() {
  const { device } = usePrototype();
  const flow = useFlow();
  const reportProblem = () => flow.go('C31');

  if (device === 'mobile') {
    return (
      <MobileShell
        header={{ title: 'Sign off' }}
        bottom={
          <BottomActions
            primaryLabel="Approve and pay $374"
            onPrimary={flow.goNext}
            secondaryLabel="Report a problem"
            onSecondary={reportProblem}
          />
        }
      >
        <h2 className="hc-h3">Check the work</h2>
        <ImagePlaceholder label="Photos from the pro" height={140} />
        <div>
          <DetailRow label="Quoted price" value="$189" />
          <DetailRow label="Approved change" value="+$185 run capacitor" />
          <DetailRow label="Final price" value="$374" />
          <DetailRow label="Warranty" value="1-year workmanship" />
        </div>
        <p className="hc-small hc-muted">{AUTO_APPROVE}</p>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="jobs">
      <div className="hc-c20-web">
        <h1 className="hc-h2">Check the work and sign off</h1>
        <div className="hc-c20-web__cols">
          <div className="hc-c20-web__main">
            <section className="hc-c20-card hc-c20-card--gap-3">
              <h2 className="hc-large-bold">Photos and checklist</h2>
              <div className="hc-c20-photos">
                <ImagePlaceholder label="Before" height={140} />
                <ImagePlaceholder label="Old part" height={140} />
                <ImagePlaceholder label="After" height={140} />
              </div>
              <p className="hc-medium">✓ Replaced the run capacitor</p>
              <p className="hc-medium">✓ Checked refrigerant pressure</p>
              <p className="hc-medium">✓ Tested cooling upstairs: 58°F at the vents</p>
            </section>
            <section className="hc-c20-card hc-c20-card--gap-1">
              <h2 className="hc-large-bold">Invoice</h2>
              <DetailRow label="Quoted price" value="$189" />
              <DetailRow label="Approved change order" value="+$185 run capacitor" />
              <DetailRow label="Final price" value="$374" actionLabel="View invoice" onAction={() => {}} />
            </section>
          </div>
          <aside className="hc-c20-web__side">
            <HoldExplainer
              title="When you approve"
              steps={[
                '$374 is charged from your hold.',
                '90% goes to the pro now.',
                '10% is held for 30 days in case something goes wrong.',
              ]}
            />
            <section className="hc-c20-card hc-c20-card--gap-3">
              <Button fullWidth onClick={flow.goNext}>
                Approve and pay $374
              </Button>
              <Button fullWidth variant="secondary" onClick={reportProblem}>
                Report a problem
              </Button>
              <p className="hc-small hc-muted">{AUTO_APPROVE}</p>
            </section>
          </aside>
        </div>
      </div>
    </WebShell>
  );
}

type Flag = 'keep' | 'clear';

function FlagButtons({ flag, setFlag, fill }: { flag: Flag; setFlag: (f: Flag) => void; fill?: boolean }) {
  return (
    <div className={['hc-c20-flag-buttons', fill && 'hc-c20-flag-buttons--fill'].filter(Boolean).join(' ')}>
      <Button variant={flag === 'keep' ? 'secondary' : 'tertiary'} aria-pressed={flag === 'keep'} onClick={() => setFlag('keep')}>
        Keep flag
      </Button>
      <Button variant={flag === 'clear' ? 'secondary' : 'tertiary'} aria-pressed={flag === 'clear'} onClick={() => setFlag('clear')}>
        Clear flag
      </Button>
    </div>
  );
}

function LandlordSignOff() {
  const { device } = usePrototype();
  const flow = useFlow();
  const [flag, setFlag] = useState<Flag>('keep');

  if (device === 'mobile') {
    return (
      <MobileShell
        role="landlord"
        header={{ title: 'Sign off' }}
        bottom={
          <BottomActions
            primaryLabel="Sign off and release $214"
            onPrimary={flow.goNext}
            secondaryLabel="Report a problem"
            onSecondary={() => flow.go('C31')}
          />
        }
      >
        <Banner tone="success" title="Tenant confirmed">
          Marisol confirmed the repair Nov 13, 10:42 AM. Auto-approves in 72 h.
        </Banner>
        <MetricRow label="Kitchen sink · Copperwick Pipe Co." value="$214.00" />
        <Banner tone="warning" title="Likely tenant-caused">
          Vendor note: P-trap cracked by impact; photos show a dent. Keep or clear before sign-off.
        </Banner>
        <FlagButtons flag={flag} setFlag={setFlag} fill />
        <Button variant="link" fullWidth onClick={() => {}}>
          Download damage record
        </Button>
      </MobileShell>
    );
  }

  return (
    <WebShell role="landlord" nav="jobs">
      <div className="hc-c20-web">
        <h1 className="hc-h2">Check the work and sign off</h1>
        <div className="hc-c20-web__cols hc-c20-web__cols--landlord">
          <div className="hc-c20-web__col540">
            <Banner tone="success" title="Tenant confirmed">
              Marisol Ortega confirmed the repair Nov 13, 10:42 AM. Auto-approves in 72 h if you don’t act.
            </Banner>
            <section className="hc-c20-card hc-c20-card--compact">
              <h2 className="hc-large-bold">Invoice · Copperwick Pipe Co.</h2>
              <MetricRow label="Kitchen sink repair" value="$190.00" />
              <MetricRow label="Parts (P-trap)" value="$24.00" />
              <MetricRow label="Total held on your Visa" value="$214.00" />
            </section>
          </div>
          <div className="hc-c20-web__main">
            <section className="hc-c20-card hc-c20-card--compact">
              <h2 className="hc-large-bold">Likely tenant-caused</h2>
              <p className="hc-medium">
                Vendor note: P-trap cracked by impact. Photos show a dent in the trap and a dropped pan nearby.
              </p>
              <FlagButtons flag={flag} setFlag={setFlag} />
              <Button variant="link" fullWidth onClick={() => {}}>
                Download damage record (PDF)
              </Button>
              <p className="hc-small hc-muted">Only you and managers see this. HouseCue does not bill or contact the tenant.</p>
            </section>
            {/* Web frame has no primary button; sign-off continues the journey from here */}
            <Button onClick={flow.goNext} className="hc-c20-web__cta">
              Sign off and release $214
            </Button>
          </div>
        </div>
      </div>
      <AgentFab size="extended" to={screenPath('C09')} className="hc-c20-fab" />
    </WebShell>
  );
}

function TenantConfirm() {
  const { device } = usePrototype();
  const flow = useFlow();
  const [fixed, setFixed] = useState(true);

  const body = (
    <>
      <p className="hc-large-bold">Bluequail Air Service marked the bedroom AC repair done.</p>
      <div role="radiogroup" aria-label="Is the repair done?" className="hc-c20-options">
        <OptionCard
          icon="home"
          title="Yes, it’s fixed"
          description="The AC is cooling again"
          selected={fixed}
          role="radio"
          aria-checked={fixed}
          onClick={() => setFixed(true)}
        />
        <OptionCard
          icon="home"
          title="There’s still a problem"
          description="Tell your landlord what’s wrong"
          selected={!fixed}
          role="radio"
          aria-checked={!fixed}
          onClick={() => setFixed(false)}
        />
      </div>
      <Input
        type="multiline"
        label="Private note to your landlord (optional)"
        defaultValue="Tech was on time and cleaned up"
        helper="Only your landlord sees this"
      />
    </>
  );

  if (device === 'mobile') {
    return (
      <MobileShell
        role="tenant"
        header={{ title: 'Confirm the repair' }}
        bottom={<BottomActions primaryLabel="Confirm completion" onPrimary={flow.goNext} />}
      >
        {body}
      </MobileShell>
    );
  }

  return (
    <WebShell role="tenant" nav="jobs">
      <div className="hc-c20-web">
        <h1 className="hc-h2">Confirm the repair</h1>
        <div className="hc-c20-web__body">
          {body}
          {/* Web frame shows no button; added so the step can be confirmed on web too */}
          <Button onClick={flow.goNext} className="hc-c20-web__cta">
            Confirm completion
          </Button>
        </div>
      </div>
    </WebShell>
  );
}
