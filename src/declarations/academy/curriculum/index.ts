import { ANTI_RAID } from '@/declarations/academy/curriculum/antiRaid'
import { COMMUNICATION_POSTURE } from '@/declarations/academy/curriculum/communication'
import { MARSHA_BOT } from '@/declarations/academy/curriculum/marshaBot'
import { TWITCH_FUNDAMENTALS } from '@/declarations/academy/curriculum/twitchFundamentals'
import type { Course, CourseBlock, ExerciseBlock } from '@/declarations/academy/curriculum/types'
import { EXERCISE_KINDS } from '@/declarations/academy/curriculum/types'

/**
 * Every interactive course, in catalogue order
 * @type {readonly Course[]}
 */

export const COURSES: readonly Course[] = [
  // Indispensable, first period
  TWITCH_FUNDAMENTALS,
  MARSHA_BOT,
  COMMUNICATION_POSTURE,
  // Secondary, second period
  ANTI_RAID,
]

// Course lookup by key
const BY_KEY = new Map(COURSES.map((course) => [course.key, course]))

/**
 * Read a course by its key
 * @param {string} key - Course key
 * @return {Course | undefined} - Course
 */

export const courseByKey = (key: string): Course | undefined => BY_KEY.get(key)

/**
 * Tell an exercise from a read-only block
 * @param {CourseBlock} block - Any block
 * @return {boolean} - Block is scored
 */

export const isExercise = (block: CourseBlock): block is ExerciseBlock =>
  EXERCISE_KINDS.includes(block.kind)

/**
 * Every exercise of a course, in order
 * @param {Course} course - Course
 * @return {ExerciseBlock[]} - Exercises
 */

export const exercisesOf = (course: Course): ExerciseBlock[] =>
  course.chapters.flatMap((chapter) => chapter.blocks.filter(isExercise))
