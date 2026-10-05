import { walkBranches } from '@/core/lib/curriculum/branching'
import type { ExerciseBlock } from '@/declarations/academy/curriculum/types'
import { foldText } from '@/utils/format/strings'

/**
 * What a learner sent for one exercise
 * @typedef {Object} ExerciseAnswer
 */

export type ExerciseAnswer =
  | string
  | string[]
  | Record<string, string>
  | Record<string, string[]>
  | Record<string, string | string[]>

/**
 * Outcome of one exercise
 * @typedef {Object} ExerciseResult
 * @property {number} score - Points earned
 * @property {number} max - Points available
 * @property {boolean} passed - Clears the exercise
 * @property {Record<string, boolean>} marks - Right or wrong
 */

export interface ExerciseResult {
  score: number
  max: number
  passed: boolean
  marks: Record<string, boolean>
}

// A hole of a gap text
const HOLE = /\[\[([^\]]+)\]\]/g

/**
 * Read the holes of a gap text
 * @param {string} text - Gap text
 * @return {string[][]} - Accepted answers per hole
 */

export const holesOf = (text: string): string[][] =>
  [...text.matchAll(HOLE)].map((match) => (match[1] ?? '').split('|').map((part) => part.trim()))

/**
 * Split a gap text around its holes
 * @param {string} text - Gap text
 * @return {string[]} - Text runs
 */

export const runsOf = (text: string): string[] =>
  text.split(HOLE).filter((_, index) => index % 2 === 0)

// Answers compare without case
const normalise = (value: string): string => foldText(value).replace(/\s+/g, ' ').trim()

/**
 * Read a record answer safely
 * @param {ExerciseAnswer} answer - Raw answer
 * @return {Record<string, unknown>} - Record
 */

const asRecord = (answer: ExerciseAnswer): Record<string, unknown> =>
  answer && typeof answer === 'object' && !Array.isArray(answer) ? answer : {}

/**
 * Same set of choice keys
 * @param {unknown} picked - Picked keys
 * @param {string[]} expected - Right keys
 * @return {boolean} - Exactly right
 */

const sameChoices = (picked: unknown, expected: string[]): boolean => {
  const list = Array.isArray(picked)
    ? picked.map(String)
    : typeof picked === 'string'
      ? [picked]
      : []

  return list.length === expected.length && expected.every((key) => list.includes(key))
}

/**
 * Wrap marks into a result
 * @param {Record<string, boolean>} marks - Right or wrong per part
 * @param {number} passPercent - Share needed
 * @return {ExerciseResult} - Result
 */

const toResult = (marks: Record<string, boolean>, passPercent: number): ExerciseResult => {
  const max = Object.keys(marks).length
  const score = Object.values(marks).filter(Boolean).length

  return { score, max, marks, passed: max > 0 && (score / max) * 100 >= passPercent }
}

/**
 * Score one exercise
 * @param {ExerciseBlock} block - Exercise
 * @param {ExerciseAnswer} answer - Learner answer
 * @param {number} passPercent - Share a quiz needs
 * @return {ExerciseResult} - Result
 */

export const scoreExercise = (
  block: ExerciseBlock,
  answer: ExerciseAnswer,
  passPercent: number
): ExerciseResult => {
  const record = asRecord(answer)

  switch (block.kind) {
    case 'quiz':
      return toResult(
        Object.fromEntries(
          block.questions.map((question) => [
            question.key,
            sameChoices(
              record[question.key],
              question.choices.filter((choice) => choice.correct).map((choice) => choice.key)
            ),
          ])
        ),
        passPercent
      )

    case 'fill': {
      const given = Array.isArray(answer) ? answer.map(String) : []

      return toResult(
        Object.fromEntries(
          holesOf(block.text).map((accepted, index) => [
            String(index),
            accepted.some((option) => normalise(option) === normalise(given[index] ?? '')),
          ])
        ),
        100
      )
    }

    case 'sort':
      return toResult(
        Object.fromEntries(block.items.map((item) => [item.key, record[item.key] === item.bucket])),
        100
      )

    case 'order': {
      const given = Array.isArray(answer) ? answer.map(String) : []

      return toResult(
        Object.fromEntries(block.items.map((item, index) => [item.key, given[index] === item.key])),
        100
      )
    }

    case 'simulation':
      return toResult(
        Object.fromEntries(
          block.steps.map((step) => [
            step.key,
            step.options.some((option) => option.correct && option.key === record[step.key]),
          ])
        ),
        100
      )

    case 'case':
      return toResult(
        Object.fromEntries(
          block.questions.map((question) => [
            question.key,
            question.type === 'open'
              ? typeof record[question.key] === 'string' &&
                (record[question.key] as string).trim().length > 0
              : sameChoices(
                  record[question.key],
                  question.choices.filter((choice) => choice.correct).map((choice) => choice.key)
                ),
          ])
        ),
        passPercent
      )

    case 'scene':
      return toResult(
        Object.fromEntries(
          block.questions.map((question) => [
            question.key,
            sameChoices(
              record[question.key],
              question.choices.filter((choice) => choice.correct).map((choice) => choice.key)
            ),
          ])
        ),
        passPercent
      )

    case 'compareRuns':
      return toResult(
        {
          pick: block.runs.some(
            (run) => run.correct && run.key === (typeof answer === 'string' ? answer : '')
          ),
        },
        100
      )

    case 'branching':
      return toResult({ ending: walkBranches(block, record).ending?.ending?.good === true }, 100)

    case 'command': {
      const given = normalise(typeof answer === 'string' ? answer : '')

      return toResult(
        { command: block.accepted.some((option) => normalise(option) === given) },
        100
      )
    }
  }
}
