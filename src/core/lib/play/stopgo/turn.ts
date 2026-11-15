import { STOPGO_CARDS, StopGoFamilies } from '@/declarations/play/stopgo/cards'
import type { StopGoCardKey } from '@/declarations/play/stopgo/cards'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'

import { draw } from '@/core/lib/play/stopgo/deck'
import type { Random } from '@/core/lib/play/stopgo/deck'
import type {
  StopGoCar,
  StopGoCard,
  StopGoHandCard,
  StopGoSeatState,
  StopGoTable,
} from '@/core/lib/play/stopgo/state'

// Families a card may be played from
const OPEN_FAMILIES: string[] = [
  StopGoFamilies.Distance,
  StopGoFamilies.Remedy,
  StopGoFamilies.Attack,
  StopGoFamilies.Bonus,
]

/**
 * Card can be played at this stage of the game
 * @param {StopGoCardKey} key - Card
 * @return {boolean} - Opened
 */

export const isOpenCard = (key: StopGoCardKey): boolean =>
  OPEN_FAMILIES.includes(STOPGO_CARDS[key].family)

/**
 * Move sent for another turn than the current one
 * @param {number} current - Turn on the table
 * @param {number | undefined} given - Turn the player saw
 * @return {boolean} - Stale
 */

export const isStale = (current: number, given: number | undefined): boolean => given !== current

/**
 * Car of a seat
 * @param {StopGoSeatState} seat - Seat
 * @return {StopGoCar} - Car
 */

export const carOf = (seat: StopGoSeatState): StopGoCar => ({
  km: seat.km,
  isGreen: seat.isGreen,
  hazards: seat.hazards,
  jokers: { immunity: !seat.immunityUsedAt, cleanup: !seat.cleanupUsedAt },
})

/**
 * Race of the seats still on the road
 * @param {StopGoSeatState[]} seats - Seats racing
 * @param {number} targetKm - Distance to reach
 * @return {StopGoTable} - Race
 */

export const raceOf = (seats: StopGoSeatState[], targetKm: number): StopGoTable => ({
  targetKm,
  cars: Object.fromEntries(seats.map((seat) => [seat.accountId, carOf(seat)])),
})

/**
 * Player after another one in the order
 * @param {string[]} order - Players in turn order
 * @param {string[]} racing - Players still racing
 * @param {string} fromId - Player who just played
 * @return {string | null} - Next player, null when nobody races
 */

export const nextRacer = (order: string[], racing: string[], fromId: string): string | null => {
  const start = order.indexOf(fromId)

  // Walk the ring once, the player himself last
  for (let step = 1; step <= order.length; step++) {
    const id = order[(start + step) % order.length]
    if (racing.includes(id)) return id
  }

  return null
}

/**
 * Hands dealt from a pile
 * @typedef {Object} StopGoDeal
 * @property {Record<string, StopGoHandCard[]>} hands - Hand per player
 * @property {StopGoCard[]} pile - Pile left
 */

export interface StopGoDeal {
  hands: Record<string, StopGoHandCard[]>
  pile: StopGoCard[]
}

/**
 * Deal the opening hands
 * @param {StopGoCard[]} pile - Shuffled pile, top last
 * @param {string[]} ids - Players in turn order
 * @param {number} size - Cards each
 * @return {StopGoDeal} - Hands and pile
 */

export const deal = (pile: StopGoCard[], ids: string[], size: number): StopGoDeal => {
  const hands: Record<string, StopGoHandCard[]> = Object.fromEntries(ids.map((id) => [id, []]))
  let rest = pile

  // One card at a time round the table
  for (let round = 0; round < size; round++) {
    for (const id of ids) {
      const taken = draw({ pile: rest, discard: [], reshuffles: 0 }, 0, () => 0)
      if (taken.card) hands[id].push(taken.card)
      rest = taken.piles.pile
    }
  }

  return { hands, pile: rest }
}

/**
 * Seconds of a turn, short for a player who stopped answering
 * @param {number} strikes - Turns missed in a row
 * @param {number} turnSeconds - Host clock
 * @return {number} - Seconds
 */

export const turnSecondsOf = (strikes: number, turnSeconds: number): number =>
  strikes >= STOPGO_SETTINGS.strikes ? STOPGO_SETTINGS.afkSeconds : turnSeconds

/**
 * Hand after the clock ran out, the drawn card goes to the discard
 * @param {StopGoHandCard[]} hand - Hand with the drawn card last
 * @return {{ hand: StopGoHandCard[], dropped: StopGoHandCard | null }} - Hand and dropped card
 */

export const dropDrawn = (
  hand: StopGoHandCard[]
): { hand: StopGoHandCard[]; dropped: StopGoHandCard | null } => {
  const isFull = hand.length > STOPGO_SETTINGS.handSize

  return { hand: isFull ? hand.slice(0, -1) : hand, dropped: isFull ? (hand.at(-1) ?? null) : null }
}

/**
 * Draw one card for a player
 * @param {StopGoCard[]} pile - Draw pile
 * @param {StopGoCard[]} discard - Discard
 * @param {number} reshuffles - Reshuffles done
 * @param {Random} random - Random source
 * @return {ReturnType<typeof draw>} - Card and piles
 */

export const drawFor = (
  pile: StopGoCard[],
  discard: StopGoCard[],
  reshuffles: number,
  random: Random
): ReturnType<typeof draw> =>
  draw({ pile, discard, reshuffles }, STOPGO_SETTINGS.reshuffles, random)
