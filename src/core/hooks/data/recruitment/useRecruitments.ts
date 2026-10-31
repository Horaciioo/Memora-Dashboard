'use client'

import { useCallback, useState } from 'react'

import { apiDelete, apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { entityFeedback } from '@/declarations/ui/copy'
import type { FieldIssue, FormValues } from '@/types/forms'
import type { RecruitmentSummary } from '@/types/recruitment'

/**
 * Recruitment session list state and mutations
 * @typedef {Object} RecruitmentCollection
 * @property {RecruitmentSummary[]} sessions - Declared sessions
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {() => void} clearIssues - Forget the rejections
 * @property {(values: FormValues) => Promise<boolean>} create - Open a session
 * @property {(id: string, values: FormValues) => Promise<boolean>} update - Edit a session
 * @property {(id: string) => Promise<void>} remove - Drop a session
 * @property {(summary: RecruitmentSummary) => void} replace - Swap in a session
 */

export interface RecruitmentCollection {
  sessions: RecruitmentSummary[]
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  create: (values: FormValues) => Promise<boolean>
  update: (id: string, values: FormValues) => Promise<boolean>
  remove: (id: string) => Promise<void>
  replace: (summary: RecruitmentSummary) => void
}

/**
 * Drive the recruitment session list
 * @param {RecruitmentSummary[]} initialSessions - Sessions resolved server-side
 * @return {RecruitmentCollection} - State and mutations
 */

export const useRecruitments = (initialSessions: RecruitmentSummary[]): RecruitmentCollection => {
  const [sessions, setSessions] = useState(initialSessions)
  const { isSaving, issues, clearIssues, run } = useMutation()

  const create = useCallback(
    async (values: FormValues) => {
      const name = typeof values.name === 'string' ? values.name : undefined
      const created = await run(
        () => apiPost<RecruitmentSummary>(API_ROUTES.recruitments, values),
        entityFeedback('recruitment', 'created', name)
      )

      if (created) setSessions((current) => [created, ...current])

      return created !== null
    },
    [run]
  )

  const update = useCallback(
    async (id: string, values: FormValues) => {
      const name = typeof values.name === 'string' ? values.name : undefined
      const saved = await run(
        () => apiPatch<RecruitmentSummary>(API_ROUTES.recruitment(id), values),
        entityFeedback('recruitment', 'saved', name)
      )

      if (saved) {
        setSessions((current) => current.map((entry) => (entry.id === id ? saved : entry)))
      }

      return saved !== null
    },
    [run]
  )

  const remove = useCallback(
    async (id: string) => {
      const dropped = await run(
        () => apiDelete<null>(API_ROUTES.recruitment(id)),
        entityFeedback('recruitment', 'deleted')
      )

      if (dropped !== null) {
        setSessions((current) => current.filter((entry) => entry.id !== id))
      }
    },
    [run]
  )

  const replace = useCallback(
    (summary: RecruitmentSummary) =>
      setSessions((current) => current.map((entry) => (entry.id === summary.id ? summary : entry))),
    []
  )

  return { sessions, isSaving, issues, clearIssues, create, update, remove, replace }
}
