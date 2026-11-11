import { useRef, useState } from 'react';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';
import { StateBlock } from '../../../components/StateBlock/StateBlock';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { TaskRow, type TaskRowTagTone } from '../../../components/TaskRow/TaskRow';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C25-warranties-and-claims.css';

type Coverage = { id: string; title: string; mobile?: string; web: string; status: 'Active' | 'Expired' };

const coverage: Coverage[] = [
  { id: 'wh', title: 'Water heater', mobile: 'Rheem · maker · ends Jun 2026', web: 'Rheem · manufacturer · ends Jun 2026', status: 'Active' },
  {
    id: 'pool',
    title: 'Pool pump repair',
    mobile: 'Fernhollow Pool Care · workmanship · ends Feb 2027',
    web: 'Fernhollow Pool Care · workmanship · ends Feb 2027',
    status: 'Active',
  },
  { id: 'garage', title: 'Garage door opener', web: 'Chamberlain · manufacturer · ends Aug 2026', status: 'Active' },
  { id: 'ac', title: 'AC / heat pump', mobile: 'Trane · ended Mar 2021', web: 'Trane · manufacturer · ended Mar 2021', status: 'Expired' },
];

const tone: Record<Coverage['status'], TaskRowTagTone> = { Active: 'success', Expired: 'info' };

type Tab = 'Coverage' | 'Claims';

/**
 * C25 Warranties and claims — Figma mobile 216:15351, web 216:17150 (J1 Home record step 4; also Warranty dispute step 1,
 * same frame). Empty / Loading / Error frames 110:5873… on B2.
 */
export default function WarrantiesAndClaims(_: ScreenProps) {
  const { device, screenState, setScreenState } = usePrototype();
  const flow = useFlow();
  const [tab, setTab] = useState<Tab>('Coverage');
  const fileRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState(0);
  const inDispute = flow.journey.slug === 'warranty-dispute';
  // The open claim leads into the dispute flow (next step there); elsewhere it opens Issues and disputes.
  const openClaim = () => (inDispute ? flow.goNext() : flow.go('C31'));

  const rows = coverage
    .filter((c) => device === 'web' || c.mobile)
    .map((c) => (
      <TaskRow
        key={c.id}
        className={c.status === 'Expired' ? 'hc-c25-row--neutral' : undefined}
        icon="shield"
        title={c.title}
        meta={device === 'mobile' ? c.mobile : c.web}
        tag={c.status}
        tagTone={tone[c.status]}
      />
    ));

  /** Coverage list, replaced by the Empty / Loading / Error frame */
  const coverageBody =
    screenState === 'loading' ? (
      <>
        <SkeletonCard label="Loading warranties" />
        <SkeletonCard label="Loading warranties" />
        <SkeletonCard label="Loading warranties" />
      </>
    ) : screenState === 'empty' ? (
      <StateBlock
        title="No warranties yet"
        body="Add a warranty or receipt and we’ll track coverage for you."
        actionLabel="Add a warranty"
        onAction={() => flow.go('C24')}
      />
    ) : screenState === 'error' ? (
      <StateBlock
        kind="error"
        title="Couldn’t load warranties and claims"
        body="Check your connection and try again. Nothing was lost."
        actionLabel="Try again"
        onAction={() => setScreenState('default')}
      />
    ) : (
      rows
    );

  if (device === 'mobile') {
    const showCoverage = tab === 'Coverage';
    return (
      <MobileShell header={{ title: 'Warranties and claims' }} tab="home">
        <div className="hc-c25-chips" role="group" aria-label="Show">
          {(['Coverage', 'Claims'] as Tab[]).map((t) => (
            <button key={t} type="button" className="hc-c25-chip" aria-pressed={tab === t} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
        {showCoverage && (
          <>
            <h2 className="hc-large-bold">Active coverage</h2>
            {coverageBody}
          </>
        )}
        {(screenState === 'default' || !showCoverage) && (
          <>
            <h2 className="hc-large-bold">Open claim</h2>
            <TaskRow
              icon="in-process"
              title="Pool pump leak"
              meta="Callback sent Nov 4 · reply due Nov 7"
              tag="Waiting"
              tagTone="warning"
              onClick={openClaim}
            />
          </>
        )}
      </MobileShell>
    );
  }

  return (
    <WebShell nav="home">
      <div className="hc-c25-web">
        <div className="hc-c25-web__head">
          <h1 className="hc-h2">Warranties and claims</h1>
          <Button onClick={flow.goNext}>Start a claim</Button>
        </div>
        <div className="hc-c25-web__cols">
          <section className="hc-c25-card hc-c25-web__main">
            <h2 className="hc-large-bold">Coverage</h2>
            {coverageBody}
          </section>
          <section className="hc-c25-card hc-c25-card--claim hc-c25-web__side">
            <div className="hc-c25-card__head">
              <h2 className="hc-large-bold">Pool pump leak</h2>
              <StatusPill label="Waiting on the pro" tone="warning" />
            </div>
            <DetailRow label="Type" value="Workmanship callback" />
            <DetailRow label="Original job" value="Pool pump repair · Feb 10, 2026" />
            <DetailRow label="Sent to the pro" value="Nov 4, 2026" />
            <DetailRow label="Reply due" value="Nov 7 · then support steps in" />
            <p className="hc-small hc-muted">
              If the pro says it isn’t covered, you can appeal for free, ask the same pro for a quote, or start a new request.
            </p>
            <div className="hc-c25-actions">
              <Button variant="secondary" onClick={() => fileRef.current?.click()}>
                {photos ? `Add photos (${photos})` : 'Add photos'}
              </Button>
              <Button variant="secondary" onClick={inDispute ? flow.goNext : () => flow.go('C32')}>
                Message support
              </Button>
              <input
                ref={fileRef}
                className="hc-c25-file"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setPhotos((n) => n + (e.target.files?.length ?? 0))}
              />
            </div>
          </section>
        </div>
      </div>
    </WebShell>
  );
}
