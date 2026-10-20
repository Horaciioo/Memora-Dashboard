'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

import { apiPatch } from '@/core/lib/api/client'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { feedbackTitle } from '@/declarations/ui/copy'
import { BOARD_ENTITY_COPY } from '@/declarations/work/copy'
import type { FieldIssue, FieldValue, FormValues } from '@/types/forms'
import type { WorkflowScopeName } from '@/utils/constants/workflow'

/**
 * Wording of the toast naming a record
 * @typedef {Object} EntityCopy
 * @property {string} label - Singular label
 * @property {'masculine' | 'feminine'} gender - Grammatical gender
 */

export interface EntityCopy {
  label: string
  gender: 'masculine' | 'feminine'
}

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
 * Drive one work file
 * @param {Object} input - File context
 * @param {string} input.path - Item route of the record
 * @param {WorkflowScopeName} [input.scope] - Board scope
 * @param {EntityCopy} [input.entity] - Toast wording when there is no board scope
 * @param {FormValues} input.initialValues - Values resolved server-side
 * @return {RecordFile} - State and mutations
 */

export const useRecordFile = ({
  path,
  scope,
  entity: ownEntity,
  initialValues,
}: {
  path: string
  scope?: WorkflowScopeName
  entity?: EntityCopy
  initialValues: FormValues
}): RecordFile => {
  const router = useRouter()
  // Kept in sync with every commit
  const [values, setValues] = useState<FormValues>(initialValues)
  // A refreshed page hands over the values as the server now holds them
  const [served, setServed] = useState(initialValues)
  if (served !== initialValues) {
    setServed(initialValues)
    setValues(initialValues)
  }
  const { isSaving, issues, clearIssues, run } = useMutation()

  const commit = useCallback(
    async (next: FormValues) => {
      const entity = ownEntity ?? BOARD_ENTITY_COPY[scope!]
      const name = [next.title, next.name].find((value) => typeof value === 'string') as
        string | undefined
      const saved = await run(
        () => apiPatch(path, next),
        feedbackTitle(entity.label, 'saved', entity.gender, name)
      )

      // A saved record re-records the journal event
      if (saved !== null) {
        setValues(next)
        router.refresh()
      }

      return saved !== null
    },
    [path, scope, ownEntity, run, router]
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
