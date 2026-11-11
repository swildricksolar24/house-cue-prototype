import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import type { IconName } from '../../../components/Icon/Icon';
import { ListRow } from '../../../components/ListRow/ListRow';
import { Logo } from '../../../components/Logo/Logo';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import heroScreen from './assets/c39-hero-c08-screen.png';
import heroPhoto from './assets/c39-hero-tucson-foothills.jpg';
import './C39-marketing-landing.css';

/**
 * Hero (Figma placeholder: "phone showing the HouseCue home dashboard over a Tucson home").
 * Photo: homes in the Tucson foothills by JC Cervantes on Unsplash (free licence),
 * https://unsplash.com/photos/a-house-on-a-hill-with-a-view-of-the-city-g7MszM0Pff4
 * Phone screen: screenshot of this prototype's C08 Home dashboard (mobile, light).
 */
function HeroImage({ height, className }: { height: number; className?: string }) {
  return (
    <div className={['hc-c39-photo', className].filter(Boolean).join(' ')} style={{ height }}>
      <img className="hc-c39-photo__bg" src={heroPhoto} alt="" />
      <div className="hc-c39-photo__phone">
        <img src={heroScreen} alt="The HouseCue home dashboard on a phone, over homes in the Tucson foothills" />
      </div>
    </div>
  );
}
const LEDE = 'HouseCue keeps your home’s record, plans its upkeep and gets trusted pros booked, always with your OK.';

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
        <HeroImage height={260} className="hc-c39-photo--compact" />
        <p className="hc-medium-semibold hc-c39-eyebrow">Now booking in Phoenix and Tucson</p>
        <h1 className="hc-h2">Your home, handled.</h1>
        <p className="hc-large hc-muted">{LEDE}</p>
        <Button fullWidth onClick={flow.goNext}>
          Get started free
        </Button>
        <Button variant="secondary" fullWidth onClick={flow.goNext}>
          Download the app
        </Button>
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
          <div className="hc-c39-cols hc-c39-cols--tight">
            <Button fullWidth onClick={flow.goNext}>
              Get started free
            </Button>
            <Button variant="secondary" fullWidth onClick={flow.goNext}>
              Download the app
            </Button>
          </div>
          <p className="hc-small hc-muted">Free to start. Members $4.99/mo or $49/yr per home.</p>
        </div>
        <HeroImage height={440} className="hc-c39-hero__image" />
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
