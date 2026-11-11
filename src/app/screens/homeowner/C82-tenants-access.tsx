import { useState } from 'react';
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
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { screenPath } from '../../prototype/journeys';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C82-tenants-access.css';

type Tenant = {
  id: string;
  name: string;
  unit: string;
  status: string;
  tone: 'success' | 'warning';
  windows: string;
  since: string;
  mobileTitle: string;
  mobileMeta: string;
};

const tenants: Tenant[] = [
  {
    id: 'marisol',
    name: 'Marisol Ortega',
    unit: 'A',
    status: 'Active',
    tone: 'success',
    windows: 'Weekdays 7–9 AM',
    since: 'Mar 1, 2026',
    mobileTitle: 'Unit A · Marisol Ortega',
    mobileMeta: 'Active since Mar 1, 2026 · access windows set',
  },
  {
    id: 'theo',
    name: 'Theo Brandt',
    unit: 'B',
    status: 'Moving out Nov 30',
    tone: 'warning',
    windows: 'Evenings',
    since: 'Aug 15, 2025',
    mobileTitle: 'Unit B · Theo Brandt',
    mobileMeta: 'Active since Aug 15, 2025 · moving out Nov 30',
  },
  {
    id: 'lena',
    name: 'Lena Brandt (co-tenant)',
    unit: 'B',
    status: 'Invite pending',
    tone: 'warning',
    windows: 'Not set yet',
    since: 'Sent Nov 7',
    mobileTitle: 'Unit B · Lena Brandt (co-tenant)',
    mobileMeta: 'Invite pending · sent Nov 7 · never expires',
  },
];

const SEES_BODY = 'Report categories you allow, status only (costs hidden), and prior maintenance jobs. Never earlier tenants’ requests (#189).';

/** C82 Tenants & access (invite) — Figma mobile 272:32085, web 272:32952; states 263:2389/2445/2505 (mobile), 263:2570/2712/2866 (web) */
export default function TenantsAccess(_: ScreenProps) {
  const { device, screenState } = usePrototype();
  const flow = useFlow();
  const [inviting, setInviting] = useState(false);
  const [name, setName] = useState('Ana Lucero');
  const [contact, setContact] = useState('ana.lucero@example.com');
  const [moveIn, setMoveIn] = useState('Dec 1, 2026');
  const [coTenant, setCoTenant] = useState(false);
  const [revoked, setRevoked] = useState(false);
  const [resent, setResent] = useState(false);

  const moveOut = () => flow.go('C87');
  const shown = tenants.filter((t) => !(revoked && t.id === 'lena'));

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
          onAction={() => undefined}
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
        header={{ title: 'Tenants & access' }}
        bottom={
          inviting ? (
            <BottomActions primaryLabel="Send invite" onPrimary={flow.goNext} secondaryLabel="Cancel" onSecondary={() => setInviting(false)} />
          ) : (
            <BottomActions primaryLabel="Invite tenant" onPrimary={() => setInviting(true)} secondaryLabel="Move out a tenant" onSecondary={moveOut} />
          )
        }
      >
        <p className="hc-medium hc-muted">1418 E Roosevelt St, Phoenix · 2 units</p>
        {inviting ? (
          <section className="hc-c82-stack">
            <h2 className="hc-large-bold">Invite a tenant</h2>
            {inviteFields}
          </section>
        ) : (
          (stateBlock(3) ?? (
            <div>
              {shown.map((t) => (
                <ListRow key={t.id} title={t.mobileTitle} description={t.mobileMeta} />
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
            <ConsoleBreadcrumb parent="1418 E Roosevelt St" parentTo={screenPath('C79')} current="Tenants & access" />
            <h1 className="hc-h2">Property tenants and access</h1>
            <p className="hc-medium hc-muted">1418 E Roosevelt St, Phoenix · 2 units · invites never expire (#158); revoke any time</p>
          </div>
          <Button variant="secondary" onClick={moveOut}>
            Move out a tenant
          </Button>
        </header>
        <div className="hc-c82-web__cols">
          <div className="hc-c82-web__main">
            {stateBlock(3) ?? (
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
                      <span role="cell">{t.id === 'lena' && resent ? 'Sent today' : t.since}</span>
                    </div>
                  ))}
                </div>
                {!revoked && (
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
              <Button fullWidth onClick={flow.goNext}>
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
