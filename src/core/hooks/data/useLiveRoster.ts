'use client'

import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { apiGet, apiPatch } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import type { LiveRoster } from '@/types/lives'
import type { AttendanceStatusName } from '@/utils/constants/workflow'

/**
 * Roll-call state and its one move
 * @typedef {Object} LiveRosterState
 * @property {LiveRoster | null} roster - Roll-call
 * @property {boolean} isSaving - Move in flight
 * @property {(accountId: string, status: AttendanceStatusName) => Promise<boolean>} move - Move a member
 */

export interface LiveRosterState {
  roster: LiveRoster | null
  isSaving: boolean
  move: (accountId: string, status: AttendanceStatusName) => Promise<boolean>
}

/**
 * Drive the roll-call of one live
 * @param {string} liveId - Live identifier
 * @return {LiveRosterState} - State and move
 */

export const useLiveRoster = (liveId: string): LiveRosterState => {
  const client = useQueryClient()
  const key = QUERY_KEYS.liveRoster(liveId)
  const { data } = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => apiGet<LiveRoster>(API_ROUTES.liveRoster(liveId), signal),
  })
  const { isSaving, run } = useMutation()

  const move = useCallback(
    async (accountId: string, status: AttendanceStatusName) => {
      // The column changes at once
      const previous = client.getQueryData<LiveRoster>(key)
      if (previous) {
        client.setQueryData<LiveRoster>(key, {
          ...previous,
          people: previous.people.map((person) =>
            person.id === accountId ? { ...person, status } : person
          ),
        })
      }

      const next = await run(() =>
        apiPatch<LiveRoster>(API_ROUTES.liveRoster(liveId), { accountId, status })
      )
      client.setQueryData<LiveRoster | undefined>(key, next ?? previous)

      return next !== null
    },
    [client, key, liveId, run]
  )

  return { roster: data ?? null, isSaving, move }
}
