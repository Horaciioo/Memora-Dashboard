import { STOPGO_CARD_KEYS, STOPGO_CARDS, StopGoFamilies } from '@/declarations/play/stopgo/cards'
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
 * Cards a stopped player needs and the share of draws steered to them
 * @typedef {Object} StopGoWanted
 * @property {StopGoCardKey[]} keys - Remedies that free the car
 * @property {number} share - Chance a draw goes to one of them, 0 to 1
 */

export interface StopGoWanted {
  keys: StopGoCardKey[]
  share: number
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
 * @param {StopGoWanted} [wanted] - Cards a stopped player needs
 * @return {number} - Index in the pile
 */

const pickIndex = (
  pile: StopGoCard[],
  kmShare: number | undefined,
  random: Random,
  wanted?: StopGoWanted
): number => {
  const top = pile.length - 1

  // A stopped player is steered to the card that frees the car
  if (wanted?.keys.length && random() < wanted.share) {
    for (let index = top; index >= 0; index--) {
      if (wanted.keys.includes(pile[index].key)) return index
    }
  }
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
 * @param {StopGoWanted} [wanted] - Cards a stopped player needs
 * @return {StopGoDraw} - Card and piles
 */

export const draw = (
  piles: StopGoPiles,
  maxReshuffles: number,
  random: Random,
  kmShare?: number,
  wanted?: StopGoWanted
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
  const index = pickIndex(pile, kmShare, random, wanted)

  return {
    card: pile[index] ?? null,
    piles: { pile: pile.filter((_, at) => at !== index), discard, reshuffles },
  }
}
