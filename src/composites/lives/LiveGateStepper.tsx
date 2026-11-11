import { Fragment } from 'react'

import { ICONS } from '@/declarations/ui/icons'
import { LIVE_GATE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface LiveGateStepperProps {
  steps: readonly string[]
  current: number
  label: string
}

/**
 * Numbered timeline, current step outlined and past ones struck
 * @param {readonly string[]} steps - Step names
 * @param {number} current - Index of the current step
 * @param {string} label - Accessible name
 * @return {JSX.Element}
 */

export const LiveGateStepper = ({ steps, current, label }: LiveGateStepperProps) => {
  const Check = ICONS.check

  return (
    <ol className={LIVE_GATE.stepper} aria-label={label}>
      {steps.map((name, index) => {
        const isDone = index < current

        return (
          <Fragment key={name}>
            {index > 0 && (
              <li
                aria-hidden="true"
                className={cn(LIVE_GATE.stepLine, isDone && LIVE_GATE.stepLineDone)}
              />
            )}
            <li
              aria-current={index === current ? 'step' : undefined}
              className={cn(
                LIVE_GATE.step,
                index === current && LIVE_GATE.stepActive,
                isDone && LIVE_GATE.stepDone
              )}
            >
              <span className={cn(LIVE_GATE.stepNumber, isDone && LIVE_GATE.stepNumberDone)}>
                {isDone ? <Check className={LIVE_GATE.stepGlyph} aria-hidden="true" /> : index + 1}
              </span>
              <span className={LIVE_GATE.stepName}>{name}</span>
            </li>
          </Fragment>
        )
      })}
    </ol>
  )
}
