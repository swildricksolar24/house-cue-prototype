import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AgentFab } from '../../../components/AgentFab/AgentFab';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { Input } from '../../../components/Input/Input';
import { OptionCard } from '../../../components/OptionCard/OptionCard';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';
import { StateBlock } from '../../../components/StateBlock/StateBlock';
import { useFlow } from '../../prototype/flow';
import { screenPath } from '../../prototype/journeys';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C38-multi-home-switcher.css';

type SwitcherHome = {
  id: string;
  address: string;
  /** Card description, mobile and web copy */
  meta: string;
  metaWeb: string;
  /** "Selected home" card (web) */
  role: string;
  plan: string;
  items: string;
  booking: string;
};

/** Homes in the switcher (Figma 26:3187 … 26:3220 mobile, 26:3298 … 26:3329 web). Detail values past the first home are prototype fill-ins. */
const ownerHomes: SwitcherHome[] = [
  {
    id: 'palm',
    address: '2218 W Palm Ln, Phoenix',
    meta: 'Owner · Member · 14 items',
    metaWeb: 'Owner · Member · 14 items · booking available',
    role: 'Owner',
    plan: 'Member · renews Mar 2027',
    items: '14',
    booking: 'Available (Phoenix)',
  },
  {
    id: 'saguaro',
    address: '5530 E Saguaro Dr, Tucson',
    meta: 'Owner · Free plan · 6 of 10 items',
    metaWeb: 'Owner · Free plan · 6 of 10 items · booking available',
    role: 'Owner',
    plan: 'Free plan',
    items: '6 of 10',
    booking: 'Available (Tucson)',
  },
  {
    id: 'mesa-vista',
    address: '81 N Mesa Vista, Tucson',
    meta: 'Caregiver · Member',
    metaWeb: 'Caregiver for the owner · Member · booking available',
    role: 'Caregiver for the owner',
    plan: 'Member',
    items: '9',
    booking: 'Available (Tucson)',
  },
  {
    id: 'pine-ridge',
    address: '4410 Pine Ridge Rd, Flagstaff',
    meta: 'Owner · Free plan · Booking not available here yet',
    metaWeb: 'Owner · Free plan · booking not available here yet',
    role: 'Owner',
    plan: 'Free plan',
    items: '3 of 10',
    booking: 'Not available here yet (Flagstaff)',
  },
];

type PortfolioCard = { id: string; title: string; meta: string; dashboard?: boolean };

/** "Roles and Portfolio" frame (Figma mobile 269:7303, web 269:7634) */
const portfolioMobile: PortfolioCard[] = [
  { id: 'roosevelt', title: '1418 E Roosevelt St, Phoenix', meta: 'Landlord · 2 units · 2 tenants' },
  { id: 'pima', title: '5602 E Pima St, Tucson', meta: 'Landlord · 4 units · 1 vacant' },
  { id: 'more', title: '3 more rentals', meta: 'Open the portfolio dashboard', dashboard: true },
];
const portfolioWeb: PortfolioCard[] = [
  { id: 'roosevelt', title: '1418 E Roosevelt St, Phoenix', meta: 'Landlord · 2 units · 2 tenants' },
  { id: 'pima', title: '5602 E Pima St, Tucson', meta: 'Landlord · 4 units · 1 vacant' },
  { id: '9th', title: '2207 N 9th Ave, Phoenix', meta: 'Landlord · 1 unit' },
  { id: 'more', title: '2 more rentals', meta: 'Open the portfolio dashboard', dashboard: true },
];
const otherHomesMobile: PortfolioCard[] = [
  { id: 'palm', title: '2218 W Palm Ln, Phoenix', meta: 'Owner · Member' },
  { id: '3rd', title: '900 N 3rd St #4, Phoenix', meta: 'Tenant · managed by Saguaro Rentals' },
];
const otherHomesWeb: PortfolioCard[] = [
  { id: 'palm', title: '2218 W Palm Ln, Phoenix', meta: 'Owner · Member · 14 items' },
  { id: '3rd', title: '900 N 3rd St #4, Phoenix', meta: 'Tenant · managed by Saguaro Rentals' },
  { id: 'mesa-vista', title: '81 N Mesa Vista, Tucson', meta: 'Caregiver · Member' },
];

/**
 * C38 Multi-home switcher — Figma mobile 218:18308, web 218:18990 (J1 Household & access step 3; target of the shells'
 * home switcher). The "Roles and Portfolio" frame (landlord with a portfolio plus other roles) shows when the journey
 * step label mentions a landlord/portfolio, or with `?view=portfolio` in the URL.
 */
export default function MultiHomeSwitcher({ variant }: ScreenProps) {
  const { device, screenState, setScreenState } = usePrototype();
  const flow = useFlow();
  const [params] = useSearchParams();
  const portfolio = /landlord|portfolio|roles/i.test(variant ?? '') || /portfolio|roles/i.test(params.get('view') ?? '');

  if (portfolio) return <RolesAndPortfolio />;

  return <OwnerSwitcher device={device} screenState={screenState} onRetry={() => setScreenState('default')} flow={flow} />;
}

