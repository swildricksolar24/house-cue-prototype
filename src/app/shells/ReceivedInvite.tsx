import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, type IconName } from '../../components/Icon/Icon';
import { sampleInvites, type InviteRole } from '../data/sample';
import { setPendingInvite } from '../prototype/accounts';
import { screenPath } from '../prototype/journeys';
import { closeReceivedInvite, useReceivedInvite } from '../prototype/receivedInvite';
import { FormDialog } from './EditDialog';
import './ReceivedInvite.css';

/**
 * Review change: what someone sees when they're invited to HouseCue, opened from the prototype shortcuts panel
 * (Homeowner / Landlord / Tenant invite, Expired invite). Rendered by WebShell and MobileShell.
 * - You're invited: who invited you, the home / portfolio / rental, your role, what you can do and what someone else
 *   decides; Decline / Accept invite (Esc, × or a click outside just closes it)
 * - Accept → Sign in (C02, "Welcome back") with a note about the invite → Choose an account (/accounts), where the new
 *   account is tagged New (prototype/accounts.ts)
 * - Decline → "Invite declined" (the sender is told you declined, nothing else)
 * - Expired: "This invite has expired" (invites last 14 days; ask for a new one)
 * Sample people and places are fictional (data/sample.ts sampleInvites).
 */
const ROLE_ICON: Record<InviteRole, IconName> = { homeowner: 'home', landlord: 'dashboard', tenant: 'home' };

export function ReceivedInvite() {
  const demo = useReceivedInvite();
  if (demo.kind === 'none') return null;
  if (demo.kind === 'expired') return <ExpiredInvite />;
  return <InviteDialogs key={demo.role} role={demo.role} />;
}

function ExpiredInvite() {
  const invite = sampleInvites.homeowner;
  return (
    <FormDialog
      title="This invite has expired"
      description={`${invite.from}’s invite to ${invite.place} was valid for 14 days. Ask ${invite.from.split(' ')[0]} to send a new one.`}
      fields={[]}
      values={{}}
      submitLabel="OK"
      cancelLabel={null}
      countsAsEdit={false}
      onSave={closeReceivedInvite}
      onCancel={closeReceivedInvite}
    />
  );
}

function InviteDialogs({ role }: { role: InviteRole }) {
  const navigate = useNavigate();
  const [declined, setDeclined] = useState(false);
  const invite = sampleInvites[role];

  if (declined) {
    return (
      <FormDialog
        title="Invite declined"
        description={`We’ll let ${invite.from} know you declined. Nothing else is shared.`}
        fields={[]}
        values={{}}
        submitLabel="Done"
        cancelLabel={null}
        countsAsEdit={false}
        onSave={closeReceivedInvite}
        onCancel={closeReceivedInvite}
      />
    );
  }

  return (
    <FormDialog
      title="You’re invited"
      description={invite.description}
      fields={[]}
      values={{}}
      submitLabel="Accept invite"
      cancelLabel={null}
      countsAsEdit={false}
      extraAction={{ label: 'Decline', variant: 'secondary', onClick: () => setDeclined(true) }}
      onSave={() => {
        // Accepting needs a sign-in first (you came from the invite email); the account is added after it
        setPendingInvite(role);
        closeReceivedInvite();
        navigate(`${screenPath('C02', 'homeowner')}?state=signin`);
      }}
      onCancel={closeReceivedInvite}
    >
      <div className="hc-received-invite__home">
        <span className="hc-received-invite__icon" aria-hidden>
          <Icon name={ROLE_ICON[role]} size={24} />
        </span>
        <span className="hc-received-invite__text">
          <span className="hc-medium-semibold">{invite.place}</span>
          <span className="hc-small hc-muted">{invite.placeMeta}</span>
        </span>
      </div>
      <dl className="hc-received-invite__perms">
        <div>
          <dt className="hc-small hc-muted">You can</dt>
          <dd className="hc-medium">{invite.can.join(' · ')}</dd>
        </div>
        <div>
          <dt className="hc-small hc-muted">{invite.needsLabel}</dt>
          <dd className="hc-medium">{invite.needsOk.join(' · ')}</dd>
        </div>
        <div>
          <dt className="hc-small hc-muted">Spend limit</dt>
          <dd className="hc-medium">{invite.spend}</dd>
        </div>
      </dl>
    </FormDialog>
  );
}
