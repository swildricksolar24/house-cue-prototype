import { useEffect, useId, useRef, useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { CodeEntry } from '../../../components/CodeEntry/CodeEntry';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import { DeactivatedAccount } from './X09-account-blocked';
import './C76-delete-account.css';

type View = 'default' | 'confirm' | 'deactivated';

/** Destructive confirm over the retention notice — J1 branch "Delete: retention notice + confirm" (231:27052; B10 242:25394 / 242:25524) */
function DeleteDialog({ mode, onDelete, onKeep }: { mode: 'mobile' | 'web'; onDelete: () => void; onKeep: () => void }) {
  const titleId = useId();
  const bodyId = useId();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onKeep();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKeep]);

  return (
    <div className={`hc-c76-overlay hc-c76-overlay--${mode}`} onClick={onKeep}>
      <div
        ref={ref}
        tabIndex={-1}
        className="hc-c76-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="hc-h4">
          Delete your account?
        </h2>
        <p id={bodyId} className="hc-medium hc-muted">
          This can’t be undone. We erase your profile, home record and messages, and keep payment and tax records as the law requires.
          Deletion runs once your open job and held funds settle (about Nov 21).
        </p>
        <Button variant="destructive" size="large" fullWidth onClick={onDelete}>
          Delete account
        </Button>
        <Button variant="secondary" size="large" fullWidth onClick={onKeep}>
          Keep my account
        </Button>
      </div>
    </div>
  );
}

/** C76 Delete account — Figma mobile 218:22351, web 218:23367 (J1 Settings & account step 5) */
export default function DeleteAccount(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [view, setView] = useState<View>('default');
  const [code, setCode] = useState('');

  if (view === 'deactivated') {
    return <DeactivatedAccount onReactivate={() => setView('default')} onLogOut={() => flow.go('C39')} />;
  }

  const confirm = () => setView('confirm');
  const deactivate = () => setView('deactivated');
  const dialog = view === 'confirm' && (
    <DeleteDialog mode={device} onDelete={flow.goNext} onKeep={() => setView('default')} />
  );
  const codeEntry = <CodeEntry value={code} onValueChange={setCode} className="hc-c76-code" />;

  if (device === 'mobile') {
    return (
      <MobileShell
        className="hc-c76-shell"
        header={{ title: 'Delete account' }}
        bottom={
          <>
            <BottomActions primaryLabel="Delete my account" onPrimary={confirm} secondaryLabel="Deactivate instead" onSecondary={deactivate} />
            {dialog}
          </>
        }
      >
        <div className="hc-c76-content">
          <Banner tone="warning" title="Export first?">
            Deactivating is reversible. Deleting is not.
          </Banner>
          <h2 className="hc-medium-semibold">We erase</h2>
          <p className="hc-small hc-muted">
            Profile, homes, items, documents and photos, agent memory, connected accounts, household access.
          </p>
          <h2 className="hc-medium-semibold">We keep, and why</h2>
          <p className="hc-small hc-muted">Jobs, payments, disputes and compliance records, for legal, fraud and tax reasons.</p>
          {codeEntry}
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="account">
      <div className="hc-c76-web">
        <header className="hc-c76-web__head">
          <div>
            <h1 className="hc-h2">Delete your account</h1>
            <p className="hc-medium hc-muted">Personal data is erased; some records are kept by law</p>
          </div>
          <Button variant="secondary" onClick={() => flow.go('C34')}>
            Export my data
          </Button>
        </header>
        <div className="hc-c76-web__cols">
          <div className="hc-c76-web__main">
            <section className="hc-c76-card">
              <h2 className="hc-large-bold">We erase</h2>
              <p className="hc-medium">
                Profile, homes, items, documents and photos, agent memory, connected accounts and email-import access, household access.
              </p>
            </section>
            <section className="hc-c76-card">
              <h2 className="hc-large-bold">We keep, and why</h2>
              <p className="hc-medium">
                Job, payment, dispute and compliance records, for legal, fraud and tax reasons (counsel to confirm the list).
              </p>
            </section>
          </div>
          <div className="hc-c76-web__side">
            <Banner tone="warning" title="1 job is still open">
              Your request is accepted and runs after it settles (expected Nov 23).
            </Banner>
            {codeEntry}
            <div className="hc-c76-actions">
              <Button variant="secondary" onClick={deactivate}>
                Deactivate instead
              </Button>
              <Button onClick={confirm}>Delete my account</Button>
            </div>
          </div>
        </div>
      </div>
      {dialog}
    </WebShell>
  );
}
