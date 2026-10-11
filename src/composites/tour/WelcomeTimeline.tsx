import { TOUR_COPY, TOUR_STAGES } from '@/declarations/tour/copy'
import { ICONS } from '@/declarations/ui/icons'
import { TOUR_TIMELINE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface WelcomeTimelineProps {
  // Part under way
  current: number
  // Part on screen
  shown: number
  onShow: (index: number) => void
}

/**
 * The parts of the conversation in a row, the one under way lit, the done ones ticked and reachable
 * @param {WelcomeTimelineProps} props - Part under way, part on screen and the way back
 * @return {JSX.Element}
 */

export const WelcomeTimeline = ({ current, shown, onShow }: WelcomeTimelineProps) => {
  const Done = ICONS.confirm

  return (
    <ol className={TOUR_TIMELINE.list} aria-label={TOUR_COPY.timelineLabel}>
      {TOUR_STAGES.map((step, index) => {
        const isDone = index < current
        const isCurrent = index === current

        return (
          <li
            key={step.key}
            aria-current={index === shown ? 'step' : undefined}
            className={cn(
              TOUR_TIMELINE.item,
              index < TOUR_STAGES.length - 1 && TOUR_TIMELINE.joined
            )}
          >
            <button
              type="button"
              disabled={index > current || index === shown}
              className={TOUR_TIMELINE.step}
              onClick={() => onShow(index)}
            >
              <span
                className={cn(
                  TOUR_TIMELINE.dot,
                  isDone
                    ? TOUR_TIMELINE.dotDone
                    : isCurrent
                      ? TOUR_TIMELINE.dotCurrent
                      : TOUR_TIMELINE.dotTodo
                )}
              >
                {isDone ? <Done className={TOUR_TIMELINE.glyph} aria-hidden="true" /> : index + 1}
              </span>
              <span
                className={cn(
                  TOUR_TIMELINE.label,
                  isDone
                    ? TOUR_TIMELINE.labelDone
                    : index === shown
                      ? TOUR_TIMELINE.labelCurrent
                      : TOUR_TIMELINE.labelIdle
                )}
              >
                {step.label}
              </span>
            </button>
            {index < TOUR_STAGES.length - 1 && (
              <span className={TOUR_TIMELINE.line} aria-hidden="true" />
            )}
          </li>
        )
      })}
    </ol>
  )
}
