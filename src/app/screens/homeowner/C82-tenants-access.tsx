import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AgentFab } from '../../../components/AgentFab/AgentFab';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { Checkbox } from '../../../components/Checkbox/Checkbox';
import { ConsoleBreadcrumb } from '../../../components/ConsoleBreadcrumb/ConsoleBreadcrumb';
import { Input } from '../../../components/Input/Input';
import { ListRow } from '../../../components/ListRow/ListRow';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';
import { StateBlock } from '../../../components/StateBlock/StateBlock';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { findProperty, type PropertyTenant } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { screenPath } from '../../prototype/journeys';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C82-tenants-access.css';

type Tenant = PropertyTenant;

const SEES_BODY = 'Report categories you allow, status only (costs hidden), and prior maintenance jobs. Never earlier tenants’ requests (#189).';

/** C82 Tenants & access (invite) — Figma mobile 272:32085, web 272:32952; states 263:2389/2445/2505 (mobile), 263:2570/2712/2866 (web) */
export default function TenantsAccess(_: ScreenProps) {
  const { device, screenState } = usePrototype();
  const flow = useFlow();
  // Review change: the tenants are those of the property in ?property=<id> (from its detail page); Back returns there and
  // Send invite adds a pending invite here. Without it (the landlord journey) it's 1418 E Roosevelt St, as before.
  const [params] = useSearchParams();
  const fromDetail = params.has('property');
  const p = findProperty(params.get('property'));
  const tenants: Tenant[] = p.tenants;
  const back = fromDetail ? () => flow.go('C79', `?property=${p.id}`) : flow.goBack;
  const [invited, setInvited] = useState<Tenant[]>([]);
  const [inviting, setInviting] = useState(false);
  const [name, setName] = useState('Otis Peabody');
  const [contact, setContact] = useState('otis.peabody@example.com');
  const [moveIn, setMoveIn] = useState('Dec 1, 2026');
  const [coTenant, setCoTenant] = useState(false);
  const [revoked, setRevoked] = useState(false);
  const [resent, setResent] = useState(false);

  // Move-out (C87) is built for 1418 E Roosevelt St's Unit B only
  const canMoveOut = p.id === 'roosevelt';
  const moveOut = () => flow.go('C87');
  // The invite Resend / Revoke act on (the property's pending one)
  const pendingId = tenants.find((t) => t.status === 'Invite pending')?.id;
  const shown = [...tenants.filter((t) => !(revoked && t.id === pendingId)), ...invited];
  const sendInvite = () => {
    if (!fromDetail) return flow.goNext();
    const who = name.trim() || 'New tenant';
    setInvited((list) => [...list, { id: `invite-${list.length}`, name: who, unit: '—', status: 'Invite pending', tone: 'warning', windows: 'Not set yet', since: 'Sent today', mobileMeta: 'Invite pending · sent today · never expires' }]);
    setSentTo(who);
    setInviting(false);
  };
  const [sentTo, setSentTo] = useState<string | null>(null);
  const sentBanner = sentTo && (
    <Banner tone="success" title={`Invite sent to ${sentTo}`}>
      It shows as pending below until they accept. Invites never expire; revoke any time.
    </Banner>
  );
  // Review change: a property with no tenants (3315 E Fairmount Ave, vacant) says so
  const noTenants =
    shown.length === 0 ? (
    <StateBlock title="No tenants yet" body={`No one lives at ${p.short} right now (${p.mobileMeta}). Invite the next tenant when it’s ready.`} actionLabel={device === 'mobile' ? 'Invite a tenant' : undefined} onAction={device === 'mobile' ? () => setInviting(true) : undefined} />
    ) : null;

  const stateBlock = (rows: number) => {
    if (screenState === 'loading') {
      return (
        <div className="hc-c82-stack">
          {Array.from({ length: rows }, (_, i) => (
            <SkeletonCard key={i} label="Loading tenants" />
          ))}
        </div>
      );
    }
    if (screenState === 'empty') {
      return (
        <StateBlock
          title="No tenants yet"
          body="Invite the tenant so they can report issues and set access windows."
          actionLabel="Get started"
          onAction={() => setInviting(true)}
        />
      );
    }
    if (screenState === 'error') {
      return (
        <StateBlock
          kind="error"
          title="Could not load tenants"
          body="Check your connection and try again. Your data is safe."
          actionLabel="Try again"
        />
      );
    }
    return null;
  };

  const inviteFields = (
    <>
      <Input label="Tenant name" value={name} onValueChange={setName} />
      <Input label="Email or phone" type="email" value={contact} onValueChange={setContact} />
      <Input label="Move-in date" value={moveIn} onValueChange={setMoveIn} />
      <Checkbox label="Add a co-tenant (each adult is invited separately)" checked={coTenant} onChange={(e) => setCoTenant(e.target.checked)} />
      <p className="hc-small hc-muted">They will see: Plumbing, HVAC, Electrical, Appliances, Pests, Locks · status only · prior maintenance history.</p>
    </>
  );

  if (device === 'mobile') {
    return (
      <MobileShell
        header={{ title: 'Tenants & access', onBack: back }}
        bottom={
          inviting ? (
            <BottomActions primaryLabel="Send invite" onPrimary={sendInvite} secondaryLabel="Cancel" onSecondary={() => setInviting(false)} />
          ) : (
            <BottomActions primaryLabel="Invite tenant" onPrimary={() => setInviting(true)} secondaryLabel={canMoveOut ? 'Move out a tenant' : undefined} onSecondary={canMoveOut ? moveOut : undefined} />
          )
        }
      >
        <p className="hc-medium hc-muted">
          {p.address} · {p.units}
        </p>
        {sentBanner}
        {inviting ? (
          <section className="hc-c82-stack">
            <h2 className="hc-large-bold">Invite a tenant</h2>
            {inviteFields}
          </section>
        ) : (
          (stateBlock(3) ?? noTenants ?? (
            <div>
              {shown.map((t) => (
                <ListRow key={t.id} title={t.unit === '—' ? t.name : `Unit ${t.unit} · ${t.name}`} description={t.mobileMeta} />
              ))}
            </div>
          ))
        )}
        <Banner tone="info" title="What tenants see">
          {SEES_BODY}
        </Banner>
      </MobileShell>
    );
  }

  return (
    <WebShell role="landlord" nav="portfolio">
      <div className="hc-c82-web">
        <header className="hc-c82-web__head">
          <div className="hc-c82-web__title">
            <ConsoleBreadcrumb parent={p.short} onParentClick={back} current="Tenants & access" />
            <h1 className="hc-h2">Property tenants and access</h1>
            <p className="hc-medium hc-muted">{p.address} · {p.units} · invites never expire (#158); revoke any time</p>
          </div>
          {canMoveOut && (
            <Button variant="secondary" onClick={moveOut}>
              Move out a tenant
            </Button>
          )}
        </header>
        <div className="hc-c82-web__cols">
          <div className="hc-c82-web__main">
            {sentBanner}
            {stateBlock(3) ?? noTenants ?? (
              <>
                <div className="hc-c82-table" role="table" aria-label="Tenants">
                  <div className="hc-c82-table__row hc-c82-table__row--head" role="row">
                    <span role="columnheader">Tenant</span>
                    <span role="columnheader">Unit</span>
                    <span role="columnheader">Status</span>
                    <span role="columnheader">Access windows</span>
                    <span role="columnheader">Since</span>
                  </div>
                  {shown.map((t) => (
                    <div key={t.id} className="hc-c82-table__row" role="row">
                      <span role="cell" className="hc-medium-semibold">
                        {t.name}
                      </span>
                      <span role="cell">{t.unit}</span>
                      <span role="cell">
                        <StatusPill label={t.status} tone={t.tone} />
                      </span>
                      <span role="cell">{t.windows}</span>
                      <span role="cell">{t.id === pendingId && resent ? 'Sent today' : t.since}</span>
                    </div>
                  ))}
                </div>
                {pendingId && !revoked && (
                  <div className="hc-c82-buttons">
                    <Button variant="secondary" onClick={() => setResent(true)}>
                      Resend invite
                    </Button>
                    <Button variant="destructive" onClick={() => setRevoked(true)}>
                      Revoke invite
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
          <aside className="hc-c82-web__side">
            <section className="hc-c82-card">
              <h2 className="hc-large-bold">Invite a tenant</h2>
              {inviteFields}
              <Button fullWidth onClick={sendInvite}>
                Send invite
              </Button>
            </section>
          </aside>
        </div>
      </div>
      <AgentFab size="extended" to={screenPath('C09')} className="hc-c82-fab" />
    </WebShell>
  );
}
