'use client'

import { useCallback, useState } from 'react'

import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { FEEDBACK_COPY } from '@/declarations/ui/copy'
import type { FieldIssue, FormValues } from '@/types/forms'
import type { LiveconStateView } from '@/types/livecon'

/**
 * Livecon state and mutations
 * @typedef {Object} LiveconCollection
 * @property {LiveconStateView[]} state - Levels in force
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {() => void} clearIssues - Forget the rejections
 * @property {(values: FormValues) => Promise<boolean>} apply - Switch a level
 */

export interface LiveconCollection {
  state: LiveconStateView[]
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  apply: (values: FormValues) => Promise<boolean>
}

/**
 * Drive the livecon switches
 * @param {LiveconStateView[]} initialState - Levels resolved server-side
 * @return {LiveconCollection} - State and mutations
 */

export const useLivecon = (initialState: LiveconStateView[]): LiveconCollection => {
  const [state, setState] = useState(initialState)
  const { isSaving, issues, clearIssues, run } = useMutation()

  const apply = useCallback(
    async (values: FormValues) => {
      const next = await run(
        () => apiPost<LiveconStateView[]>(API_ROUTES.livecon, values),
        FEEDBACK_COPY.saved
      )

      if (next) setState(next)

      return next !== null
    },
    [run]
  )

  return { state, isSaving, issues, clearIssues, apply }
}
