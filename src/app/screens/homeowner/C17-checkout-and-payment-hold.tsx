import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { ConsentRow } from '../../../components/ConsentRow/ConsentRow';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { HoldExplainer } from '../../../components/HoldExplainer/HoldExplainer';
import { OptionCard } from '../../../components/OptionCard/OptionCard';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C17-checkout-and-payment-hold.css';

/**
 * C17 Checkout and payment hold — Figma mobile 217:29415, web 217:30491 (J1 Review & book step 4).
 * ?state=oon — out-of-network: Authorize blocked until acknowledged (100:3413 / 100:3539).
 * ?state=over-cap — "Over spend cap (approval card)" 231:25148: approval sheet over the checkout.
 */

const JOB = 'AC repair · Thu, Nov 13, 8–10 AM';
const OON_TITLE = 'Not background-checked';
const OON_BODY =
  'Ocotillo Air Repair is out of network. HouseCue has not run a background check on this pro. Out-of-network bookings follow our out-of-network protection terms.';
const OON_ACK = 'I understand this pro is not background-checked and I still want to book.';

const holdSteps = (amount: string) => [
  `We hold ${amount} on your card now. Nothing is charged yet.`,
  'When you sign off the job, 90% goes to the pro.',
  'The last 10% is held for 30 days in case something goes wrong.',
];

type Branch = 'default' | 'oon' | 'over-cap';

export default function CheckoutAndPaymentHold(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [params] = useSearchParams();
  const raw = params.get('state');
  const fromUrl: Branch = raw === 'oon' || raw === 'over-cap' ? raw : 'default';
  const [sheetOpen, setSheetOpen] = useState(fromUrl === 'over-cap');
  const [ack, setAck] = useState(false);
  const [card, setCard] = useState<'visa' | 'new'>('visa');
  useEffect(() => {
    setSheetOpen(fromUrl === 'over-cap');
    setAck(false);
  }, [fromUrl]);

  const oon = fromUrl === 'oon';
  const amount = oon ? '$175' : '$189';
  const blocked = oon && !ack;
  const authorizeLabel = `Authorize ${amount} hold`;

  const oonBlock = oon && (
    <>
      <Banner tone="error" title={OON_TITLE}>
        {OON_BODY}
      </Banner>
      <ConsentRow checked={ack} onChange={(e) => setAck(e.target.checked)} linkLabel="Out-of-network terms" onLinkClick={() => flow.go('X08')}>
        {OON_ACK}
      </ConsentRow>
    </>
  );
  const explainer = <HoldExplainer title="How your payment is protected" steps={holdSteps(amount)} />;

  const sheet = sheetOpen && (
    <div className={`hc-c17-overlay hc-c17-overlay--${device === 'mobile' ? 'bottom' : 'center'}`} role="presentation">
      <div className="hc-c17-sheet" role="dialog" aria-modal="true" aria-labelledby="hc-c17-sheet-title">
        {device === 'mobile' && <span className="hc-c17-sheet__grabber" aria-hidden />}
        <h2 id="hc-c17-sheet-title" className="hc-h4">
          Approve $412? It’s over your $300 cap
        </h2>
        <p className="hc-medium hc-muted">
          Total out-of-pocket for AC repair: $374 job + $38 trip fee. Auto-book is on, but anything over your cap needs your OK.
        </p>
        <Button fullWidth onClick={flow.goNext}>
          Approve $412 and book
        </Button>
        <Button fullWidth variant="secondary" onClick={() => setSheetOpen(false)}>
          Not now
        </Button>
      </div>
    </div>
  );

  // ───────────── Mobile ─────────────
  if (device === 'mobile') {
    return (
      <MobileShell
        header={{ title: 'Payment' }}
        className="hc-c17-mobile"
        bottom={
          <BottomActions
            primaryLabel={authorizeLabel}
            onPrimary={flow.goNext}
            primaryDisabled={blocked}
            secondaryLabel="Back"
            onSecondary={flow.goBack}
          />
        }
      >
        {oonBlock}
        <div>
          {!oon && <DetailRow label="Job" value={JOB} />}
          <DetailRow label="Quoted price" value={`${amount}.00`} />
          <DetailRow label="Pay with" value="Visa •• 4242" actionLabel="Edit" actionDisabled />
        </div>
        {explainer}
        {!oon && (
          <p className="hc-small hc-muted">
            Free cancellation until 24 hours before the visit (Zephyrline HVAC’s terms). Legally reviewed copy pending.
          </p>
        )}
        {sheet}
      </MobileShell>
    );
  }

  // ───────────── Web ─────────────
  return (
    <WebShell nav="plan">
      <div className="hc-c17-web">
        <h1 className="hc-h2">Payment</h1>
        <div className="hc-c17-web__cols">
          <div className="hc-c17-web__main">
            <section className="hc-c17-card">
              <h2 className="hc-large-bold">Your booking</h2>
              <div>
                <DetailRow label="Pro" value={oon ? 'Ocotillo Air Repair' : 'Zephyrline HVAC'} />
                <DetailRow label="Job" value={JOB} />
                <DetailRow label="Quoted price" value={`${amount}.00`} />
                <DetailRow label="Cancellation" value="Free until 24 hours before" />
              </div>
            </section>
            <section className="hc-c17-card">
              <h2 className="hc-large-bold">Pay with</h2>
              <div className="hc-c17-methods" role="radiogroup" aria-label="Pay with">
                <OptionCard
                  title="Visa •• 4242"
                  description="Default for this home · expires 08/28"
                  selected={card === 'visa'}
                  onClick={() => setCard('visa')}
                />
                <OptionCard
                  title="Add a card or bank account"
                  description="Secure form from our payments partner"
                  selected={card === 'new'}
                  onClick={() => setCard('new')}
                />
              </div>
            </section>
          </div>
          <aside className="hc-c17-web__side">
            {oonBlock}
            {explainer}
            <section className="hc-c17-card">
              <Button fullWidth onClick={flow.goNext} disabled={blocked}>
                {authorizeLabel}
              </Button>
              <p className="hc-small hc-muted">By authorizing you agree to this pro’s terms. Legally reviewed copy pending.</p>
            </section>
          </aside>
        </div>
      </div>
      {sheet}
    </WebShell>
  );
}
