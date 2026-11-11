import { useRef, useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { Input } from '../../../components/Input/Input';
import { MetricRow } from '../../../components/MetricRow/MetricRow';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C75-account-standing.css';

/** C75 Account standing (Suspended) — Figma mobile 218:22269, web 218:23223 (J1 Settings & account step 4) */
export default function AccountStanding(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [reason, setReason] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Account standing' }} tab="account">
        <div className="hc-c75-content">
          <Banner tone="error" title="Suspended until Dec 18">
            After a trust and safety review of repeated disputes.
          </Banner>
          <div className="hc-c75-details">
            <MetricRow label="Limited" value="Opening new disputes" />
            <MetricRow label="Not affected" value="Home record, plan, open jobs" />
          </div>
          <div className="hc-c75-actions">
            <Button onClick={flow.goNext}>Appeal</Button>
          </div>
          <p className="hc-small hc-muted">A senior reviewer looks first, then an admin decides.</p>
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="account">
      <div className="hc-c75-web">
        <header className="hc-c75-web__head">
          <h1 className="hc-h2">Account standing</h1>
          <p className="hc-medium hc-muted">Suspended until Dec 18, 2026</p>
        </header>
        <div className="hc-c75-web__cols">
          <div className="hc-c75-web__main">
            <Banner tone="error" title="Suspended until Dec 18">
              After a trust and safety review of repeated disputes on Oct 30.
            </Banner>
            <section className="hc-c75-card">
              <div className="hc-c75-details">
                <MetricRow label="Limited" value="Opening new disputes" />
                <MetricRow label="Not affected" value="Home record, maintenance plan, open jobs, messages" />
              </div>
            </section>
          </div>
          <form
            className="hc-c75-card hc-c75-web__side"
            onSubmit={(e) => {
              e.preventDefault();
              flow.goNext();
            }}
          >
            <h2 className="hc-large-bold">Appeal</h2>
            <Input label="What should we know?" placeholder="Explain what happened" value={reason} onValueChange={setReason} />
            {files.length > 0 && <p className="hc-small hc-muted">{files.join(', ')}</p>}
            <div className="hc-c75-actions">
              <input
                ref={fileInput}
                type="file"
                multiple
                hidden
                onChange={(e) => setFiles(Array.from(e.target.files ?? []).map((file) => file.name))}
              />
              <Button variant="secondary" onClick={() => fileInput.current?.click()}>
                Add files
              </Button>
            </div>
            <Button type="submit" className="hc-c75-submit">
              Send appeal
            </Button>
            <p className="hc-small hc-muted">Free. A senior reviewer recommends; an admin decides.</p>
          </form>
        </div>
      </div>
    </WebShell>
  );
}
