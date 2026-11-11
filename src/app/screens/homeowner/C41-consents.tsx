import { useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { ConsentRow } from '../../../components/ConsentRow/ConsentRow';
import { useDemoActions } from '../../prototype/DemoTools';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import { Dialog, WebCard, WebStepHeader } from './_onboarding';

type Consent = { id: string; text: string; link: string; required: boolean };

const homeownerConsents: Consent[] = [
  { id: 'terms', text: 'I agree to the Terms of Service', link: 'Read terms', required: true },
  {
    id: 'disputes',
    text: 'I agree that disputes are first decided by AI, with a human appeal. An appeal costs $250, is refunded in full if you win, even in part, and is free when less than $500 is in dispute.',
    link: 'How disputes work',
    required: true,
  },
  { id: 'privacy', text: 'I’ve read the Privacy Policy', link: 'Read policy', required: true },
  { id: 'agent', text: 'Let my HouseCue agent call, text and email pros for me', link: 'Needed to request quotes · Learn more', required: true },
  {
    id: 'research',
    text: 'Share anonymized home data with research partners (never your name, email or address)',
    link: 'What’s shared',
    required: false,
  },
];

const tenantConsents: Consent[] = [
  { id: 'terms', text: 'I agree to the HouseCue terms and tenant terms', link: 'Read', required: true },
  { id: 'access', text: 'Pros may contact me to arrange access for repairs', link: 'Read', required: true },
  { id: 'notices', text: 'Send me entry notices by text and email', link: 'Read', required: true },
  { id: 'privacy', text: 'I have read the privacy notice', link: 'Read', required: true },
];

const INTRO = 'Required items can’t be skipped: your agent needs them to ask pros for quotes. Optional ones stay off unless you turn them on.';
const TENANT_INTRO = 'Mesa Verde Holdings invited you as the tenant of 1418 E Roosevelt St, Unit A.';

/**
 * C41 Consents — Figma onboarding mobile 215:11846 / web 215:14269; tenant mobile 272:33916 / web 272:34801.
 * States: opens with nothing ticked and no error (review change); the error banner shows after a failed submit (the
 * web frame draws it on load); "Branch: Consent declined
 * (blocked)" 231:23637 = the required-agreements dialog, opened by "Agree and continue" with a required item
 * unchecked, or directly with ?state=error.
 */
export default function Consents({ variant }: ScreenProps) {
  const { device, screenState } = usePrototype();
  const flow = useFlow();
  const tenant = variant === 'Consents (tenant)';
  const mobile = device === 'mobile';
  const items = tenant ? tenantConsents : homeownerConsents;
  const blocked = !tenant && screenState === 'error';

  // Review decision: nothing is ticked and no error shows when the step opens (Figma draws some items ticked and the
  // web frame with the error). The error banner appears only after "Agree and continue" with a required item
  // unticked. The blocked branch (?state=error) still opens straight on the required-agreements dialog.
  const [checked, setChecked] = useState<Record<string, boolean>>(() => Object.fromEntries(items.map((c) => [c.id, false])));
  const [attempted, setAttempted] = useState(blocked);
  const [dialog, setDialog] = useState(blocked);

  const missing = items.filter((c) => c.required && !checked[c.id]).length;

  // Demo card shortcut (prototype only): tick every required agreement, clear the error and dialog
  useDemoActions([
    {
      label: 'Use Demo Account',
      onClick: () => {
        setChecked((s) => ({ ...s, ...Object.fromEntries(items.filter((c) => c.required).map((c) => [c.id, true])) }));
        setDialog(false);
      },
    },
  ]);

  const submit = () => {
    // Homeowner: skip the journey's X08 Terms step (reached from the "Read" links; it has no forward button)
    if (missing === 0) return tenant ? flow.goNext() : flow.go('C04');
    setAttempted(true);
    if (!tenant) setDialog(true);
  };

  const rows = (
    <div>
      {items.map((c) => (
        <ConsentRow
          key={c.id}
          required={c.required}
          checked={checked[c.id]}
          onChange={(e) => setChecked((s) => ({ ...s, [c.id]: e.target.checked }))}
          linkLabel={c.link}
          onLinkClick={() => flow.go('X08')}
        >
          {c.text}
        </ConsentRow>
      ))}
    </div>
  );

  const errorBanner = attempted && missing > 0 && (
    <Banner tone="error" title={missing === 1 ? '1 required item is unchecked' : `${missing} required items are unchecked`}>
      To use HouseCue, accept the Terms and the dispute rules. You can read each one first.
    </Banner>
  );

  const tenantNote = tenant && <Banner>No agent-contact consent here: your landlord’s consent covers vendor outreach.</Banner>;

  const blockedDialog = dialog && (
    <Dialog
      title="These agreements are required"
      width={mobile ? 342 : 456}
      onClose={() => setDialog(false)}
      actions={
        <>
          <Button size="large" fullWidth onClick={() => setDialog(false)}>
            Review agreements
          </Button>
          <Button size="large" variant="secondary" fullWidth onClick={() => flow.go('C39')}>
            Exit setup
          </Button>
        </>
      }
    >
      <p className="hc-medium hc-muted">
        HouseCue can’t continue without the Terms of Service, the dispute terms and the privacy policy. Agent contact is
        needed to request quotes: without it, your agent can’t ask pros for quotes.
      </p>
    </Dialog>
  );

  if (mobile) {
    return (
      <MobileShell
        className="hc-onb-mobile"
        header={{ title: 'Agreements', step: '3 of 6', progress: 3 / 6 }}
        bottom={<BottomActions primaryLabel="Agree and continue" onPrimary={submit} primaryDisabled={dialog || missing > 0} />}
      >
        {tenant ? (
          <p className="hc-medium hc-muted">{TENANT_INTRO}</p>
        ) : (
          <>
            <h1 className="hc-h3">A few agreements</h1>
            <p className="hc-medium hc-muted">{INTRO}</p>
            {dialog ? null : errorBanner}
          </>
        )}
        {rows}
        {tenantNote}
        {blockedDialog}
      </MobileShell>
    );
  }

  return (
    <WebShell layout="onboarding" className="hc-onb-web">
      <WebCard>
        <WebStepHeader step={3} />
        <h1 className="hc-h2">{tenant ? 'Tenant agreements' : 'A few agreements'}</h1>
        {tenant && <p className="hc-medium hc-muted">{TENANT_INTRO}</p>}
        {errorBanner}
        {rows}
        {tenantNote}
        <div className="hc-onb-actions">
          <Button fullWidth onClick={submit} disabled={dialog || missing > 0}>
            Agree and continue
          </Button>
        </div>
      </WebCard>
      {blockedDialog}
    </WebShell>
  );
}
