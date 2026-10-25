import { BACCALAUREAT_SETTINGS } from '@/declarations/play/settings'
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
 * Points of every answer of a round
 * @param {JudgedAnswer[]} answers - Judged answers
 * @return {Map<string, number>} - Points per answer
 */

export const scoreAnswers = (answers: JudgedAnswer[]): Map<string, number> => {
  const { solo, unique, shared } = BACCALAUREAT_SETTINGS.points
  const valid = answers.filter((answer) => answer.valid)
  const byCategory = Map.groupBy(valid, (answer) => answer.category)

  return new Map(
    answers.map((answer) => {
      if (!answer.valid) return [answer.id, 0]

      // Same word, same category
      const peers = byCategory.get(answer.category) ?? []
      const twins = peers.filter((peer) => normalizeWord(peer.word) === normalizeWord(answer.word))
      const points = peers.length === 1 ? solo : twins.length === 1 ? unique : shared

      return [answer.id, points]
    })
  )
}

/**
 * Review verdict of one answer
 * @param {Object} input - Vote tally
 * @param {boolean} input.fits - Opens on the letter
 * @param {number} input.rejects - Votes against
 * @param {number} input.voters - Possible voters
 * @return {boolean} - Kept
 */

export const keepsAnswer = ({
  fits,
  rejects,
  voters,
}: {
  fits: boolean
  rejects: number
  voters: number
}): boolean => fits && (voters === 0 || rejects / voters <= BACCALAUREAT_SETTINGS.rejectShare)
