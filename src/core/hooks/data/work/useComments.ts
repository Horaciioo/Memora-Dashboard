'use client'

import { useCallback } from 'react'

import { apiDelete, apiPatch, apiPost } from '@/core/lib/api/client'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { useSyncedState } from '@/core/hooks/interaction/state/saved/useSyncedState'
import { entityFeedback } from '@/declarations/ui/copy'
import type { CommentView } from '@/types/comments'
import type { FieldIssue, FormValues } from '@/types/forms'

/**
 * Remarks of one record and their mutations
 * @typedef {Object} CommentsState
 * @property {CommentView[]} comments - Remarks, newest last
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {() => void} clearIssues - Forget the rejections
 * @property {(values: FormValues) => Promise<boolean>} add - Leave a remark
 * @property {(id: string) => Promise<void>} remove - Drop a remark
 * @property {(id: string, pinned: boolean) => Promise<void>} [pin] - Hold a remark at the top, when the record allows it
 */

export interface CommentsState {
  comments: CommentView[]
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  add: (values: FormValues) => Promise<boolean>
  remove: (id: string) => Promise<void>
  pin?: (id: string, pinned: boolean) => Promise<void>
}

/**
 * Drive the remarks of one record
 * @param {CommentView[]} initial - Remarks resolved server-side
 * @param {string} addPath - Route a remark is posted to
 * @param {(id: string) => string} removePath - Route a remark is dropped from
 * @param {boolean} [canPin] - The record keeps pinned remarks, the same route takes the pin
 * @return {CommentsState} - State and mutations
 */

export const useComments = (
  initial: CommentView[],
  addPath: string,
  removePath: (id: string) => string,
  canPin = false
): CommentsState => {
  const [comments, setComments] = useSyncedState(initial)
  const { isSaving, issues, clearIssues, run } = useMutation()

  const add = useCallback(
    async (values: FormValues) => {
      const next = await run(
        () => apiPost<CommentView[]>(addPath, values),
        entityFeedback('comment', 'created')
      )
      if (next) setComments(next)

      return next !== null
    },
    [run, addPath, setComments]
  )

  const remove = useCallback(
    async (id: string) => {
      const next = await run(
        () => apiDelete<CommentView[]>(removePath(id)),
        entityFeedback('comment', 'deleted')
      )
      if (next) setComments(next)
    },
    [run, removePath, setComments]
  )

  const pin = useCallback(
    async (id: string, pinned: boolean) => {
      const next = await run(() => apiPatch<CommentView[]>(removePath(id), { pinned }))
      if (next) setComments(next)
    },
    [run, removePath, setComments]
  )

  return { comments, isSaving, issues, clearIssues, add, remove, ...(canPin ? { pin } : {}) }
}
