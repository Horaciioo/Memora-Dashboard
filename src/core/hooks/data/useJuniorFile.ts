'use client'

import { useCallback, useState } from 'react'

import { apiDelete, apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { FEEDBACK_COPY } from '@/declarations/ui/copy'
import type { AcademyReviewView, JuniorView } from '@/types/academy'
import type { FieldIssue, FormValues } from '@/types/forms'

/**
 * Individual follow-up file state and mutations
 * @typedef {Object} JuniorFileState
 * @property {JuniorView} junior - Junior being followed
 * @property {AcademyReviewView[]} reviews - Voice check-ins
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {() => void} clearIssues - Forget the rejections
 * @property {(trainingId: string, validated: boolean) => Promise<void>} setTraining - Validate a training
 * @property {(values: FormValues) => Promise<boolean>} save - Edit the follow-up
 * @property {(values: FormValues) => Promise<boolean>} addReview - Write a check-in
 * @property {(id: string, values: FormValues) => Promise<boolean>} editReview - Edit a check-in
 * @property {(id: string) => Promise<void>} dropReview - Drop a check-in
 */

export interface JuniorFileState {
  junior: JuniorView
  reviews: AcademyReviewView[]
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  setTraining: (trainingId: string, validated: boolean) => Promise<void>
  save: (values: FormValues) => Promise<boolean>
  addReview: (values: FormValues) => Promise<boolean>
  editReview: (id: string, values: FormValues) => Promise<boolean>
  dropReview: (id: string) => Promise<void>
}

/**
 * Drive one individual follow-up file
 * @param {JuniorView} initialJunior - Junior resolved server-side
 * @param {AcademyReviewView[]} initialReviews - Check-ins resolved server-side
 * @return {JuniorFileState} - State and mutations
 */

export const useJuniorFile = (
  initialJunior: JuniorView,
  initialReviews: AcademyReviewView[]
): JuniorFileState => {
  const [junior, setJunior] = useState(initialJunior)
  const [reviews, setReviews] = useState(initialReviews)
  const { isSaving, issues, clearIssues, run } = useMutation()

  // Every junior mutation answers with the whole session, so the file picks its own row back
  const pickSelf = useCallback((rows: JuniorView[] | null, id: string) => {
    const mine = rows?.find((row) => row.id === id)
    if (mine) setJunior(mine)

    return rows !== null
  }, [])

  const setTraining = useCallback(
    async (trainingId: string, validated: boolean) => {
      const next = await run(() =>
        apiPatch<JuniorView[]>(API_ROUTES.juniorTrainings(junior.id), { trainingId, validated })
      )

      pickSelf(next, junior.id)
    },
    [junior.id, pickSelf, run]
  )

  const save = useCallback(
    async (values: FormValues) => {
      const next = await run(
        () => apiPatch<JuniorView[]>(API_ROUTES.junior(junior.id), values),
        FEEDBACK_COPY.saved
      )

      return pickSelf(next, junior.id)
    },
    [junior.id, pickSelf, run]
  )

  const addReview = useCallback(
    async (values: FormValues) => {
      const next = await run(
        () => apiPost<AcademyReviewView[]>(API_ROUTES.juniorReviews(junior.id), values),
        FEEDBACK_COPY.created
      )

      if (next) setReviews(next)

      return next !== null
    },
    [junior.id, run]
  )

  const editReview = useCallback(
    async (id: string, values: FormValues) => {
      const next = await run(
        () => apiPatch<AcademyReviewView[]>(API_ROUTES.review(id), values),
        FEEDBACK_COPY.saved
      )

      if (next) setReviews(next)

      return next !== null
    },
    [run]
  )

  const dropReview = useCallback(
    async (id: string) => {
      const next = await run(
        () => apiDelete<AcademyReviewView[]>(API_ROUTES.review(id)),
        FEEDBACK_COPY.deleted
      )

      if (next) setReviews(next)
    },
    [run]
  )

  return {
    junior,
    reviews,
    isSaving,
    issues,
    clearIssues,
    setTraining,
    save,
    addReview,
    editReview,
    dropReview,
  }
}
