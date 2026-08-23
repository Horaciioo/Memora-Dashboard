'use client'

import { useCallback, useState } from 'react'

import { apiDelete, apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { feedbackTitle } from '@/declarations/ui/copy'
import type { FieldIssue, FormValues } from '@/types/forms'
import type { MemberAbsence } from '@/types/members'
import type { AbsenceStatusName } from '@/utils/constants/workflow'

// Toast entity label
const ENTITY = 'Absence'
const GENDER = 'feminine'

/**
 * Absence state and mutations
 * @typedef {Object} AbsenceCollection
 * @property {MemberAbsence[]} absences - Current requests
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {() => void} clearIssues - Forget the rejections
 * @property {(values: FormValues) => Promise<boolean>} create - Declare an absence
 * @property {(id: string, status: AbsenceStatusName, values: FormValues) => Promise<boolean>} review - Settle a request
 * @property {(id: string) => Promise<void>} remove - Withdraw a request
 */

export interface AbsenceCollection {
  absences: MemberAbsence[]
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  create: (values: FormValues) => Promise<boolean>
  review: (id: string, status: AbsenceStatusName, values: FormValues) => Promise<boolean>
  remove: (id: string) => Promise<void>
}

/**
 * Drive the absence requests
 * @param {MemberAbsence[]} initialAbsences - Requests resolved server-side
 * @return {AbsenceCollection} - State and mutations
 */

export const useAbsences = (initialAbsences: MemberAbsence[]): AbsenceCollection => {
  const [absences, setAbsences] = useState(initialAbsences)
  const { isSaving, issues, clearIssues, run } = useMutation()

  const create = useCallback(
    async (values: FormValues) => {
      const absence = await run(
        () => apiPost<MemberAbsence>(API_ROUTES.absences, values),
        feedbackTitle(ENTITY, 'created', GENDER)
      )

      if (absence) setAbsences((current) => [absence, ...current])

      return absence !== null
    },
    [run]
  )

  const review = useCallback(
    async (id: string, status: AbsenceStatusName, values: FormValues) => {
      const absence = await run(
        () => apiPatch<MemberAbsence>(API_ROUTES.absence(id), { ...values, status }),
        feedbackTitle(ENTITY, 'saved', GENDER)
      )

      if (absence) {
        setAbsences((current) => current.map((entry) => (entry.id === id ? absence : entry)))
      }

      return absence !== null
    },
    [run]
  )

  const remove = useCallback(
    async (id: string) => {
      const done = await run(
        () => apiDelete<{ id: string }>(API_ROUTES.absence(id)),
        feedbackTitle(ENTITY, 'deleted', GENDER)
      )

      if (done) setAbsences((current) => current.filter((entry) => entry.id !== id))
    },
    [run]
  )

  return { absences, isSaving, issues, clearIssues, create, review, remove }
}
