'use client'

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Progress } from '@/components/elements/feedback/Progress'
import { FormRenderer } from '@/components/structures/FormRenderer'
import {
  StepTimeline,
  type StepState,
  type TimelineStep,
} from '@/components/structures/StepTimeline'
import { collectMissingRequired } from '@/core/lib/forms'
import { WIZARD_STYLES } from '@/declarations/ui/variants'
import type { FieldDefinition, FieldIssue, FieldValue, FormValues } from '@/types/forms'

/**
 * One stop of a wizard, either driven by field declarations or drawn by the caller
 * @typedef {Object} WizardStep
 * @property {string} id - Step identifier
 * @property {string} label - Step caption
 * @property {string} [hint] - Supporting line under the caption
 * @property {FieldDefinition[]} [fields] - Declarations rendered by the form engine
 * @property {ReactNode} [render] - Body drawn by the caller
 * @property {ReactNode} [notice] - Standing message drawn under the body
 * @property {boolean} [blocked] - Holds the step whatever its fields say
 */

export interface WizardStep {
  id: string
  label: string
  hint?: string
  fields?: FieldDefinition[]
  render?: ReactNode
  notice?: ReactNode
  blocked?: boolean
}

export interface FormWizardProps {
  steps: WizardStep[]
  values: FormValues
  issues: FieldIssue[]
  onChange: (name: string, value: FieldValue) => void
  onSubmit: () => void
  label: string
  nextLabel: string
  previousLabel: string
  submitLabel: string
  counter: (index: number, total: number) => string
  disabled?: boolean
  idPrefix?: string
}

/**
 * Linear form split into steps, gated on the required fields of the step on screen
 * @param {WizardStep[]} steps - Steps in display order
 * @param {FormValues} values - Current values
 * @param {FieldIssue[]} issues - Rejections returned by the server
 * @param {(name: string, value: FieldValue) => void} onChange - Value handler
 * @param {() => void} onSubmit - Called on the last step
 * @param {string} label - Accessible name of the progress
 * @param {string} nextLabel - Caption of the forward move
 * @param {string} previousLabel - Caption of the backward move
 * @param {string} submitLabel - Caption of the last move
 * @param {(index: number, total: number) => string} counter - Builds the step counter
 * @param {boolean} [disabled] - Blocks every control
 * @param {string} [idPrefix] - Namespace of the generated identifiers
 * @return {JSX.Element}
 */

export const FormWizard = ({
  steps,
  values,
  issues,
  onChange,
  onSubmit,
  label,
  nextLabel,
  previousLabel,
  submitLabel,
  counter,
  disabled,
  idPrefix = 'wizard',
}: FormWizardProps) => {
  const [index, setIndex] = useState(0)

  // A rejection always shows on the step that carries the field it belongs to
  const rejected = useMemo(() => {
    if (issues.length === 0) return null

    return steps.findIndex((step) =>
      step.fields?.some((field) => issues.some((issue) => issue.field === field.name))
    )
  }, [issues, steps])

  const current = rejected !== null && rejected >= 0 ? rejected : Math.min(index, steps.length - 1)
  const step = steps[current]
  const isLast = current === steps.length - 1

  const missing = step.fields ? collectMissingRequired(step.fields, values) : []
  const held = Boolean(step.blocked) || missing.length > 0

  const stateOf = (position: number): StepState => {
    if (position < current) return 'done'
    return position === current ? 'current' : 'idle'
  }

  const rail: TimelineStep[] = steps.map((entry, position) => ({
    id: entry.id,
    label: entry.label,
    hint: entry.hint,
    state: stateOf(position),
    // Only a step already cleared is walkable backwards
    ...(position < current ? { onClick: () => setIndex(position) } : {}),
  }))

  return (
    <div className={WIZARD_STYLES.frame}>
      <div className={WIZARD_STYLES.header}>
        <Progress value={current + 1} max={steps.length} label={label} compact />
        <StepTimeline steps={rail} label={label} className={WIZARD_STYLES.rail} />

        <div className={WIZARD_STYLES.heading}>
          <span className={WIZARD_STYLES.counter}>{counter(current + 1, steps.length)}</span>
          <h2 className={WIZARD_STYLES.title}>{step.label}</h2>
          {step.hint && <p className={WIZARD_STYLES.hint}>{step.hint}</p>}
        </div>
      </div>

      <div className={WIZARD_STYLES.body}>
        {step.fields ? (
          <FormRenderer
            fields={step.fields}
            values={values}
            issues={issues}
            onChange={onChange}
            disabled={disabled}
            idPrefix={`${idPrefix}-${step.id}`}
          />
        ) : (
          step.render
        )}
        {step.notice}
      </div>

      <div className={WIZARD_STYLES.footer}>
        <Button
          icon="back"
          disabled={disabled || current === 0}
          onClick={() => setIndex(current - 1)}
        >
          {previousLabel}
        </Button>

        <Button
          variant="primary"
          iconAfter={isLast ? undefined : 'forward'}
          disabled={disabled || held}
          onClick={() => (isLast ? onSubmit() : setIndex(current + 1))}
        >
          {isLast ? submitLabel : nextLabel}
        </Button>
      </div>
    </div>
  )
}
