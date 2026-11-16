import { STOPGO_CARD_KEYS, STOPGO_CARDS, StopGoFamilies } from '@/declarations/play/stopgo/cards'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'
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
 * Quantity per card, safeties dropped when the table plays without
 * @param {boolean} safeties - Safeties kept
 * @return {Record<StopGoCardKey, number>} - Quantity per key
 */

export const deckOf = (safeties: boolean): Record<StopGoCardKey, number> =>
  Object.fromEntries(
    STOPGO_CARD_KEYS.map((key) => [
      key,
      !safeties && STOPGO_CARDS[key].family === StopGoFamilies.Safety
        ? 0
        : STOPGO_SETTINGS.deck[key],
    ])
  ) as Record<StopGoCardKey, number>

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
 * Place of the card to take in the pile, a distance card comes up for the share asked
 * @param {StopGoCard[]} pile - Draw pile, top last
 * @param {number | undefined} kmShare - Share of distance cards, 0 to 1, none to take the top
 * @param {Random} random - Random source
 * @return {number} - Index in the pile
 */

const pickIndex = (
  pile: StopGoCard[],
  kmShare: number | undefined,
  random: Random
): number => {
  const top = pile.length - 1

  if (kmShare === undefined) return top
  const wantsKm = random() < kmShare

  // Nearest card of the kind wanted from the top, the top itself when none is left
  for (let index = top; index >= 0; index--) {
    if ((STOPGO_CARDS[pile[index].key].family === StopGoFamilies.Distance) === wantsKm) return index
  }

  return top
}

/**
 * Draw one card
 * @param {StopGoPiles} piles - Current piles
 * @param {number} maxReshuffles - Reshuffle cap
 * @param {Random} random - Random source
 * @param {number} [kmShare] - Share of distance cards among the cards drawn, 0 to 1
 * @return {StopGoDraw} - Card and piles
 */

export const draw = (
  piles: StopGoPiles,
  maxReshuffles: number,
  random: Random,
  kmShare?: number
): StopGoDraw => {
  let { pile, discard, reshuffles } = piles

  // Reshuffle discard under its top
  if (!pile.length) {
    const canReshuffle = reshuffles < maxReshuffles && discard.length > 1
    if (!canReshuffle) return { card: null, piles }
    pile = shuffle(discard.slice(0, -1), random)
    discard = discard.slice(-1)
    reshuffles += 1
  }
  const index = pickIndex(pile, kmShare, random)

  return {
    card: pile[index] ?? null,
    piles: { pile: pile.filter((_, at) => at !== index), discard, reshuffles },
  }
}
