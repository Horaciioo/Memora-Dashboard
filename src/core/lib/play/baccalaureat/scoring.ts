import { BACCALAUREAT_SETTINGS } from '@/declarations/play/settings'
import { BACCALAUREAT_SHARING } from '@/declarations/play/baccalaureat/sharing'
import type { BaccalaureatSharingKey } from '@/declarations/play/baccalaureat/sharing'
import { normalizeWord } from '@/core/lib/play/baccalaureat/words'

/**
 * Word judged at the end of a review
 * @typedef {Object} JudgedAnswer
 * @property {string} id - Answer
 * @property {string} category - Category
 * @property {string} word - Written word
 * @property {boolean} valid - Kept after review
 */

export interface JudgedAnswer {
  id: string
  category: string
  word: string
  valid: boolean
}

/**
 * Points of a word written by several
 * @param {BaccalaureatSharingKey} rule - Sharing rule
 * @return {number} - Unique points shared
 */

export const sharedPoints = (rule: BaccalaureatSharingKey): number =>
  Math.floor(BACCALAUREAT_SETTINGS.points.unique * BACCALAUREAT_SHARING[rule].share)

/**
 * Points of every answer of a round
 * @param {JudgedAnswer[]} answers - Judged answers
 * @param {BaccalaureatSharingKey} rule - Sharing rule
 * @return {Map<string, number>} - Points per answer
 */

export const scoreAnswers = (
  answers: JudgedAnswer[],
  rule: BaccalaureatSharingKey
): Map<string, number> => {
  const { unique } = BACCALAUREAT_SETTINGS.points
  const byCategory = Map.groupBy(
    answers.filter((answer) => answer.valid),
    (answer) => answer.category
  )

  return new Map(
    answers.map((answer) => {
      if (!answer.valid) return [answer.id, 0]

      // Same word, same category
      const peers = byCategory.get(answer.category) ?? []
      const twins = peers.filter((peer) => normalizeWord(peer.word) === normalizeWord(answer.word))

      return [answer.id, twins.length === 1 ? unique : sharedPoints(rule)]
    })
  )
}

/**
 * Review verdict of one answer
 * @param {Object} input - Vote tally
 * @param {boolean} input.fits - Opens on the letter
 * @param {number} input.accepts - Votes for
 * @param {number} input.rejects - Votes against
 * @return {boolean} - Kept
 */

export const keepsAnswer = ({
  fits,
  accepts,
  rejects,
}: {
  fits: boolean
  accepts: number
  rejects: number
}): boolean => fits && (accepts + rejects === 0 || accepts > rejects)
