import { useState } from 'react';
import { BottomActions } from '../../../components/BottomActions/BottomActions';
import { Button } from '../../../components/Button/Button';
import { Icon } from '../../../components/Icon/Icon';
import { SettingRow } from '../../../components/SettingRow/SettingRow';
import { useFlow } from '../../prototype/flow';
import { usePrototype } from '../../prototype/PrototypeContext';
import { MobileShell } from '../../shells/MobileShell';
import { WebShell } from '../../shells/WebShell';
import type { ScreenProps } from '../registry';
import './C21-rate-and-review.css';

const PUBLIC_NOTE =
  'Public: shown on Zephyrline’s profile and quotes when you submit. Open until Nov 27 (14 days). The pro also rates working with you; that rating is private.';
const MOBILE_TAGS = ['On time', 'Clean', 'Fair price', 'Explained the work'];
const WEB_TAGS = [...MOBILE_TAGS, 'Friendly', 'Would hire again'];

/**
 * C21 Rate and review ("Rate your vendor") — Figma mobile 217:32310, web 217:32969 (J1 Payment & review step 3).
 * Public review, published on submit, open 14 days after sign-off.
 */
export default function RateAndReview(_: ScreenProps) {
  const { device } = usePrototype();
  const flow = useFlow();
  const [rating, setRating] = useState(5);
  const [tags, setTags] = useState<string[]>(['On time', 'Clean', 'Explained the work']);
  const [text, setText] = useState('Fast and tidy. Explained what failed and showed me the old part.');
  const [preferred, setPreferred] = useState(true);

  const toggleTag = (t: string) => setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  const stars = (
    <div className="hc-c21-stars" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={rating === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className="hc-c21-star"
          onClick={() => setRating(n)}
        >
          <Icon name={n <= rating ? 'star' : 'rating-hollow'} size={36} />
        </button>
      ))}
    </div>
  );

  const chips = (list: string[]) => (
    <div className="hc-c21-chips">
      {list.map((t) => (
        <button
          key={t}
          type="button"
          aria-pressed={tags.includes(t)}
          className={['hc-c21-chip', tags.includes(t) && 'hc-c21-chip--selected'].filter(Boolean).join(' ')}
          onClick={() => toggleTag(t)}
        >
          {t}
        </button>
      ))}
    </div>
  );

  // Figma draws a borderless tint text area (not HC/Input), so this stays a local textarea
  const textArea = (
    <textarea
      className="hc-c21-textarea"
      aria-label="Your review"
      rows={2}
      value={text}
      onChange={(e) => setText(e.target.value)}
    />
  );

  const preferredRow = (
    <SettingRow
      title="Add to my preferred HVAC pros"
      description="Your agent asks them first next time"
      checked={preferred}
      onCheckedChange={setPreferred}
    />
  );

  if (device === 'mobile') {
    return (
      <MobileShell
        header={{ title: 'Rate your vendor' }}
        bottom={<BottomActions primaryLabel="Submit review" onPrimary={flow.goNext} secondaryLabel="Skip" onSecondary={flow.goNext} />}
      >
        <h2 className="hc-h3">How did Zephyrline HVAC do?</h2>
        {stars}
        <p className="hc-small hc-muted">{PUBLIC_NOTE}</p>
        {chips(MOBILE_TAGS)}
        {textArea}
        <Button variant="secondary" fullWidth>
          Add photos
        </Button>
        {preferredRow}
      </MobileShell>
    );
  }

  return (
    <WebShell nav="jobs">
      <div className="hc-c21-web">
        <h1 className="hc-h2">Rate your vendor: Zephyrline HVAC</h1>
        <div className="hc-c21-web__cols">
          <section className="hc-c21-card hc-c21-card--form">
            <p className="hc-small hc-muted">AC repair · Thu, Nov 13 · $374</p>
            {stars}
            <p className="hc-small hc-muted">{PUBLIC_NOTE}</p>
            {chips(WEB_TAGS)}
            {textArea}
            <Button variant="secondary" className="hc-c21-start">
              Add photos
            </Button>
            {preferredRow}
            <div className="hc-c21-actions">
              <Button onClick={flow.goNext}>Submit review</Button>
              <Button variant="secondary" onClick={flow.goNext}>
                Skip
              </Button>
            </div>
          </section>
          <section className="hc-c21-card hc-c21-card--side">
            <h2 className="hc-large-bold">How reviews work</h2>
            <p className="hc-small hc-muted">
              Your review is public and is posted when you submit, after an automatic check. It shows your first name and the
              month, on the pro’s profile and quotes, apart from their trust score. You can edit it for 30 days. Reviews stay
              open for 14 days after sign-off. The pro rates working with you privately; that rating feeds your customer score
              (Account ›{' '}
              <button type="button" className="hc-c21-inline-link" onClick={() => flow.go('C78')}>
                Your customer score
              </button>
              ).
            </p>
          </section>
        </div>
      </div>
    </WebShell>
  );
}
