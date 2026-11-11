import { useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { Input } from '../../../components/Input/Input';
import { Switch } from '../../../components/Switch/Switch';
import { TimelineStep } from '../../../components/TimelineStep/TimelineStep';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C67-transfer-home.css';

type Part = { id: 'items' | 'documents' | 'warranties' | 'shutoff'; title: string; description?: string };

const parts: Part[] = [
  { id: 'items', title: 'Items and history' },
  { id: 'documents', title: 'Documents', description: 'Personal files are excluded' },
  { id: 'warranties', title: 'Warranties that allow transfer', description: '3 of 5 transferable' },
  { id: 'shutoff', title: 'Shutoff map' },
];

/** C67 Transfer home — Figma mobile 218:18460, web 218:19206 (J1 Household & access step 4) */
export default function TransferHome(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [included, setIncluded] = useState<Record<Part['id'], boolean>>({ items: true, documents: true, warranties: true, shutoff: true });
  const [buyer, setBuyer] = useState('');
  const [closing, setClosing] = useState('Feb 14, 2027');

  const toggles = parts.map((p) => (
    <div key={p.id} className="hc-c67-toggle">
      <div className="hc-c67-toggle__text">
        <span className="hc-medium-semibold">{p.title}</span>
        {p.description && <span className="hc-small hc-muted">{p.description}</span>}
      </div>
      <Switch aria-label={p.title} checked={included[p.id]} onCheckedChange={(on) => setIncluded((s) => ({ ...s, [p.id]: on }))} />
    </div>
  ));

  const fields = (
    <>
      <Input label="Buyer email or phone" type="email" placeholder="buyer@example.com" value={buyer} onValueChange={setBuyer} />
      <Input label="Closing date (optional)" value={closing} onValueChange={setClosing} />
    </>
  );

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Transfer home' }} tab="account" background="page" className="hc-c67-mobile">
        <h2 className="hc-medium-semibold">Choose what the buyer gets</h2>
        {toggles}
        {fields}
        <Button fullWidth onClick={flow.goNext}>
          Send transfer invite
        </Button>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="account">
      <div className="hc-c67-web">
        <header className="hc-c67-web__head">
          <h1 className="hc-h2">Transfer home</h1>
          <p className="hc-medium hc-muted">Give the buyer this home’s record and transferable warranties, free</p>
        </header>
        <div className="hc-c67-web__cols">
          <div className="hc-c67-web__main">
            <section className="hc-c67-card">
              <h2 className="hc-large-bold">What transfers</h2>
              {toggles}
              <p className="hc-small hc-muted">Rooms and contents are excluded by default.</p>
            </section>
            {fields}
            <Button className="hc-c67-cta" onClick={flow.goNext}>
              Send transfer invite
            </Button>
          </div>
          <aside className="hc-c67-web__side">
            <Banner tone="warning" title="1 open job">
              Close the Nov 30 plumbing job before the transfer can finish.
            </Banner>
            <section className="hc-c67-card">
              <h2 className="hc-large-bold">What happens</h2>
              <ol className="hc-c67-steps">
                <TimelineStep state="done" title="Invite sent" meta="Buyer creates an account" />
                <TimelineStep state="current" title="Buyer accepts" meta="Or on the closing date" />
                <TimelineStep state="upcoming" title="Home marked Sold here" meta="Your copy is kept and deactivated" />
              </ol>
            </section>
          </aside>
        </div>
      </div>
    </WebShell>
  );
}
