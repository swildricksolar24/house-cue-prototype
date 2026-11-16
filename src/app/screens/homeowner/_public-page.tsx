import type { ReactNode } from 'react';
import { legalPdf } from '../../data/legal';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import './_public-page.css';

/**
 * Shared layout for the signed-out pages opened from the top bar (review change: "all four pages from the top nav
 * should look the same"): How it works and For Pros (C39 ?view=…), Membership (C28 ?visitor=1) and Help
 * (C32 ?visitor=1). Web: top bar, then one centred 1024px column (same as the landing page) with a Back button (→ landing page C39), title,
 * lede, the page content and the landing footer. Mobile: app bar with back, same content.
 * Not a screen: the registry only picks up files named <CODE>-<slug>.tsx.
 */
export function PublicPage({ title, lede, children }: { title: string; lede?: ReactNode; children: ReactNode }) {
  const { device } = usePrototype();
  const flow = useFlow();
  const back = () => flow.go('C39');
  const footer = <SiteFooter />;

  if (device === 'mobile') {
    return (
      <MobileShell className="hc-public-mobile" header={{ title, onBack: back }}>
        {lede && <p className="hc-large hc-muted">{lede}</p>}
        {children}
        {footer}
      </MobileShell>
    );
  }

  return (
    <WebShell layout="marketing" className="hc-public">
      <button type="button" className="hc-public__back" onClick={back}>
        <span className="hc-public__back-icon" aria-hidden />
        Back
      </button>
      <h1 className="hc-h1">{title}</h1>
      {lede && <p className="hc-large hc-muted">{lede}</p>}
      {children}
      {footer}
    </WebShell>
  );
}

/** Simple outline marks for the footer's social links (no social icons in HC/Icon yet) */
const socials: { name: string; icon: ReactNode }[] = [
  {
    name: 'Facebook',
    icon: <path d="M15 4h-2.5A3.5 3.5 0 0 0 9 7.5V10H7v3h2v7h3v-7h2.5l.5-3h-3V8a1 1 0 0 1 1-1H15z" />,
  },
  {
    name: 'Instagram',
    icon: (
      <>
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
      </>
    ),
  },
  { name: 'X', icon: <path d="M4.5 4.5l15 15M19.5 4.5l-15 15" /> },
  {
    name: 'LinkedIn',
    icon: (
      <>
        <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
        <path d="M8 10.5v6M8 7.5v.01M12 16.5v-6M12 13a2.5 2.5 0 0 1 5 0v3.5" />
      </>
    ),
  },
  {
    name: 'YouTube',
    icon: (
      <>
        <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
        <path d="M10.5 9.5l4 2.5-4 2.5z" fill="currentColor" />
      </>
    ),
  },
];

/**
 * Footer of every signed-out page (landing C39 + the four top-bar pages). Review change: "© <current year> HouseCue.
 * All rights reserved." in the centre, Terms · Privacy on the right ("Are you a pro? Join HouseCue", "Request account
 * deletion" and "Español" removed). Stacks on narrow screens.
 */
export function SiteFooter() {
  // Review change: Terms and Privacy open the placeholder PDFs (lorem ipsum) in a new tab, see data/legal.ts
  return (
    <footer className="hc-small hc-muted hc-site-footer">
      {/* Review change: social icons on the left. Placeholders: HouseCue has no social accounts yet, so they go nowhere. */}
      <ul className="hc-site-footer__social" aria-label="HouseCue on social media">
        {socials.map((s) => (
          <li key={s.name}>
            <button type="button" aria-label={`HouseCue on ${s.name}`} title={s.name}>
              <svg width="15.625" height="15.625" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                {s.icon}
              </svg>
            </button>
          </li>
        ))}
      </ul>
      <p className="hc-site-footer__links">
        <a href={legalPdf.terms} target="_blank" rel="noopener noreferrer">
          Terms
        </a>{' '}
        ·{' '}
        <a href={legalPdf.privacy} target="_blank" rel="noopener noreferrer">
          Privacy
        </a>
      </p>
      <p className="hc-site-footer__copyright">© {new Date().getFullYear()} HouseCue. All rights reserved.</p>
    </footer>
  );
}

/** Bordered card used for every block on these pages */
export function PublicCard({ children, featured = false }: { children: ReactNode; featured?: boolean }) {
  return <section className={`hc-public-card${featured ? ' hc-public-card--featured' : ''}`}>{children}</section>;
}

/** Steps stacked top to bottom, each a card with a number badge, title and body (How it works, For Pros) */
export function NumberedCards({ items }: { items: { title: string; body: string }[] }) {
  return (
    <ol className="hc-public-steps">
      {items.map((s, i) => (
        <li key={s.title} className="hc-public-card hc-public-step">
          <span className="hc-public-step__num" aria-hidden>
            {i + 1}
          </span>
          <span className="hc-public-step__text">
            <span className="hc-large-bold">{s.title}</span>
            <span className="hc-medium hc-muted">{s.body}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Main call to action with an optional small note under it */
export function PublicCta({ children, note }: { children: ReactNode; note?: ReactNode }) {
  return (
    <div className="hc-public-cta">
      {children}
      {note && <p className="hc-small hc-muted">{note}</p>}
    </div>
  );
}
