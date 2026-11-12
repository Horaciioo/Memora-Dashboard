import type { LudoMoveKind, Prisma } from '@prisma/client'

import type { LudoSeat } from '@/core/lib/play/ludo/rules'
import type { LudoEffectName } from '@/declarations/play/ludo/chaos'

/**
 * Phantom pair of a pawn
 * @typedef {Object} LudoGhost
 */

export interface LudoGhost {
  // Real pawn index
  pawn: number
  // Step of the decoy
  step: number
  // Which of two labels the others see the real one under
  swap: 0 | 1
  turns: number
}

/**
 * Chaos effects at work on a colour
 * @typedef {Object} LudoEffects
 */

export interface LudoEffects {
  ghost?: LudoGhost
  chameleon?: { turns: number; colour: number }
  boost?: boolean
  double?: boolean
  faulty?: number
  blind?: number
  skip?: boolean
}

/**
 * Colour in Chaos mode
 * @typedef {Object} ChaosSeat
 */

export interface ChaosSeat extends LudoSeat {
  joker: number
  effects: LudoEffects
}

/**
 * One line written for the board
 * @typedef {Object} LudoLine
 */

export interface LudoLine {
  kind: LudoMoveKind
  accountId: string
  dice?: number
  pawn?: number
  from?: number
  to?: number
  victimId?: string
  effect?: string
  value?: number
}

/**
 * Malus waiting for a joker answer
 * @typedef {Object} LudoOffer
 */

export interface LudoOffer {
  malus: LudoEffectName
  pawn: number
  to: number
  // Bonus throw kept for the move
  isBonus: boolean
  steps: number
}

/**
 * Choice the turn waits on
 * @typedef {Object} LudoPending
 */

export interface LudoDuelWait {
  type: 'duel'
  pawn: number
  // Bonus throw kept for the move
  isBonus: boolean
  steps: number
  // Players who still have to throw, and the faces thrown
  waiting: string[]
  rolls: Record<string, number>
}

/**
 * Storm of dice: every colour still racing throws its own die before the turn starts
 * @typedef {Object} LudoFrenzyWait
 */

export interface LudoFrenzyWait {
  type: 'frenzy'
  waiting: string[]
  rolls: Record<string, number>
}

export type LudoPending =
  | ({ type: 'joker' } & LudoOffer)
  | { type: 'pick'; dice: [number, number] }
  | LudoDuelWait
  | LudoFrenzyWait

/**
 * Effects as stored
 * @param {Prisma.JsonValue} stored - Stored effects
 * @return {LudoEffects} - Effects
 */

export const effectsOf = (stored: Prisma.JsonValue | undefined): LudoEffects =>
  (stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {}) as LudoEffects

/**
 * Pending choice as stored
 * @param {Prisma.JsonValue} stored - Stored choice
 * @return {LudoPending | null} - Choice
 */

export const pendingOf = (stored: Prisma.JsonValue | undefined): LudoPending | null =>
  stored && typeof stored === 'object' && !Array.isArray(stored)
    ? (stored as unknown as LudoPending)
    : null

/**
 * Colour each player is drawn in
 * @param {ChaosSeat[]} seats - Players
 * @return {Record<string, number>} - Corner shown
 */

export const looksOf = (seats: Pick<ChaosSeat, 'accountId' | 'corner' | 'effects'>[]) => {
  const looks: Record<string, number> = Object.fromEntries(
    seats.map((seat) => [seat.accountId, seat.corner])
  )

  // A chameleon swaps colours with whoever holds the one it takes
  for (const seat of seats) {
    const colour = seat.effects.chameleon?.colour
    if (colour === undefined) continue
    looks[seat.accountId] = colour
    const holder = seats.find(
      (other) => other.corner === colour && other.accountId !== seat.accountId
    )
    if (holder && !holder.effects.chameleon) looks[holder.accountId] = seat.corner
  }

  return looks
}
