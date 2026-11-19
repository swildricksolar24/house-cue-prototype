import { useState } from 'react';
import { Button } from '../../../components/Button/Button';
import { Input } from '../../../components/Input/Input';
import { FormDialog } from '../../shells/EditDialog';
import './_ask-tenant-dialog.css';

/** Quick questions: each fills the message (after "Hi <name>,") */
const QUICK: { label: string; text: string }[] = [
  { label: 'Closer photo', text: 'could you send a closer photo of the problem? It helps me get the right pro.' },
  { label: 'Access times', text: 'when are good times this week for a pro to come in?' },
  { label: 'Getting worse?', text: 'is it getting worse, or about the same as when you reported it?' },
];

/**
 * Review change: "Ask the tenant" on C86 Approval queue opens this dialog over the queue (was a jump to the agent chat,
 * C09). It shows who gets the message and about which report, a message already drafted for that report, and quick
 * questions that replace the draft. Send closes it and the queue confirms; Cancel, × or Esc close without sending.
 * The message can't be empty.
 */
export function AskTenantDialog({
  tenant,
  report,
  draft,
  onSend,
  onCancel,
}: {
  /** e.g. "Clara Clayton · Unit A" */
  tenant: string;
  /** Report title, e.g. "Kitchen sink leaking" */
  report: string;
  /** Message the agent drafted for this report */
  draft: string;
  onSend: (message: string) => void;
  onCancel: () => void;
}) {
  const name = tenant.split(' · ')[0];
  // "Unit 3 tenant" / "Units 1–4 tenants" have no first name to greet
  const first = /^Units?\b/.test(name) ? '' : name.split(' ')[0];
  const greeting = first ? `Hi ${first}, ` : 'Hi, ';
  const [message, setMessage] = useState(draft);
  const [error, setError] = useState<string | undefined>();

  return (
    <FormDialog
      title="Ask the tenant"
      description={`To ${tenant} about “${report}”. Sent by text and in their HouseCue app; their reply shows on this job.`}
      width="wide"
      fields={[]}
      values={{}}
      submitLabel={first ? `Send to ${first}` : 'Send'}
      countsAsEdit={false}
      beforeSave={() => {
        if (message.trim()) return true;
        setError('Write a message.');
        return false;
      }}
      onSave={() => onSend(message.trim())}
      onCancel={onCancel}
    >
      <div className="hc-ask-tenant">
        <div className="hc-ask-tenant__quick" role="group" aria-label="Quick questions">
          {QUICK.map((q) => (
            <Button
              key={q.label}
              size="tiny"
              variant="secondary"
              onClick={() => {
                setMessage(greeting + q.text);
                setError(undefined);
              }}
            >
              {q.label}
            </Button>
          ))}
        </div>
        <Input
          type="multiline"
          label="Message"
          rows={4}
          value={message}
          onValueChange={(v) => {
            setMessage(v);
            if (error) setError(undefined);
          }}
          error={error}
        />
      </div>
    </FormDialog>
  );
}
