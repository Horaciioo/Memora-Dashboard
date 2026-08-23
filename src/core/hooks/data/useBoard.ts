'use client'

import { useCallback, useState } from 'react'

import { apiDelete, apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { feedbackTitle } from '@/declarations/ui/copy'
import { BOARD_ENTITY_COPY } from '@/declarations/work/copy'
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
 * @param {(card: T) => string} labelOf - Display label of a card
 * @return {BoardCollection<T>} - State and mutations
 */

export const useBoard = <T extends BoardItem>(
  scope: WorkflowScopeName,
  endpoints: BoardEndpoints,
  initialCards: T[],
  labelOf: (card: T) => string
): BoardCollection<T> => {
  const [cards, setCards] = useState(initialCards)
  const { isSaving, issues, clearIssues, run } = useMutation()

  // Toast entity label
  const { label: entity, gender } = BOARD_ENTITY_COPY[scope]

  const create = useCallback(
    async (values: FormValues) => {
      const name = typeof values.title === 'string' ? values.title : undefined
      const card = await run(
        () => apiPost<T>(endpoints.collection, values),
        feedbackTitle(entity, 'created', gender, name)
      )

      if (card) setCards((current) => [...current, card])

      return card !== null
    },
    [endpoints, run, entity, gender]
  )

  const update = useCallback(
    async (id: string, values: FormValues) => {
      const name = typeof values.title === 'string' ? values.title : undefined
      const card = await run(
        () => apiPatch<T>(endpoints.item(id), values),
        feedbackTitle(entity, 'saved', gender, name)
      )

      if (card) setCards((current) => current.map((entry) => (entry.id === id ? card : entry)))

      return card !== null
    },
    [endpoints, run, entity, gender]
  )

  const remove = useCallback(
    async (id: string) => {
      const found = cards.find((card) => card.id === id)
      const name = found ? labelOf(found) : undefined
      const done = await run(
        () => apiDelete<{ id: string }>(endpoints.item(id)),
        feedbackTitle(entity, 'deleted', gender, name)
      )

      if (done) setCards((current) => current.filter((entry) => entry.id !== id))
    },
    [endpoints, run, entity, gender, cards, labelOf]
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
