import { useState } from 'react';
import { Button } from '../../../components/Button/Button';
import { Input } from '../../../components/Input/Input';
import { Dialog } from './_onboarding';
import appleLogo from './assets/c02-apple.png';
import googleLogo from './assets/c02-google.png';
import './_get-app.css';

/**
 * "Download the app" on the landing page (C39), review change. Not in Figma.
 * - Web: a "Get the HouseCue app" pop-up with a QR code to scan, App Store / Google Play buttons and "Text me a link".
 * - Mobile: the live site would send the visitor straight to the right store (App Store on iPhone, Google Play on
 *   Android); the prototype says so in a small note.
 * Prototype placeholders: the QR code is a fake pattern, the store buttons go nowhere and no text is sent.
 * Not a screen: the registry only picks up files named <CODE>-<slug>.tsx.
 */
export function GetAppDialog({ mobile, onClose }: { mobile: boolean; onClose: () => void }) {
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);
  const canSend = phone.replace(/\D/g, '').length >= 10;

  if (mobile) {
    return (
      <Dialog
        title="Get the HouseCue app"
        onClose={onClose}
        actions={
          <Button size="large" fullWidth onClick={onClose}>
            OK
          </Button>
        }
      >
        <p className="hc-medium hc-muted">
          On the live site this button opens the App Store on an iPhone, or Google Play on Android, so you can install
          HouseCue in one tap.
        </p>
      </Dialog>
    );
  }

  return (
    <Dialog
      title="Get the HouseCue app"
      width={480}
      onClose={onClose}
      actions={
        <Button size="large" variant="secondary" fullWidth onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="hc-get-app">
        <FakeQr />
        <div className="hc-get-app__text">
          <p className="hc-medium">Scan with your phone’s camera to download HouseCue for iPhone or Android.</p>
          <div className="hc-get-app__stores">
            <button type="button" className="hc-get-app__store" title="Placeholder: goes nowhere in the prototype">
              <img src={appleLogo} alt="" width={20} height={17} className="hc-get-app__apple" />
              <span>
                <span className="hc-get-app__store-small">Download on the</span>
                App Store
              </span>
            </button>
            <button type="button" className="hc-get-app__store" title="Placeholder: goes nowhere in the prototype">
              <img src={googleLogo} alt="" width={18} height={18} />
              <span>
                <span className="hc-get-app__store-small">Get it on</span>
                Google Play
              </span>
            </button>
          </div>
        </div>
      </div>
      <div className="hc-get-app__sms">
        <Input
          label="Or text me a link"
          type="phone"
          value={phone}
          onValueChange={(v) => {
            setPhone(v);
            setSent(false);
          }}
        />
        <Button onClick={() => setSent(true)} disabled={!canSend}>
          Send link
        </Button>
      </div>
      {sent && <p className="hc-small hc-muted">Link sent to {phone}. (Prototype: no text is actually sent.)</p>}
    </Dialog>
  );
}

/** Placeholder QR code: three finder squares and a fixed pseudo-random pattern (not scannable) */
function FakeQr() {
  const n = 25;
  const cells: [number, number][] = [];
  let seed = 7;
  const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inFinder(x, y) && rand() < 0.48) cells.push([x, y]);
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={7} height={7} fill="currentColor" />
      <rect x={x + 1} y={y + 1} width={5} height={5} fill="var(--hc-card)" />
      <rect x={x + 2} y={y + 2} width={3} height={3} fill="currentColor" />
    </g>
  );
  return (
    <svg className="hc-get-app__qr" viewBox={`-2 -2 ${n + 4} ${n + 4}`} role="img" aria-label="QR code to download the HouseCue app (placeholder)">
      {cells.map(([x, y]) => (
        <rect key={`${x}.${y}`} x={x} y={y} width={1} height={1} fill="currentColor" />
      ))}
      {finder(0, 0)}
      {finder(n - 7, 0)}
      {finder(0, n - 7)}
    </svg>
  );
}
