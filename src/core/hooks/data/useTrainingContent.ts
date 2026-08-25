'use client'

import { useCallback, useState } from 'react'

import { apiDelete, apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { feedbackTitle } from '@/declarations/ui/copy'
import type { TrainingChapterView } from '@/types/academy'
import type { FieldIssue, FormValues } from '@/types/forms'

/**
 * Training content editor state and mutations
 * @typedef {Object} TrainingContentState
 * @property {TrainingChapterView[]} chapters - Chapters in display order
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {() => void} clearIssues - Forget the rejections
 */

export interface TrainingContentState {
  chapters: TrainingChapterView[]
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  addChapter: (values: FormValues) => Promise<boolean>
  editChapter: (id: string, values: FormValues) => Promise<boolean>
  dropChapter: (id: string) => Promise<void>
  reorderChapters: (ids: string[]) => Promise<void>
  addBlock: (chapterId: string, values: FormValues) => Promise<boolean>
  editBlock: (id: string, values: FormValues) => Promise<boolean>
  dropBlock: (id: string) => Promise<void>
  reorderBlocks: (chapterId: string, ids: string[]) => Promise<void>
  addQuestion: (blockId: string, values: FormValues) => Promise<boolean>
  editQuestion: (id: string, values: FormValues) => Promise<boolean>
  dropQuestion: (id: string) => Promise<void>
  reorderQuestions: (blockId: string, ids: string[]) => Promise<void>
  addChoice: (questionId: string, values: FormValues) => Promise<boolean>
  editChoice: (id: string, values: FormValues) => Promise<boolean>
  dropChoice: (id: string) => Promise<void>
  reorderChoices: (questionId: string, ids: string[]) => Promise<void>
}

/**
 * Drive the chapter, block, question and choice editors of one training
 * @param {string} trainingId - Training identifier
 * @param {TrainingChapterView[]} initialChapters - Chapters resolved server-side
 * @return {TrainingContentState} - State and mutations
 */

export const useTrainingContent = (
  trainingId: string,
  initialChapters: TrainingChapterView[]
): TrainingContentState => {
  const [chapters, setChapters] = useState(initialChapters)
  const { isSaving, issues, clearIssues, run } = useMutation()

  // One mutation shape shared by every level: post or patch, then replace the tree
  const post = useCallback(
    async (path: string, values: FormValues, name?: string) => {
      const next = await run(
        () => apiPost<TrainingChapterView[]>(path, values),
        name ? feedbackTitle(name, 'created', 'masculine') : undefined
      )
      if (next) setChapters(next)

      return next !== null
    },
    [run]
  )

  const patch = useCallback(
    async (path: string, values: FormValues) => {
      const next = await run(() => apiPatch<TrainingChapterView[]>(path, values))
      if (next) setChapters(next)

      return next !== null
    },
    [run]
  )

  const drop = useCallback(
    async (path: string) => {
      const next = await run(() => apiDelete<TrainingChapterView[]>(path))
      if (next) setChapters(next)
    },
    [run]
  )

  const reorder = useCallback(
    async (path: string, ids: string[]) => {
      const next = await run(() => apiPatch<TrainingChapterView[]>(path, { ids }))
      if (next) setChapters(next)
    },
    [run]
  )

  return {
    chapters,
    isSaving,
    issues,
    clearIssues,
    addChapter: (values) => post(API_ROUTES.trainingChapters(trainingId), values),
    editChapter: (id, values) => patch(API_ROUTES.chapter(id), values),
    dropChapter: (id) => drop(API_ROUTES.chapter(id)),
    reorderChapters: (ids) => reorder(API_ROUTES.trainingChaptersOrder(trainingId), ids),
    addBlock: (chapterId, values) => post(API_ROUTES.chapterBlocks(chapterId), values),
    editBlock: (id, values) => patch(API_ROUTES.block(id), values),
    dropBlock: (id) => drop(API_ROUTES.block(id)),
    reorderBlocks: (chapterId, ids) => reorder(API_ROUTES.chapterBlocksOrder(chapterId), ids),
    addQuestion: (blockId, values) => post(API_ROUTES.blockQuestions(blockId), values),
    editQuestion: (id, values) => patch(API_ROUTES.question(id), values),
    dropQuestion: (id) => drop(API_ROUTES.question(id)),
    reorderQuestions: (blockId, ids) => reorder(API_ROUTES.blockQuestionsOrder(blockId), ids),
    addChoice: (questionId, values) => post(API_ROUTES.questionChoices(questionId), values),
    editChoice: (id, values) => patch(API_ROUTES.choice(id), values),
    dropChoice: (id) => drop(API_ROUTES.choice(id)),
    reorderChoices: (questionId, ids) => reorder(API_ROUTES.questionChoicesOrder(questionId), ids),
  }
}
