import { Button } from '../../components/Button/Button';
import { StatusPill } from '../../components/StatusPill/StatusPill';
import './ConnectFailed.css';

export type ConnectFailedProps = {
  /** Why it failed, in plain words */
  reason: string;
  onRetry: () => void;
  onOtherAccount: () => void;
  /** A way forward without connecting, e.g. "Enter times by hand" */
  fallbackLabel: string;
  onFallback: () => void;
};

/**
 * Review change: shown in place of "Connected" when connecting fails (C43 Calendar, C44 Email, C46 Devices). Shown in the
 * prototype when "Connections fail" is on in the shortcuts panel. A red "Couldn't connect" tag, the reason, Try again
 * (back to Confirm your account), Use another account, and a way forward without connecting so nobody is stuck.
 * Nothing is linked; the setup step's Save still works.
 */
export function ConnectFailed({ reason, onRetry, onOtherAccount, fallbackLabel, onFallback }: ConnectFailedProps) {
  return (
    <div className="hc-connect-failed" role="alert">
      <div className="hc-connect-failed__text">
        <StatusPill label="Couldn’t connect" tone="danger" />
        <p className="hc-medium">{reason}</p>
      </div>
      <div className="hc-connect-failed__actions">
        <Button size="small" onClick={onRetry}>
          Try again
        </Button>
        <Button size="small" variant="secondary" onClick={onOtherAccount}>
          Use another account
        </Button>
        <Button size="small" variant="tertiary" onClick={onFallback}>
          {fallbackLabel}
        </Button>
      </div>
    </div>
  );
}
