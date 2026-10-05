import { exercisesOf } from '@/declarations/academy/curriculum'
import type { Course } from '@/declarations/academy/curriculum/types'
import type { CourseProgress } from '@/types/academy'

/**
 * Read saved progress
 * @param {unknown} value - Stored progress
 * @return {CourseProgress} - Progress
 */

export const readProgress = (value: unknown): CourseProgress => {
  const blocks =
    value && typeof value === 'object' && !Array.isArray(value) && 'blocks' in value
      ? (value.blocks as CourseProgress['blocks'])
      : {}

  return { blocks: blocks ?? {} }
}

/**
 * Count the exercises of a course a member has cleared
 * @param {Course} course - Course
 * @param {unknown} stored - Stored progress
 * @return {{ passed: number, total: number }} - Cleared and total
 */

export const countCleared = (
  course: Course,
  stored: unknown
): { passed: number; total: number } => {
  const progress = readProgress(stored)
  const exercises = exercisesOf(course)

  return {
    passed: exercises.filter((block) => progress.blocks[block.key]?.passed).length,
    total: exercises.length,
  }
}
