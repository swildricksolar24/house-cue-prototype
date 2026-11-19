import { useState } from 'react';
import { Checkbox } from '../../../components/Checkbox/Checkbox';
import { FormDialog } from '../../shells/EditDialog';
import { approvalLimits, type KnownVendorTrade } from './_known-vendor-dialog';
import './_get-quotes-dialog.css';

const PRO_COUNTS = ['3 pros (recommended)', '2 pros', '4 pros'];
const DEADLINES = ['Within 48 hours', 'Within 24 hours', 'Within 3 days'];

export type QuoteRequest = { pros: number; deadline: string; limit: string; sharePhotos: boolean; tellTenant: boolean };

/**
 * Review change: "Approve & get quotes" on a C86 job opens this dialog (was a jump to the next journey step). It names
 * the job and estimate, then asks how many pros to ask, how soon quotes are due, how much you approve without asking
 * again (shared with Approve a known vendor), and two checkboxes: share the tenant's photos with the pros, and text the
 * tenant when a visit is booked. Approve & get quotes sends the request; Cancel, × or Esc close it.
 */
export function GetQuotesDialog({
  job,
  property,
  trade,
  estimate,
  photos,
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
  /** e.g. "3 · video 1" */
  photos: string;
  /** First name or "the tenant" */
  tenant: string;
  onApprove: (request: QuoteRequest) => void;
  onCancel: () => void;
}) {
  const [sharePhotos, setSharePhotos] = useState(true);
  const [tellTenant, setTellTenant] = useState(true);
  const limits = approvalLimits(estimate);

  return (
    <FormDialog
      title="Approve & get quotes"
      description={`${job} · ${property} · estimate ${estimate}. Your agent asks ${trade.toLowerCase()} pros nearby for quotes; you pick one before any work starts.`}
      width="wide"
      fields={[
        { key: 'pros', label: 'Ask for quotes from', field: { kind: 'select', options: PRO_COUNTS } },
        { key: 'deadline', label: 'Quotes due', field: { kind: 'select', options: DEADLINES } },
        { key: 'limit', label: 'Approve up to', field: { kind: 'select', options: limits } },
      ]}
      values={{ pros: PRO_COUNTS[0], deadline: DEADLINES[0], limit: limits[0] }}
      submitLabel="Approve & get quotes"
      countsAsEdit={false}
      onSave={(v) =>
        onApprove({
          pros: parseInt(v.pros, 10),
          deadline: v.deadline.replace(/^Within /, ''),
          limit: v.limit.split(' ')[0],
          sharePhotos,
          tellTenant,
        })
      }
      onCancel={onCancel}
      after={
        <div className="hc-get-quotes__options">
          <Checkbox
            label={`Share ${tenant === 'the tenant' ? 'the tenant’s' : `${tenant}’s`} photos with the pros (${photos})`}
            checked={sharePhotos}
            onChange={(e) => setSharePhotos(e.target.checked)}
          />
          <Checkbox label={`Text ${tenant} when a visit is booked`} checked={tellTenant} onChange={(e) => setTellTenant(e.target.checked)} />
        </div>
      }
    />
  );
}
