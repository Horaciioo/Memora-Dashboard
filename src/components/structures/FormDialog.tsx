'use client'

import { useState } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { Dialog } from '@/components/structures/Dialog'
import { FormRenderer } from '@/components/structures/FormRenderer'
import { FormSteps, type FormStep } from '@/components/structures/FormSteps'
import { emptyValues, groupFields } from '@/core/lib/forms'
import { ACTION_COPY, FORM_COPY } from '@/declarations/ui/copy'
import type { IconName } from '@/declarations/ui/icons'
import type { DialogSize } from '@/declarations/ui/variants'
import type { FieldDefinition, FieldIssue, FieldValue, FormValues } from '@/types/forms'

export interface FormDialogProps {
  open: boolean
  title: string
  description?: string
  // Glyph of the header badge, add or edit depending on initialValues by default
  icon?: IconName
  fields: FieldDefinition[]
  initialValues?: FormValues
  issues: FieldIssue[]
  isSaving: boolean
  submitLabel?: string
  size?: DialogSize
  onSubmit: (values: FormValues) => Promise<boolean>
  onClose: () => void
}

/**
 * Overlay wrapping the form engine, its declared categories running as a trail under the
 * title and one category of fields on screen at a time
 * @param {boolean} open - Overlay is mounted
 * @param {string} title - Overlay title
 * @param {string} [description] - Supporting line under the title
 * @param {IconName} [icon] - Glyph of the header badge
 * @param {FieldDefinition[]} fields - Field declarations
 * @param {FormValues} [initialValues] - Values of the edited record
 * @param {FieldIssue[]} issues - Rejections returned by the server
 * @param {boolean} isSaving - Submission in flight
 * @param {string} [submitLabel] - Label of the confirming button
 * @param {DialogSize} [size] - Panel width
 * @param {(values: FormValues) => Promise<boolean>} onSubmit - Submission handler
 * @param {() => void} onClose - Dismiss handler
 * @return {JSX.Element}
 */

export const FormDialog = ({
  open,
  title,
  description,
  icon,
  fields,
  initialValues,
  issues,
  isSaving,
  submitLabel,
  size,
  onSubmit,
  onClose,
}: FormDialogProps) => {
  const [session, setSession] = useState({
    open,
    values: initialValues ?? emptyValues(fields),
  })

  // Reopening the overlay always starts from the record being edited
  if (session.open !== open) {
    setSession({ open, values: open ? (initialValues ?? emptyValues(fields)) : session.values })
  }

  const values = session.values
  const setValues = (next: FormValues) => setSession((current) => ({ ...current, values: next }))

  const change = (name: string, value: FieldValue) => setValues({ ...values, [name]: value })

  const groups = groupFields(fields, values)

  const steps: FormStep[] = groups.map((group) => ({
    name: group.name,
    flagged: group.fields.some((field) => issues.some((issue) => issue.field === field.name)),
  }))

  const [trail, setTrail] = useState({ issues, open, group: groups[0]?.name ?? '' })

  // Reopening starts on the first category, a rejection jumps to the flagged one
  if (trail.issues !== issues || trail.open !== open) {
    const flagged = steps.find((step) => step.flagged)
    setTrail({
      issues,
      open,
      group: flagged?.name ?? (trail.open === open ? trail.group : (groups[0]?.name ?? '')),
    })
  }

  const current = groups.find((group) => group.name === trail.group) ?? groups[0]

  const submit = async () => {
    const accepted = await onSubmit(values)
    if (accepted) onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
      icon={icon ?? (initialValues ? 'edit' : 'add')}
      subheader={
        groups.length > 1 && (
          <FormSteps
            steps={steps}
            value={current?.name ?? ''}
            label={FORM_COPY.categories}
            onChange={(group) => setTrail({ issues, open, group })}
          />
        )
      }
      footer={
        <>
          <Button onClick={onClose} disabled={isSaving}>
            {ACTION_COPY.cancel}
          </Button>
          <Button variant="primary" icon="confirm" onClick={submit} disabled={isSaving}>
            {isSaving ? ACTION_COPY.saving : (submitLabel ?? ACTION_COPY.save)}
          </Button>
        </>
      }
    >
      <FormRenderer
        fields={current?.fields ?? []}
        values={values}
        issues={issues}
        onChange={change}
        disabled={isSaving}
      />
    </Dialog>
  )
}
