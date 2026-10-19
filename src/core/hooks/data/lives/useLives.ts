'use client'

import { useCallback, useState } from 'react'

import { isOpenLive } from '@/core/lib/lives/permissions'
import { apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { feedbackTitle } from '@/declarations/ui/copy'
import type { LiveView } from '@/types/lives'
import { LIVE_COPY } from '@/declarations/lives/copy'
import { LiveStatuses } from '@/utils/constants/lives'
import type { LiveStatusName } from '@/utils/constants/lives'

// Toast entity label
const ENTITY = 'Live'
const GENDER = 'masculine'

/**
 * Live state and mutations
 * @typedef {Object} LiveCollection
 * @property {LiveView[]} lives - Open lives
 * @property {LiveView[]} recent - Lives closed within the day
 * @property {boolean} isSaving - Mutation in flight
 * @property {string | null} endedId - Live just closed, its report is offered
 * @property {() => void} dismissEnded - Leave the report for later
 * @property {(id: string, status: LiveStatusName) => Promise<boolean>} move - Change its status
 * @property {(id: string) => Promise<boolean>} reopen - Put back a live closed too soon
 */

export interface LiveCollection {
  lives: LiveView[]
  recent: LiveView[]
  isSaving: boolean
  endedId: string | null
  dismissEnded: () => void
  move: (id: string, status: LiveStatusName) => Promise<boolean>
  reopen: (id: string) => Promise<boolean>
}

/**
 * Drive the open lives
 * @param {LiveView[]} initialLives - Lives resolved server-side
 * @param {LiveView[]} initialRecent - Lives closed within the day
 * @return {LiveCollection} - State and mutations
 */

export const useLives = (initialLives: LiveView[], initialRecent: LiveView[]): LiveCollection => {
  const [lives, setLives] = useState(initialLives)
  const [recent, setRecent] = useState(initialRecent)
  const [endedId, setEndedId] = useState<string | null>(null)
  const { isSaving, run } = useMutation()

  const move = useCallback(
    async (id: string, status: LiveStatusName) => {
      const live = await run(
        () => apiPatch<LiveView>(API_ROUTES.live(id), { status }),
        feedbackTitle(ENTITY, 'saved', GENDER)
      )
      if (!live) return false

      // A closed live moves to the past ones, a cancelled one leaves
      setLives((current) =>
        isOpenLive(live.status)
          ? current.map((entry) => (entry.id === id ? live : entry))
          : current.filter((entry) => entry.id !== id)
      )
      if (live.status === LiveStatuses.Ended) {
        setRecent((current) => [live, ...current])
        setEndedId(live.id)
      }

      return true
    },
    [run]
  )

  // A live put back runs again
  const reopen = useCallback(
    async (id: string) => {
      const live = await run(
        () => apiPost<LiveView>(API_ROUTES.liveReopen(id), {}),
        LIVE_COPY.reopened
      )
      if (!live) return false

      setRecent((current) => current.filter((entry) => entry.id !== id))
      setLives((current) =>
        [...current, live].sort((left, right) =>
          left.plannedStartAt.localeCompare(right.plannedStartAt)
        )
      )

      return true
    },
    [run]
  )

  const dismissEnded = useCallback(() => setEndedId(null), [])

  return { lives, recent, isSaving, endedId, dismissEnded, move, reopen }
}
