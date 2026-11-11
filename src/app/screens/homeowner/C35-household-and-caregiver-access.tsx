import { useState } from 'react';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { Icon, type IconName } from '../../../components/Icon/Icon';
import { SettingRow } from '../../../components/SettingRow/SettingRow';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';
import { StateBlock } from '../../../components/StateBlock/StateBlock';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { currentHome } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C35-household-and-caregiver-access.css';

type Member = {
  id: string;
  name: string;
  /** Row meta; web copy differs for Sam */
  meta: string;
  metaWeb?: string;
  pill: string;
  icon: IconName;
  owner?: boolean;
};

/** People on the home (Figma 34:1659 … 34:1693) */
const members: Member[] = [
  { id: 'jordan', name: 'Jordan (you)', meta: 'Owner · full access', pill: 'Owner', icon: 'account', owner: true },
  {
    id: 'sam',
    name: 'Sam',
    meta: 'Co-owner · full access',
    metaWeb: 'Co-owner · full access, including payment',
    pill: 'Co-owner',
    icon: 'users',
  },
  { id: 'riley', name: 'Riley', meta: 'Household member · can request, can’t pay', pill: 'Member', icon: 'users' },
  { id: 'pat', name: 'Pat', meta: 'Caregiver · invite sent Nov 4 · valid until accepted or revoked', pill: 'Invited', icon: 'users' },
];

/** C35 Household and caregiver access — Figma mobile 218:18093, web 218:18710 (J1 Household & access step 1) */
export default function HouseholdAndCaregiverAccess(_: ScreenProps) {
  const { device, screenState, setScreenState } = usePrototype();
  const flow = useFlow();
  const [removed, setRemoved] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState('riley');
  const [perms, setPerms] = useState({ book: false, pay: false, approve: false, documents: false, contact: true });
  const setPerm = (key: keyof typeof perms) => (on: boolean) => setPerms((p) => ({ ...p, [key]: on }));

  const people = members.filter((m) => !removed.includes(m.id));
  const selected = people.find((m) => m.id === selectedId && !m.owner) ?? people.find((m) => !m.owner);
  const firstName = selected?.name;

  const remove = () => {
    if (!selected) return;
    setRemoved((r) => [...r, selected.id]);
    const next = people.find((m) => !m.owner && m.id !== selected.id);
    if (next) setSelectedId(next.id);
  };

  const rows = (
    <div className="hc-c35-members">
      {people.map((m) => {
        const content = (
          <>
            <span className="hc-c35-member__icon">
              <Icon name={m.icon} size={24} />
            </span>
            <span className="hc-c35-member__text">
              <span className="hc-medium-semibold">{m.name}</span>
              <span className="hc-small hc-muted">{device === 'web' && m.metaWeb ? m.metaWeb : m.meta}</span>
            </span>
            <StatusPill label={m.pill} />
          </>
        );
        return m.owner ? (
          <div key={m.id} className="hc-c35-member">
            {content}
          </div>
        ) : (
          <button
            key={m.id}
            type="button"
            className="hc-c35-member hc-c35-member--button"
            aria-pressed={selected?.id === m.id}
            onClick={() => setSelectedId(m.id)}
          >
            {content}
          </button>
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
      <StateBlock title="Only you so far" body="Invite household members or a caregiver to help." actionLabel="Invite someone" onAction={flow.goNext} />
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

  const bookRow = <SettingRow title="Book pros" description="Bookings need your OK when off" checked={perms.book} onCheckedChange={setPerm('book')} />;
  const documentsRow = (
    <SettingRow
      title="See documents and valuables"
      description="Receipts, warranties, contents"
      checked={perms.documents}
      onCheckedChange={setPerm('documents')}
    />
  );

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Household' }} tab="account">
        {stateBlock ?? rows}
        <Button fullWidth onClick={flow.goNext}>
          Invite someone
        </Button>
        {!stateBlock && firstName && <h2 className="hc-large-bold">{firstName}’s permissions</h2>}
        {(stateBlock || firstName) && (
          <div>
            {bookRow}
            {documentsRow}
          </div>
        )}
      </MobileShell>
    );
  }

  const spendRow = <DetailRow label="Spend limit" value="$0 · everything needs your OK" actionLabel="Edit" actionDisabled />;

  return (
    <WebShell nav="account">
      <div className="hc-c35-web">
        <header className="hc-c35-web__head">
          <h1 className="hc-h2">Household and caregivers</h1>
          <Button onClick={flow.goNext}>Invite someone</Button>
        </header>
        <div className="hc-c35-web__cols">
          <section className="hc-c35-card hc-c35-web__main">
            <h2 className="hc-large-bold">People at {currentHome.address}</h2>
            {rows}
          </section>
          {(stateBlock || firstName) && (
            <section className="hc-c35-card hc-c35-web__side">
              <h2 className="hc-large-bold">{firstName ?? 'Riley'}’s permissions</h2>
              {stateBlock ? (
                <>
                  {stateBlock}
                  {spendRow}
                </>
              ) : (
                <>
                  <div>
                    {bookRow}
                    <SettingRow title="Pay" description="Use this home’s payment methods" checked={perms.pay} onCheckedChange={setPerm('pay')} />
                    <SettingRow
                      title="Approve agent actions"
                      description="Approve what the agent proposes"
                      checked={perms.approve}
                      onCheckedChange={setPerm('approve')}
                    />
                    {documentsRow}
                    <SettingRow
                      title="Be the contact for visits"
                      description="Pros see first name and phone during the job"
                      checked={perms.contact}
                      onCheckedChange={setPerm('contact')}
                    />
                    {spendRow}
                  </div>
                  <button type="button" className="hc-c35-remove" onClick={remove}>
                    Remove {firstName}
                  </button>
                </>
              )}
            </section>
          )}
        </div>
      </div>
    </WebShell>
  );
}
