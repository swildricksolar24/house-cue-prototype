import type { ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import './TimelineStep.css';

export type TimelineStepState = 'done' | 'current' | 'upcoming';

export type TimelineStepProps = {
  state: TimelineStepState;
  title: ReactNode;
  /** Time, ETA or detail line */
  meta?: ReactNode;
  className?: string;
};

const stateLabel: Record<TimelineStepState, string> = { done: 'Done', current: 'In progress', upcoming: 'Upcoming' };

/**
 * HC/Timeline Step (Figma 29:110) — State Done / Current / Upcoming. One step of the C18 job timeline
 * (Booked → On the way → Arrived → In progress → Parts needed → Completed). Render steps inside an <ol>.
 */
export function TimelineStep({ state, title, meta, className }: TimelineStepProps) {
  return (
    <li
      className={['hc-timeline-step', `hc-timeline-step--${state}`, className].filter(Boolean).join(' ')}
      aria-current={state === 'current' ? 'step' : undefined}
    >
      <span className="hc-timeline-step__dot">
        {state === 'done' && <Icon name="check" size={16} label={stateLabel.done} />}
        {state === 'current' && <Icon name="in-process" size={16} label={stateLabel.current} />}
        {state === 'upcoming' && <span className="hc-timeline-step__sr">{stateLabel.upcoming}</span>}
      </span>
      <span className="hc-timeline-step__text">
        <span className="hc-timeline-step__title">{title}</span>
        {meta && <span className="hc-timeline-step__meta">{meta}</span>}
      </span>
    </li>
  );
}
