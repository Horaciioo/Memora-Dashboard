import { Fragment } from 'react'

import { ICONS, type IconName } from '@/declarations/ui/icons'
import { HORIZONTAL_TIMELINE_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export type StepState = 'idle' | 'current' | 'done' | 'late'

/**
 * One step of a horizontal timeline
 * @typedef {Object} TimelineStep
 * @property {string} id - Step identifier
 * @property {string} label - Step caption
 * @property {string} [hint] - Supporting line under the caption
 * @property {StepState} state - Where the step stands
 * @property {IconName} [icon] - Glyph overriding the state default
 * @property {() => void} [onClick] - Called when the step is picked
 */

export interface TimelineStep {
  id: string
  label: string
  hint?: string
  state: StepState
  icon?: IconName
  onClick?: () => void
}

export interface StepTimelineProps {
  steps: TimelineStep[]
  label: string
  className?: string
}

// Glyph carried by each state, so colour is never the only carrier
const STATE_ICONS: Record<StepState, IconName> = {
  idle: 'clock',
  current: 'pending',
  done: 'confirm',
  late: 'warning',
}

// Dot classes per state
const STATE_DOTS: Record<StepState, string> = {
  idle: HORIZONTAL_TIMELINE_STYLES.dotIdle,
  current: HORIZONTAL_TIMELINE_STYLES.dotCurrent,
  done: HORIZONTAL_TIMELINE_STYLES.dotDone,
  late: HORIZONTAL_TIMELINE_STYLES.dotLate,
}

// Connector classes per state of the step it leads into
const STATE_CONNECTORS: Record<StepState, string> = {
  idle: HORIZONTAL_TIMELINE_STYLES.connectorIdle,
  current: HORIZONTAL_TIMELINE_STYLES.connectorIdle,
  done: HORIZONTAL_TIMELINE_STYLES.connectorDone,
  late: HORIZONTAL_TIMELINE_STYLES.connectorLate,
}

/**
 * Horizontal progress of any staged process, informative only — never an authorisation
 * @param {TimelineStep[]} steps - Steps in display order
 * @param {string} label - Accessible name of the whole timeline
 * @param {string} [className] - Extra classes merged onto the row
 * @return {JSX.Element}
 */

export const StepTimeline = ({ steps, label, className }: StepTimelineProps) => (
  <ol className={cn(HORIZONTAL_TIMELINE_STYLES.row, className)} aria-label={label}>
    {steps.map((step, index) => {
      const Icon = ICONS[step.icon ?? STATE_ICONS[step.state]]
      const next = steps[index + 1]
      const isDone = step.state === 'done'

      return (
        <Fragment key={step.id}>
          <li className={HORIZONTAL_TIMELINE_STYLES.step}>
            {/* A pickable step is a button, a plain one never pretends to be one */}
            {step.onClick ? (
              <button
                type="button"
                onClick={step.onClick}
                className={cn(
                  HORIZONTAL_TIMELINE_STYLES.dot,
                  STATE_DOTS[step.state],
                  'cursor-pointer'
                )}
              >
                <Icon className={HORIZONTAL_TIMELINE_STYLES.icon} aria-hidden="true" />
              </button>
            ) : (
              <span className={cn(HORIZONTAL_TIMELINE_STYLES.dot, STATE_DOTS[step.state])}>
                <Icon className={HORIZONTAL_TIMELINE_STYLES.icon} aria-hidden="true" />
              </span>
            )}
            <span
              className={cn(
                HORIZONTAL_TIMELINE_STYLES.label,
                isDone ? HORIZONTAL_TIMELINE_STYLES.labelDone : HORIZONTAL_TIMELINE_STYLES.labelIdle
              )}
            >
              {step.label}
            </span>
            {step.hint && <span className={HORIZONTAL_TIMELINE_STYLES.hint}>{step.hint}</span>}
          </li>
          {next && (
            <span
              aria-hidden="true"
              className={cn(HORIZONTAL_TIMELINE_STYLES.connector, STATE_CONNECTORS[next.state])}
            />
          )}
        </Fragment>
      )
    })}
  </ol>
)
