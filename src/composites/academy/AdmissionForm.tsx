'use client'

import { useState } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { FormRenderer } from '@/components/structures/FormRenderer'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { ADMISSION_COPY } from '@/declarations/academy/copy'
import type { FieldDefinition, FieldValue, FormValues } from '@/types/forms'

export interface AdmissionFormProps {
  token: string
  fields: FieldDefinition[]
}

/**
 * Public admission form — submits once, then hands off to the Formateurs
 * @param {string} token - Invite token the form answers to
 * @param {FieldDefinition[]} fields - Declarations of the admission form
 * @return {JSX.Element}
 */

export const AdmissionForm = ({ token, fields }: AdmissionFormProps) => {
  const [values, setValues] = useState<FormValues>({})
  const [submitted, setSubmitted] = useState(false)
  const { isSaving, issues, run } = useMutation()

  const onChange = (name: string, value: FieldValue) =>
    setValues((current) => ({ ...current, [name]: value }))

  const submit = async () => {
    const result = await run(() => apiPost<{ ok: boolean }>(API_ROUTES.admission(token), values))
    if (result) setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col gap-1">
        <p className="font-medium">{ADMISSION_COPY.successTitle}</p>
        <p className="text-sm text-[var(--color-ink-subtle)]">
          {ADMISSION_COPY.successDescription}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <FormRenderer
        fields={fields}
        values={values}
        issues={issues}
        onChange={onChange}
        disabled={isSaving}
      />
      <Button variant="primary" disabled={isSaving} onClick={() => void submit()}>
        {isSaving ? ADMISSION_COPY.pending : ADMISSION_COPY.submit}
      </Button>
    </div>
  )
}
