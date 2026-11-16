import { useSearchParams } from 'react-router-dom';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { Input } from '../../../components/Input/Input';
import { ListRow } from '../../../components/ListRow/ListRow';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import { PublicCard, PublicPage } from './_public-page';
import './C32-help-and-contact-support.css';

/**
 * C32 Help and contact support — Figma mobile 218:16979, web 218:17679 (J1 Warranty / dispute, step 3). No state frames.
 * Review change: the signed-out top bar's "Help" opens this page with ?visitor=1, on the shared layout of the four
 * top-bar pages (Back, title, lede, stacked cards, footer): chat asks you to log in, and the account-specific
 * "What your agent will share" card is left out. A "Delete your account" card opens the web deletion request (X10),
 * which works without signing in (app stores require a web link for this).
 */

const articles = [
  { title: 'How payment holds work', description: 'Holds, sign-off and the 30-day holdback' },
  { title: 'Cancel or reschedule a job', description: 'Fees, timing and refunds' },
  { title: 'Disputes and appeals', description: 'AI rulings, appeals and the $250 fee' },
  { title: 'Warranty claims', description: 'Callbacks to the pro and maker claims' },
  { title: 'Your agent and your data', description: 'What it knows and how to change it' },
];

export default function HelpAndContactSupport(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [params] = useSearchParams();

  // Chat goes through the agent (C09); email and call-back have no prototype screen
  const contact = (
    <>
      <DetailRow label="Chat" value="Usually replies in 5 minutes" actionLabel="Start" onAction={() => flow.go('C09')} />
      <DetailRow label="Email" value="Within 1 business day" actionLabel="Write" actionDisabled />
      <DetailRow label="Call me back" value="Pick a time" actionLabel="Schedule" actionDisabled />
    </>
  );

  const rows = (items: typeof articles) =>
    items.map((a) => <ListRow key={a.title} title={a.title} description={a.description} />);

  if (params.get('visitor') === '1') {
    return (
      <PublicPage title="Help" lede="Search our help articles, or talk to us.">
        <Input type="search" label="Search help" hideLabel placeholder="Search help in English or Spanish" />
        <PublicCard>
          <h2 className="hc-large-bold">Popular articles</h2>
          <div>{rows(articles)}</div>
        </PublicCard>
        <PublicCard>
          <h2 className="hc-large-bold">Talk to us</h2>
          <div>
            <DetailRow label="Chat" value="Log in to chat with support" actionLabel="Log in" onAction={() => flow.go('C02', '?state=signin')} />
            <DetailRow label="Email" value="Within 1 business day" actionLabel="Write" actionDisabled />
            <DetailRow label="Call me back" value="Pick a time" actionLabel="Schedule" actionDisabled />
          </div>
        </PublicCard>
        <PublicCard>
          <h2 className="hc-large-bold">Delete your account</h2>
          <p className="hc-small hc-muted">Ask us to delete your HouseCue account and data, even if you can’t sign in.</p>
          <Button variant="secondary" fullWidth onClick={() => flow.go('X10')}>
            Request account deletion
          </Button>
        </PublicCard>
        <Banner tone="error" title="Emergency?">
          Log in and use Emergency instead of waiting for support.
        </Banner>
      </PublicPage>
    );
  }

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Help' }} tab="account">
        <Input type="search" label="Search help" hideLabel placeholder="Search help" />
        <h2 className="hc-large-bold">Popular</h2>
        {rows(articles.slice(0, 2))}
        <h2 className="hc-large-bold">Talk to us</h2>
        {contact}
      </MobileShell>
    );
  }

  return (
    <WebShell nav="account">
      <div className="hc-c32-web">
        <h1 className="hc-h2">Help</h1>
        <Input type="search" label="Search help" hideLabel placeholder="Search help in English or Spanish" />
        <div className="hc-c32-web__cols">
          <section className="hc-c32-card hc-c32-web__main">
            <h2 className="hc-large-bold">Popular articles</h2>
            {rows(articles)}
          </section>
          <aside className="hc-c32-web__side">
            <section className="hc-c32-card">
              <h2 className="hc-large-bold">Talk to us</h2>
              {contact}
            </section>
            <section className="hc-c32-card hc-c32-card--gap">
              <h2 className="hc-large-bold">What your agent will share</h2>
              <p className="hc-small hc-muted">
                A short summary, the AC repair job with Zephyrline HVAC, the change order and your last 5 messages. You
                won’t have to repeat yourself.
              </p>
            </section>
            <Banner tone="error" title="Emergency?">
              Use Emergency instead of waiting for support.
            </Banner>
          </aside>
        </div>
      </div>
    </WebShell>
  );
}
