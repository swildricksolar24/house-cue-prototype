import { useState } from 'react';
import { Checkbox } from '../../../components/Checkbox/Checkbox';
import { FormDialog } from '../../shells/EditDialog';

const REASONS = ['Tenant can fix it', 'Not my responsibility under the lease', 'Already being handled', 'Other'];

export type DeclineChoice = { reason: string; tellTenant: boolean };

/**
 * Review change: Decline on a C86 job asks first (was immediate). The dialog names the job and what declining does,
 * asks for a reason (optional), and whether the tenant is told; the red Decline report confirms, Cancel, × or Esc keep
 * the report in the queue.
 */
export function DeclineDialog({
  job,
  property,
  tenant,
  onDecline,
  onCancel,
}: {
  /** e.g. "Kitchen sink leaking" */
  job: string;
  property: string;
  /** First name or "the tenant" */
  tenant: string;
  onDecline: (choice: DeclineChoice) => void;
  onCancel: () => void;
}) {
  const [tellTenant, setTellTenant] = useState(true);
  return (
    <FormDialog
      title="Decline this report?"
      description={`${job} · ${property}. It leaves the queue and nothing is booked or paid. ${tenant === 'the tenant' ? 'The tenant' : tenant} can report it again if it gets worse.`}
      fields={[{ key: 'reason', label: 'Reason', optional: true, field: { kind: 'select', options: REASONS } }]}
      values={{ reason: '' }}
      submitLabel="Decline report"
      submitVariant="destructive"
      countsAsEdit={false}
      onSave={(v) => onDecline({ reason: v.reason, tellTenant })}
      onCancel={onCancel}
      after={<Checkbox label={`Let ${tenant} know it was declined`} checked={tellTenant} onChange={(e) => setTellTenant(e.target.checked)} />}
    />
  );
}
