import { useNavigate } from 'react-router-dom';
import { Icon, type IconName } from '../../../components/Icon/Icon';
import { Button } from '../../../components/Button/Button';
import { StatusPill, type StatusTone } from '../../../components/StatusPill/StatusPill';
import { accountHomes, expiredHouseholdHome, homeowner, sampleInvites, type InviteRole } from '../../data/sample';
import { acceptInvite, clearNewAccount, declineInvite, useAccounts } from '../../prototype/accounts';
import { useCurrentHome } from '../../prototype/HomeContext';
import { screenPath } from '../../prototype/journeys';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import { WebCard } from './_onboarding';
import './_choose-account.css';

/**
 * A row with no `open` is disabled (review change): no flow in the prototype yet, or access that has ended. `note`
 * says why (default "Not in the prototype yet"); `tag` is a status after the address, e.g. Expired.
 */
type Row = {
  id: string;
  address: string;
  meta: string;
  isNew?: boolean;
  open?: () => void;
  tag?: { label: string; tone: StatusTone };
  note?: string;
};
type Group = {
  id: string;
  role: InviteRole;
  title: string;
  meta: string;
  isNew: boolean;
  rows: Row[];
  /** A link next to the account name, e.g. "Open portfolio" */
  action?: { label: string; onClick: () => void };
  /** Initials for the profile avatar: only on the signed-in person's own account */
  avatar?: string;
};

const ROLES: InviteRole[] = ['homeowner', 'landlord', 'tenant'];
const ROLE_NAME: Record<InviteRole, string> = { homeowner: 'Homeowner', landlord: 'Landlord', tenant: 'Tenant' };
const ROLE_ICON: Record<InviteRole, IconName> = { homeowner: 'home', landlord: 'dashboard', tenant: 'home' };

/**
 * Choose an account (review change, not in Figma; route /accounts): after accepting an invite and signing in, pick
 * where to go. Review change: it lists every property you can open, in a section per kind of account, then by account:
 * - Homeowner: your own homes (Marty McFly), then Household member: each home you joined by invite (Home, C08, on that
 *   home) and one whose access has expired (disabled, Expired tag, "Ask Linda for a new invite")
 * - Landlord: each portfolio you co-manage and its rentals (Portfolio dashboard, C79)
 * - Tenant: your rental (Tenant home, C84)
 * Review change: landlord and tenant invites waiting for you show in their section (who sent it, the portfolio or rental,
 * your role) with Decline / Accept invite; accepting adds the account to the list straight away (you're signed in),
 * tagged New; declining hides it for this visit.
 * What you just joined is tagged New. Also opened by Switch account (home switcher, phone-width menu, landlord / tenant
 * switchers). Web: centred card under the top bar, like Sign in. Mobile: full screen.
 */
