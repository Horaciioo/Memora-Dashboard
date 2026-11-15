'use client'

import { useCallback, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { useMutation } from '@/core/hooks/data/system/useMutation'
import { ApiClientError, apiGet, apiPost } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { UnbanActions } from '@/core/lib/unban/actions'
import type { UnbanActionName } from '@/core/lib/unban/actions'
import type { ActivityEntry } from '@/core/services/system/ActivityService'
import { UNBAN_COPY } from '@/declarations/unban/copy'
import type { FieldIssue } from '@/types/forms'
import type { UnbanRequestDetail } from '@/types/unban'
import { ErrorCodes } from '@/utils/constants/errors'

// Route segment each action writes to
const ACTION_ROUTES: Record<UnbanActionName, string> = {
  [UnbanActions.Take]: 'take',
  [UnbanActions.Release]: 'release',
  [UnbanActions.Assign]: 'assign',
  [UnbanActions.Accept]: 'decision',
  [UnbanActions.Refuse]: 'decision',
  [UnbanActions.Reopen]: 'reopen',
  [UnbanActions.Lift]: 'discord',
}

// Outcome each decision action carries
const OUTCOMES: Partial<Record<UnbanActionName, string>> = {
  [UnbanActions.Accept]: 'ACCEPTED',
  [UnbanActions.Refuse]: 'REFUSED',
}

/**
 * One request with its journal and the things that can be done to it
 * @typedef {Object} UnbanRequestFile
 * @property {UnbanRequestDetail | undefined} detail - File once read
 * @property {ActivityEntry[]} history - Journal, newest first
 * @property {string | null} conflict - Words about a write that lost
 * @property {boolean} isSaving - Write in flight
 * @property {FieldIssue[]} issues - Rejections of the last write
 * @property {() => void} clearIssues - Forget the rejections
 * @property {() => void} dismissConflict - Hide the conflict banner
 * @property {(action: UnbanActionName, values?: Record<string, unknown>) => Promise<boolean>} act - Do one thing to the request
 * @property {(choice: 'FOR' | 'AGAINST') => Promise<void>} vote - Take a side, again to take it back
 */

export interface UnbanRequestFile {
  detail: UnbanRequestDetail | undefined
  history: ActivityEntry[]
  conflict: string | null
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  dismissConflict: () => void
  act: (action: UnbanActionName, values?: Record<string, unknown>) => Promise<boolean>
  vote: (choice: 'FOR' | 'AGAINST') => Promise<void>
}

/**
 * Drive one request, a lost write reads the file again and keeps what was typed
 * @param {string | null} id - Request identifier, null for none
 * @return {UnbanRequestFile} - State and writes
 */

export const useUnbanRequest = (id: string | null): UnbanRequestFile => {
  const queryClient = useQueryClient()
  const { isSaving, issues, clearIssues, run } = useMutation()
  const [conflict, setConflict] = useState<string | null>(null)

  const { data: detail } = useQuery({
    queryKey: QUERY_KEYS.unbanRequest(id ?? ''),
    queryFn: () => apiGet<UnbanRequestDetail>(API_ROUTES.unbanRequest(id!)),
    enabled: id !== null,
  })
  const { data: history = [] } = useQuery({
    queryKey: QUERY_KEYS.unbanHistory(id ?? ''),
    queryFn: () => apiGet<ActivityEntry[]>(`${API_ROUTES.unbanRequest(id!)}/history`),
    enabled: id !== null,
  })

  const act = useCallback(
    async (action: UnbanActionName, values: Record<string, unknown> = {}) => {
      if (!id || !detail) return false
      setConflict(null)

      const saved = await run(async () => {
        try {
          return await apiPost<UnbanRequestDetail>(
            API_ROUTES.unbanRequestAction(id, ACTION_ROUTES[action]),
            {
              ...values,
              version: detail.version,
              ...(OUTCOMES[action] ? { outcome: OUTCOMES[action] } : {}),
            }
          )
        } catch (error) {
          if (!(error instanceof ApiClientError) || error.code !== ErrorCodes.ResourceConflict) {
            throw error
          }
          // Lost write, the file is read again
          setConflict(error.message || UNBAN_COPY.conflictUnknown)
          await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.unban })

          return null
        }
      })
      if (!saved) return false

      queryClient.setQueryData(QUERY_KEYS.unbanRequest(id), saved)
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.unban })

      return true
    },
    [id, detail, run, queryClient]
  )

  const vote = useCallback(
    async (choice: 'FOR' | 'AGAINST') => {
      if (!id) return
      const saved = await run(() =>
        apiPost<UnbanRequestDetail>(API_ROUTES.unbanRequestAction(id, 'vote'), { choice })
      )
      if (saved) queryClient.setQueryData(QUERY_KEYS.unbanRequest(id), saved)
    },
    [id, run, queryClient]
  )

  return {
    detail,
    history,
    conflict,
    isSaving,
    issues,
    clearIssues,
    dismissConflict: () => setConflict(null),
    act,
    vote,
  }
}
