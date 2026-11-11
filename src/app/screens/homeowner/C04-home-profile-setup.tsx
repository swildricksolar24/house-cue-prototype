import { useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { Icon } from '../../../components/Icon/Icon';
import type { IconName } from '../../../components/Icon/Icon';
import { Input } from '../../../components/Input/Input';
import { OptionCard } from '../../../components/OptionCard/OptionCard';
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

  const [who, setWho] = useState(rental ? 'rental' : 'me');
  const [address, setAddress] = useState(rental ? '1418 E Roosevelt St, Phoenix, AZ 85006' : '2218 W Palm Ln, Phoenix, AZ 85015');
  const [stage, setStage] = useState<'address' | 'confirm'>(!rental && screenState === 'error' ? 'confirm' : 'address');
  const [details, setDetails] = useState<Record<string, string>>(() =>
    Object.fromEntries([...mobileDetails, ...webDetails].map((d) => [d.id, d.value])),
  );
  const [editing, setEditing] = useState<string | null>(null);

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
      value={address}
      onValueChange={setAddress}
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
          bottom={<BottomActions primaryLabel="Continue" onPrimary={flow.goNext} secondaryLabel="Add several at once" onSecondary={flow.goNext} />}
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
            <Button fullWidth onClick={flow.goNext}>
              Continue
            </Button>
          </div>
        </WebCard>
      </WebShell>
    );
  }

  /* ---------- Homeowner onboarding (step 7) ---------- */
  if (mobile) {
    if (stage === 'confirm') {
      return (
        <MobileShell
          className="hc-onb-mobile"
          header={{ title: 'Your home', step: '4 of 6', progress: 4 / 6, onBack: () => setStage('address') }}
          bottom={<BottomActions primaryLabel="Looks right" onPrimary={flow.goNext} />}
        >
          <h1 className="hc-h3">Is this right?</h1>
          <p className="hc-medium hc-muted">We filled these in from public records for 2218 W Palm Ln. Fix anything that’s off.</p>
          {detailRows(mobileDetails)}
          {bookingBanner}
        </MobileShell>
      );
    }
    return (
      <MobileShell
        className="hc-onb-mobile"
        header={{ title: 'Your home', step: '4 of 6', progress: 4 / 6 }}
        bottom={<BottomActions primaryLabel="Continue" onPrimary={() => setStage('confirm')} />}
      >
        <h1 className="hc-h3">Where’s your home?</h1>
        {addressInput('Home address')}
        <TextLink align="left" onClick={() => setAddress('2218 W Palm Ln, Phoenix, AZ 85015')}>
          Use my current location
        </TextLink>
        <h2 className="hc-h4">Who is this home for?</h2>
        {options(ownerOptions)}
      </MobileShell>
    );
  }

  return (
    <WebShell layout="onboarding" className="hc-onb-web">
      <WebCard>
        <WebStepHeader step={4} />
        <h1 className="hc-h2">Where’s your home?</h1>
        {addressInput('Home address')}
        <h2 className="hc-h4">Who is this home for?</h2>
        {options(ownerOptions)}
        <h2 className="hc-h4">Is this right?</h2>
        {detailRows(webDetails)}
        {bookingBanner}
        <div className="hc-onb-actions">
          <Button fullWidth onClick={flow.goNext}>
            Continue
          </Button>
        </div>
      </WebCard>
    </WebShell>
  );
}
