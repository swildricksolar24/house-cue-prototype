import { useState } from 'react';
import { Button } from '../../../components/Button/Button';
import { Icon, type IconName } from '../../../components/Icon/Icon';
import { Select } from '../../../components/Select/Select';
import { SettingRow } from '../../../components/SettingRow/SettingRow';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';
import { StateBlock } from '../../../components/StateBlock/StateBlock';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { currentHome, homeowner } from '../../data/sample';
import { usePrototype } from '../../prototype/PrototypeContext';
import { FormDialog } from '../../shells/EditDialog';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C35-household-and-caregiver-access.css';

type Role = 'Owner' | 'Co-owner' | 'Household member' | 'Caregiver';

type Member = {
  id: string;
  /** First name */
  name: string;
  lastName: string;
  email: string;
  role: Role;
  icon: IconName;
  owner?: boolean;
  /** Invite not accepted yet */
  invited?: boolean;
  /** When the invite went out, e.g. "Nov 4" or "today" */
  invitedOn?: string;
};

/**
 * People on the home (Figma 34:1659 … 34:1693). Review change: role and email are editable (Edit next to each person),
 * and everyone has a last name. Review change: Back to the Future character names (fictional).
 */
const MEMBERS: Member[] = [
  { id: 'jordan', name: homeowner.firstName, lastName: homeowner.lastName, email: homeowner.email, role: 'Owner', icon: 'account', owner: true },
  { id: 'jennifer', name: 'Jennifer', lastName: 'Parker', email: 'jennifer@example.com', role: 'Co-owner', icon: 'users' },
  { id: 'george', name: 'George', lastName: 'McFly', email: 'george@example.com', role: 'Household member', icon: 'users' },
  { id: 'lorraine', name: 'Lorraine', lastName: 'McFly', email: 'lorraine@example.com', role: 'Caregiver', icon: 'users', invited: true, invitedOn: 'Nov 4' },
];

