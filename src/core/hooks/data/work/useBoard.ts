'use client'

import { useCallback, useState } from 'react'

import { apiDelete, apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { feedbackTitle } from '@/declarations/ui/copy'
import { BOARD_ENTITY_COPY, SELECTION_ENTITY } from '@/declarations/work/copy'
import type { BoardItem } from '@/components/structures/data/KanbanBoard'
import type { FieldIssue, FormValues } from '@/types/forms'
import type { WorkflowScopeName } from '@/utils/constants/workflow'

/**
 * Endpoints backing one board
 * @typedef {Object} BoardEndpoints
 * @property {string} collection - Collection path
 * @property {(id: string) => string} item - Item path
 * @property {(id: string) => string} [move] - Path moving a card, replaces the shared board route
 */

export interface BoardEndpoints {
  collection: string
  item: (id: string) => string
  move?: (id: string) => string
}

/**
 * Toast label of a board card
 * @typedef {Object} BoardEntity
 * @property {string} label - Singular label
 * @property {'masculine' | 'feminine'} gender - Grammatical gender
 */

export interface BoardEntity {
  label: string
  gender: 'masculine' | 'feminine'
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
 * @property {(updates: BoardUpdate[]) => Promise<boolean>} updateMany - Edit several cards
 * @property {(ids: string[]) => Promise<void>} removeMany - Drop several cards
 */

export interface BoardUpdate {
  id: string
  values: FormValues
}

export interface BoardCollection<T extends BoardItem> {
  cards: T[]
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  create: (values: FormValues) => Promise<boolean>
  update: (id: string, values: FormValues) => Promise<boolean>
  remove: (id: string) => Promise<void>
  move: (id: string, columnId: string, index: number) => void
  updateMany: (updates: BoardUpdate[]) => Promise<boolean>
  removeMany: (ids: string[]) => Promise<void>
}

/**
 * Drive one board
 * @param {WorkflowScopeName | null} scope - Board scope, null for a board outside the workflows
 * @param {BoardEndpoints} endpoints - Paths of the resource
 * @param {T[]} initialCards - Cards resolved server-side
 * @param {(card: T) => string} labelOf - Display label of a card
 * @param {BoardEntity} [entityOverride] - Toast label, defaults to the scope one
 * @return {BoardCollection<T>} - State and mutations
 */

export const useBoard = <T extends BoardItem>(
  scope: WorkflowScopeName | null,
  endpoints: BoardEndpoints,
  initialCards: T[],
  labelOf: (card: T) => string,
  entityOverride?: BoardEntity
): BoardCollection<T> => {
  const [cards, setCards] = useState(initialCards)
  const { isSaving, issues, clearIssues, run } = useMutation()

  // Toast entity label
  const { label: entity, gender } = entityOverride ?? BOARD_ENTITY_COPY[scope!]

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
      // Paint the drop first
      setCards((current) =>
        current.map((entry) => (entry.id === id ? { ...entry, columnId } : entry))
      )

      const request = endpoints.move
        ? () => apiPatch<T>(endpoints.move!(id), { columnId })
        : () => apiPatch<T>(API_ROUTES.board, { scope, id, columnId, index })

      void run(request).then((card) => {
        if (card) setCards((current) => current.map((entry) => (entry.id === id ? card : entry)))
      })
    },
    [scope, endpoints, run]
  )

  // Settled writes keep the cards that went through
  const updateMany = useCallback(
    async (updates: BoardUpdate[]) => {
      const saved = await run(
        async () => {
          const results = await Promise.allSettled(
            updates.map(({ id, values }) => apiPatch<T>(endpoints.item(id), values))
          )
          const done = results.flatMap((result) =>
            result.status === 'fulfilled' ? [result.value] : []
          )

          setCards((current) =>
            current.map((entry) => done.find((card) => card.id === entry.id) ?? entry)
          )

          const failed = results.find((result) => result.status === 'rejected')
          if (failed) throw failed.reason

          return done
        },
        feedbackTitle(SELECTION_ENTITY.label, 'saved', SELECTION_ENTITY.gender)
      )

      return saved !== null
    },
    [endpoints, run]
  )

  const removeMany = useCallback(
    async (ids: string[]) => {
      await run(
        async () => {
          const results = await Promise.allSettled(
            ids.map((id) => apiDelete<{ id: string }>(endpoints.item(id)))
          )
          const gone = ids.filter((_, index) => results[index].status === 'fulfilled')

          setCards((current) => current.filter((entry) => !gone.includes(entry.id)))

          const failed = results.find((result) => result.status === 'rejected')
          if (failed) throw failed.reason

          return gone
        },
        feedbackTitle(SELECTION_ENTITY.label, 'deleted', SELECTION_ENTITY.gender)
      )
    },
    [endpoints, run]
  )

  return {
    cards,
    isSaving,
    issues,
    clearIssues,
    create,
    update,
    remove,
    move,
    updateMany,
    removeMany,
  }
}
