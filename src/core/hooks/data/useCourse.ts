'use client'

import { useCallback, useState } from 'react'

import { apiPost } from '@/core/lib/api/client'
import { scoreExercise } from '@/core/lib/curriculum/scoring'
import type { ExerciseAnswer, ExerciseResult } from '@/core/lib/curriculum/scoring'
import { useMutation } from '@/core/hooks/data/useMutation'
import { exercisesOf } from '@/declarations/academy/curriculum'
import type { Course, ExerciseBlock } from '@/declarations/academy/curriculum/types'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import type { CourseProgress } from '@/types/academy'

/**
 * Course being followed
 * @typedef {Object} CourseRun
 * @property {CourseProgress} progress - Saved progress
 * @property {Record<string, ExerciseAnswer>} answers - What sits in each exercise
 * @property {Record<string, ExerciseResult>} results - Last check of each exercise
 * @property {number} passed - Exercises cleared
 * @property {number} total - Exercises of the course
 * @property {boolean} finished - Every exercise cleared
 * @property {boolean} isSaving - Check being saved
 * @property {(key: string, answer: ExerciseAnswer) => void} answer - Change an answer
 * @property {(block: ExerciseBlock, answer?: ExerciseAnswer) => Promise<void>} check - Score and save
 * @property {(key: string) => void} retry - Reopen a checked exercise
 */

export interface CourseRun {
  progress: CourseProgress
  answers: Record<string, ExerciseAnswer>
  results: Record<string, ExerciseResult>
  passed: number
  total: number
  finished: boolean
  isSaving: boolean
  answer: (key: string, answer: ExerciseAnswer) => void
  check: (block: ExerciseBlock, answer?: ExerciseAnswer) => Promise<void>
  retry: (key: string) => void
}

/**
 * Follow one interactive course: an exercise is scored on screen at once, then saved, the server
 * keeping the last word on what is cleared
 * @param {string} submitPath - Address an exercise is sent to
 * @param {Course} course - Course followed
 * @param {CourseProgress} initial - Progress resolved server-side
 * @return {CourseRun} - State and gestures
 */

export const useCourse = (
  submitPath: string,
  course: Course,
  initial: CourseProgress
): CourseRun => {
  const { isSaving, run } = useMutation()
  const [progress, setProgress] = useState(initial)
  const exercises = exercisesOf(course)

  // A cleared exercise reopens showing its saved answer and its marks
  const [answers, setAnswers] = useState<Record<string, ExerciseAnswer>>(() =>
    Object.fromEntries(
      exercises.flatMap((block) => {
        const saved = initial.blocks[block.key]

        return saved?.passed ? [[block.key, saved.answer as ExerciseAnswer]] : []
      })
    )
  )
  const [results, setResults] = useState<Record<string, ExerciseResult>>(() =>
    Object.fromEntries(
      exercises.flatMap((block) => {
        const saved = initial.blocks[block.key]

        return saved?.passed
          ? [
              [
                block.key,
                scoreExercise(
                  block,
                  saved.answer as ExerciseAnswer,
                  ACADEMY_SETTINGS.exercisePassPercent
                ),
              ],
            ]
          : []
      })
    )
  )

  const answer = useCallback(
    (key: string, next: ExerciseAnswer) => setAnswers((current) => ({ ...current, [key]: next })),
    []
  )

  const check = useCallback(
    async (block: ExerciseBlock, given?: ExerciseAnswer) => {
      const sent = given ?? answers[block.key] ?? ''
      const result = scoreExercise(block, sent, ACADEMY_SETTINGS.exercisePassPercent)
      setResults((current) => ({ ...current, [block.key]: result }))

      const saved = await run(() =>
        apiPost<{ progress: CourseProgress }>(submitPath, {
          blockKey: block.key,
          answer: sent,
        })
      )
      if (saved) setProgress(saved.progress)
    },
    [answers, run, submitPath]
  )

  const retry = useCallback(
    (key: string) =>
      setResults((current) =>
        Object.fromEntries(Object.entries(current).filter(([id]) => id !== key))
      ),
    []
  )

  const passed = exercises.filter((block) => progress.blocks[block.key]?.passed).length

  return {
    progress,
    answers,
    results,
    passed,
    total: exercises.length,
    finished: exercises.length > 0 && passed === exercises.length,
    isSaving,
    answer,
    check,
    retry,
  }
}
