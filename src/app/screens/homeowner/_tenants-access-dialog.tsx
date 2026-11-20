import { useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { DatePicker, formatIsoDate, parseDisplayDate } from '../../../components/DatePicker/DatePicker';
import { Input } from '../../../components/Input/Input';
import { Select } from '../../../components/Select/Select';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import type { PortfolioProperty, PropertyTenant } from '../../data/sample';
import { isEmail } from './_editable-row';
import './_tenants-access-dialog.css';

/** What tenants can see (same copy as C82 Tenants & access) */
export const TENANTS_SEE = 'Report categories you allow, status only (costs hidden), and prior maintenance jobs. Never earlier tenants’ requests (#189).';

/** The Access windows drop-down (the windows tenants use in the sample data) */
export const ACCESS_WINDOWS = ['Not set yet', 'Any weekday', 'Weekdays 7–9 AM', 'Weekdays 9 AM–noon', 'Weekdays after 5 PM', 'Evenings', 'Weekends'];

/** A 10-digit US phone as (602) 555-0142 */
const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(-10);
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : v.trim();
};

/**
 * Review change: one unit's tenant and access, as a form on the unit's page (was a dialog opened by Edit in the
 * property page's Tenants table). The tenant's name is shown filled in with an Edit pill that turns it into a field;
 * then Email (filled in), Phone (optional), Access windows (a drop-down) and Move-in date (the HC/Date Picker
 * calendar). A pending invite shows "Invite pending · sent …" with Resend / Revoke. An empty unit starts with a Tenant
 * name field; Send invite there invites them (Invite pending). Move out a tenant opens C87 where it's built.
 * Prototype only: nothing is sent.
 */
export function TenantAccessForm({
  unit,
  tenant,
  onSave,
  onRevoke,
  onMoveOut,
}: {
  property: PortfolioProperty;
  /** The unit's name ('A', '1'), or '—' for a one-unit home */
  unit: string;
  /** The unit's tenant, or none for an empty unit */
  tenant?: PropertyTenant;
  /** The tenant as saved (a new one is an Invite pending) */
  onSave: (tenant: PropertyTenant, isNew: boolean) => void;
  onRevoke: (id: string) => void;
  /** Shown as "Move out a tenant" when this unit has a move-out flow */
  onMoveOut?: () => void;
}) {
  const pending = tenant?.status === 'Invite pending';
  const [name, setName] = useState(tenant?.name ?? '');
  const [editingName, setEditingName] = useState(!tenant);
  const [email, setEmail] = useState(tenant?.email ?? '');
  const [phone, setPhone] = useState(tenant?.phone ?? '');
  const [windows, setWindows] = useState(tenant && ACCESS_WINDOWS.includes(tenant.windows) ? tenant.windows : 'Not set yet');
  // Move-in date: the day they became a tenant ("Mar 1, 2026"); a pending invite has none yet
  const [moveIn, setMoveIn] = useState(tenant && !pending ? parseDisplayDate(tenant.since) : '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resent, setResent] = useState(false);
  const clear = (key: string) => setErrors(({ [key]: _, ...rest }) => rest);

  const save = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Enter their name.';
    if (!isEmail(email)) next.email = email.trim() ? 'Enter an email like name@example.com.' : 'Enter their email.';
    if (phone.trim() && phone.replace(/\D/g, '').length < 10) next.phone = 'Enter a 10-digit phone number.';
    setErrors(next);
    if (Object.keys(next).length) return;
    const base: PropertyTenant = tenant ?? {
      id: `invite-${Date.now().toString(36)}`,
      name: '',
      unit,
      status: 'Invite pending',
      tone: 'warning',
      windows: 'Not set yet',
      since: 'Sent today',
      mobileMeta: 'Invite pending · sent today · never expires',
    };
    const active = !!tenant && !pending;
    onSave(
      {
        ...base,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() ? formatPhone(phone) : undefined,
        windows,
        // An active tenant's move-in date is their "since"
        since: active && moveIn ? formatIsoDate(moveIn) : base.since,
      },
      !tenant,
    );
    setEditingName(false);
  };

  return (
    <div className="hc-tenants-access">
      <section className="hc-tenants-access__section" aria-label="Tenant">
        {editingName ? (
          <Input
            label="Tenant name"
            placeholder="e.g. Otis Peabody"
            value={name}
            onValueChange={(v) => {
              setName(v);
              clear('name');
            }}
            error={errors.name}
          />
        ) : (
          <div className="hc-tenants-access__name-row">
            <span className="hc-tenants-access__label">Tenant name</span>
            <span className="hc-tenants-access__name">
              <span className="hc-medium-semibold">{name}</span>
              <StatusPill label={tenant!.status.replace(/^Moving out .*/, 'Moving out')} tone={tenant!.tone} />
              <button type="button" className="hc-tenants-access__edit" onClick={() => setEditingName(true)} aria-label={`Edit ${name}’s name`}>
                <StatusPill label="Edit" tone="neutral" />
              </button>
            </span>
          </div>
        )}
        {pending && (
          <div className="hc-tenants-access__buttons">
            <span className="hc-small hc-muted">Invite pending · {resent ? 'sent again today' : tenant!.since.replace(/^Sent/, 'sent')} · never expires</span>
            <Button size="small" variant="secondary" onClick={() => setResent(true)}>
              {resent ? 'Sent again' : 'Resend invite'}
            </Button>
            <Button size="small" variant="destructive" onClick={() => onRevoke(tenant!.id)}>
              Revoke invite
            </Button>
          </div>
        )}
      </section>
      <div className="hc-tenants-access__grid">
        <Input
          label="Email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onValueChange={(v) => {
            setEmail(v);
            clear('email');
          }}
          error={errors.email}
        />
        <Input
          label="Phone (optional)"
          placeholder="(602) 555-0142"
          value={phone}
          onValueChange={(v) => {
            setPhone(v);
            clear('phone');
          }}
          error={errors.phone}
        />
        <Select label="Access windows" placeholder="" options={ACCESS_WINDOWS.map((w) => ({ value: w, label: w }))} value={windows} onValueChange={setWindows} />
        <DatePicker label="Move-in date (optional)" value={moveIn} onValueChange={setMoveIn} />
      </div>
      <p className="hc-small hc-muted">They will see: Plumbing, HVAC, Electrical, Appliances, Pests, Locks · status only · prior maintenance history.</p>
      <Banner tone="info" title="What tenants see">
        {TENANTS_SEE}
      </Banner>
      <div className="hc-tenants-access__actions">
        {onMoveOut && (
          <Button size="small" variant="secondary" onClick={onMoveOut}>
            Move out a tenant
          </Button>
        )}
        <Button size="small" onClick={save}>
          {tenant ? 'Save' : 'Send invite'}
        </Button>
      </div>
    </div>
  );
}
