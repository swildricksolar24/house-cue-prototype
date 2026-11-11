import { useEffect, useState } from 'react';
import { Button } from '../../../components/Button/Button';
import { Input } from '../../../components/Input/Input';
import { MetricRow } from '../../../components/MetricRow/MetricRow';
import { StatTile } from '../../../components/StatTile/StatTile';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C72-home-health-certificate.css';

const BREAKDOWN = [
  { label: 'Upkeep done on time', value: '32 / 35' },
  { label: 'Item ages', value: '22 / 30' },
  { label: 'Open issues', value: '18 / 20' },
  { label: 'Maintenance history', value: '14 / 15' },
];

type SharedLink = { id: string; label: string; views: string };

/** Certificate is as of Jan 8, 2027, so "In 30 days" expires Feb 7 (same as the Realtor link in Figma). */
const expiryText = (v: string) => (v.trim().toLowerCase() === 'in 30 days' ? 'Feb 7' : v.trim().toLowerCase() || 'Feb 7');

/**
 * C72 Home Health certificate — Figma mobile 216:16239 (batch 211:56279), web 216:18386 (batch 211:56280).
 * J1 Home record & maintenance step 12 (last step). No Empty/Loading/Error frames are drawn for this screen.
 * Mobile "Share link" opens the web Share card inline. "Create link" is the primary CTA: it adds a shared link
 * (Revoke removes it) and calls flow.goNext(), a no-op at the end of the journey.
 */
export default function HomeHealthCertificate(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [recipient, setRecipient] = useState('');
  const [expires, setExpires] = useState('In 30 days');
  const [links, setLinks] = useState<SharedLink[]>([{ id: 'realtor', label: 'Realtor · expires Feb 7', views: '3 views' }]);
  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!downloading) return;
    const t = window.setTimeout(() => setDownloading(false), 900);
    return () => window.clearTimeout(t);
  }, [downloading]);

  const createLink = () => {
    const who = recipient.trim() || 'Anyone with the link';
    setLinks((ls) => [...ls, { id: `link-${Date.now()}`, label: `${who} · expires ${expiryText(expires)}`, views: '0 views' }]);
    setRecipient('');
    flow.goNext();
  };

  const breakdown = (
    <section className="hc-c72-card">
      <h2 className="hc-large-bold">Breakdown</h2>
      {BREAKDOWN.map((b) => (
        <MetricRow key={b.label} label={b.label} value={b.value} />
      ))}
    </section>
  );

  const shareCard = (
    <section className="hc-c72-card">
      <h2 className="hc-large-bold">Share</h2>
      <Input label="Recipient" type="email" placeholder="insurer@example.com" value={recipient} onValueChange={setRecipient} />
      <Input label="Link expires" value={expires} onValueChange={setExpires} />
      <div className="hc-c72-actions">
        <Button onClick={createLink}>Create link</Button>
        <Button variant="secondary" loading={downloading} onClick={() => setDownloading(true)}>
          Download PDF
        </Button>
      </div>
    </section>
  );

  const linksCard = (
    <section className="hc-c72-card">
      <h2 className="hc-large-bold">Shared links</h2>
      {links.length === 0 && <p className="hc-medium hc-muted">No shared links</p>}
      {links.map((l) => (
        <div key={l.id} className="hc-c72-link-item">
          <MetricRow label={l.label} value={l.views} />
          <button type="button" className="hc-c72-link" onClick={() => setLinks((ls) => ls.filter((x) => x.id !== l.id))}>
            Revoke
          </button>
        </div>
      ))}
    </section>
  );

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Home Health' }} tab="home" background="page">
        <div className="hc-c72-content">
          <div className="hc-c72-stats">
            <StatTile label="Home Health" value="86" meta="of 100" />
            <StatTile label="As of" value="Jan 8" meta="2027" />
          </div>
          {breakdown}
          <div className="hc-c72-actions">
            <Button fullWidth aria-expanded={sharing} onClick={() => setSharing((s) => !s)}>
              Share link
            </Button>
            <Button variant="secondary" fullWidth loading={downloading} onClick={() => setDownloading(true)}>
              PDF
            </Button>
          </div>
          {sharing && shareCard}
          {sharing && linksCard}
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="home">
      <div className="hc-c72-web">
        <header className="hc-c72-web__head">
          <h1 className="hc-h2">Home Health certificate</h1>
          <p className="hc-medium hc-muted">A shareable score from upkeep, item ages and open issues</p>
        </header>
        <div className="hc-c72-web__cols">
          <div className="hc-c72-web__main">
            <div className="hc-c72-stats">
              <StatTile label="Home Health" value="86" meta="of 100" />
              <StatTile label="As of" value="Jan 8, 2027" meta="Updated monthly" />
            </div>
            {breakdown}
          </div>
          <aside className="hc-c72-web__side">
            {shareCard}
            {linksCard}
          </aside>
        </div>
      </div>
    </WebShell>
  );
}
