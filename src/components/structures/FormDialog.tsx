'use client'

import { useState } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { Dialog } from '@/components/structures/Dialog'
import { FormRenderer } from '@/components/structures/FormRenderer'
import { emptyValues } from '@/core/lib/forms'
import { ACTION_COPY } from '@/declarations/ui/copy'
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
 * Overlay wrapping the form engine, closing itself once the submission goes through
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
        fields={fields}
        values={values}
        issues={issues}
        onChange={change}
        disabled={isSaving}
      />
    </Dialog>
  )
}
