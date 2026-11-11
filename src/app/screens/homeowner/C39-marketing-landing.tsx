import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { Icon, type IconName } from '../../../components/Icon/Icon';
import { ListRow } from '../../../components/ListRow/ListRow';
import { Logo } from '../../../components/Logo/Logo';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import { HeroImage } from './_hero';
import './C39-marketing-landing.css';

const LEDE = 'HouseCue keeps your home’s record, plans its upkeep and gets trusted pros booked, always with your OK.';

/** C01 Welcome's three panels, merged into this page's hero (review change: onboarding steps 1 and 2 are one page) */
const welcomePoints: { icon: IconName; title: string; body: string }[] = [
  { icon: 'home', title: 'Know your home', body: 'Systems, documents, invoices and history in one place.' },
  { icon: 'calendar', title: 'Never miss upkeep', body: 'A maintenance plan for your climate and your systems.' },
  { icon: 'service', title: 'Pros, booked for you', body: 'Quotes compared and jobs booked, with your approval.' },
];

function WelcomePoints() {
  return (
    <ul className="hc-c39-points">
      {welcomePoints.map((p) => (
        <li key={p.title}>
          <span className="hc-c39-points__icon">
            <Icon name={p.icon} size={24} />
          </span>
          <span>
            <span className="hc-large-bold">{p.title}</span>
            <span className="hc-medium hc-muted">{p.body}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

type Row = { title: string; description?: string; icon: IconName };

const freeRows: Row[] = [
  { title: 'Home record and maintenance plan', description: 'Works everywhere', icon: 'home' },
  { title: 'Up to 10 items per home', description: 'Appliances and systems', icon: 'devices' },
  { title: 'Quotes and booking', description: 'Phoenix and Tucson', icon: 'search' },
];

const memberRows: Row[] = [
  { title: 'Everything in Free', icon: 'check' },
  { title: 'Unlimited items', description: 'Per home', icon: 'devices' },
  { title: 'Household and caregiver access', description: 'Invite family or a caregiver', icon: 'users' },
];

const stepsMobile: Row[] = [
  { title: 'Tell us about your home', description: 'Address, systems and appliances in minutes', icon: 'home' },
  { title: 'Get a plan for upkeep', description: 'Tasks for your climate and your systems', icon: 'calendar' },
  { title: 'Let your agent handle pros', description: 'Quotes compared, booked with your approval', icon: 'chat' },
];

const stepsWeb = [
  { title: '1. Tell us about your home', body: 'Address, systems and appliances in a few minutes. Scan labels to fill in model and serial.' },
  { title: '2. Get a plan for upkeep', body: 'A maintenance calendar for your climate and your systems, with reminders.' },
  { title: '3. Let your agent handle pros', body: 'Quotes compared and jobs booked, only with your approval and within your limit.' },
];

const rows = (items: Row[]) => (
  <div>
    {items.map((r) => (
      <ListRow key={r.title} title={r.title} description={r.description} icon={r.icon} />
    ))}
  </div>
);

/** C39 Marketing landing page (web) — Figma mobile 215:11454, web 215:13872 (J1 Onboarding step 1) */
export default function MarketingLanding(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();

  const footer = (
    <p className="hc-small hc-muted hc-c39-footer">
      <button type="button" onClick={() => flow.go('X08')}>Terms</button> ·{' '}
      <button type="button" onClick={() => flow.go('X08')}>Privacy</button> · Are you a pro? Join HouseCue · Request account
      deletion · Español
    </p>
  );

  const freeCard = (cta: boolean) => (
    <section className="hc-c39-card">
      <h3 className="hc-large-bold">Free</h3>
      {rows(freeRows)}
      {cta && (
        <Button variant="secondary" fullWidth onClick={flow.goNext}>
          Get started free
        </Button>
      )}
    </section>
  );

  const memberCard = (cta: boolean) => (
    <section className="hc-c39-card">
      <h3 className="hc-large-bold">Member · $4.99/mo or $49/yr per home</h3>
      {rows(memberRows)}
      {cta && (
        <Button fullWidth onClick={flow.goNext}>
          See membership
        </Button>
      )}
    </section>
  );

  if (device === 'mobile') {
    return (
      <MobileShell className="hc-c39-mobile">
        <Logo />
        <HeroImage height={260} className="hc-hero-photo--compact" />
        <p className="hc-medium-semibold hc-c39-eyebrow">Now booking in Phoenix and Tucson</p>
        <h1 className="hc-h2">Your home, handled.</h1>
        <p className="hc-large hc-muted">{LEDE}</p>
        <WelcomePoints />
        <Button fullWidth onClick={flow.goNext}>
          Get started free
        </Button>
        <Button variant="secondary" fullWidth onClick={flow.goNext}>
          Download the app
        </Button>
        <button type="button" className="hc-medium-semibold hc-link hc-c39-text-btn" onClick={flow.goNext}>
          I have an account
        </button>
        <h2 className="hc-h4">How it works</h2>
        {rows(stepsMobile)}
        <h2 className="hc-h4">Plans</h2>
        {freeCard(false)}
        {memberCard(false)}
        <Banner title="Booking metros">
          Quotes and booking are live in Phoenix and Tucson. Everywhere else, your home record and reminders work now.
        </Banner>
        {footer}
      </MobileShell>
    );
  }

  return (
    <WebShell layout="marketing" className="hc-c39-web">
      <div className="hc-c39-hero">
        <div className="hc-c39-hero__text">
          <p className="hc-medium-semibold hc-c39-eyebrow">Now booking in Phoenix and Tucson</p>
          <h1 className="hc-h1">Your home, handled.</h1>
          <p className="hc-large hc-muted">{LEDE}</p>
          <WelcomePoints />
          <div className="hc-c39-cols hc-c39-cols--tight">
            <Button fullWidth onClick={flow.goNext}>
              Get started free
            </Button>
            <Button variant="secondary" fullWidth onClick={flow.goNext}>
              Download the app
            </Button>
          </div>
          <p className="hc-small hc-muted">
            Free to start. Members $4.99/mo or $49/yr per home. Already a member?{' '}
            <button type="button" className="hc-medium-semibold hc-link hc-c39-text-btn" onClick={flow.goNext}>
              I have an account
            </button>
          </p>
        </div>
        <HeroImage height={560} className="hc-c39-hero__image" />
      </div>
      <h2 className="hc-h2">How it works</h2>
      <div className="hc-c39-cols hc-c39-cols--equal">
        {stepsWeb.map((s) => (
          <section key={s.title} className="hc-c39-card">
            <h3 className="hc-large-bold">{s.title}</h3>
            <p className="hc-medium hc-muted">{s.body}</p>
          </section>
        ))}
      </div>
      <h2 className="hc-h2">Plans</h2>
      <div className="hc-c39-cols">
        {freeCard(true)}
        {memberCard(true)}
      </div>
      <Banner title="Booking metros">
        Quotes and booking are live in Phoenix and Tucson. Everywhere else, your home record and reminders work now and we’ll
        tell you when booking arrives.
      </Banner>
      {footer}
    </WebShell>
  );
}
