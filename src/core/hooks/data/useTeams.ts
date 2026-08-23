'use client'

import { useCallback, useState } from 'react'

import { apiDelete, apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { FEEDBACK_COPY, feedbackTitle } from '@/declarations/ui/copy'
import type { FieldIssue, FormValues } from '@/types/forms'
import type { TeamBoardData } from '@/types/teams'

// Toast entity label
const ENTITY = 'Équipe'
const GENDER = 'feminine'

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
 * @param {string} [scope] - Creator the board is scoped to
 * @return {TeamCollection} - State and mutations
 */

export const useTeams = (initialBoard: TeamBoardData, scope?: string): TeamCollection => {
  const [board, setBoard] = useState(initialBoard)
  const { isSaving, issues, clearIssues, run } = useMutation()

  const create = useCallback(
    async (values: FormValues) => {
      const name = typeof values.name === 'string' ? values.name : undefined
      const next = await run(
        () => apiPost<TeamBoardData>(API_ROUTES.teams(scope), values),
        feedbackTitle(ENTITY, 'created', GENDER, name)
      )

      if (next) setBoard(next)

      return next !== null
    },
    [run, scope]
  )

  const update = useCallback(
    async (id: string, values: FormValues) => {
      const name = typeof values.name === 'string' ? values.name : undefined
      const next = await run(
        () => apiPatch<TeamBoardData>(API_ROUTES.team(id, scope), values),
        feedbackTitle(ENTITY, 'saved', GENDER, name)
      )

      if (next) setBoard(next)

      return next !== null
    },
    [run, scope]
  )

  const remove = useCallback(
    async (id: string) => {
      const name = board.teams.find((team) => team.id === id)?.name
      const next = await run(
        () => apiDelete<TeamBoardData>(API_ROUTES.team(id, scope)),
        feedbackTitle(ENTITY, 'deleted', GENDER, name)
      )

      if (next) setBoard(next)
    },
    [run, scope, board.teams]
  )

  const move = useCallback(
    (accountId: string, teamId: string | null) => {
      void run(
        () => apiPatch<TeamBoardData>(API_ROUTES.teams(scope), { accountId, teamId }),
        FEEDBACK_COPY.moved
      ).then((next) => {
        if (next) setBoard(next)
      })
    },
    [run, scope]
  )

  return { board, isSaving, issues, clearIssues, create, update, remove, move }
}
