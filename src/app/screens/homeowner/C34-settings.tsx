import { useState } from 'react';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { SettingRow } from '../../../components/SettingRow/SettingRow';
import { currentHome, homeowner } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C34-settings.css';

/** C34 Settings, privacy, data export (Account tab) — Figma mobile 218:21899, web 218:22717 (J1 Settings & account step 1) */
export default function Settings(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [outreach, setOutreach] = useState(true);
  const [shareData, setShareData] = useState(false);
  const [recordCalls, setRecordCalls] = useState(false);

  const privacyRows = (
    <>
      <SettingRow
        title="Let my agent call, text and email pros"
        description="Needed to request quotes. Turning it off stops all outreach."
        checked={outreach}
        onCheckedChange={setOutreach}
      />
      <SettingRow
        title="Share anonymized home data"
        description="Optional. Never your name, email or address."
        checked={shareData}
        onCheckedChange={setShareData}
      />
      <SettingRow
        title="Record agent calls"
        description="Keep call recordings in your activity log"
        checked={recordCalls}
        onCheckedChange={setRecordCalls}
      />
    </>
  );

  // The export arrives as a notification ("Your data export is ready", C33)
  const exportRow = (
    <DetailRow label="Export my data" value="ZIP with PDF and CSV files" actionLabel="Export" onAction={() => flow.go('C33')} />
  );
  const deactivateHomeRow = (
    <DetailRow label="Deactivate this home" value={currentHome.address} actionLabel="Deactivate" onAction={() => flow.go('C76')} />
  );
  const deleteLink = (
    <button type="button" className="hc-c34-delete" onClick={flow.goNext}>
      Delete account
    </button>
  );

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Settings', showBack: false }} tab="account">
        <h2 className="hc-large-bold">Privacy</h2>
        {privacyRows}
        <h2 className="hc-large-bold">Your data</h2>
        {exportRow}
        {deactivateHomeRow}
        {deleteLink}
      </MobileShell>
    );
  }

  return (
    <WebShell nav="account">
      <div className="hc-c34-web">
        <h1 className="hc-h2">Settings</h1>
        <div className="hc-c34-web__cols">
          <div className="hc-c34-web__col">
            <section className="hc-c34-card">
              <h2 className="hc-large-bold">Profile</h2>
              <DetailRow label="Name" value={homeowner.firstName} onAction={() => undefined} />
              <DetailRow label="Email" value="j•••@example.com" actionLabel="Change" onAction={() => undefined} />
              <DetailRow label="Phone" value="(602) •••-0142" actionLabel="Change" onAction={() => undefined} />
              <DetailRow label="Language" value="English" actionLabel="Change" onAction={() => undefined} />
              <DetailRow label="Theme" value="Match my device" actionLabel="Change" onAction={() => undefined} />
            </section>
            <section className="hc-c34-card">
              <h2 className="hc-large-bold">Sign-in</h2>
              <DetailRow label="Sign-in methods" value="Email code · Apple" actionLabel="Manage" onAction={() => flow.go('C52')} />
              <p className="hc-small hc-muted">HouseCue doesn’t use passwords.</p>
            </section>
          </div>
          <div className="hc-c34-web__col">
            <section className="hc-c34-card">
              <h2 className="hc-large-bold">Privacy</h2>
              {privacyRows}
              <DetailRow label="Who can see valuables" value="Owners only" actionLabel="Change" onAction={() => undefined} />
            </section>
            <section className="hc-c34-card">
              <h2 className="hc-large-bold">Connected accounts</h2>
              <DetailRow label="Email import" value="Gmail · syncing" actionLabel="Disconnect" onAction={() => flow.go('C44')} />
              <DetailRow label="Calendar" value="Not connected" actionLabel="Connect" onAction={() => flow.go('C43')} />
              <DetailRow label="Smart home" value="Google Home" actionLabel="Disconnect" onAction={() => flow.go('C46')} />
            </section>
          </div>
          <div className="hc-c34-web__col">
            <section className="hc-c34-card">
              <h2 className="hc-large-bold">Your data</h2>
              {exportRow}
              {deactivateHomeRow}
              <DetailRow
                label="Deactivate account"
                value="You can reactivate any time"
                actionLabel="Deactivate"
                onAction={() => flow.go('C76')}
              />
              {deleteLink}
              <p className="hc-small hc-muted">
                Deleting erases your personal data. Job, payment and dispute records are kept for legal, fraud and tax reasons.
              </p>
            </section>
          </div>
        </div>
      </div>
    </WebShell>
  );
}
