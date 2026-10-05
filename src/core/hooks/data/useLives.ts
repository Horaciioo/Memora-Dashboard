'use client'

import { useCallback, useState } from 'react'

import { apiGet, apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { feedbackTitle } from '@/declarations/ui/copy'
import type { FieldIssue, FormValues } from '@/types/forms'
import type { LiveView } from '@/types/lives'
import type { LiveStatusName } from '@/utils/constants/lives'

// Toast entity label
const ENTITY = 'Live'
const GENDER = 'masculine'

/**
 * Live state and mutations
 * @typedef {Object} LiveCollection
 * @property {LiveView[]} lives - Open lives
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {() => void} clearIssues - Forget the rejections
 * @property {(values: FormValues) => Promise<boolean>} announce - Announce a live
 * @property {(id: string, status: LiveStatusName) => Promise<boolean>} move - Change its status
 */

export interface LiveCollection {
  lives: LiveView[]
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  announce: (values: FormValues) => Promise<boolean>
  move: (id: string, status: LiveStatusName) => Promise<boolean>
}

/**
 * Drive the open lives
 * @param {LiveView[]} initialLives - Lives resolved server-side
 * @return {LiveCollection} - State and mutations
 */

export const useLives = (initialLives: LiveView[]): LiveCollection => {
  const [lives, setLives] = useState(initialLives)
  const { isSaving, issues, clearIssues, run } = useMutation()

  const announce = useCallback(
    async (values: FormValues) => {
      const created = await run(
        () => apiPost<{ id: string }>(API_ROUTES.lives, values),
        feedbackTitle(ENTITY, 'created', GENDER)
      )
      if (!created) return false

      // Reread the list
      setLives(await apiGet<LiveView[]>(API_ROUTES.lives))

      return true
    },
    [run]
  )

  const move = useCallback(
    async (id: string, status: LiveStatusName) => {
      const live = await run(
        () => apiPatch<LiveView>(API_ROUTES.live(id), { status }),
        feedbackTitle(ENTITY, 'saved', GENDER)
      )
      if (!live) return false

      setLives((current) => current.map((entry) => (entry.id === id ? live : entry)))

      return true
    },
    [run]
  )

  return { lives, isSaving, issues, clearIssues, announce, move }
}
