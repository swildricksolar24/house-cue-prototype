import { useState } from 'react';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { SettingRow } from '../../../components/SettingRow/SettingRow';
import { currentHome, demoAccount, homeowner } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import { EditableRow, isEmail, isPhone, maskEmail, maskPhone } from './_editable-row';
import './C34-settings.css';

type ThemePref = 'device' | 'light' | 'dark';
const themeLabels: Record<ThemePref, string> = { device: 'Match my device', light: 'Light', dark: 'Dark' };

/** C34 Settings, privacy, data export (Account tab) — Figma mobile 218:21899, web 218:22717 (J1 Settings & account step 1) */
export default function Settings(_: ScreenProps) {
  const { device, setTheme } = usePrototype();
  const flow = useFlow();
  // Editable profile (prototype state only)
  const [name, setName] = useState(homeowner.firstName);
  const [email, setEmail] = useState(homeowner.email);
  const [phone, setPhone] = useState(demoAccount.phone);
  const [language, setLanguage] = useState('English');
  const [valuables, setValuables] = useState('Owners only');
  const [themePref, setThemePref] = useState<ThemePref>('device');
  // Theme actually switches the prototype; "Match my device" follows the OS setting
  const applyTheme = (pref: ThemePref) => {
    setThemePref(pref);
    if (pref === 'device') setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    else setTheme(pref);
  };
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
  // Review change: Log out at the bottom of the Account stack; returns to the landing page (C39)
  const logOut = (
    <Button variant="secondary" fullWidth onClick={() => flow.go('C39')}>
      Log out
    </Button>
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
        {logOut}
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
              {/* Review change: every Edit opens an inline editor (prototype only; nothing is sent) */}
              <EditableRow kind="text" label="Name" display={name} value={name} onSave={setName} />
              <EditableRow kind="email" label="Email" display={maskEmail(email)} value={email} validate={isEmail} onSave={setEmail} />
              <EditableRow kind="phone" label="Phone" display={maskPhone(phone)} value={phone} validate={isPhone} onSave={setPhone} />
              <EditableRow
                kind="select"
                label="Language"
                display={language}
                value={language}
                options={[
                  { value: 'English', label: 'English' },
                  { value: 'Español', label: 'Español' },
                ]}
                onSave={setLanguage}
              />
              <EditableRow
                kind="select"
                label="Theme"
                display={themeLabels[themePref]}
                value={themePref}
                options={Object.entries(themeLabels).map(([v, l]) => ({ value: v, label: l }))}
                onSave={(v) => applyTheme(v as ThemePref)}
              />
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
              <EditableRow
                kind="select"
                label="Who can see valuables"
                display={valuables}
                value={valuables}
                options={['Owners only', 'Owners and household', 'Everyone with access to the home'].map((v) => ({ value: v, label: v }))}
                onSave={setValuables}
              />
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
        {logOut}
      </div>
    </WebShell>
  );
}
