import { useState, type ReactNode } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { Icon } from '../../../components/Icon/Icon';
import type { IconName } from '../../../components/Icon/Icon';
import { Input } from '../../../components/Input/Input';
import { OptionCard } from '../../../components/OptionCard/OptionCard';
import { useDemoActions } from '../../prototype/DemoTools';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import { TextLink, WebCard, WebStepHeader } from './_onboarding';
import './C04-home-profile-setup.css';

type Option = { id: string; title: string; description: string; icon: IconName };

const ownerOptions: Option[] = [
  { id: 'me', title: 'Me', description: 'I live here or own it', icon: 'home' },
  { id: 'care', title: 'Someone I help care for', description: 'A parent or relative. You choose who owns the account.', icon: 'users' },
];

const rentalOptions: Option[] = [
  { id: 'mine', title: 'My home', description: 'I live here', icon: 'home' },
  { id: 'rental', title: 'Rental properties I own', description: 'Add one or several; tenants report issues to you', icon: 'home' },
  { id: 'help', title: 'A home I help with', description: 'Caregiver or co-owner', icon: 'home' },
];

type Detail = { id: string; label: string; value: string };

/**
 * Review change: the card is broken into numbered steps. Step 1 (home address) comes first; the later steps stay
 * disabled (dimmed, not focusable) until an address is entered.
 */
function NumberedStep({ n, title, done, disabled, children }: { n: number; title: string; done?: boolean; disabled?: boolean; children: ReactNode }) {
  return (
    <section
      className={['hc-c04-step', disabled && 'hc-c04-step--disabled'].filter(Boolean).join(' ')}
      aria-disabled={disabled || undefined}
      inert={disabled || undefined}
    >
      <h2 className="hc-c04-step__head">
        <span className="hc-c04-step__num" aria-hidden>
          {done ? <Icon name="check" size={16} /> : n}
        </span>
        <span className="hc-h4">
          <span className="hc-visually-hidden">Step {n}: </span>
          {title}
        </span>
      </h2>
      {children}
    </section>
  );
}

const mobileDetails: Detail[] = [
  { id: 'type', label: 'Home type · county records', value: 'Single-family' },
  { id: 'size', label: 'Size · county records', value: '1,850 sq ft' },
  { id: 'year', label: 'Year built · county records', value: '1978' },
  { id: 'cooling', label: 'Cooling and heating · likely', value: 'Heat pump' },
  { id: 'water', label: 'Water heater · likely', value: 'Gas, tank' },
  { id: 'pool', label: 'Pool', value: 'Yes' },
];

const webDetails: Detail[] = [
  { id: 'type', label: 'Home type · county records', value: 'Single-family' },
  { id: 'size', label: 'Size · county records', value: '1,850 sq ft' },
  { id: 'year', label: 'Year built · county records', value: '1978' },
  { id: 'systems', label: 'Systems · likely', value: 'Heat pump · gas water heater · pool' },
];

/**
 * C04 Home profile setup — Figma onboarding mobile 215:11979 (address + who) → 4b Confirm details 230:35405,
 * web 215:14548 (one card); rental owner (landlord-portfolio) mobile 272:31781, web 272:32376.
 * "Branch: Address not found" 231:23837 draws the 4b Confirm details frame, so ?state=error opens on that step (mobile).
 */
