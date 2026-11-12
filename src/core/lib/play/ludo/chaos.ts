import { fadeLine, spawnGhost } from '@/core/lib/play/ludo/ghost'
import type { ChaosSeat, LudoEffects, LudoLine } from '@/core/lib/play/ludo/effects'
import { rollDie } from '@/core/lib/play/ludo/rules'
import type { LudoPlan } from '@/core/lib/play/ludo/rules'
import { chaosKindOf, isOnTrack, squareOf } from '@/core/lib/play/ludo/track'
import { LUDO_BONUSES, LUDO_CHAOS, LUDO_MALUSES } from '@/declarations/play/ludo/chaos'
import type { LudoEffectName } from '@/declarations/play/ludo/chaos'
import { LUDO_CORNERS } from '@/declarations/play/ludo/board'

/**
 * What a landing on an action square gives
 * @typedef {Object} ChaosOutcome
 */

export interface ChaosOutcome<T extends ChaosSeat> {
  seats: T[]
  lines: LudoLine[]
  // Malus held back for a joker answer
  malus: LudoEffectName | null
  // Duel to play: the others throw their own die
  isDuel?: boolean
}

interface ChaosContext<T extends ChaosSeat> {
  seats: T[]
  moverId: string
  pawn: number
  random: () => number
}

/**
 * Seats with one colour changed
 * @param {T[]} seats - Board
 * @param {string} accountId - Colour to change
 * @param {(seat: T) => T} change - Change
 * @return {T[]} - Board afterwards
 */

const patch = <T extends ChaosSeat>(seats: T[], accountId: string, change: (seat: T) => T): T[] =>
  seats.map((seat) => (seat.accountId === accountId ? change(seat) : seat))

/**
 * Die face under the effects of its thrower
 * @param {LudoEffects} effects - Effects
 * @param {() => number} [random] - Random source
 * @return {number} - Face
 */

export const faceOf = (effects: LudoEffects, random: () => number = Math.random): number => {
  if (effects.faulty) return 1 + Math.floor(random() * LUDO_CHAOS.faultyMax)
  if (effects.boost) return LUDO_CHAOS.boostMin + Math.floor(random() * (7 - LUDO_CHAOS.boostMin))

  return rollDie(random)
}

/**
 * Second die of a double throw, never the face of the first
 * @param {LudoEffects} effects - Effects
 * @param {number} first - First face
 * @param {() => number} [random] - Random source
 * @return {number} - Face
 */

export const otherFaceOf = (
  effects: LudoEffects,
  first: number,
  random: () => number = Math.random
): number => {
  const face = faceOf(effects, random)
  if (face !== first) return face

  // Draw again until another face shows, the last try takes the next one up
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const next = faceOf(effects, random)
    if (next !== first) return next
  }

  return (first % 6) + 1
}

/**
 * Duel of dice settled: a lone best thrower among the others pushes the trigger back
 * @param {Object} input - Duel
 * @param {T[]} input.seats - Board
 * @param {string} input.moverId - Player who triggered it
 * @param {number} input.pawn - Pawn on the square
 * @param {{ accountId: string; dice: number }[]} input.rolls - Faces thrown by the others
 * @return {Object} - Lines and seats
 */

export const duelRecoil = <T extends ChaosSeat>({
  seats,
  moverId,
  pawn,
  rolls,
}: {
  seats: T[]
  moverId: string
  pawn: number
  rolls: { accountId: string; dice: number }[]
}) => {
  const best = Math.max(0, ...rolls.map((roll) => roll.dice))
  const winners = rolls.filter((roll) => roll.dice === best)
  const mover = seats.find((seat) => seat.accountId === moverId)!
  const from = mover.pawns[pawn]

  // A lone winner pushes back
  if (winners.length !== 1 || from < 1) return { seats, lines: [] as LudoLine[] }
  const crowded = (step: number) =>
    seats.some((seat) =>
      seat.pawns.some(
        (other, index) =>
          !(seat.accountId === moverId && index === pawn) &&
          isOnTrack(other) &&
          squareOf(seat.corner, other) === squareOf(mover.corner, step)
      )
    )
  const first = Math.max(0, from - best)
  const to = Array.from({ length: from - first }, (_, index) => first + index).find(
    (step) => !crowded(step)
  )
  if (to === undefined) return { seats, lines: [] as LudoLine[] }

  return {
    seats: patch(seats, moverId, (seat) => ({
      ...seat,
      pawns: seat.pawns.map((step, index) => (index === pawn ? to : step)),
    })),
    lines: [
      {
        kind: 'RECOIL' as const,
        accountId: moverId,
        pawn,
        from,
        to,
        victimId: winners[0].accountId,
        value: best,
      },
    ],
  }
}

// Effects set by a malus, per name
const MALUS_PATCH: Partial<Record<LudoEffectName, () => Partial<LudoEffects>>> = {
  faulty: () => ({ faulty: LUDO_CHAOS.faultyTurns }),
  stall: () => ({ skip: true }),
  blind: () => ({ blind: LUDO_CHAOS.blindTurns }),
}

/**
 * Malus at work
 * @param {LudoEffectName} malus - Malus
 * @param {ChaosContext} context - Context
 * @return {Object} - Lines and seats
 */

export const applyMalus = <T extends ChaosSeat>(
  malus: LudoEffectName,
  context: ChaosContext<T>
) => {
  if (malus === 'duel') return { seats: context.seats, lines: [] as LudoLine[] }
  const change = MALUS_PATCH[malus]?.() ?? {}

  return {
    seats: patch(context.seats, context.moverId, (seat) => ({
      ...seat,
      effects: { ...seat.effects, ...change },
    })),
    lines: [] as LudoLine[],
  }
}

