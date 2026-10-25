import { PlayOutcomes } from '@/utils/constants/play'
import type { PlayOutcomeName } from '@/utils/constants/play'

/**
 * One player's final place
 * @typedef {Object} PlayStanding
 * @property {string} accountId - Player
 * @property {number} score - Total
 * @property {number} rank - Place, ties shared
 * @property {PlayOutcomeName} outcome - Outcome
 */

export interface PlayStanding {
  accountId: string
  score: number
  rank: number
  outcome: PlayOutcomeName
}

/**
 * Rank players by score
 * @param {Map<string, number>} scores - Score per player
 * @param {Set<string>} [gone] - Players who left
 * @return {PlayStanding[]} - Standings, best first
 */

export const rankScores = (
  scores: Map<string, number>,
  gone = new Set<string>()
): PlayStanding[] => {
  // Leavers rank last
  const sorted = [...scores].sort(
    ([a, left], [b, right]) => Number(gone.has(a)) - Number(gone.has(b)) || right - left
  )
  const contenders = sorted.filter(([accountId]) => !gone.has(accountId))
  const best = contenders[0]?.[1]
  const winners = contenders.filter(([, score]) => score === best).length

  return sorted.map(([accountId, score]) => {
    const tied = sorted.findIndex(
      ([other, value]) => value === score && gone.has(other) === gone.has(accountId)
    )
    const isTop = !gone.has(accountId) && score === best

    return {
      accountId,
      score,
      rank: tied + 1,
      outcome: !isTop ? PlayOutcomes.Loss : winners > 1 ? PlayOutcomes.Draw : PlayOutcomes.Win,
    }
  })
}
