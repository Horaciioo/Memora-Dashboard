import { StopGoRefusals } from '@/declarations/play/stopgo/refusals'
import type { StopGoRefusal } from '@/declarations/play/stopgo/refusals'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'

import { draw } from '@/core/lib/play/stopgo/deck'
import type { Random, StopGoPiles } from '@/core/lib/play/stopgo/deck'
import type { StopGoCard, StopGoHandCard } from '@/core/lib/play/stopgo/state'

/**
 * Mystery card kept apart
 * @typedef {Object} StopGoSealed
 * @property {StopGoCard} card - Hidden card, never sent
 * @property {string} fromId - Sender
 * @property {string} at - ISO time
 */

export interface StopGoSealed {
  card: StopGoCard
  fromId: string
  at: string
}

/**
 * Good draw choice the turn waits on
 * @type {{ kind: 'pick' }}
 */

export const PICK_PENDING = { kind: 'pick' } as const

/**
 * Turn waits on a Good draw choice
 * @param {unknown} pending - Stored pending choice
 * @return {boolean} - Picking
 */

export const isPicking = (pending: unknown): boolean =>
  (pending as { kind?: string } | null)?.kind === PICK_PENDING.kind

/**
 * Stored sealed cards, typed
 * @param {unknown} raw - Stored value
 * @return {StopGoSealed[]} - Sealed cards
 */

export const sealedOf = (raw: unknown): StopGoSealed[] =>
  Array.isArray(raw) ? (raw as StopGoSealed[]) : []

/**
 * Draw several cards
 * @param {StopGoPiles} piles - Current piles
 * @param {number} count - Cards wanted
 * @param {number} maxReshuffles - Reshuffle cap
 * @param {Random} random - Random source
 * @return {{ cards: StopGoCard[], piles: StopGoPiles }} - Cards found and piles
 */

export const drawCards = (
  piles: StopGoPiles,
  count: number,
  maxReshuffles: number,
  random: Random
): { cards: StopGoCard[]; piles: StopGoPiles } => {
  const cards: StopGoCard[] = []
  let current = piles

  // One card at a time
  for (let index = 0; index < count; index++) {
    const taken = draw(current, maxReshuffles, random)
    if (!taken.card) break
    cards.push(taken.card)
    current = taken.piles
  }

  return { cards, piles: current }
}

/**
 * Player draws when the turn opens
 * @param {number} handCount - Cards in hand
 * @param {number} sealedCount - Sealed cards
 * @return {boolean} - Draws
 */

export const needsDraw = (handCount: number, sealedCount: number): boolean =>
  handCount + sealedCount <= STOPGO_SETTINGS.handSize

/**
 * Hand once a card is kept out of two
 * @param {StopGoHandCard[]} hand - Hand with two cards to pick
 * @param {string | undefined} keepId - Kept card, the first when missing
 * @return {{ hand: StopGoHandCard[], dropped: StopGoHandCard | null }} - Hand and thrown card
 */

export const keepPicked = (
  hand: StopGoHandCard[],
  keepId?: string
): { hand: StopGoHandCard[]; dropped: StopGoHandCard | null } => {
  const picks = hand.filter((card) => card.isPicking)
  const keep = picks.find((card) => card.id === keepId) ?? picks[0]

  return {
    hand: hand
      .filter((card) => !card.isPicking || card === keep)
      .map((card) => ({ id: card.id, key: card.key })),
    dropped: picks.find((card) => card !== keep) ?? null,
  }
}

/**
 * Why a mystery card cannot go to a target
 * @param {StopGoSealed[]} sealed - Cards already sealed there
 * @return {StopGoRefusal | null} - Refusal or null
 */

export const canSeal = (sealed: StopGoSealed[]): StopGoRefusal | null =>
  sealed.length ? StopGoRefusals.AlreadySealed : null

/**
 * Why a sealed card cannot be revealed
 * @param {StopGoSealed[]} sealed - Cards sealed on the player
 * @return {StopGoRefusal | null} - Refusal or null
 */

export const canReveal = (sealed: StopGoSealed[]): StopGoRefusal | null =>
  sealed.length ? null : StopGoRefusals.NoSealed

/**
 * Hand and sealed cards after a reveal
 * @param {StopGoHandCard[]} hand - Hand
 * @param {StopGoSealed[]} sealed - Sealed cards, one at least
 * @return {{ hand: StopGoHandCard[], sealed: StopGoSealed[] }} - Both after
 */

export const revealSealed = (
  hand: StopGoHandCard[],
  sealed: StopGoSealed[]
): { hand: StopGoHandCard[]; sealed: StopGoSealed[] } => ({
  hand: [{ id: sealed[0].card.id, key: sealed[0].card.key }, ...hand],
  sealed: sealed.slice(1),
})
