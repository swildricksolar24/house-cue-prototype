import { useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { Icon } from '../../../components/Icon/Icon';
import { SettingRow } from '../../../components/SettingRow/SettingRow';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { FormDialog } from '../../shells/EditDialog';
import './_sign-in-dialog.css';

/** A device signed in to the account (invented sample data) */
export type SignInSession = { id: string; device: string; place: string; when: string; current?: boolean };

/** What the Sign-in & security dialog manages; kept by C34 Settings so its Sign-in card stays in step */
export type SignInState = {
  apple: boolean;
  google: boolean;
  /** Text code to the account's phone */
  text: boolean;
  sessions: SignInSession[];
  /** Landlord only: ask for a code before big approvals and payment changes */
  bigCheck: boolean;
};

const LANDLORD_SESSIONS: SignInSession[] = [
  { id: 'this', device: 'Chrome on Windows', place: 'Phoenix, AZ', when: 'Active now', current: true },
  { id: 'iphone', device: 'iPhone app', place: 'Phoenix, AZ', when: '2 hours ago' },
  { id: 'mac', device: 'Safari on Mac', place: 'Tucson, AZ', when: 'Nov 12' },
];
const HOMEOWNER_SESSIONS: SignInSession[] = [
  { id: 'this', device: 'Chrome on Windows', place: 'Phoenix, AZ', when: 'Active now', current: true },
  { id: 'iphone', device: 'iPhone app', place: 'Phoenix, AZ', when: 'Yesterday' },
  { id: 'ipad', device: 'iPad app', place: 'Scottsdale, AZ', when: 'Nov 10' },
];

export const defaultSignIn = (landlord: boolean): SignInState => ({
  apple: true,
  google: false,
  text: false,
  sessions: landlord ? LANDLORD_SESSIONS : HOMEOWNER_SESSIONS,
  bigCheck: true,
});

/** The Sign-in card's line, e.g. "Email code · Apple · signed in on 3 devices" */
export function signInSummary(s: SignInState) {
  const methods = ['Email code', s.apple && 'Apple', s.google && 'Google', s.text && 'Text code'].filter(Boolean).join(' · ');
  return `${methods} · signed in on ${s.sessions.length} ${s.sessions.length === 1 ? 'device' : 'devices'}`;
}

const RECENT = {
  landlord: [
    ['Email code', 'iPhone app', 'Phoenix, AZ', 'Today 7:40 AM'],
    ['Apple', 'Chrome on Windows', 'Phoenix, AZ', 'Yesterday 5:12 PM'],
    ['Email code', 'Safari on Mac', 'Tucson, AZ', 'Nov 12, 9:03 AM'],
  ],
  homeowner: [
    ['Email code', 'Chrome on Windows', 'Phoenix, AZ', 'Today 8:15 AM'],
    ['Apple', 'iPhone app', 'Phoenix, AZ', 'Yesterday 6:48 PM'],
    ['Email code', 'iPad app', 'Scottsdale, AZ', 'Nov 10, 7:30 PM'],
  ],
} satisfies Record<string, [string, string, string, string][]>;

/**
 * Review change: Manage on the Settings Sign-in card (C34) opens this dialog (was a jump to C52 Account recovery).
 * How you sign in (email code, Apple, Google, text code), where you're signed in (this device and the others, each with
 * Sign out, plus Sign out of all other devices with a confirm), the landlord's extra check for big decisions, and recent
 * sign-ins (a table; review change: no "Don't recognize one?" link). Review change: changes are a draft until
 * Save (they last for the visit); Cancel, × or Esc close without keeping them.
 */
export function SignInDialog({
  landlord,
  email,
  phone,
  state,
  onSave,
  onCancel,
}: {
  landlord: boolean;
  email: string;
  /** Masked phone, e.g. "(602) •••-0187" */
  phone: string;
  /** The saved settings the dialog starts from */
  state: SignInState;
  onSave: (next: SignInState) => void;
  onCancel: () => void;
}) {
  // Review change: edits go to a draft; Save keeps them, Cancel drops them
  const [draft, setDraft] = useState(state);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);
  const update = (patch: Partial<SignInState>, message: string) => {
    setDraft((d) => ({ ...d, ...patch }));
    setNotice(message);
  };
  const others = draft.sessions.filter((s) => !s.current);

  return (
    <FormDialog
      title="Sign-in & security"
      description="How you sign in, where you’re signed in, and recent activity."
      width="wide"
      fields={[]}
      values={{}}
      submitLabel="Save"
      countsAsEdit={false}
      onSave={() => onSave(draft)}
      onCancel={onCancel}
    >
      <div className="hc-sign-in">
        {notice && (
          <Banner tone="success" className="hc-sign-in__notice">
            {notice}
          </Banner>
        )}

        <section className="hc-sign-in__section" aria-labelledby="hc-sign-in-methods">
          <h3 id="hc-sign-in-methods" className="hc-medium-semibold">
            How you sign in
          </h3>
          <DetailRow
            label={
              <>
                Email code <StatusPill label="Main" tone="neutral" />
              </>
            }
            value={`A code sent to ${email}`}
            actionLabel="Can’t remove"
            actionDisabled
          />
          <DetailRow
            label="Apple"
            value={draft.apple ? 'Connected' : 'Not connected'}
            actionLabel={draft.apple ? 'Remove' : 'Connect'}
            onAction={() => update({ apple: !draft.apple }, draft.apple ? 'Apple sign-in removed.' : 'Apple connected.')}
          />
          <DetailRow
            label="Google"
            value={draft.google ? 'Connected' : 'Not connected'}
            actionLabel={draft.google ? 'Remove' : 'Connect'}
            onAction={() => update({ google: !draft.google }, draft.google ? 'Google sign-in removed.' : 'Google connected.')}
          />
          <SettingRow
            title="Text code"
            description={`A code by text to ${phone}`}
            checked={draft.text}
            onCheckedChange={(on) => update({ text: on }, on ? 'Text codes turned on.' : 'Text codes turned off.')}
          />
          <p className="hc-small hc-muted">HouseCue doesn’t use passwords. Your email code always works, so it can’t be removed.</p>
        </section>

        <section className="hc-sign-in__section" aria-labelledby="hc-sign-in-where">
          <h3 id="hc-sign-in-where" className="hc-medium-semibold">
            Where you’re signed in
          </h3>
          <ul className="hc-sign-in__sessions">
            {draft.sessions.map((s) => (
              <li key={s.id} className="hc-sign-in__session">
                {/* Review change: a device icon on the left of each signed-in device (a phone for the iPhone app) */}
                <span className="hc-sign-in__device-icon" aria-hidden>
                  <Icon name={/iPhone|Android|phone/i.test(s.device) ? 'phone' : 'devices'} size={20} />
                </span>
                <div className="hc-sign-in__session-text">
                  <span className="hc-medium-semibold">{s.device}</span>
                  <span className="hc-small hc-muted">
                    {s.place} · {s.when}
                  </span>
                </div>
                {/* Review change: "This device" sits on the right, in line with the other devices' Sign out buttons */}
                {s.current ? (
                  <StatusPill label="This device" tone="info" />
                ) : (
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => update({ sessions: draft.sessions.filter((x) => x.id !== s.id) }, `Signed out of ${s.device}.`)}
                  >
                    Sign out
                  </Button>
                )}
              </li>
            ))}
          </ul>
          {others.length > 0 &&
            (confirmAll ? (
              <div className="hc-sign-in__confirm" role="group" aria-label="Sign out of all other devices">
                <span className="hc-medium">
                  Sign out of {others.length} other {others.length === 1 ? 'device' : 'devices'}? You stay signed in here.
                </span>
                <div className="hc-sign-in__confirm-actions">
                  <Button size="small" variant="secondary" onClick={() => setConfirmAll(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    variant="destructive"
                    onClick={() => {
                      update({ sessions: draft.sessions.filter((x) => x.current) }, 'Signed out of all other devices.');
                      setConfirmAll(false);
                    }}
                  >
                    Sign out
                  </Button>
                </div>
              </div>
            ) : (
              <Button size="small" variant="secondary" className="hc-sign-in__all" onClick={() => setConfirmAll(true)}>
                Sign out of all other devices
              </Button>
            ))}
        </section>

        {landlord && (
          // Review change: no "Extra check for big decisions" heading; the switch's own title says it
          <section className="hc-sign-in__section hc-sign-in__section--check" aria-label="Extra check for big decisions">
            <SettingRow
              title="Ask for a code before big decisions"
              description="Approving jobs over $500 or changing payment methods needs a code, even when you’re signed in"
              checked={draft.bigCheck}
              onCheckedChange={(on) => update({ bigCheck: on }, on ? 'Extra check turned on.' : 'Extra check turned off.')}
            />
          </section>
        )}

        <section className="hc-sign-in__section" aria-labelledby="hc-sign-in-recent">
          <h3 id="hc-sign-in-recent" className="hc-medium-semibold">
            Recent sign-ins
          </h3>
          {/* Review change: a table (method, device, location, when) instead of one line each */}
          <div className="hc-sign-in__table" role="table" aria-labelledby="hc-sign-in-recent">
            <div className="hc-sign-in__tr hc-sign-in__tr--head" role="row">
              <span role="columnheader">Method</span>
              <span role="columnheader">Device</span>
              <span role="columnheader">Location</span>
              <span role="columnheader">When</span>
            </div>
            {RECENT[landlord ? 'landlord' : 'homeowner'].map((r) => (
              <div key={r.join('|')} className="hc-sign-in__tr" role="row">
                {r.map((cell, i) => (
                  <span key={i} role="cell">
                    {cell}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>
    </FormDialog>
  );
}
