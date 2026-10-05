import { exercisesOf } from '@/declarations/academy/curriculum'
import type { Course } from '@/declarations/academy/curriculum/types'
import { LEGACY_SETTINGS } from '@/declarations/configurations/settings'
import type { CourseProgress } from '@/types/academy'

/**
 * Points of one module and whether it clears
 * @typedef {Object} ModuleScore
 * @property {number} auto - Points earned by the exercises
 * @property {number} total - Points once the evaluator's note is in
 * @property {boolean} passed - Total reaches the pass mark
 */

export interface ModuleScore {
  auto: number
  total: number
  passed: boolean
}

/**
 * Points the exercises of a module earned
 * @param {Course} course - Module
 * @param {CourseProgress} progress - Saved exercises
 * @return {number} - Points out of the module maximum
 */

export const autoScoreOf = (course: Course, progress: CourseProgress): number => {
  const exercises = exercisesOf(course)
  if (exercises.length === 0) return 0

  const share = exercises.reduce((sum, block) => {
    const saved = progress.blocks[block.key]
    if (!saved) return sum
    if (saved.passed) return sum + 1

    return sum + (saved.max > 0 ? saved.score / saved.max : 0)
  }, 0)

  return Math.round((share / exercises.length) * LEGACY_SETTINGS.modulePoints)
}

/**
 * Total of a module: the exercises alone until the evaluator gives a note
 * @param {number} auto - Points from the exercises
 * @param {number | null} evaluator - Evaluator's note out of the module maximum
 * @return {number} - Total out of the module maximum
 */

export const moduleTotal = (auto: number, evaluator: number | null): number => {
  if (evaluator === null) return auto

  const share = LEGACY_SETTINGS.evaluatorSharePercent / 100

  return Math.round(auto * (1 - share) + evaluator * share)
}

/**
 * Score of one module
 * @param {Course} course - Module
 * @param {CourseProgress} progress - Saved exercises
 * @param {number | null} evaluator - Evaluator's note
 * @return {ModuleScore} - Points and verdict
 */

export const scoreModule = (
  course: Course,
  progress: CourseProgress,
  evaluator: number | null
): ModuleScore => {
  const auto = autoScoreOf(course, progress)
  const total = moduleTotal(auto, evaluator)

  return { auto, total, passed: total >= LEGACY_SETTINGS.modulePassPoints }
}

/**
 * Standing of a whole track
 * @typedef {Object} LegacyOutcome
 * @property {number} modulesPassed - Modules cleared
 * @property {number} modulesToPass - Modules needed
 * @property {number} points - Total of every module
 * @property {number} pointsToPass - Points needed
 * @property {number} maxPoints - Points available
 * @property {boolean} eligible - Both thresholds met
 */

export interface LegacyOutcome {
  modulesPassed: number
  modulesToPass: number
  points: number
  pointsToPass: number
  maxPoints: number
  eligible: boolean
}

/**
 * Standing of a track: enough modules cleared AND enough points overall
 * @param {{ total: number, passed: boolean }[]} modules - Result of each module
 * @return {LegacyOutcome} - Standing
 */

export const outcomeOf = (modules: { total: number; passed: boolean }[]): LegacyOutcome => {
  const modulesPassed = modules.filter((module) => module.passed).length
  const points = modules.reduce((sum, module) => sum + module.total, 0)

  return {
    modulesPassed,
    modulesToPass: LEGACY_SETTINGS.modulesToPass,
    points,
    pointsToPass: LEGACY_SETTINGS.pointsToPass,
    maxPoints: modules.length * LEGACY_SETTINGS.modulePoints,
    eligible:
      modulesPassed >= LEGACY_SETTINGS.modulesToPass && points >= LEGACY_SETTINGS.pointsToPass,
  }
}
