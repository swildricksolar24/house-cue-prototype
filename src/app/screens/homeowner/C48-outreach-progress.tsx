import { useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { DisclosureNote } from '../../../components/DisclosureNote/DisclosureNote';
import type { IconName } from '../../../components/Icon/Icon';
import { TaskRow, type TaskRowTagTone } from '../../../components/TaskRow/TaskRow';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C48-outreach-progress.css';

type Outreach = { id: string; name: string; meta: string; icon: IconName; status: 'Quoted' | 'Viewed' | 'No reply' };

/** Invented sample pros from the Figma frame (not real companies) */
const outreach: Outreach[] = [
  { id: 'zephyrline', name: 'Zephyrline HVAC', meta: 'On HouseCue · app · quoted 10:02 AM', icon: 'check', status: 'Quoted' },
  { id: 'saguaro-air', name: 'Saguaro Air Pros', meta: 'On HouseCue · app · quoted 11:30 AM', icon: 'check', status: 'Quoted' },
  { id: 'desert-peak', name: 'Desert Peak Cooling', meta: 'Not on HouseCue · email · quoted 12:15 PM', icon: 'email', status: 'Quoted' },
  { id: 'mesa-comfort', name: 'Mesa Comfort Co.', meta: 'On HouseCue · viewed 10:40 AM', icon: 'visibility', status: 'Viewed' },
  { id: 'bluequail', name: 'Bluequail Air Service', meta: 'Not on HouseCue · email · no reply yet', icon: 'email', status: 'No reply' },
];

/* TaskRow has no neutral tag tone; "neutral" is styled in C48-outreach-progress.css (reported as a component gap) */
const tones: Record<Outreach['status'], TaskRowTagTone> = {
  Quoted: 'success',
  Viewed: 'info',
  'No reply': 'neutral' as TaskRowTagTone,
};

/**
 * C48 Outreach progress — Figma mobile 216:18793, web 216:20099 (J1 Request quotes step 3).
 * States: "No quotes" (B3 242:12387 / 242:12559, J1 "Branch: No quotes" 231:24362) via ?state=no-quotes or ?state=empty;
 * "Disclosure seen (info icon)" (207:5096) after dismissing the note.
 * J1 "Branch: No vendor accepts (widen)" (231:26599) is an unchanged instance of this screen (default state).
 */
export default function OutreachProgress(_: ScreenProps) {
  const { device, screenState } = usePrototype();
  const flow = useFlow();
  const [noteOpen, setNoteOpen] = useState(true);
  const state = screenState as string;
  const noQuotes = state === 'no-quotes' || state === 'empty';

  const noQuotesBanner = noQuotes && (
    <Banner tone="warning" title="No quotes came in">
      No pros quoted within the 24-hour window. Your agent can widen to more pros and a wider area, or try again later with
      different preferences.
    </Banner>
  );

  const infoButton = !noteOpen && <DisclosureNote variant="info-icon" onOpen={() => setNoteOpen(true)} />;
  const note = noteOpen && <DisclosureNote onDismiss={() => setNoteOpen(false)} onLearnMore={() => flow.go('C41')} />;

  const rows = (
    <div className="hc-c48-list">
      {outreach.map((o) => (
        <TaskRow
          key={o.id}
          title={o.name}
          meta={o.meta}
          icon={o.icon}
          tag={o.status}
          tagTone={tones[o.status]}
          onClick={() => flow.go('C74')}
        />
      ))}
    </div>
  );

  if (device === 'mobile') {
    return (
      <MobileShell
        header={{ title: 'Finding pros' }}
        bottom={
          <BottomActions
            primaryLabel="Show quotes now"
            onPrimary={flow.goNext}
            secondaryLabel="Cancel request"
            onSecondary={() => flow.go('C08')}
          />
        }
      >
        <div className="hc-c48-mobile">
          {noQuotesBanner}
          <div className="hc-c48-heading">
            <h2 className="hc-large-bold">AC repair · 3 of 5 quotes in</h2>
            {infoButton}
          </div>
          <p className="hc-small hc-muted">Started 9:14 AM · quotes due by 9:14 AM tomorrow</p>
          {rows}
          {note}
        </div>
      </MobileShell>
    );
  }

  return (
    <WebShell nav="jobs">
      <div className="hc-c48-web">
        <header className="hc-c48-web__head">
          <h1 className="hc-h2">Finding pros for AC repair</h1>
          <p className="hc-medium hc-muted">3 of 5 quotes in · started 9:14 AM · quotes due by 9:14 AM tomorrow (24-hour window)</p>
        </header>
        {noQuotesBanner}
        <div className="hc-c48-web__cols">
          <div className="hc-c48-web__main">
            <section className="hc-c48-card hc-c48-card--list">
              <div className="hc-c48-heading">
                <h2 className="hc-large-bold">Pros contacted</h2>
                {infoButton}
              </div>
              {rows}
            </section>
            {note}
          </div>
          <aside className="hc-c48-web__side">
            <section className="hc-c48-card hc-c48-card--actions">
              <Button fullWidth onClick={flow.goNext}>
                Show quotes now
              </Button>
              <Button fullWidth variant="secondary" onClick={() => flow.go('C74')}>
                Message a pro
              </Button>
              <Button fullWidth variant="secondary" onClick={() => flow.go('C08')}>
                Cancel request
              </Button>
            </section>
            <Banner title="If fewer than 5 quote">
              I’ll widen the search once (more pros, a wider area), then show you what I have and why.
            </Banner>
          </aside>
        </div>
      </div>
    </WebShell>
  );
}
