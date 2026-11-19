import { useState } from 'react';
import { Checkbox } from '../../../components/Checkbox/Checkbox';
import { OptionCard } from '../../../components/OptionCard/OptionCard';
import { FormDialog } from '../../shells/EditDialog';
import './_known-vendor-dialog.css';

export type KnownVendorTrade = 'Plumbing' | 'Electrical' | 'Appliances';

/** A pro the landlord has hired before (invented names, never real companies) */
type KnownVendor = {
  id: string;
  name: string;
  rating: number;
  /** Jobs they've done for this portfolio */
  jobs: number;
  /** What they usually charge for this kind of job */
  usual: string;
  /** Earliest visit they offer */
  next: string;
  /** Short label of the visit for the confirmation, e.g. "tomorrow 10 AM–noon" */
  nextShort: string;
};

const KNOWN_VENDORS: Record<KnownVendorTrade, KnownVendor[]> = {
  Plumbing: [
    { id: 'sonoran', name: 'Sonoran Plumbing Co.', rating: 4.8, jobs: 3, usual: '$160–$240', next: 'Tomorrow · 10 AM–noon', nextShort: 'tomorrow 10 AM–noon' },
    { id: 'roadrunner', name: 'Roadrunner Rooter', rating: 4.6, jobs: 1, usual: '$190–$280', next: 'Thu · 1–3 PM', nextShort: 'Thursday 1–3 PM' },
  ],
  Electrical: [
    { id: 'camelback', name: 'Camelback Electric', rating: 4.9, jobs: 2, usual: '$130–$210', next: 'Today · 4–6 PM', nextShort: 'today 4–6 PM' },
    { id: 'mesa-spark', name: 'Mesa Spark Electrical', rating: 4.5, jobs: 1, usual: '$150–$230', next: 'Tomorrow · 8–10 AM', nextShort: 'tomorrow 8–10 AM' },
  ],
  Appliances: [
    { id: 'saguaro-appliance', name: 'Saguaro Appliance Repair', rating: 4.7, jobs: 4, usual: '$120–$200', next: 'Tomorrow · 2–4 PM', nextShort: 'tomorrow 2–4 PM' },
    { id: 'valley-fix', name: 'Valley Fix-It', rating: 4.4, jobs: 1, usual: '$140–$220', next: 'Fri · 9–11 AM', nextShort: 'Friday 9–11 AM' },
  ],
};

/** "$180–$260" → 260 */
const topOf = (estimate: string) => Number(estimate.split('–').pop()?.replace(/[^0-9]/g, '')) || 0;

/**
 * Review change: the "Approve up to" choices for a job: the top of its estimate, or the next two $50 steps above it.
 * Shared by Approve a known vendor and Approve & get quotes. Each choice's amount is its first word ("$260").
 */
export function approvalLimits(estimate: string) {
  const top = topOf(estimate);
  const step = Math.ceil((top + 1) / 50) * 50;
  return [`$${top} (top of the estimate)`, `$${step}`, `$${step + 50}`];
}

export type KnownVendorApproval = { vendor: string; limit: string; visit: string; tellTenant: boolean };

/**
 * Review change: "Approve a known vendor" on a C86 job opens this dialog. It lists pros you've hired before for that
 * trade (rating, jobs for you, usual price, earliest visit), the most used one picked; how much they may spend without
 * asking again (top of the estimate, or a bit more); and whether the tenant gets a text with the visit time. Approve
 * sends the job to that pro; Cancel, × or Esc close it.
 */
export function KnownVendorDialog({
  job,
  property,
  trade,
  estimate,
  tenant,
  onApprove,
  onCancel,
}: {
  /** e.g. "Kitchen sink leaking" */
  job: string;
  property: string;
  trade: KnownVendorTrade;
  /** e.g. "$180–$260" */
  estimate: string;
  /** First name or "the tenant" */
  tenant: string;
  onApprove: (approval: KnownVendorApproval) => void;
  onCancel: () => void;
}) {
  const list = KNOWN_VENDORS[trade];
  const [vendorId, setVendorId] = useState(list[0].id);
  const [tellTenant, setTellTenant] = useState(true);
  const vendor = list.find((v) => v.id === vendorId) ?? list[0];

  const limits = approvalLimits(estimate);

  return (
    <FormDialog
      title="Approve a known vendor"
      description={`${job} · ${property} · estimate ${estimate}. Pick a ${trade.toLowerCase()} pro you’ve hired before; they get the job without a round of quotes.`}
      width="wide"
      fields={[{ key: 'limit', label: 'Approve up to', field: { kind: 'select', options: limits } }]}
      values={{ limit: limits[0] }}
      submitLabel={`Approve ${vendor.name.split(' ')[0]}`}
      countsAsEdit={false}
      onSave={(v) => onApprove({ vendor: vendor.name, limit: v.limit.split(' ')[0], visit: vendor.nextShort, tellTenant })}
      onCancel={onCancel}
      after={
        <Checkbox
          label={`Text ${tenant} the visit time once ${vendor.name} confirms`}
          checked={tellTenant}
          onChange={(e) => setTellTenant(e.target.checked)}
        />
      }
    >
      <div className="hc-known-vendor" role="radiogroup" aria-label={`${trade} pros you’ve hired`}>
        {list.map((v, i) => (
          <OptionCard
            key={v.id}
            icon="service"
            title={i === 0 ? `${v.name} · most used` : v.name}
            description={`★ ${v.rating} · ${v.jobs} ${v.jobs === 1 ? 'job' : 'jobs'} for you · usually ${v.usual} · next opening ${v.next}`}
            selected={v.id === vendorId}
            onClick={() => setVendorId(v.id)}
          />
        ))}
      </div>
    </FormDialog>
  );
}
