import { useState } from 'react';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { ImagePlaceholder } from '../../../components/ImagePlaceholder/ImagePlaceholder';
import { Logo } from '../../../components/Logo/Logo';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C01-splash-welcome.css';

/** Mobile carousel: panel 1 copy is the Figma mobile frame; panels 2–3 reuse the web frame's panel copy. */
const panels = [
  {
    image: 'Illustration: desert-style home with AC, water heater and pool highlighted (panel 1 of 3)',
    title: 'Your home, handled',
    body: 'One record of your home’s systems, documents, invoices and history, so nothing gets lost.',
  },
  {
    image: 'Panel 2: Never miss upkeep',
    title: 'Never miss upkeep',
    body: 'A maintenance plan for your climate and your systems.',
  },
  {
    image: 'Panel 3: Pros, booked for you',
    title: 'Pros, booked for you',
    body: 'Quotes compared and jobs booked, with your approval.',
  },
];

const webPanels = [
  { image: 'Panel 1: Know your home', title: 'Know your home', body: 'Systems, documents, invoices and history in one place.' },
  { image: 'Panel 2: Never miss upkeep', title: 'Never miss upkeep', body: 'A maintenance plan for your climate and your systems.' },
  { image: 'Panel 3: Pros, booked for you', title: 'Pros, booked for you', body: 'Quotes compared and jobs booked, with your approval.' },
];

/** C01 Splash and welcome — Figma mobile 215:11499, web 215:13938 (J1 Onboarding step 2) */
export default function SplashWelcome(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [panel, setPanel] = useState(0);

  if (device === 'mobile') {
    const p = panels[panel];
    return (
      <MobileShell
        className="hc-c01-mobile"
        bottom={<BottomActions primaryLabel="Get started" onPrimary={flow.goNext} secondaryLabel="I have an account" onSecondary={flow.goNext} />}
      >
        <Logo />
        <ImagePlaceholder label={p.image} height={300} />
        <h1 className="hc-h3">{p.title}</h1>
        <p className="hc-medium hc-muted">{p.body}</p>
        <div className="hc-c01-dots" role="tablist" aria-label="Welcome panels">
          {panels.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === panel}
              aria-label={`Panel ${i + 1} of ${panels.length}`}
              className={`hc-c01-dot${i === panel ? ' hc-c01-dot--active' : ''}`}
              onClick={() => setPanel(i)}
            />
          ))}
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell layout="onboarding" className="hc-c01-web">
      <section className="hc-c01-card">
        <h1 className="hc-h2">Your home, handled</h1>
        <p className="hc-large hc-muted">
          One record for your home, a plan for its upkeep, and an agent that gets pros booked, always with your OK.
        </p>
        <div className="hc-c01-cols">
          {webPanels.map((p) => (
            <div key={p.title} className="hc-c01-col">
              <ImagePlaceholder label={p.image} height={180} />
              <h2 className="hc-large-bold">{p.title}</h2>
              <p className="hc-medium hc-muted">{p.body}</p>
            </div>
          ))}
        </div>
        <div className="hc-c01-actions">
          <Button fullWidth onClick={flow.goNext}>
            Get started
          </Button>
          <button type="button" className="hc-medium-semibold hc-link hc-c01-text-btn" onClick={flow.goNext}>
            I have an account
          </button>
        </div>
      </section>
    </WebShell>
  );
}
