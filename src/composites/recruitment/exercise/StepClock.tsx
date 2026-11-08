'use client'

import type { CSSProperties } from 'react'

import { useCountdown } from '@/core/hooks/interaction/state/time/useCountdown'
import { EXERCISE_COPY } from '@/declarations/recruitment/exerciseCopy'
import { EXERCISE_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { SECOND_MS } from '@/utils/constants/time'

export interface StepClockProps {
  // Null when the step is untimed
  seconds: number | null
  onEnd?: () => void
}

/**
 * Seconds left on the question, with a bar draining beneath
 * @param {StepClockProps} props - Component props
 * @return {JSX.Element}
 */

export const StepClock = ({ seconds, onEnd }: StepClockProps) => {
  const left = useCountdown(seconds, 0, true, onEnd)

  if (left === null || seconds === null)
    return <span className={EXERCISE_STYLES.stepPause}>{EXERCISE_COPY.noTimer}</span>

  return (
    <div className={EXERCISE_STYLES.clock} aria-live="off">
      <span className={cn(EXERCISE_STYLES.clockValue, left === 0 && EXERCISE_STYLES.clockLate)}>
        {EXERCISE_COPY.secondsLeft.replace('{seconds}', String(left))}
      </span>
      <span className={EXERCISE_STYLES.clockBar}>
        <span
          className={EXERCISE_STYLES.clockFill}
          style={{ '--drain-ms': `${seconds * SECOND_MS}ms` } as CSSProperties}
        />
      </span>
    </div>
  )
}
