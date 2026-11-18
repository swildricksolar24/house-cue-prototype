import { useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { ImagePlaceholder } from '../../../components/ImagePlaceholder/ImagePlaceholder';
import { Input } from '../../../components/Input/Input';
import { Select } from '../../../components/Select/Select';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { requestSetupSave, useSetupFlow } from '../../shells/SetupFlow';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C05-add-systems.css';

const CATEGORIES = ['Water heater', 'AC / heat pump', 'Pool pump', 'Other'];
// Review change: the web "Care Library" dropdown lists more household appliances (the mobile chips keep the four
// quick picks above)
const LIBRARY_CATEGORIES = [
  'Water heater',
  'AC / heat pump',
  'Furnace',
  'Evaporative cooler',
  'Pool pump',
  'Refrigerator',
  'Freezer',
  'Dishwasher',
  'Range / oven',
  'Cooktop',
  'Microwave',
  'Range hood',
  'Garbage disposal',
  'Washer',
  'Dryer',
  'Water softener',
  'Water filtration',
  'Garage door opener',
  'Ceiling fan',
  'Smoke / CO alarm',
  'Other',
];
// Review change: brands across the appliance list (A–Z, Other last); Northline is the sample water heater's brand
const BRANDS = [
  'A. O. Smith',
  'Bosch',
  'Bradford White',
  'Carrier',
  'Chamberlain',
  'Culligan',
  'Frigidaire',
  'GE Appliances',
  'Goodman',
  'Hayward',
  'Hunter',
  'KitchenAid',
  'Lennox',
  'LG',
  'LiftMaster',
  'Maytag',
  'Northline',
  'Pentair',
  'Rheem',
  'Samsung',
  'Trane',
  'Whirlpool',
  'Other',
];
const ROOMS = ['Garage', 'Kitchen', 'Living room', 'Primary bedroom', 'Hall bath'];
const PLAN_NOTE = 'Free plan: 7 of 10 items used in this home.';

// Review change: options show just the room, no "Room:" prefix (web form and the mobile review step)
const roomOptions = ROOMS.map((r) => ({ value: r, label: r }));

/**
 * C05 Add systems and label scan — Figma mobile 215:12472 (batch 210:3867, review state 10:1176),
 * web 215:15334 (batch 210:3868). J1 Onboarding step 12.
 * Mobile has two steps in local state: scan (camera) → review (label read).
 * Review change: in the setup flow (from the C08 checklist) "Save item" runs the setup step's Save and moves on to the next
 * setup step instead of the next onboarding step. On mobile the camera and details screens show their own buttons (Take
 * photo / Type it in instead, Save item / Retake photo) in the content there, since the setup bar takes the bottom.
 */
export default function AddSystems(_: ScreenProps) {
  const { fromSetup } = useSetupFlow();
  const { device } = usePrototype();
  const flow = useFlow();
  const [stage, setStage] = useState<'scan' | 'review'>('scan');
  const [category, setCategory] = useState('Water heater');
  const [room, setRoom] = useState('Garage');

  if (device === 'mobile') {
    if (stage === 'review') {
      return (
        <MobileShell
          header={{ title: 'Check the details', onBack: () => setStage('scan') }}
          bottom={<BottomActions primaryLabel="Save item" onPrimary={flow.goNext} secondaryLabel="Retake photo" onSecondary={() => setStage('scan')} />}
        >
          <Banner tone="success" title="Label read">
            Matched to a 50-gallon gas water heater in the Care Library.
          </Banner>
          <div>
            <DetailRow label="Brand · high confidence" value="Northline" actionDisabled />
            <DetailRow label="Model · high confidence" value="NL-50G-T2" actionDisabled />
            <DetailRow label="Serial · please check" value="Q1018 4512 3" actionDisabled />
            <DetailRow label="Made · from serial" value="October 2018" actionDisabled />
          </div>
          <Select label="Room" hideLabel placeholder="" options={roomOptions} value={room} onValueChange={setRoom} />
          <p className="hc-small hc-muted">{PLAN_NOTE}</p>
          {/* Review change: in the setup flow its Cancel / Save bar replaces the bottom actions, so they sit here instead */}
          {fromSetup && (
            <div className="hc-c05-inline-actions">
              <Button fullWidth onClick={requestSetupSave}>
                Save item
              </Button>
              <Button variant="tertiary" fullWidth onClick={() => setStage('scan')}>
                Retake photo
              </Button>
            </div>
          )}
        </MobileShell>
      );
    }

    return (
      <MobileShell
        header={{ title: 'Add an item' }}
        bottom={
          <BottomActions
            primaryLabel="Take photo"
            onPrimary={() => setStage('review')}
            secondaryLabel="Type it in instead"
            onSecondary={() => setStage('review')}
          />
        }
      >
        <ImagePlaceholder label="Camera view: frame guide over the water heater rating plate" height={380} />
        <p className="hc-medium hc-muted hc-c05-center">
          Line up the rating plate inside the frame. We’ll read the brand, model and serial.
        </p>
        <div className="hc-c05-chips" role="radiogroup" aria-label="Item type">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={category === c}
              className={['hc-c05-chip', category === c && 'hc-c05-chip--selected'].filter(Boolean).join(' ')}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        {/* Review change: in the setup flow its Cancel / Save bar replaces the bottom actions, so they sit here instead */}
        {fromSetup && (
          <div className="hc-c05-inline-actions">
            <Button fullWidth onClick={() => setStage('review')}>
              Take photo
            </Button>
            <Button variant="tertiary" fullWidth onClick={() => setStage('review')}>
              Type it in instead
            </Button>
          </div>
        )}
      </MobileShell>
    );
  }

  return (
    <WebShell nav="home">
      <div className="hc-c05-web">
        <h1 className="hc-h2">Add an item</h1>
        <div className="hc-c05-web__cols">
          <section className="hc-c05-card">
            <h2 className="hc-large-bold">Upload a label photo</h2>
            <ImagePlaceholder label="Drop a photo of the rating plate here, or browse" height={240} />
            <p className="hc-small hc-muted">JPG, PNG or HEIC, up to 20 MB. We read brand, model and serial.</p>
          </section>
          <section className="hc-c05-card">
            <h2 className="hc-large-bold">Or pick from the Care Library</h2>
            {/* Review change: Room comes first; every dropdown in this form shows its label (Room, Category, Brand) */}
            <Select label="Room" placeholder="" options={roomOptions} value={room} onValueChange={setRoom} />
            <Select
              label="Category"
              placeholder=""
              // Review change: options show just the category ("Water heater"), no "Category:" prefix
              options={LIBRARY_CATEGORIES.map((c) => ({ value: c, label: c }))}
              value={category}
              onValueChange={setCategory}
            />
            <Select
              label="Brand"
              placeholder=""
              // Review change: options show just the brand, no "Brand:" prefix, and cover more appliance makers
              options={BRANDS.map((b) => ({ value: b, label: b }))}
              defaultValue="Northline"
            />
            <Input label="Model number" defaultValue="NL-50G-T2" />
            <Input label="Serial number (optional)" defaultValue="Q1018 4512 3" />
            {/* Review change: in the setup flow Save item does the step's Save (checks the fields, marks it done, next step) */}
            <Button fullWidth onClick={fromSetup ? requestSetupSave : flow.goNext}>
              Save item
            </Button>
          </section>
        </div>
        <p className="hc-small hc-muted">{PLAN_NOTE}</p>
      </div>
    </WebShell>
  );
}