function OwnerSwitcher({
  device,
  screenState,
  onRetry,
  flow,
}: {
  device: 'mobile' | 'web';
  screenState: 'default' | 'empty' | 'loading' | 'error';
  onRetry: () => void;
  flow: ReturnType<typeof useFlow>;
}) {
  const [selectedId, setSelectedId] = useState('palm');
  const selected = ownerHomes.find((h) => h.id === selectedId) ?? ownerHomes[0];

  const cards = (
    <div className="hc-c38-list" role="radiogroup" aria-label="Your homes">
      {ownerHomes.map((h) => (
        <OptionCard
          key={h.id}
          icon="home"
          title={h.address}
          description={device === 'web' ? h.metaWeb : h.meta}
          selected={h.id === selectedId}
          onClick={() => setSelectedId(h.id)}
        />
      ))}
    </div>
  );

  const stateContent =
    screenState === 'empty' ? (
      <StateBlock title="Just one home so far" body="Add another home to manage it here." actionLabel="Add a home" onAction={flow.goNext} />
    ) : screenState === 'error' ? (
      <StateBlock kind="error" title="Couldn’t load your homes" body="Check your connection and try again. Nothing was lost." onAction={onRetry} />
    ) : screenState === 'loading' ? (
      <div className="hc-c38-list" aria-busy>
        <SkeletonCard label="Loading your homes" />
        <SkeletonCard label="Loading your homes" />
        <SkeletonCard label="Loading your homes" />
      </div>
    ) : null;

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Your homes' }} tab="home">
        {stateContent ?? cards}
        <Button variant="secondary" fullWidth onClick={flow.goNext}>
          Add a home
        </Button>
        {!stateContent && <p className="hc-small hc-muted">Each home has its own plan. Membership is billed per home.</p>}
      </MobileShell>
    );
  }

  return (
    <WebShell nav="account">
      <div className="hc-c38-web">
        <header className="hc-c38-web__head">
          <h1 className="hc-h2">Your homes</h1>
          <Button onClick={flow.goNext}>Add a home</Button>
        </header>
        <div className="hc-c38-web__cols">
          <section className="hc-c38-card hc-c38-card--list hc-c38-web__main">{stateContent ?? cards}</section>
          <aside className="hc-c38-web__side">
            <Banner tone="info" title="Membership is per home">
              Member features work only in member homes. The free plan allows 10 items in each home.
            </Banner>
            <section className="hc-c38-card">
              <h2 className="hc-large-bold">Selected home</h2>
              <div>
                <DetailRow label="Your role" value={selected.role} />
                <DetailRow label="Plan" value={selected.plan} actionLabel="Manage" onAction={() => flow.go('C29')} />
                <DetailRow label="Items" value={selected.items} />
                <DetailRow label="Booking" value={selected.booking} />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </WebShell>
  );
}

function RolesAndPortfolio() {
  const { device } = usePrototype();
  const flow = useFlow();
  const [selectedId, setSelectedId] = useState('roosevelt');
  const [query, setQuery] = useState('');
  const match = (c: PortfolioCard) => !query.trim() || c.title.toLowerCase().includes(query.trim().toLowerCase());

  const card = (c: PortfolioCard) => (
    <OptionCard
      key={c.id}
      icon="home"
      title={c.title}
      description={c.meta}
      selected={c.id === selectedId}
      onClick={() => (c.dashboard ? flow.go('C79') : setSelectedId(c.id))}
    />
  );

  const search = (
    <Input label="Search homes" hideLabel type="search" leadingIcon="search" placeholder="Search homes" value={query} onValueChange={setQuery} />
  );

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Your homes' }} role="landlord" tab="portfolio" className="hc-c38-portfolio">
        {search}
        <div className="hc-c38-group-head">
          <h2 className="hc-c38-group-title">Mesa Verde Holdings · Portfolio</h2>
          <button type="button" className="hc-c38-link" onClick={() => flow.go('C79')}>
            Open
          </button>
        </div>
        <div className="hc-c38-list" role="radiogroup" aria-label="Mesa Verde Holdings">
          {portfolioMobile.filter(match).map(card)}
        </div>
        <h2 className="hc-c38-group-title">Other homes</h2>
        <div className="hc-c38-list" role="radiogroup" aria-label="Other homes">
          {otherHomesMobile.filter(match).map(card)}
        </div>
        <AgentFab to={screenPath('C09')} className="hc-c38-fab" />
      </MobileShell>
    );
  }

  return (
    <WebShell role="landlord" nav="portfolio">
      <div className="hc-c38-web">
        <header className="hc-c38-web__head">
          <h1 className="hc-h2">Your homes</h1>
          <Button onClick={flow.goNext}>Add a home</Button>
        </header>
        <div className="hc-c38-web__body">
          {search}
          <div className="hc-c38-web__cols">
            <div className="hc-c38-web__portfolio">
              <div className="hc-c38-group-head">
                <h2 className="hc-large-bold">Mesa Verde Holdings · Portfolio</h2>
                <button type="button" className="hc-c38-link" onClick={() => flow.go('C79')}>
                  Open portfolio
                </button>
              </div>
              <div className="hc-c38-list" role="radiogroup" aria-label="Mesa Verde Holdings">
                {portfolioWeb.filter(match).map(card)}
              </div>
            </div>
            <div className="hc-c38-web__main">
              <h2 className="hc-large-bold">Other homes</h2>
              <div className="hc-c38-list" role="radiogroup" aria-label="Other homes">
                {otherHomesWeb.filter(match).map(card)}
              </div>
            </div>
          </div>
        </div>
      </div>
      <AgentFab size="extended" to={screenPath('C09')} className="hc-c38-fab" />
    </WebShell>
  );
}
