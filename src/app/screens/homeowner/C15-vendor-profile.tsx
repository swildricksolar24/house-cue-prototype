import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Banner } from '../../../components/Banner/Banner';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { DetailRow } from '../../../components/DetailRow/DetailRow';
import { ImagePlaceholder } from '../../../components/ImagePlaceholder/ImagePlaceholder';
import { ListRow } from '../../../components/ListRow/ListRow';
import { StatusPill } from '../../../components/StatusPill/StatusPill';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C15-vendor-profile.css';

/**
 * C15 Vendor profile — Figma mobile 217:29236, web 217:30149 (J1 Review & book step 2).
 * Variant "Vendor profile (recommendations)" — 300:31943 / 300:32528 (Community contributions step 1).
 * ?state=pending — "Pending verification (Book disabled)" 231:24979 / 242:13611.
 */

const VENDOR = 'Zephyrline HVAC';

const details = [
  { label: 'License', value: 'Arizona contractor license · verified' },
  { label: 'Insurance', value: 'General liability · verified' },
  { label: 'Background check', value: 'Passed' },
  { label: 'Complaints', value: 'None on record', webOnly: true },
  { label: 'Responds', value: 'Usually within 2 hours' },
];

const reviews = [
  { title: 'Fast, tidy and explained everything', meta: '★★★★★ · AC tune-up · Oct 2026' },
  { title: 'Fair price, came the same day', meta: '★★★★★ · AC repair · Sep 2026' },
  { title: 'Good work, arrived 20 minutes late', meta: '★★★★ · Duct cleaning · Aug 2026' },
];

const REVIEWS_HEADING = 'Reviews · ★ 4.8 (126)';
const PENDING_TITLE = 'Vendor verification in progress';
const PENDING_BODY = 'This pro’s background check is still running. You can compare and message them; booking unlocks once it clears.';
const RECOMMENDED_TITLE = 'Recommended by 9 HouseCue homeowners';

export default function VendorProfile({ variant }: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [params] = useSearchParams();
  const fromUrl = params.get('state') === 'pending';
  const [pending, setPending] = useState(fromUrl);
  useEffect(() => setPending(fromUrl), [fromUrl]);

  const recommendations = variant === 'Vendor profile (recommendations)';
  // Review & book: Choose is the next step (C16). Community contributions: next step is C90 Recommend a vendor.
  const chooseThisPro = recommendations ? () => flow.go('C16') : flow.goNext;
  const recommend = recommendations ? flow.goNext : () => flow.go('C90');
  const askQuestion = () => flow.go('C74');

  const pills = (
    <>
      <StatusPill label="Trust 92" tone="info" />
      <StatusPill label="Top performer" tone="info" />
    </>
  );

  const recommendCard = (
    <section className="hc-c15-recommend">
      <h2 className="hc-medium-semibold">{RECOMMENDED_TITLE}</h2>
      <p className="hc-small hc-muted">
        {device === 'mobile'
          ? '2 credited Care Library guide edits · Replace HVAC filter, Clear the condensate line'
          : 'Credited guide edits: Replace HVAC filter · step 4; Clear the condensate line · step 2'}
      </p>
      <Button variant="secondary" size={device === 'mobile' ? 'medium' : 'small'} onClick={recommend} className="hc-c15-recommend__button">
        Recommend this pro
      </Button>
    </section>
  );

  const pendingBanner = pending && (
    <Banner tone="warning" title={PENDING_TITLE}>
      {PENDING_BODY}
    </Banner>
  );

  // ───────────── Mobile ─────────────
  if (device === 'mobile') {
    const rows = recommendations ? details.slice(0, 2) : details.filter((d) => !d.webOnly);
    return (
      <MobileShell
        header={{ title: 'Pro profile' }}
        bottom={
          <BottomActions
            primaryLabel="Choose this pro"
            onPrimary={chooseThisPro}
            primaryDisabled={pending}
            secondaryLabel="Ask a question"
            onSecondary={askQuestion}
          />
        }
      >
        {pendingBanner}
        <h1 className="hc-h3">{VENDOR}</h1>
        <div className="hc-c15-pills">
          {pills}
          <span className="hc-small hc-muted">HVAC · Phoenix</span>
        </div>
        {recommendations && recommendCard}
        <div>
          {rows.map((d) => (
            <DetailRow key={d.label} label={d.label} value={d.value} />
          ))}
        </div>
        <h2 className="hc-large-bold">{REVIEWS_HEADING}</h2>
        <ListRow title={reviews[0].title} description={reviews[0].meta} />
      </MobileShell>
    );
  }

  // ───────────── Web ─────────────
  return (
    <WebShell nav="plan">
      <div className="hc-c15-web">
        <button type="button" className="hc-c15-back hc-small" onClick={flow.goBack}>
          ‹ Quotes
        </button>
        {pendingBanner}
        <div className="hc-c15-web__cols">
          <div className="hc-c15-web__left">
            <section className="hc-c15-card hc-c15-card--profile">
              <ImagePlaceholder label="Logo" height={120} />
              <h1 className="hc-h3">{VENDOR}</h1>
              <div className="hc-c15-pills">{pills}</div>
              {recommendations && recommendCard}
              <div>
                {details.map((d) => (
                  <DetailRow key={d.label} label={d.label} value={d.value} />
                ))}
              </div>
            </section>
            <div className="hc-c15-web__actions">
              <Button onClick={chooseThisPro} disabled={pending}>
                Choose this pro
              </Button>
              <Button variant="secondary" onClick={askQuestion}>
                Ask a question
              </Button>
            </div>
          </div>
          <div className="hc-c15-web__right">
            <section className="hc-c15-card">
              <h2 className="hc-large-bold">{REVIEWS_HEADING}</h2>
              {reviews.map((r) => (
                <ListRow key={r.title} title={r.title} description={r.meta} />
              ))}
            </section>
            <section className="hc-c15-card">
              <h2 className="hc-large-bold">Past work</h2>
              <div className="hc-c15-photos">
                <ImagePlaceholder label="Photo" height={120} />
                <ImagePlaceholder label="Photo" height={120} />
                <ImagePlaceholder label="Photo" height={120} />
              </div>
            </section>
            <section className="hc-c15-card">
              <h2 className="hc-large-bold">Your history with this pro</h2>
              <ListRow title="AC tune-up" description="Mar 12, 2025 · $149 · you rated 5 stars" />
            </section>
          </div>
        </div>
      </div>
    </WebShell>
  );
}