const ROLES: Role[] = ['Co-owner', 'Household member', 'Caregiver'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Row description and tag from the role (web adds "including payment" for co-owners, as in Figma) */
const describe = (m: Member, web: boolean) => {
  const access =
    m.role === 'Owner'
      ? 'full access'
      : m.role === 'Co-owner'
        ? web
          ? 'full access, including payment'
          : 'full access'
        : m.role === 'Household member'
          ? 'can request, can’t pay'
          : 'helps with visits and requests';
  if (m.invited) return { meta: `${m.role} · invite sent ${m.invitedOn ?? 'Nov 4'} · valid until accepted or revoked`, pill: 'Invited' };
  return { meta: `${m.role} · ${access}`, pill: m.role === 'Household member' ? 'Member' : m.role };
};

/** Spend limit choices (review change) */
const SPEND_LIMITS = ['$0 · everything needs your OK', 'Up to $100 per job', 'Up to $250 per job', 'Up to $500 per job'];

type Perms = { book: boolean; pay: boolean; approve: boolean; documents: boolean; contact: boolean; spend: string };

/** What a new invitee starts with: only "Be the contact for visits" */
const NEW_PERMS: Perms = { book: false, pay: false, approve: false, documents: false, contact: true, spend: '$0 · everything needs your OK' };

/** Starting permissions per person: co-owners can do everything; others are the contact for visits only */
const START_PERMS: Record<string, Perms> = {
  jennifer: { book: true, pay: true, approve: true, documents: true, contact: true, spend: 'Up to $500 per job' },
  george: { book: false, pay: false, approve: false, documents: false, contact: true, spend: SPEND_LIMITS[0] },
  lorraine: { book: false, pay: false, approve: false, documents: false, contact: true, spend: SPEND_LIMITS[0] },
};

const PERM_ROWS: { key: Exclude<keyof Perms, 'spend'>; title: string; description: string }[] = [
  { key: 'book', title: 'Book pros', description: 'Bookings need your OK when off' },
  { key: 'pay', title: 'Pay', description: 'Use this home’s payment methods' },
  { key: 'approve', title: 'Approve agent actions', description: 'Approve what the agent proposes' },
  { key: 'documents', title: 'See documents and valuables', description: 'Receipts, warranties, contents' },
  { key: 'contact', title: 'Be the contact for visits', description: 'Pros see first name and phone during the job' },
];

/**
 * Review change: one dialog per person (Edit at the right of their row) for their details and, for everyone but the
 * owner, their permissions: the five switches and Spend limit, plus "Remove <name> from this home". The separate
 * permissions panel (and picking a person to show it) is gone.
 * Review change: the same dialog invites someone ("Invite someone"): empty Name / Email / Role, permissions starting with
 * only "Be the contact for visits", and Send invite instead of Remove. Both check the fields: a name, an email in the
 * right format that isn't already on this home, and a role.
 */
function MemberDialog({
  mode = 'edit',
  member,
  perms,
  takenEmails,
  onSave,
  onRemove,
  onCancel,
}: {
  mode?: 'edit' | 'invite';
  member: Member;
  perms?: Perms;
  /** Everyone else's email on this home (lowercase), so the same person isn't added twice */
  takenEmails: string[];
  onSave: (m: Member, perms?: Perms) => void;
  onRemove?: () => void;
  onCancel: () => void;
}) {
  const invite = mode === 'invite';
  const [draft, setDraft] = useState<Perms | undefined>(perms);
  const full = `${member.name} ${member.lastName}`;
  return (
    <FormDialog
      width="wide"
      title={invite ? 'Invite someone' : member.owner ? 'Edit your details' : `Edit ${full}`}
      description={
        invite
          ? `They’ll get an email to join ${currentHome.address}. You can change their role and permissions anytime.`
          : member.owner
            ? 'You’re the owner of this home, with full access.'
            : `${member.name}’s details and what they can do at ${currentHome.address}.`
      }
      submitLabel={invite ? 'Send invite' : 'Save'}
      fields={[
        // Review change: one Name field (first and last name); the first word is the first name
        { key: 'fullName', label: 'Full name', field: { kind: 'text', placeholder: 'First and last name' } },
        {
          key: 'email',
          label: 'Email',
          field: { kind: 'email', placeholder: 'name@example.com' },
          validate: (v) =>
            !EMAIL.test(v)
              ? 'Enter an email like name@example.com.'
              : takenEmails.includes(v.toLowerCase())
                ? 'This email is already on this home.'
                : undefined,
        },
        ...(member.owner ? [] : [{ key: 'role', label: 'Role', field: { kind: 'select' as const, options: ROLES } }]),
      ]}
      values={invite ? { fullName: '', email: '', role: '' } : { fullName: full, email: member.email, role: member.role }}
      onSave={(v) => {
        const [first, ...rest] = v.fullName.split(/\s+/);
        onSave(
          { ...member, name: first, lastName: rest.join(' '), email: v.email, role: member.owner ? member.role : (v.role as Role) },
          draft,
        );
      }}
      onCancel={onCancel}
      // Review change: Remove is a red button in the button row (it was a link under the permissions)
      extraAction={invite || member.owner || !onRemove ? undefined : { label: `Remove ${member.name}`, onClick: onRemove }}
      after={
        draft && (
          <div className="hc-c35-dialog-perms">
            <h3 className="hc-large-bold">Permissions</h3>
            <div>
              {PERM_ROWS.map((r) => (
                <SettingRow
                  key={r.key}
                  title={r.title}
                  description={r.description}
                  checked={draft[r.key]}
                  onCheckedChange={(on) => setDraft((d) => (d ? { ...d, [r.key]: on } : d))}
                />
              ))}
            </div>
            <Select
              label="Spend limit"
              helper="Spending above the limit always needs your OK."
              placeholder=""
              options={SPEND_LIMITS.map((o) => ({ value: o, label: o }))}
              value={draft.spend}
              onValueChange={(v) => setDraft((d) => (d ? { ...d, spend: v } : d))}
            />
          </div>
        )
      }
    />
  );
}

/** C35 Household and caregiver access — Figma mobile 218:18093, web 218:18710 (J1 Household & access step 1) */
export default function HouseholdAndCaregiverAccess(_: ScreenProps) {
  const { device, screenState, setScreenState } = usePrototype();
  const [removed, setRemoved] = useState<string[]>([]);
  const [members, setMembers] = useState(MEMBERS);
  const [perms, setPerms] = useState<Record<string, Perms>>(START_PERMS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const invite = () => setInviting(true);

  const people = members.filter((m) => !removed.includes(m.id));
  const editing = people.find((m) => m.id === editingId);

  const emailsOf = (exceptId?: string) => people.filter((m) => m.id !== exceptId).map((m) => m.email.toLowerCase());

  // Review change: Invite someone opens the invite dialog; the new person joins the list as Invited
  const inviteDialog = inviting && (
    <MemberDialog
      mode="invite"
      member={{ id: 'new', name: '', lastName: '', email: '', role: 'Household member', icon: 'users' }}
      perms={NEW_PERMS}
      takenEmails={emailsOf()}
      onSave={(m, p) => {
        const id = `invite-${members.length + 1}`;
        setMembers((list) => [...list, { ...m, id, invited: true, invitedOn: 'today' }]);
        if (p) setPerms((all) => ({ ...all, [id]: p }));
        setInviting(false);
      }}
      onCancel={() => setInviting(false)}
    />
  );

  const memberDialog = editing && (
    <MemberDialog
      member={editing}
      takenEmails={emailsOf(editing.id)}
      perms={editing.owner ? undefined : perms[editing.id]}
      onSave={(m, p) => {
        setMembers((list) => list.map((x) => (x.id === m.id ? m : x)));
        if (p) setPerms((all) => ({ ...all, [m.id]: p }));
        setEditingId(null);
      }}
      onRemove={() => {
        setRemoved((r) => [...r, editing.id]);
        setEditingId(null);
      }}
      onCancel={() => setEditingId(null)}
    />
  );

  const rows = (
    <div className="hc-c35-members">
      {people.map((m) => {
        const { meta, pill } = describe(m, device === 'web');
        const full = `${m.name} ${m.lastName}`;
        return (
          <div key={m.id} className="hc-c35-member-row">
            <div className="hc-c35-member">
              <span className="hc-c35-member__icon">
                <Icon name={m.icon} size={24} />
              </span>
              <span className="hc-c35-member__text">
                {/* Review change: the tag sits next to the name (Edit takes the right) */}
                <span className="hc-c35-member__name">
                  <span className="hc-medium-semibold">{m.owner ? `${full} (you)` : full}</span>
                  <StatusPill label={pill} />
                </span>
                <span className="hc-small hc-muted">{meta}</span>
              </span>
            </div>
            <Button
              variant="secondary"
              size="tiny"
              className="hc-c35-member__edit"
              onClick={() => setEditingId(m.id)}
              aria-label={m.owner ? 'Edit your details' : `Edit ${full} and their permissions`}
            >
              Edit
            </Button>
          </div>
        );
      })}
    </div>
  );

  const loading = (
    <div className="hc-c35-stack" aria-busy>
      <SkeletonCard label="Loading household members" />
      <SkeletonCard label="Loading household members" />
      <SkeletonCard label="Loading household members" />
    </div>
  );

  const stateBlock =
    screenState === 'empty' ? (
      <StateBlock title="Only you so far" body="Invite household members or a caregiver to help." actionLabel="Invite someone" onAction={invite} />
    ) : screenState === 'error' ? (
      <StateBlock
        kind="error"
        title="Couldn’t load household members"
        body="Check your connection and try again. Nothing was lost."
        onAction={() => setScreenState('default')}
      />
    ) : screenState === 'loading' ? (
      loading
    ) : null;

  const hint = <p className="hc-small hc-muted">Use Edit to change someone’s details or what they can do.</p>;

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Household' }} tab="account">
        {stateBlock ?? rows}
        {!stateBlock && hint}
        <Button fullWidth onClick={invite}>
          Invite someone
        </Button>
        {memberDialog}
        {inviteDialog}
      </MobileShell>
    );
  }

  return (
    <WebShell nav="account">
      <div className="hc-c35-web">
        <header className="hc-c35-web__head">
          <h1 className="hc-h2">Household and caregivers</h1>
          <Button onClick={invite}>Invite someone</Button>
        </header>
        <section className="hc-c35-card hc-c35-web__main">
          <h2 className="hc-large-bold">People at {currentHome.address}</h2>
          {stateBlock ?? rows}
          {!stateBlock && hint}
        </section>
      </div>
      {memberDialog}
      {inviteDialog}
    </WebShell>
  );
}
