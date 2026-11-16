import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { Icon, type IconName } from '../../../components/Icon/Icon';
import { ListRow } from '../../../components/ListRow/ListRow';
import { Logo } from '../../../components/Logo/Logo';
import { useFlow } from '../../prototype/flow';
import { stepPath } from '../../prototype/journeys';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import { GetAppDialog } from './_get-app';
import { MenuButton, SiteMenu } from '../../shells/SiteMenu';
import { HeroImage } from './_hero';
import { NumberedCards, PublicCta, PublicPage, SiteFooter } from './_public-page';
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

/** For Pros page steps (placeholder copy, see the For Pros view) */
const proSteps = [
  { title: 'Get matched to jobs', body: 'Homeowners’ agents send you requests that fit your trade and service area.' },
  { title: 'Quote and schedule', body: 'Send a quote and pick a time, all in HouseCue.' },
  { title: 'Get paid after sign-off', body: 'Payment is held when the job is booked and released when the homeowner signs off.' },
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
  // Review change: "I have an account" opens C02 in sign-in mode (returning user), not the sign-up step
  const signIn = () => flow.go('C02', '?state=signin');
  const [params] = useSearchParams();
  const view = params.get('view');
  // Review change: "Download the app" opens the Get the app pop-up (web) or the app-store note (mobile), see _get-app.tsx
  const [appOpen, setAppOpen] = useState(false);
  // Review change: mobile has no top bar, so a ☰ menu next to the logo opens the same signed-out pages
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  // Review change: landlords' way in. The landlord sign-up is its own journey (/landlord/portfolio/2); hidden when
  // this landing page is already the landlord journey's first step.
  const landlordJourney = flow.journey.slug === 'landlord-portfolio';
  const startLandlord = () => navigate(stepPath('landlord-portfolio', 2));
  const landlordLink = !landlordJourney && (
    <p className="hc-small hc-muted">
      Managing rentals?{' '}
      <button type="button" className="hc-medium-semibold hc-link hc-c39-text-btn" onClick={startLandlord}>
        Start here
      </button>
    </p>
  );
  const getApp = appOpen && <GetAppDialog mobile={device === 'mobile'} onClose={() => setAppOpen(false)} />;

  const footer = <SiteFooter />;

  // Review change: "Are you a pro?" section near the bottom of the landing page, linking to the For Pros page
  // (the same page as the top bar's "For Pros")
  // Review change: "Who uses HouseCue" (the six users from the prototype's old home page) as a section after the hero.
  // Customer cards link to their way in; tenants join by invite; support and admin are HouseCue staff (no button).
  // Review change: only the Homeowners card is active; the other five are shown disabled (dimmed, not clickable).
  const users: { icon: IconName; name: string; body: string; action?: { label: string; onClick: () => void }; note?: string; enabled?: boolean }[] = [
    {
      icon: 'home',
      name: 'Homeowners',
      body: 'Keep your home’s record and a maintenance plan, and let your agent get pros booked, always with your OK.',
      action: { label: 'Go', onClick: flow.goNext },
      enabled: true,
    },
    {
      icon: 'dashboard',
      name: 'Landlords',
      body: 'Keep every rental maintained. Tenants report issues and you approve the work, across one home or a whole portfolio.',
      action: { label: 'Go', onClick: landlordJourney ? flow.goNext : startLandlord },
    },
    {
      icon: 'users',
      name: 'Tenants',
      body: 'Report an issue, choose when a pro can come in, and confirm when the job’s done.',
      note: 'Your landlord sends you an invite.',
    },
    {
      icon: 'service',
      name: 'Pros',
      body: 'Get job requests from homeowners’ agents, send quotes and get paid when the work is signed off.',
      action: { label: 'Go', onClick: () => flow.go('C39', '?view=for-pros') },
    },
    {
      icon: 'help',
      name: 'Support team',
      body: 'HouseCue’s support team helps homeowners, tenants and pros by chat, email and call-back.',
      note: 'HouseCue staff',
    },
    {
      icon: 'shield',
      name: 'Admins',
      body: 'Run the platform: approving pros, payments, disputes and the safety controls on every agent.',
      note: 'HouseCue staff',
    },
  ];
  const usersSection = (
    <section className="hc-c39-users" aria-labelledby="hc-c39-users-title">
      <div className="hc-c39-users__head">
        <h2 id="hc-c39-users-title" className={device === 'mobile' ? 'hc-h4' : 'hc-h2'}>
          Who uses HouseCue
        </h2>
        <p className="hc-medium hc-muted">One home record, shared with the people who look after it.</p>
      </div>
      <ul className="hc-c39-users__grid">
        {users.map((u) => (
          <li
            key={u.name}
            // Review change: every card button reads just "Go" (aria-label names where it goes)
            className={`hc-c39-card hc-c39-user${u.enabled ? '' : ' hc-c39-user--disabled'}`}
            aria-disabled={u.enabled ? undefined : true}
          >
            <span className="hc-c39-points__icon">
              <Icon name={u.icon} size={24} />
            </span>
            <h3 className="hc-large-bold">{u.name}</h3>
            <p className="hc-medium hc-muted">{u.body}</p>
            <div className="hc-c39-user__foot">
              {u.action ? (
                <Button variant="secondary" size="small" onClick={u.action.onClick} disabled={!u.enabled} aria-label={`Go: ${u.name}`}>
                  {u.action.label}
                </Button>
              ) : (
                <p className="hc-small hc-muted">{u.note}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );

  const proSection = (
    <section className="hc-c39-card hc-c39-pro">
      <div className="hc-c39-pro__text">
        <h2 className="hc-h4">Are you a pro?</h2>
        <p className="hc-medium hc-muted">Get jobs from homeowners in Phoenix and Tucson, sent to you by their HouseCue agent.</p>
      </div>
      {/* Review change: disabled, like the Pros card in Who uses HouseCue */}
      <Button variant="secondary" fullWidth={device === 'mobile'} disabled>
        See HouseCue for Pros
      </Button>
    </section>
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

  // Review change: the top bar's "How it works" and "For Pros" open their own signed-out pages (?view=…), on the
  // shared layout the four top-bar pages use (Back to this page, title, lede, content, footer).
  if (view === 'how-it-works') {
    return (
      <PublicPage title="How it works" lede={LEDE}>
        <NumberedCards items={stepsWeb.map((s) => ({ title: s.title.replace(/^\d+\.\s*/, ''), body: s.body }))} />
        <PublicCta note="Free to start. Members $4.99/mo or $49/yr per home.">
          <Button fullWidth={device === 'mobile'} onClick={flow.goNext}>
            Get started free
          </Button>
        </PublicCta>
      </PublicPage>
    );
  }
  if (view === 'for-pros') {
    // Placeholder copy: no For Pros page in Figma and the vendor journey (J2) isn't built yet
    return (
      <PublicPage title="For Pros" lede="Get jobs from homeowners in Phoenix and Tucson, sent to you by their HouseCue agent.">
        <NumberedCards items={proSteps} />
        <PublicCta note="Pro sign-up isn’t in this prototype yet.">
          <Button fullWidth={device === 'mobile'} disabled>
            Join as a pro
          </Button>
        </PublicCta>
      </PublicPage>
    );
  }

  if (device === 'mobile') {
    return (
      <MobileShell className="hc-c39-mobile">
        <div className="hc-c39-mhead">
          <Logo />
          <MenuButton open={menuOpen} onClick={() => setMenuOpen((o) => !o)} controls="hc-c39-menu" />
        </div>
        {menuOpen && (
          // Review change: the shared full-screen menu (SiteMenu), the same one the signed-in pages use at phone width
          <SiteMenu
            id="hc-c39-menu"
            statusBar
            onClose={() => setMenuOpen(false)}
            links={[
              { label: 'How it works', onClick: () => flow.go('C39', '?view=how-it-works') },
              { label: 'Membership', onClick: () => flow.go('C28', '?visitor=1') },
              { label: 'For Pros', onClick: () => flow.go('C39', '?view=for-pros') },
              { label: 'Help', onClick: () => flow.go('C32', '?visitor=1') },
            ]}
            actions={
              <>
                <Button variant="secondary" size="large" fullWidth onClick={signIn}>
                  Log in
                </Button>
                <Button size="large" fullWidth onClick={flow.goNext}>
                  Get started
                </Button>
              </>
            }
          />
        )}
        <HeroImage height={260} className="hc-hero-photo--compact" />
        <p className="hc-medium-semibold hc-c39-eyebrow">Now booking in Phoenix and Tucson</p>
        <h1 className="hc-h2">Your home, handled.</h1>
        <p className="hc-large hc-muted">{LEDE}</p>
        <WelcomePoints />
        <Button fullWidth onClick={flow.goNext}>
          Get started free
        </Button>
        <Button variant="secondary" fullWidth onClick={() => setAppOpen(true)}>
          Download the app
        </Button>
        <button type="button" className="hc-medium-semibold hc-link hc-c39-text-btn" onClick={signIn}>
          I have an account
        </button>
        {landlordLink}
        {usersSection}
        <h2 className="hc-h4">How it works</h2>
        {rows(stepsMobile)}
        <h2 className="hc-h4">Plans</h2>
        {freeCard(false)}
        {memberCard(false)}
        <Banner title="Booking metros">
          Quotes and booking are live in Phoenix and Tucson. Everywhere else, your home record and reminders work now.
        </Banner>
        {proSection}
        {footer}
        {getApp}
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
            <Button variant="secondary" fullWidth onClick={() => setAppOpen(true)}>
              Download the app
            </Button>
          </div>
          <p className="hc-small hc-muted">
            Free to start. Members $4.99/mo or $49/yr per home. Already a member?{' '}
            <button type="button" className="hc-medium-semibold hc-link hc-c39-text-btn" onClick={signIn}>
              I have an account
            </button>
          </p>
          {landlordLink}
        </div>
        <HeroImage height={560} className="hc-c39-hero__image" />
      </div>
      {usersSection}
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
      {proSection}
      {footer}
      {getApp}
    </WebShell>
  );
}
