import { buildDeck, commonSymbol } from '@/core/lib/play/echo/deck'
import type { EchoCard } from '@/core/lib/play/echo/deck'
import { ECHO_SETTINGS } from '@/declarations/play'

// Deck of the game, built once
export const ECHO_DECK: EchoCard[] = buildDeck(ECHO_SETTINGS.order)

/**
 * Cards of a round
 * @typedef {Object} EchoDeal
 * @property {number} center - Card in the middle
 * @property {Record<string, number>} hands - Card of each player
 * @property {number} seed - Seed of the layouts
 */

export interface EchoDeal {
  center: number
  hands: Record<string, number>
  seed: number
}

/**
 * Deal the center and one card to each player
 * @param {string[]} players - Seated players
 * @param {() => number} [random] - Source in [0, 1)
 * @return {EchoDeal} - Deal
 */

export const dealRound = (players: string[], random: () => number = Math.random): EchoDeal => {
  const order = ECHO_DECK.map((_, index) => index).toSorted(() => random() - 0.5)
  const [center, ...rest] = order

  return {
    center,
    hands: Object.fromEntries(players.map((accountId, index) => [accountId, rest[index]])),
    seed: Math.floor(random() * 2 ** 31),
  }
}

/**
 * Symbol a player has to find
 * @param {EchoDeal} deal - Round deal
 * @param {string} accountId - Player
 * @return {number} - Symbol id, -1 without a card
 */

export const answerOf = (deal: EchoDeal, accountId: string): number => {
  const hand = deal.hands[accountId]

  return hand === undefined ? -1 : commonSymbol(ECHO_DECK[deal.center], ECHO_DECK[hand])
}

/**
 * Points of a found symbol
 * @param {Object} input - Find
 * @param {number} input.elapsedMs - Time since the round opened
 * @param {number} input.totalMs - Time of the round
 * @param {number} input.rank - Place among the finders, from one
 * @return {number} - Points
 */

export const pointsOf = ({
  elapsedMs,
  totalMs,
  rank,
}: {
  elapsedMs: number
  totalMs: number
  rank: number
}): number => {
  const { base, speedBonus, firstBonus } = ECHO_SETTINGS.scoring
  const left = Math.min(1, Math.max(0, 1 - elapsedMs / totalMs))

  return base + Math.round(speedBonus * left) + (rank === 1 ? firstBonus : 0)
}