/**
 * Colour a chameleon takes, among the three others
 * @param {ChaosSeat[]} seats - Board
 * @param {ChaosSeat} mover - Chameleon
 * @param {() => number} random - Random source
 * @return {number} - Corner
 */

const colourFor = (seats: ChaosSeat[], mover: ChaosSeat, random: () => number): number => {
  const others = LUDO_CORNERS.map((_, corner) => corner).filter((corner) => corner !== mover.corner)
  const free = others.filter(
    (corner) => !seats.some((seat) => seat.corner === corner && seat.effects.chameleon)
  )
  const pool = free.length ? free : others

  return pool[Math.floor(random() * pool.length)]
}

/**
 * Bonus at work
 * @param {LudoEffectName} bonus - Bonus
 * @param {ChaosContext} context - Context
 * @return {Object} - Lines, seats and the rev the phantom starts on
 */

export const applyBonus = <T extends ChaosSeat>(
  bonus: LudoEffectName,
  context: ChaosContext<T>
) => {
  const { seats, moverId, pawn, random } = context
  const mover = seats.find((seat) => seat.accountId === moverId)!
  const set = (change: Partial<LudoEffects>, pawns = mover.pawns) =>
    patch(seats, moverId, (seat) => ({ ...seat, pawns, effects: { ...seat.effects, ...change } }))

  if (bonus === 'double') return { seats: set({ double: true }), lines: [] as LudoLine[] }
  if (bonus === 'boost') return { seats: set({ boost: true }), lines: [] as LudoLine[] }
  if (bonus === 'chameleon') {
    const colour = colourFor(seats, mover, random)

    return {
      seats: set({ chameleon: { turns: LUDO_CHAOS.chameleonTurns, colour } }),
      lines: [] as LudoLine[],
      value: colour,
    }
  }

  // Ghost, a second pair never starts over the first
  if (mover.effects.ghost) return { seats, lines: [] as LudoLine[] }
  const born = spawnGhost({ seats, moverId, pawn, random })

  return {
    seats: set(
      { ghost: born.ghost },
      mover.pawns.map((step, index) => (index === pawn ? born.real : step))
    ),
    lines: [born.line],
  }
}

/**
 * Landing on an action square
 * @param {Object} input - Landing
 * @param {T[]} input.seats - Board after the move
 * @param {string} input.moverId - Player moving
 * @param {LudoPlan} input.plan - Move played
 * @param {() => number} [input.random] - Random source
 * @param {LudoEffectName} [input.force] - Effect picked for a test
 * @return {ChaosOutcome<T>} - Outcome
 */

export const landOnSquare = <T extends ChaosSeat>({
  seats,
  moverId,
  plan,
  random = Math.random,
  force,
}: {
  seats: T[]
  moverId: string
  plan: LudoPlan
  random?: () => number
  force?: LudoEffectName
}): ChaosOutcome<T> => {
  const mover = seats.find((seat) => seat.accountId === moverId)
  const none = { seats, lines: [], malus: null }
  if (!mover || plan.isHome || !isOnTrack(plan.to)) return none
  const kind = chaosKindOf(squareOf(mover.corner, plan.to))
  if (!kind) return none

  // Effect drawn from its family
  const pool = kind === 'bonus' ? LUDO_BONUSES : LUDO_MALUSES
  const effect = force ?? pool[Math.floor(random() * pool.length)]
  const head: LudoLine = {
    kind: 'EFFECT',
    accountId: moverId,
    pawn: plan.pawn,
    to: plan.to,
    effect,
  }
  const context = { seats, moverId, pawn: plan.pawn, random }
  if (kind === 'bonus') {
    const bonus = applyBonus(effect, context)

    return {
      seats: bonus.seats,
      lines: [{ ...head, value: 'value' in bonus ? bonus.value : undefined }, ...bonus.lines],
      malus: null,
    }
  }

  // A joker holder is asked before the malus lands
  if (mover.joker > 0) return { seats, lines: [head, { ...head, kind: 'OFFER' }], malus: effect }
  if (effect === 'duel') return { seats, lines: [head], malus: null, isDuel: true }
  const malus = applyMalus(effect, context)

  return { seats: malus.seats, lines: [head, ...malus.lines], malus: null }
}

/**
 * Turn over: every timed effect loses a turn
 * @param {ChaosSeat} seat - Colour whose turn ended
 * @param {number} count - Pawns per colour
 * @return {Object} - Effects left and the lines of those ended
 */

export const tickEffects = (seat: ChaosSeat, count: number) => {
  const { effects } = seat
  const lines: LudoLine[] = []
  const next: LudoEffects = { ...effects }
  const end = (effect: string) => lines.push({ kind: 'EXPIRE', accountId: seat.accountId, effect })

  // Each counter steps down, the last one ends
  for (const key of ['faulty', 'blind'] as const) {
    const left = (effects[key] ?? 0) - 1
    if (!effects[key]) continue
    if (left > 0) next[key] = left
    else {
      delete next[key]
      end(key === 'faulty' ? 'faulty' : 'blind')
    }
  }
  if (effects.chameleon) {
    if (effects.chameleon.turns > 1)
      next.chameleon = { ...effects.chameleon, turns: effects.chameleon.turns - 1 }
    else {
      delete next.chameleon
      end('chameleon')
    }
  }
  if (effects.ghost) {
    if (effects.ghost.turns > 1) next.ghost = { ...effects.ghost, turns: effects.ghost.turns - 1 }
    else {
      delete next.ghost
      lines.push(fadeLine(seat.accountId, effects.ghost, count))
    }
  }

  return { effects: next, lines }
}
