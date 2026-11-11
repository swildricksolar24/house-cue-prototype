import { useState } from 'react';
import type { IconName } from '../../../components/Icon/Icon';
import { ListRow } from '../../../components/ListRow/ListRow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import { TextLink } from './_onboarding';
import './X08-legal-pages.css';

const docs: { title: string; meta?: string; icon: IconName }[] = [
  { title: 'Terms of Service', meta: 'Updated Mar 15, 2027', icon: 'document' },
  { title: 'Privacy Policy', icon: 'shield' },
  { title: 'AI disputes and appeals', icon: 'in-process' },
  { title: 'Vendor agreement', meta: 'For pros', icon: 'service' },
  { title: 'Data sharing (research)', meta: 'Optional program', icon: 'data' },
  { title: 'Delete my account', meta: 'Request page', icon: 'delete' },
];

const sections = [
  {
    h: '1. What HouseCue does',
    p: 'HouseCue helps you keep a record of your home and, where available, find and book independent pros. Pros are not HouseCue employees.',
  },
  { h: '2. Your agent acts with your approval', p: 'The agent books or pays only within the limit you set. At $0, every booking waits for you.' },
  {
    h: '3. Disputes and appeals',
    p: 'Disputes are first decided by AI. You can appeal to a person for $250, refunded in full if you win, even in part and waived when less than $500 is in dispute.',
  },
];

/**
 * X08 Legal pages — Figma mobile 215:11885, web 215:14402 (J1 Onboarding step 6). Terms of Service in English
 * with an English/Español chip switch. No primary CTA in Figma: back returns to the previous step.
 */
export default function LegalPages(_: ScreenProps) {
  const { device } = usePrototype();
  const [lang, setLang] = useState<'en' | 'es'>('en');

  const body = (
    <>
      <p className="hc-small hc-muted">Version 1.0 · effective March 15, 2027</p>
      <div className="hc-onb-chips" role="radiogroup" aria-label="Language">
        {(['en', 'es'] as const).map((l) => (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={lang === l}
            className={`hc-onb-chip${lang === l ? ' hc-onb-chip--selected' : ''}`}
            onClick={() => setLang(l)}
          >
            {l === 'en' ? 'English' : 'Español'}
          </button>
        ))}
      </div>
      {sections.map((s) => (
        <section key={s.h} className="hc-x08-section">
          <h2 className="hc-h4">{s.h}</h2>
          <p className="hc-medium">{s.p}</p>
        </section>
      ))}
      <TextLink align="left">Download PDF</TextLink>
    </>
  );

  if (device === 'mobile') {
    return (
      <MobileShell
        className="hc-onb-mobile hc-x08-mobile"
        header={{ title: 'Terms of Service' }}
        bottom={
          <div className="hc-x08-home-indicator" aria-hidden>
            <span />
          </div>
        }
      >
        {body}
      </MobileShell>
    );
  }

  return (
    <WebShell layout="onboarding" className="hc-x08-web">
      <div className="hc-x08-layout">
        <nav className="hc-x08-panel" aria-label="Legal">
          <h2 className="hc-large-bold">Legal</h2>
          <div>
            {docs.map((d) => (
              <ListRow key={d.title} title={d.title} description={d.meta} icon={d.icon} />
            ))}
          </div>
        </nav>
        <article className="hc-x08-content">
          <h1 className="hc-h2">Terms of Service</h1>
          {body}
        </article>
      </div>
    </WebShell>
  );
}
