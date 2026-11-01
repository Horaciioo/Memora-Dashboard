'use client'

import { useCallback, useState } from 'react'

import { apiDelete } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { SECURITY_COPY } from '@/declarations/preferences/settings'
import type { AccountSession } from '@/types/preferences'

/**
 * Open sessions and the two ways to close them
 * @typedef {Object} SessionsState
 * @property {AccountSession[]} sessions - Sessions still open
 * @property {boolean} isSaving - Mutation in flight
 * @property {(id: string) => Promise<void>} close - Close one session
 * @property {() => Promise<void>} closeOthers - Close all but the current one
 */

export interface SessionsState {
  sessions: AccountSession[]
  isSaving: boolean
  close: (id: string) => Promise<void>
  closeOthers: () => Promise<void>
}

/**
 * Drive the open sessions of the signed-in member
 * @param {AccountSession[]} initial - Sessions resolved server-side
 * @return {SessionsState} - State and mutations
 */

export const useSessions = (initial: AccountSession[]): SessionsState => {
  const [sessions, setSessions] = useState(initial)
  const { isSaving, run } = useMutation()

  const close = useCallback(
    async (id: string) => {
      const done = await run(() => apiDelete(API_ROUTES.openSession(id)), SECURITY_COPY.closedOne)
      if (done) setSessions((current) => current.filter((session) => session.id !== id))
    },
    [run]
  )

  const closeOthers = useCallback(async () => {
    const done = await run(() => apiDelete(API_ROUTES.openSessions), SECURITY_COPY.closedOthers)
    if (done) setSessions((current) => current.filter((session) => session.isCurrent))
  }, [run])

  return { sessions, isSaving, close, closeOthers }
}
