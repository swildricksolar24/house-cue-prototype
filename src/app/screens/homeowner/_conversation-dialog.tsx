import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../../components/Icon/Icon';
import { Input } from '../../../components/Input/Input';
import { FormDialog } from '../../shells/EditDialog';
import './_conversation-dialog.css';

/** One message between the landlord ("you") and a tenant about a job */
export type JobMessage = { from: 'you' | 'tenant'; text: string; time: string; attachment?: string };

/** "Clara Clayton · Unit A" → "Clara Clayton"; "Units 1–4 tenants" stays as it is */
export const tenantName = (tenant: string) => tenant.split(' · ')[0];

/**
 * Review change: the messages with a tenant about a job, oldest first. Your messages on the right (filled), the tenant's
 * on the left (white card) with any photo they sent, each with who and when above it. `typing` adds a "… is typing"
 * line at the end. Used in a job's details on C86 Jobs and in the Conversation dialog.
 */
export function MessageThread({ messages, tenant, typing = false }: { messages: JobMessage[]; tenant: string; typing?: boolean }) {
  const name = tenantName(tenant);
  return (
    <ol className="hc-thread">
      {messages.map((m, i) => (
        <li key={i} className={`hc-thread__msg hc-thread__msg--${m.from}`}>
          <span className="hc-small hc-muted">
            {m.from === 'you' ? 'You' : name} · {m.time}
          </span>
          <p className="hc-thread__bubble hc-medium">
            {m.text}
            {m.attachment && (
              <span className="hc-thread__file hc-small">
                <Icon name="document" size={16} />
                {m.attachment}
              </span>
            )}
          </p>
        </li>
      ))}
      {typing && (
        <li className="hc-thread__msg hc-thread__msg--tenant hc-thread__typing" aria-live="polite">
          <span className="hc-small hc-muted">{name} is typing</span>
          <span className="hc-thread__bubble hc-thread__dots" aria-hidden>
            <i />
            <i />
            <i />
          </span>
        </li>
      )}
    </ol>
  );
}

/**
 * Review change: the message icon on a C86 job row (and View conversation in its details) opens this conversation with the tenant
 * over the queue. The whole thread scrolls above a message box; Send adds your message and keeps the dialog open (the
 * tenant's reply arrives a few seconds later in the prototype, with a typing line meanwhile). Close, × or Esc close it.
 */
export function ConversationDialog({
  tenant,
  job,
  messages,
  typing,
  onSend,
  onClose,
}: {
  /** e.g. "Clara Clayton · Unit A" */
  tenant: string;
  /** The job's title, e.g. "Kitchen sink leaking" */
  job: string;
  messages: JobMessage[];
  /** The tenant is "writing" a reply */
  typing: boolean;
  onSend: (message: string) => void;
  onClose: () => void;
}) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | undefined>();
  const list = useRef<HTMLDivElement>(null);

  // Keep the newest message in view
  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight });
  }, [messages.length, typing]);

  return (
    <FormDialog
      title="Conversation"
      description={`With ${tenant} about “${job}”. Sent by text and in their HouseCue app.`}
      width="wide"
      fields={[]}
      values={{}}
      submitLabel="Send"
      cancelLabel="Close"
      countsAsEdit={false}
      beforeSave={() => {
        if (message.trim()) return true;
        setError('Write a message.');
        return false;
      }}
      onSave={() => {
        onSend(message.trim());
        setMessage('');
      }}
      onCancel={onClose}
    >
      <div ref={list} className="hc-conversation__list" tabIndex={0} aria-label={`Messages with ${tenant}`}>
        {messages.length ? (
          <MessageThread messages={messages} tenant={tenant} typing={typing} />
        ) : (
          <p className="hc-medium hc-muted">No messages yet. Write the first one below.</p>
        )}
      </div>
      <Input
        type="multiline"
        label="Message"
        rows={3}
        value={message}
        onValueChange={(v) => {
          setMessage(v);
          if (error) setError(undefined);
        }}
        error={error}
      />
    </FormDialog>
  );
}
