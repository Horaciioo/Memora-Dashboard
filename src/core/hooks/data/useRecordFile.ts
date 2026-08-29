'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

import { apiPatch } from '@/core/lib/api/client'
import { useMutation } from '@/core/hooks/data/useMutation'
import { feedbackTitle } from '@/declarations/ui/copy'
import { BOARD_ENTITY_COPY } from '@/declarations/work/copy'
import type { FieldIssue, FieldValue, FormValues } from '@/types/forms'
import type { WorkflowScopeName } from '@/utils/constants/workflow'

/**
 * File state and inline mutations of one work record
 * @typedef {Object} RecordFile
 * @property {FormValues} values - Current field values
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {() => void} clearIssues - Forget the rejections
 * @property {(name: string, value: FieldValue) => Promise<boolean>} saveField - Commit one field
 * @property {(patch: FormValues) => Promise<boolean>} saveFields - Commit a group of fields
 */

export interface RecordFile {
  values: FormValues
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  saveField: (name: string, value: FieldValue) => Promise<boolean>
  saveFields: (patch: FormValues) => Promise<boolean>
}

/**
 * Drive one work file, every commit sending the whole record
 * @param {Object} input - File context
 * @param {string} input.path - Item route of the record
 * @param {WorkflowScopeName} input.scope - Board scope, naming the toasts
 * @param {FormValues} input.initialValues - Values resolved server-side
 * @return {RecordFile} - State and mutations
 */

export const useRecordFile = ({
  path,
  scope,
  initialValues,
}: {
  path: string
  scope: WorkflowScopeName
  initialValues: FormValues
}): RecordFile => {
  const router = useRouter()
  // Kept in sync with every commit, always sent in full to the PATCH route
  const [values, setValues] = useState<FormValues>(initialValues)
  const { isSaving, issues, clearIssues, run } = useMutation()

  const commit = useCallback(
    async (next: FormValues) => {
      const entity = BOARD_ENTITY_COPY[scope]
      const name = typeof next.title === 'string' ? next.title : undefined
      const saved = await run(
        () => apiPatch(path, next),
        feedbackTitle(entity.label, 'saved', entity.gender, name)
      )

      // A saved record re-records the journal event, so the logs surface needs the refresh
      if (saved !== null) {
        setValues(next)
        router.refresh()
      }

      return saved !== null
    },
    [path, scope, run, router]
  )

  const saveField = useCallback(
    (name: string, value: FieldValue) => commit({ ...values, [name]: value }),
    [values, commit]
  )

  const saveFields = useCallback(
    (patch: FormValues) => commit({ ...values, ...patch }),
    [values, commit]
  )

  return { values, isSaving, issues, clearIssues, saveField, saveFields }
}
