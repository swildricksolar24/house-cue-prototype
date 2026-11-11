import type { ReactNode } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { ImagePlaceholder } from '../../../components/ImagePlaceholder/ImagePlaceholder';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './X09-account-blocked.css';

type BlockedLayoutProps = {
  illustration: string;
  title: string;
  /** Mobile body (centred) */
  body: string;
  /** Web body, when it differs */
  webBody?: string;
  /** Web detail rows */
  details?: ReactNode;
  banner?: ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
};

/** Full-screen account status (X09): centred illustration + message on mobile, a 600px card on web. */
function BlockedLayout({ illustration, title, body, webBody, details, banner, primaryLabel, onPrimary, secondaryLabel, onSecondary }: BlockedLayoutProps) {
  const { device } = usePrototype();

  if (device === 'mobile') {
    return (
      <MobileShell
        padding="none"
        bottom={<BottomActions primaryLabel={primaryLabel} onPrimary={onPrimary} secondaryLabel={secondaryLabel} onSecondary={onSecondary} />}
      >
        <div className="hc-x09-mobile">
          <div className="hc-x09-mobile__center">
            <ImagePlaceholder label={illustration} height={160} />
            <h1 className="hc-h3 hc-x09-center-text">{title}</h1>
            <p className="hc-medium hc-muted hc-x09-center-text">{body}</p>
          </div>
          {banner}
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell layout="onboarding">
      <div className="hc-x09-web">
        <section className="hc-x09-card">
          <h1 className="hc-h3">{title}</h1>
          <p className="hc-large hc-muted">{webBody ?? body}</p>
          {details && <div>{details}</div>}
          {banner}
          <div className="hc-x09-card__actions">
            <Button fullWidth onClick={onPrimary}>
              {primaryLabel}
            </Button>
            <button type="button" className="hc-x09-link" onClick={onSecondary}>
              {secondaryLabel}
            </button>
          </div>
        </section>
      </div>
    </WebShell>
  );
}

/**
 * X09 Deactivated state — Figma "X09 / Mobile / Light / Deactivated" (230:35406), J1 branch "Deactivate instead" (231:26939).
 * Web has no drawn frame; it reuses the X09 web card. Shown by C76 when the homeowner picks "Deactivate instead".
 */
export function DeactivatedAccount({ onReactivate, onLogOut }: { onReactivate: () => void; onLogOut: () => void }) {
  return (
    <BlockedLayout
      illustration="Illustration: house with a pause sign"
      title="Your account is deactivated"
      body="Your home record is saved. Reactivate to pick up where you left off."
      primaryLabel="Reactivate"
      onPrimary={onReactivate}
      secondaryLabel="Log out"
      onSecondary={onLogOut}
    />
  );
}

/** X09 Suspended or deleted account (Suspended) — Figma mobile 218:22453, web 218:23556 (J1 Settings & account step 7) */
export default function AccountBlocked(_: ScreenProps) {
  const flow = useFlow();
  const banner = (
    <Banner tone="info" title="You can appeal">
      A person reviews every appeal. Appeals of a suspension are free.
    </Banner>
  );

  return (
    <BlockedLayout
      illustration="Illustration: lock"
      title="Your account is suspended"
      body="We paused your account on Nov 2 after a Trust & Safety review. Open jobs are on hold and your agent isn’t contacting pros."
      webBody="We paused your account after a Trust & Safety review. Open jobs are on hold and your agent isn’t contacting pros."
      details={
        <>
          <DetailRow label="Since" value="Nov 2, 2026" />
          <DetailRow label="Policy" value="Booking conduct, section 5.2" />
          <DetailRow label="Open jobs" value="2 on hold" />
        </>
      }
      banner={banner}
      primaryLabel="Appeal this decision"
      onPrimary={() => flow.go('C75')}
      secondaryLabel="Contact support"
      onSecondary={() => flow.go('C32')}
    />
  );
}
