import { useState } from 'react';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { ImagePlaceholder } from '../../../components/ImagePlaceholder/ImagePlaceholder';
import { Input } from '../../../components/Input/Input';
import { Select } from '../../../components/Select/Select';
import { Switch } from '../../../components/Switch/Switch';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C58-log-an-outside-job.css';

const ITEMS = [
  { value: 'water-heater', label: 'Item: water heater' },
  { value: 'ac', label: 'Item: AC / heat pump' },
  { value: 'pool-pump', label: 'Item: pool pump' },
  { value: 'other', label: 'Item: something else' },
];

/** C58 Log an outside job — Figma mobile 216:19440, web 216:20970 (J1 Request quotes step 9, last) */
export default function LogAnOutsideJob(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [contractor, setContractor] = useState('');
  const [date, setDate] = useState('Nov 4, 2026');
  const [item, setItem] = useState('water-heater');
  const [work, setWork] = useState('Replaced heating element');
  const [cost, setCost] = useState('$240');
  const [history, setHistory] = useState(true);
  const [invoice, setInvoice] = useState(false);

  // Last step of the journey: saving goes to My jobs
  const save = () => (flow.nextPath ? flow.goNext() : flow.go('C40'));

  const contractorField = <Input label="Contractor" placeholder="Business name" value={contractor} onValueChange={setContractor} />;
  const dateField = <Input label="Date" value={date} onValueChange={setDate} />;
  const itemField = <Select label="Item" hideLabel options={ITEMS} placeholder="" value={item} onValueChange={setItem} />;
  const workField = <Input label="What was done" value={work} onValueChange={setWork} />;
  const costField = <Input type="number" label="Cost" value={cost} onValueChange={setCost} />;
  const historySwitch = <Switch label="Add to the item’s history" checked={history} onCheckedChange={setHistory} />;

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Log a job' }} bottom={<BottomActions primaryLabel="Save job" onPrimary={save} />}>
        <div className="hc-c58-form">
          {contractorField}
          {dateField}
          {itemField}
          {workField}
          {costField}
          <div>
            <Button variant="secondary" onClick={() => setInvoice(true)}>
              {invoice ? 'Invoice attached' : 'Attach invoice'}
            </Button>
          </div>
          {historySwitch}
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="jobs">
      <div className="hc-c58-web">
        <header className="hc-c58-web__head">
          <div>
            <h1 className="hc-h2">Log an outside job</h1>
            <p className="hc-medium hc-muted">Keep your home record complete, even for work booked elsewhere</p>
          </div>
          <Button onClick={save}>Save job</Button>
        </header>
        <div className="hc-c58-web__cols">
          <div className="hc-c58-form">
            {contractorField}
            {dateField}
            {itemField}
            {workField}
          </div>
          <div className="hc-c58-form">
            {costField}
            <ImagePlaceholder label="Invoice or photos" height={120} />
            {historySwitch}
          </div>
        </div>
      </div>
    </WebShell>
  );
}