export default function HomeProfileSetup({ variant }: ScreenProps) {
  const { device, screenState } = usePrototype();
  const flow = useFlow();
  const rental = variant === 'Home profile setup (rental owner)';
  const mobile = device === 'mobile';

  const sampleAddress = rental ? '1418 E Roosevelt St, Phoenix, AZ 85006' : '2218 W Palm Ln, Phoenix, AZ 85015';
  const [who, setWho] = useState(rental ? 'rental' : 'me');
  // Review decision: the address starts empty and is required; Continue stays disabled until it's filled
  const [address, setAddress] = useState('');
  const [stage, setStage] = useState<'address' | 'confirm'>(!rental && screenState === 'error' ? 'confirm' : 'address');
  const [details, setDetails] = useState<Record<string, string>>(() =>
    Object.fromEntries([...mobileDetails, ...webDetails].map((d) => [d.id, d.value])),
  );
  const [editing, setEditing] = useState<string | null>(null);

  // Review change: the address must be confirmed before "Who is this home for?" and "Is this right?" open;
  // the record details are only filled in once it's confirmed. Editing the address un-confirms it.
  const [confirmed, setConfirmed] = useState(!rental && screenState === 'error');
  const recordDefaults = () => Object.fromEntries([...mobileDetails, ...webDetails].map((d) => [d.id, d.value]));
  const changeAddress = (v: string) => {
    setAddress(v);
    setConfirmed(false);
    setEditing(null);
  };
  const confirmAddress = (value = address) => {
    setAddress(value);
    setDetails(recordDefaults());
    setConfirmed(true);
  };

  const addressOk = address.trim().length >= 5;
  // Confirmed details can be edited but not left blank
  const detailsOk = Object.values(details).every((v) => v.trim() !== '');
  const street = address.split(',')[0].trim();
  const recordsNote = `We filled these in from public records for ${street || 'your home'}. Fix anything that’s off.`;

  useDemoActions(
    stage !== 'address'
      ? []
      : rental
        ? [{ label: 'Use Demo Account', onClick: () => setAddress(sampleAddress) }]
        : [{ label: 'Use Demo Account', onClick: () => confirmAddress(sampleAddress) }],
  );

  const options = (list: Option[]) => (
    <div role="radiogroup" aria-label="Who is this home for?" className="hc-onb-stack">
      {list.map((o) => (
        <OptionCard key={o.id} icon={o.icon} title={o.title} description={o.description} selected={who === o.id} onClick={() => setWho(o.id)} />
      ))}
    </div>
  );

  const addressInput = (label: string) => (
    <Input
      label={label}
      placeholder="Start typing an address"
      value={address}
      onValueChange={rental ? setAddress : changeAddress}
      trailingAction={rental ? undefined : <Icon name="location" size={20} label="Address lookup" />}
    />
  );

  const detailRows = (list: Detail[]) => (
    <div>
      {list.map((d) =>
        editing === d.id ? (
          <div key={d.id} className="hc-c04-edit">
            <Input
              label={d.label}
              value={details[d.id]}
              onValueChange={(v) => setDetails((s) => ({ ...s, [d.id]: v }))}
              onKeyDown={(e) => e.key === 'Enter' && setEditing(null)}
              autoFocus
              trailingAction={
                <button type="button" className="hc-c04-done" onClick={() => setEditing(null)}>
                  Done
                </button>
              }
            />
          </div>
        ) : (
          <DetailRow key={d.id} label={d.label} value={details[d.id]} onAction={() => setEditing(d.id)} />
        ),
      )}
    </div>
  );

  const bookingBanner = (
    <Banner title="Booking is live here">
      Phoenix and Tucson homes can get quotes and book pros. Your record and reminders work anywhere.
    </Banner>
  );

  /* ---------- Rental owner (landlord-portfolio step 1) ---------- */
  if (rental) {
    if (mobile) {
      return (
        <MobileShell
          className="hc-onb-mobile"
          header={{ title: 'Your home', step: '4 of 6', progress: 4 / 6 }}
          bottom={
            <BottomActions primaryLabel="Continue" onPrimary={flow.goNext} primaryDisabled={!addressOk} secondaryLabel="Add several at once" onSecondary={flow.goNext} />
          }
        >
          <h1 className="hc-h4">Who is this home for?</h1>
          {options(rentalOptions)}
          {addressInput('First property address')}
          <Banner>Two or more rentals use the Portfolio plan: $9.99 a month + $2 per door.</Banner>
        </MobileShell>
      );
    }
    return (
      <WebShell layout="onboarding" className="hc-onb-web">
        <WebCard>
          <WebStepHeader step={4} />
          <h1 className="hc-h2">Where’s your home?</h1>
          <h2 className="hc-medium-semibold">Who is this home for?</h2>
          {options(rentalOptions)}
          {addressInput('First property address')}
          <Button variant="secondary" fullWidth onClick={flow.goNext}>
            Add several at once
          </Button>
          <Banner title="Portfolio plan">
            Two or more rentals use the Portfolio plan: $9.99 a month + $2 per door. One rental stays on membership with one tenant.
          </Banner>
          <div className="hc-onb-actions">
            <Button fullWidth onClick={flow.goNext} disabled={!addressOk}>
              Continue
            </Button>
          </div>
        </WebCard>
      </WebShell>
    );
  }

  /* ---------- Homeowner onboarding (step 7) ---------- */
  // Step 1: address, then "Confirm address". Steps 2 and 3 stay disabled until it's confirmed.
  const addressStep = (
    <NumberedStep n={1} title="Home address" done={confirmed}>
      {addressInput('Street, city and ZIP')}
      {!confirmed && (
        <>
          <TextLink align="left" onClick={() => changeAddress('2218 W Palm Ln, Phoenix, AZ 85015')}>
            Use my current location
          </TextLink>
          <Button variant="secondary" fullWidth onClick={() => confirmAddress()} disabled={!addressOk}>
            Confirm address
          </Button>
        </>
      )}
    </NumberedStep>
  );
  const whoStep = (
    <NumberedStep n={2} title="Who is this home for?" disabled={!confirmed}>
      {options(ownerOptions)}
    </NumberedStep>
  );
  const detailsStep = (list: Detail[]) => (
    <NumberedStep n={3} title="Is this right?" disabled={!confirmed}>
      {confirmed ? (
        <>
          <p className="hc-medium hc-muted">{recordsNote}</p>
          {detailRows(list)}
        </>
      ) : (
        <p className="hc-medium hc-muted">We’ll fill these in from public records once you confirm your address.</p>
      )}
    </NumberedStep>
  );

  if (mobile) {
    if (stage === 'confirm') {
      return (
        <MobileShell
          className="hc-onb-mobile"
          header={{ title: 'Your home', step: '4 of 6', progress: 4 / 6, onBack: () => setStage('address') }}
          bottom={<BottomActions primaryLabel="Looks right" onPrimary={flow.goNext} primaryDisabled={!detailsOk} />}
        >
          {detailsStep(mobileDetails)}
          {bookingBanner}
        </MobileShell>
      );
    }
    return (
      <MobileShell
        className="hc-onb-mobile"
        header={{ title: 'Your home', step: '4 of 6', progress: 4 / 6 }}
        bottom={<BottomActions primaryLabel="Continue" onPrimary={() => setStage('confirm')} primaryDisabled={!confirmed} />}
      >
        <h1 className="hc-h3">Where’s your home?</h1>
        {addressStep}
        {whoStep}
      </MobileShell>
    );
  }

  return (
    <WebShell layout="onboarding" className="hc-onb-web">
      <WebCard>
        <WebStepHeader step={4} />
        <h1 className="hc-h2">Where’s your home?</h1>
        {addressStep}
        {whoStep}
        {detailsStep(webDetails)}
        {bookingBanner}
        <div className="hc-onb-actions">
          <Button fullWidth onClick={flow.goNext} disabled={!confirmed || !detailsOk}>
            Continue
          </Button>
        </div>
      </WebCard>
    </WebShell>
  );
}
