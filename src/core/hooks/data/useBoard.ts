'use client'

import { useCallback, useState } from 'react'

import { apiDelete, apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { FEEDBACK_COPY } from '@/declarations/ui/copy'
import type { BoardItem } from '@/components/structures/KanbanBoard'
import type { FieldIssue, FormValues } from '@/types/forms'
import type { WorkflowScopeName } from '@/utils/constants/workflow'

/**
 * Endpoints backing one board
 * @typedef {Object} BoardEndpoints
 * @property {string} collection - Collection path
 * @property {(id: string) => string} item - Item path
 */

export interface BoardEndpoints {
  collection: string
  item: (id: string) => string
}

/**
 * Board state and mutations
 * @typedef {Object} BoardCollection
 * @property {T[]} cards - Current cards
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {() => void} clearIssues - Forget the rejections
 * @property {(values: FormValues) => Promise<boolean>} create - Add a card
 * @property {(id: string, values: FormValues) => Promise<boolean>} update - Edit a card
 * @property {(id: string) => Promise<void>} remove - Drop a card
 * @property {(id: string, columnId: string, index: number) => void} move - Move a card
 */

export interface BoardCollection<T extends BoardItem> {
  cards: T[]
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  create: (values: FormValues) => Promise<boolean>
  update: (id: string, values: FormValues) => Promise<boolean>
  remove: (id: string) => Promise<void>
  move: (id: string, columnId: string, index: number) => void
}

/**
 * Drive one board, whatever resource sits behind it
 * @param {WorkflowScopeName} scope - Board scope
 * @param {BoardEndpoints} endpoints - Paths of the resource
 * @param {T[]} initialCards - Cards resolved server-side
 * @return {BoardCollection<T>} - State and mutations
 */

export const useBoard = <T extends BoardItem>(
  scope: WorkflowScopeName,
  endpoints: BoardEndpoints,
  initialCards: T[]
): BoardCollection<T> => {
  const [cards, setCards] = useState(initialCards)
  const { isSaving, issues, clearIssues, run } = useMutation()

  const create = useCallback(
    async (values: FormValues) => {
      const card = await run(() => apiPost<T>(endpoints.collection, values), FEEDBACK_COPY.created)

      if (card) setCards((current) => [...current, card])

      return card !== null
    },
    [endpoints, run]
  )

  const update = useCallback(
    async (id: string, values: FormValues) => {
      const card = await run(() => apiPatch<T>(endpoints.item(id), values), FEEDBACK_COPY.saved)

      if (card) setCards((current) => current.map((entry) => (entry.id === id ? card : entry)))

      return card !== null
    },
    [endpoints, run]
  )

  const remove = useCallback(
    async (id: string) => {
      const done = await run(
        () => apiDelete<{ id: string }>(endpoints.item(id)),
        FEEDBACK_COPY.deleted
      )

      if (done) setCards((current) => current.filter((entry) => entry.id !== id))
    },
    [endpoints, run]
  )

  const move = useCallback(
    (id: string, columnId: string, index: number) => {
      // Paint the drop first, the server confirms the exact position right after
      setCards((current) =>
        current.map((entry) => (entry.id === id ? { ...entry, columnId } : entry))
      )

      void run(() => apiPatch<T>(API_ROUTES.board, { scope, id, columnId, index })).then((card) => {
        if (card) setCards((current) => current.map((entry) => (entry.id === id ? card : entry)))
      })
    },
    [scope, run]
  )

  return { cards, isSaving, issues, clearIssues, create, update, remove, move }
}
