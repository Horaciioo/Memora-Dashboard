'use client'

import { useCallback, useState } from 'react'

import { apiPatch, apiPut } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { TEAM_COPY } from '@/declarations/teams/copy'
import type { CreatorTeamData } from '@/types/teams'

/**
 * Teams of a creator and their mutations
 * @typedef {Object} CreatorTeamCollection
 * @property {CreatorTeamData} data - Functions and members
 * @property {boolean} isSaving - Mutation in flight
 * @property {(functionIds: string[]) => void} setEnabled - Switch teams
 * @property {(accountId: string, functionIds: string[]) => void} setMemberTeams - Seat a member
 */

export interface CreatorTeamCollection {
  data: CreatorTeamData
  isSaving: boolean
  setEnabled: (functionIds: string[]) => void
  setMemberTeams: (accountId: string, functionIds: string[]) => void
}

/**
 * Drive the teams of one creator
 * @param {CreatorTeamData} initial - Data resolved server-side
 * @param {string} youtuberId - Creator identifier
 * @return {CreatorTeamCollection} - State and mutations
 */

export const useCreatorTeams = (
  initial: CreatorTeamData,
  youtuberId: string
): CreatorTeamCollection => {
  const [data, setData] = useState(initial)
  const [source, setSource] = useState(initial)
  const { isSaving, run } = useMutation()

  // Server refresh wins
  if (initial !== source) {
    setSource(initial)
    setData(initial)
  }

  const save = useCallback(
    (action: () => Promise<CreatorTeamData>) => {
      void run(action, TEAM_COPY.saved).then((next) => {
        if (next) setData(next)
      })
    },
    [run]
  )

  const setEnabled = useCallback(
    (functionIds: string[]) =>
      save(() => apiPut<CreatorTeamData>(API_ROUTES.creatorTeams(youtuberId), { functionIds })),
    [save, youtuberId]
  )

  const setMemberTeams = useCallback(
    (accountId: string, functionIds: string[]) =>
      save(() =>
        apiPatch<CreatorTeamData>(API_ROUTES.creatorTeams(youtuberId), { accountId, functionIds })
      ),
    [save, youtuberId]
  )

  return { data, isSaving, setEnabled, setMemberTeams }
}
