import { Fragment } from 'react'

import { PLAY_GROUP_COPY } from '@/declarations/play'
import { PLAY_GROUP } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PlayGroupTimelineProps {
  steps: string[]
  current: number
}

/**
 * Steps of the creation, the ones reached are filled
 * @param {PlayGroupTimelineProps} props - Labels and current index
 * @return {JSX.Element}
 */

export const PlayGroupTimeline = ({ steps, current }: PlayGroupTimelineProps) => (
  <ol className={PLAY_GROUP.timeline} aria-label={PLAY_GROUP_COPY.steps}>
    {steps.map((label, index) => (
      <Fragment key={label}>
        {index > 0 && (
          <li
            aria-hidden="true"
            className={cn(PLAY_GROUP.stepLine, index <= current && PLAY_GROUP.stepLineOn)}
          />
        )}
        <li
          aria-current={index === current ? 'step' : undefined}
          className={cn(PLAY_GROUP.step, index <= current && PLAY_GROUP.stepOn)}
        >
          <span className={cn(PLAY_GROUP.stepDot, index <= current && PLAY_GROUP.stepDotOn)}>
            {index + 1}
          </span>
          <span className={PLAY_GROUP.stepLabel}>{label}</span>
        </li>
      </Fragment>
    ))}
  </ol>
)