export function ChooseAccount() {
  const { device } = usePrototype();
  const navigate = useNavigate();
  const { homes, setHomeId } = useCurrentHome();
  const { joined, invites, newId } = useAccounts();

  const go = (path: string, homeId?: string) => {
    clearNewAccount();
    if (homeId) setHomeId(homeId);
    navigate(path);
  };

  const toHome = (homeId: string) => () => go(screenPath('C08', 'homeowner'), homeId);
  const ownHomes = homes.filter((h) => accountHomes.some((a) => a.id === h.id));
  // Homes joined as a household member (also in the home switcher)
  const joinedHomes = homes.filter((h) => !accountHomes.some((a) => a.id === h.id));
  const expired = expiredHouseholdHome;

  const groups: Group[] = [
    {
      id: 'own',
      role: 'homeowner',
      title: `${homeowner.firstName} ${homeowner.lastName}`,
      avatar: `${homeowner.firstName[0]}${homeowner.lastName[0]}`,
      meta: `Your account · ${ownHomes.length} homes`,
      isNew: false,
      rows: ownHomes.map((h) => ({ id: h.id, address: `${h.address}, ${h.city}`, meta: h.meta, open: toHome(h.id) })),
    },
    // Review change: one Household member group: homes you joined by invite, then one whose access has expired
    {
      id: 'household',
      role: 'homeowner',
      title: 'Household member',
      meta: 'Homes other owners invited you to',
      isNew: false,
      rows: [
        ...joinedHomes.map<Row>((h) => {
          const account = joined.find((a) => a.homeId === h.id);
          return {
            id: h.id,
            address: `${h.address}, ${h.city}`,
            meta: account?.title ?? h.meta,
            isNew: h.id === newId,
            open: toHome(h.id),
          };
        }),
        {
          id: expired.id,
          address: `${expired.address}, ${expired.city}`,
          meta: expired.meta,
          tag: { label: 'Expired', tone: 'danger' },
          note: expired.note,
        },
      ],
    },
    ...joined
      .filter((a) => a.role !== 'homeowner')
      .map<Group>((a) => {
        return {
          id: a.id,
          role: a.role,
          title: a.role === 'landlord' ? a.title : 'Your rental',
          meta: a.meta,
          isNew: a.id === newId,
          // The portfolio itself stays one click away (C79)
          action: a.role === 'landlord' ? { label: 'Open portfolio', onClick: () => go(screenPath('C79', 'landlord')) } : undefined,
          // Each property opens its own screen (C82 Tenants & access for 1418 E Roosevelt St, C84 for your rental); the
          // others have no flow yet and are disabled
          rows: sampleInvites[a.role].properties.map((p) => {
            const screen = p.screen;
            return {
              id: `${a.id}-${p.address}`,
              address: `${p.address}, ${p.city}`,
              meta: p.meta,
              open: screen ? () => go(screenPath(screen, a.role)) : undefined,
            };
          }),
        };
      }),
  ];

  // Review change: one section per kind of account, in this order; a kind you have no account for isn't shown
  const list = ROLES.filter((role) => groups.some((g) => g.role === role) || invites.includes(role)).map((role) => (
    <section key={role} className="hc-choose-account__role" aria-labelledby={`hc-choose-account-${role}`}>
      <h2 id={`hc-choose-account-${role}`} className="hc-h4 hc-choose-account__role-title">
        <Icon name={ROLE_ICON[role]} size={20} />
        {ROLE_NAME[role]}
      </h2>
      {groups.filter((g) => g.role === role).map(renderGroup)}
      {invites.includes(role) && renderInvite(role)}
    </section>
  ));

  function renderInvite(role: InviteRole) {
    const invite = sampleInvites[role];
    const titleId = `hc-choose-account-invite-${role}`;
    return (
      <div key={`invite-${role}`} className="hc-choose-account__invite" role="group" aria-labelledby={titleId}>
        <div className="hc-choose-account__invite-head">
          <span className="hc-choose-account__icon" aria-hidden>
            <Icon name="email" size={20} />
          </span>
          <div className="hc-choose-account__group-name">
            <div className="hc-choose-account__group-title">
              <h3 id={titleId} className="hc-medium-semibold">
                {invite.place}
              </h3>
              <StatusPill label="Invite" tone="info" />
            </div>
            <p className="hc-small hc-muted">
              From {invite.from} · your role: {invite.roleLabel}
            </p>
          </div>
        </div>
        <p className="hc-small">{invite.description}</p>
        <div className="hc-choose-account__invite-actions">
          <Button variant="secondary" size="small" onClick={() => declineInvite(role)}>
            Decline
          </Button>
          <Button size="small" onClick={() => acceptInvite(role)}>
            Accept invite
          </Button>
        </div>
      </div>
    );
  }

  function renderGroup(g: Group) {
    const headingId = `hc-choose-account-${g.id}`;
    return (
      <div key={g.id} className="hc-choose-account__group" role="group" aria-labelledby={headingId}>
        <div className="hc-choose-account__group-head">
          {/* Review change: profile avatar (initials) next to the person who's signed in */}
          {g.avatar && (
            <span className="hc-choose-account__avatar" aria-hidden>
              {g.avatar}
            </span>
          )}
          <div className="hc-choose-account__group-name">
            <div className="hc-choose-account__group-title">
              <h3 id={headingId} className="hc-medium-semibold">
                {g.title}
              </h3>
              {g.isNew && <StatusPill label="New" tone="success" />}
            </div>
            <p className="hc-small hc-muted">{g.meta}</p>
          </div>
          {g.action && (
            <Button variant="link" size="small" className="hc-choose-account__action" onClick={g.action.onClick}>
              {g.action.label}
            </Button>
          )}
        </div>
        <ul className="hc-choose-account__list">
          {g.rows.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                className={['hc-choose-account__item', !r.open && 'is-disabled'].filter(Boolean).join(' ')}
                onClick={r.open}
                disabled={!r.open}
                title={r.open ? undefined : (r.note ?? 'Not in the prototype yet')}
              >
                <span className="hc-choose-account__icon" aria-hidden>
                  <Icon name={ROLE_ICON[g.role]} size={20} />
                </span>
                <span className="hc-choose-account__text">
                  <span className="hc-medium-semibold">
                    {r.address}
                    {r.isNew && <StatusPill label="New" tone="success" className="hc-choose-account__new" />}
                    {r.tag && <StatusPill label={r.tag.label} tone={r.tag.tone} className="hc-choose-account__new" />}
                  </span>
                  <span className="hc-small hc-muted">
                    {r.meta}
                    {!r.open && ` · ${r.note ?? 'Not in the prototype yet'}`}
                  </span>
                </span>
                {r.open && (
                  <svg className="hc-choose-account__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  const intro = 'Every home and property you can open. You can switch anytime from your home menu.';

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Choose an account', showBack: false }} className="hc-onb-mobile hc-choose-account">
        <h1 className="hc-h3">Where do you want to go?</h1>
        <p className="hc-medium hc-muted">{intro}</p>
        {list}
      </MobileShell>
    );
  }

  return (
    <WebShell layout="onboarding" className="hc-onb-web hc-choose-account">
      <WebCard>
        <h1 className="hc-h2">Choose an account</h1>
        <p className="hc-large hc-muted">{intro}</p>
        {list}
      </WebCard>
    </WebShell>
  );
}
