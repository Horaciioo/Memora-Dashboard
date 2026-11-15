import { STOPGO_CARD_KEYS } from '@/declarations/play/stopgo/cards'
import type { StopGoCardKey } from '@/declarations/play/stopgo/cards'

import type { StopGoCard } from '@/core/lib/play/stopgo/state'

// Random source
export type Random = () => number

/**
 * Secure random source
 * @return {number} - Float in [0, 1)
 */

export const secureRandom: Random = () => crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32

/**
 * Ordered deck
 * @param {Record<StopGoCardKey, number>} counts - Quantity per key
 * @return {StopGoCard[]} - Cards, stable ids
 */

export const buildDeck = (counts: Record<StopGoCardKey, number>): StopGoCard[] =>
  STOPGO_CARD_KEYS.flatMap((key) => Array.from({ length: counts[key] }, () => key)).map(
    (key, index) => ({ id: `c${index}`, key })
  )

/**
 * Fisher-Yates shuffle
 * @param {T[]} cards - Items
 * @param {Random} random - Random source
 * @return {T[]} - New array
 */

export const shuffle = <T>(cards: T[], random: Random): T[] => {
  const result = [...cards]

  // Swap from the end
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1))
    ;[result[index], result[other]] = [result[other], result[index]]
  }

  return result
}

/**
 * Pile and discard
 * @typedef {Object} StopGoPiles
 * @property {StopGoCard[]} pile - Draw pile, top last
 * @property {StopGoCard[]} discard - Discard, top last
 * @property {number} reshuffles - Reshuffles done
 */

export interface StopGoPiles {
  pile: StopGoCard[]
  discard: StopGoCard[]
  reshuffles: number
}

/**
 * Draw result
 * @typedef {Object} StopGoDraw
 * @property {StopGoCard | null} card - Null when exhausted
 * @property {StopGoPiles} piles - Piles after
 */

export interface StopGoDraw {
  card: StopGoCard | null
  piles: StopGoPiles
}

/**
 * Draw one card
 * @param {StopGoPiles} piles - Current piles
 * @param {number} maxReshuffles - Reshuffle cap
 * @param {Random} random - Random source
 * @return {StopGoDraw} - Card and piles
 */

export const draw = (piles: StopGoPiles, maxReshuffles: number, random: Random): StopGoDraw => {
  let { pile, discard, reshuffles } = piles

  // Reshuffle discard under its top
  if (!pile.length) {
    const canReshuffle = reshuffles < maxReshuffles && discard.length > 1
    if (!canReshuffle) return { card: null, piles }
    pile = shuffle(discard.slice(0, -1), random)
    discard = discard.slice(-1)
    reshuffles += 1
  }

  return { card: pile.at(-1) ?? null, piles: { pile: pile.slice(0, -1), discard, reshuffles } }
}
