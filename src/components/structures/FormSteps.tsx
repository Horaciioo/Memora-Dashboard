'use client'

import { Fragment } from 'react'
import { ICONS } from '@/declarations/ui/icons'
import { FORM_STEPS_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * One category of a form declaration
 * @typedef {Object} FormStep
 * @property {string} name - Category label, also its key
 * @property {boolean} flagged - Holds at least one rejection
 */

export interface FormStep {
  name: string
  flagged: boolean
}

export interface FormStepsProps {
  steps: FormStep[]
  value: string
  onChange: (value: string) => void
  label: string
}

/**
 * Trail of the categories a form is split into, one panel of fields showing at a time
 * @param {FormStep[]} steps - Categories in declaration order
 * @param {string} value - Category on screen
 * @param {(value: string) => void} onChange - Selection handler
 * @param {string} label - Accessible name of the trail
 * @return {JSX.Element}
 */

export const FormSteps = ({ steps, value, onChange, label }: FormStepsProps) => {
  const Separator = ICONS.next

  return (
    <nav aria-label={label} className={FORM_STEPS_STYLES.trail}>
      {steps.map((step, index) => {
        const isCurrent = step.name === value

        return (
          <Fragment key={step.name}>
            {index > 0 && <Separator className={FORM_STEPS_STYLES.separator} aria-hidden="true" />}
            <button
              type="button"
              aria-current={isCurrent ? 'step' : undefined}
              onClick={() => onChange(step.name)}
              className={cn(
                FORM_STEPS_STYLES.crumb,
                isCurrent ? FORM_STEPS_STYLES.current : FORM_STEPS_STYLES.idle,
                step.flagged && !isCurrent && FORM_STEPS_STYLES.flagged
              )}
            >
              {step.name}
            </button>
          </Fragment>
        )
      })}
    </nav>
  )
}
