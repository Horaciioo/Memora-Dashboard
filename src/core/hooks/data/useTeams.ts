'use client'

import { useCallback, useState } from 'react'

import { apiDelete, apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { FEEDBACK_COPY } from '@/declarations/ui/copy'
import type { FieldIssue, FormValues } from '@/types/forms'
import type { TeamBoardData } from '@/types/teams'

/**
 * Team board state and mutations
 * @typedef {Object} TeamCollection
 * @property {TeamBoardData} board - Teams and unassigned members
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {() => void} clearIssues - Forget the rejections
 * @property {(values: FormValues) => Promise<boolean>} create - Create a team
 * @property {(id: string, values: FormValues) => Promise<boolean>} update - Edit a team
 * @property {(id: string) => Promise<void>} remove - Drop a team
 * @property {(accountId: string, teamId: string | null) => void} move - Move a member
 */

export interface TeamCollection {
  board: TeamBoardData
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  create: (values: FormValues) => Promise<boolean>
  update: (id: string, values: FormValues) => Promise<boolean>
  remove: (id: string) => Promise<void>
  move: (accountId: string, teamId: string | null) => void
}

/**
 * Drive the team board
 * @param {TeamBoardData} initialBoard - Board resolved server-side
 * @return {TeamCollection} - State and mutations
 */

export const useTeams = (initialBoard: TeamBoardData): TeamCollection => {
  const [board, setBoard] = useState(initialBoard)
  const { isSaving, issues, clearIssues, run } = useMutation()

  const create = useCallback(
    async (values: FormValues) => {
      const next = await run(
        () => apiPost<TeamBoardData>(API_ROUTES.teams, values),
        FEEDBACK_COPY.created
      )

      if (next) setBoard(next)

      return next !== null
    },
    [run]
  )

  const update = useCallback(
    async (id: string, values: FormValues) => {
      const next = await run(
        () => apiPatch<TeamBoardData>(API_ROUTES.team(id), values),
        FEEDBACK_COPY.saved
      )

      if (next) setBoard(next)

      return next !== null
    },
    [run]
  )

  const remove = useCallback(
    async (id: string) => {
      const next = await run(
        () => apiDelete<TeamBoardData>(API_ROUTES.team(id)),
        FEEDBACK_COPY.deleted
      )

      if (next) setBoard(next)
    },
    [run]
  )

  const move = useCallback(
    (accountId: string, teamId: string | null) => {
      void run(
        () => apiPatch<TeamBoardData>(API_ROUTES.teams, { accountId, teamId }),
        FEEDBACK_COPY.moved
      ).then((next) => {
        if (next) setBoard(next)
      })
    },
    [run]
  )

  return { board, isSaving, issues, clearIssues, create, update, remove, move }
}
