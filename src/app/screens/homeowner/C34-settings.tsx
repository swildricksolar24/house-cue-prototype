import { useState } from 'react';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { SettingRow } from '../../../components/SettingRow/SettingRow';
import { currentHome, demoAccount, homeowner, landlord, landlordDemoAccount } from '../../data/sample';
import { useFlow } from '../../prototype/flow';
import { getActiveUser } from '../../prototype/journeys';
import { setCompanyName, useCompanyName } from '../../prototype/portfolio';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { setSignedInAs } from '../../prototype/accounts';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import { EditableRow, isEmail, isPhone, maskEmail, maskPhone } from './_editable-row';
import { defaultSignIn, signInSummary, SignInDialog } from './_sign-in-dialog';
import './C34-settings.css';

type ThemePref = 'device' | 'light' | 'dark';
const themeLabels: Record<ThemePref, string> = { device: 'Match my device', light: 'Light', dark: 'Dark' };

/**
 * C34 Settings, privacy, data export (Account tab) — Figma mobile 218:21899, web 218:22717 (J1 Settings & account step 1).
 * Review change: also the landlord's Account page (/landlord/settings-and-account/1): Biff's profile and sign-in, the
 * landlord nav, a Portfolio billing card that opens C89, and without the homeowner-only rows (valuables, smart home,
 * deactivate this home).
 */
export default function Settings(props: ScreenProps) {
  // A fresh page (profile, toggles) for each account, so the landlord's details never carry over to the homeowner's
  return <SettingsPage key={getActiveUser()} {...props} />;
}

function SettingsPage(_: ScreenProps) {
  const { device, setTheme } = usePrototype();
  const flow = useFlow();
  const isLandlord = getActiveUser() === 'landlord';
  const me = isLandlord ? { ...landlord, phone: landlordDemoAccount.phone } : { ...homeowner, phone: demoAccount.phone };
  // Editable profile (prototype state only)
  const [name, setName] = useState(me.firstName);
  // Review change: the landlord's business name, saved for the visit and shown everywhere the business is named
  const company = useCompanyName();
  // Review change: Manage on the Sign-in card opens the Sign-in & security dialog; its changes update the card
  const [signIn, setSignIn] = useState(() => defaultSignIn(isLandlord));
  const [managingSignIn, setManagingSignIn] = useState(false);
  const [email, setEmail] = useState(me.email);
  const [phone, setPhone] = useState(me.phone);
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
  // Review change: the landlord's billing lives on its own page (C89); Settings shows a summary and opens it
  // Review change: the homeowner gets the same Billing card; Edit opens their combined Billing page (C29)
  const billingRow = isLandlord ? (
    <DetailRow
      label={`${company} · Portfolio plan`}
      value="$27.99 / mo · next charge Dec 1 · Visa ending 4242"
      actionLabel="Edit"
      // Review change: Edit opens the Billing page (C89) with Back to settings; the Billing dialog is removed
      onAction={() => flow.go('C89', '?from=settings')}
    />
  ) : (
    <DetailRow
      label="Member · 1 of 3 homes"
      value="$49 / yr · next charge Mar 15, 2027 · Visa ending 4242"
      actionLabel="Edit"
      onAction={() => flow.go('C29', '?from=settings')}
    />
  );
  const deleteLink = (
    <button type="button" className="hc-c34-delete" onClick={flow.goNext}>
      Delete account
    </button>
  );
  // Review change: Log out at the bottom of the Account stack; returns to the landing page (C39)
  const logOut = (
    <Button
      variant="secondary"
      fullWidth
      onClick={() => {
        setSignedInAs(null);
        flow.go('C39');
      }}
    >
      Log out
    </Button>
  );

  if (device === 'mobile') {
    return (
      <MobileShell header={{ title: 'Settings', showBack: false }} tab="account" role={isLandlord ? 'landlord' : 'homeowner'}>
        <h2 className="hc-large-bold">Billing</h2>
        {billingRow}
        <h2 className="hc-large-bold">Privacy</h2>
        {privacyRows}
        <h2 className="hc-large-bold">Your data</h2>
        {exportRow}
        {!isLandlord && deactivateHomeRow}
        {deleteLink}
        {logOut}
      </MobileShell>
    );
  }

  return (
    <WebShell role={isLandlord ? 'landlord' : 'homeowner'} nav="account">
      <div className="hc-c34-web">
        <h1 className="hc-h2">Settings</h1>
        <div className="hc-c34-web__cols">
          <div className="hc-c34-web__col">
            <section className="hc-c34-card">
              <h2 className="hc-large-bold">Profile</h2>
              {/* Review change: every Edit opens an inline editor (prototype only; nothing is sent) */}
              <EditableRow kind="text" label="Name" display={name} value={name} onSave={setName} />
              {/* Review change: landlord only, the business name (shown on Portfolio, billing, tenants' screens, invites) */}
              {isLandlord && <EditableRow kind="text" label="Business name" display={company} value={company} onSave={setCompanyName} />}
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
              <DetailRow label="Sign-in methods" value={signInSummary(signIn)} actionLabel="Manage" onAction={() => setManagingSignIn(true)} />
              <p className="hc-small hc-muted">HouseCue doesn’t use passwords.</p>
            </section>
            {/* Review change: Connected accounts after Sign-in, above Billing and Privacy */}
            <section className="hc-c34-card">
              <h2 className="hc-large-bold">Connected accounts</h2>
              <DetailRow label="Email import" value="Gmail · syncing" actionLabel="Disconnect" onAction={() => flow.go('C44')} />
              <DetailRow label="Calendar" value="Not connected" actionLabel="Connect" onAction={() => flow.go('C43')} />
              {!isLandlord && <DetailRow label="Smart home" value="Google Home" actionLabel="Disconnect" onAction={() => flow.go('C46')} />}
            </section>
            {/* Review change: landlord only, a summary of the portfolio's billing; Edit opens the Billing page */}
            {/* Review change: both accounts have the Billing card (was landlord only) */}
            <section className="hc-c34-card">
              <h2 className="hc-large-bold">Billing</h2>
              {billingRow}
              <p className="hc-small hc-muted">
                {isLandlord ? 'Plan, doors, invoices and payment method.' : 'Plan per home, payment methods, history and credits.'} Billing is managed on the web.
              </p>
            </section>
          </div>
          <div className="hc-c34-web__col">
            <section className="hc-c34-card">
              <h2 className="hc-large-bold">Privacy</h2>
              {privacyRows}
              {!isLandlord && (
                <EditableRow
                  kind="select"
                  label="Who can see valuables"
                  display={valuables}
                  value={valuables}
                  options={['Owners only', 'Owners and household', 'Everyone with access to the home'].map((v) => ({ value: v, label: v }))}
                  onSave={setValuables}
                />
              )}
            </section>
          </div>
          <div className="hc-c34-web__col">
            <section className="hc-c34-card">
              <h2 className="hc-large-bold">Your data</h2>
              {exportRow}
              {!isLandlord && deactivateHomeRow}
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
      {managingSignIn && (
        <SignInDialog
          landlord={isLandlord}
          email={email}
          phone={maskPhone(phone)}
          state={signIn}
          onSave={(next) => {
            setSignIn(next);
            setManagingSignIn(false);
          }}
          onCancel={() => setManagingSignIn(false)}
        />
      )}
    </WebShell>
  );
}
