import { STOPGO_CARDS, StopGoTargets } from '@/declarations/play/stopgo/cards'
import type { StopGoCardKey } from '@/declarations/play/stopgo/cards'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'
import { StopGoPhases } from '@/utils/constants/play'

import { hazardOf, windowOf } from '@/core/lib/play/stopgo/attack'
import { aimableOf, canPlay, counterOf, isMoving } from '@/core/lib/play/stopgo/rules'
import type { StopGoGameSettings } from '@/core/lib/play/stopgo/settings'
import type {
  StopGoGameState,
  StopGoLogLine,
  StopGoSeatState,
  StopGoTable,
} from '@/core/lib/play/stopgo/state'
import { isPicking, needsDraw, sealedOf } from '@/core/lib/play/stopgo/special'
import { carOf, isOpenCard, raceOf } from '@/core/lib/play/stopgo/turn'

/**
 * Everything one read of a race holds
 * @typedef {Object} StopGoViewInput
 */

export interface StopGoViewInput {
  settings: StopGoGameSettings
  game: StopGoGameState
  seats: StopGoSeatState[]
  log: StopGoLogLine[]
  present: ReadonlySet<string>
  now: Date
}

/**
 * Opponents a card may aim at, null when it cannot be played
 * @param {StopGoCardKey} key - Card
 * @param {string} accountId - Player on turn
 * @param {StopGoTable} race - Race
 * @return {string[] | null} - Targets, empty for a card without one
 */

const targetsFor = (
  key: StopGoCardKey,
  accountId: string,
  race: StopGoTable,
  carrying: ReadonlySet<string>
): string[] | null => {
  const spec = STOPGO_CARDS[key]
  if (!isOpenCard(key)) return null
  if (spec.target === StopGoTargets.None) return canPlay(key, accountId, [], race) ? null : []

  // Opponents who can take the malus, none carrying a sealed card for a mystery
  const aimable = aimableOf(spec, race, accountId).filter(
    (id) =>
      key !== 'mystery' || (!carrying.has(id) && race.cars[id].km >= STOPGO_SETTINGS.mysteryCost)
  )
  if (spec.target === StopGoTargets.One) return aimable.length ? aimable : null

  return canPlay(key, accountId, aimable, race) ? null : aimable
}

/**
 * Hand of the reader with the moves each card allows
 * @param {StopGoViewInput} input - One read of the race
 * @param {StopGoSeatState} seat - Seat of the reader
 * @return {object} - Private part of the board
 */

const privateOf = ({ game, seats, settings }: StopGoViewInput, seat: StopGoSeatState) => {
  const carrying = new Set(
    seats.filter((entry) => sealedOf(entry.sealed).length).map((entry) => entry.accountId)
  )
  const isTurn =
    game.phase === StopGoPhases.Playing && game.turnId === seat.accountId && !game.pending
  const racing = seats.filter((entry) => !entry.finishedAt)
  const race = raceOf(racing, settings.target)
  const window = windowOf(game.pending)
  const isLive = game.phase === StopGoPhases.Playing
  const mustDraw = needsDraw(seat.hand.length, sealedOf(seat.sealed).length)

  return {
    // Safety of the hand that stops the attack aimed at the reader, null without one
    counterId:
      isLive && window?.waiting.includes(seat.accountId)
        ? (counterOf(seat.hand, hazardOf(window.card))?.id ?? null)
        : null,
    // Attack aimed at the reader, whatever the hand holds
    isAimed: isLive && !!window?.targets.includes(seat.accountId),
    // The card of the turn waits on the pile until the player takes it
    canDraw: isTurn && mustDraw,
    canReveal: isTurn && sealedOf(seat.sealed).length > 0,
    // Slots taken by sealed cards, nothing of their content
    sealedCount: sealedOf(seat.sealed).length,
    hand: seat.hand.map((card) => ({ id: card.id, key: card.key, isPicking: !!card.isPicking })),
    // Card id to the targets it may aim at
    playable: Object.fromEntries(
      isTurn && !mustDraw
        ? seat.hand
            .filter((card) => !card.isPicking)
            .map((card) => [card.id, targetsFor(card.key, seat.accountId, race, carrying)] as const)
            .filter(([, targets]) => targets)
        : []
    ),
  }
}

/**
 * Boards of a race, one per reader, built field by field
 * @param {StopGoViewInput} input - One read of the race
 * @return {(viewerId: string) => object} - Board of a reader
 */

export const buildBoards = (input: StopGoViewInput) => {
  const { settings, game, seats, log, present, now } = input
  const top = game.discard.at(-1)
  const window = windowOf(game.pending)
  const players = seats.map((seat) => {
    const car = carOf(seat)

    return {
      accountId: seat.accountId,
      slot: seat.slot,
      km: seat.km,
      isGreen: seat.isGreen,
      isMoving: isMoving(car),
      hazards: seat.hazards,
      isLimited: seat.hazards.includes('limit'),
      shields: seat.shields,
      lastHazard: seat.lastHazard,
      handCount: seat.hand.length + sealedOf(seat.sealed).length,
      // Shown once the race is over
      sealedLeft:
        game.phase === StopGoPhases.Over ? sealedOf(seat.sealed).map((s) => s.card.key) : [],
      strikes: seat.strikes,
      place: seat.place,
      hasLeft: !present.has(seat.accountId),
    }
  })

  const board = {
    phase: game.phase,
    rev: game.rev,
    turnId: game.turnId,
    turnNo: game.turnNo,
    startsAt: game.startsAt,
    turnEndsAt: game.turnEndsAt,
    serverTime: now,
    target: settings.target,
    turnSeconds: settings.turnSeconds,
    mapKm: STOPGO_SETTINGS.mapKm,
    signKm: STOPGO_SETTINGS.signKm,
    // Attack waiting, nothing of who holds a safety: a table without one waits as long
    window: window
      ? {
          card: window.card,
          fromId: window.fromId,
          targets: window.targets,
          endsAt: game.pendingEndsAt,
        }
      : null,
    // Player choosing a card, others see no card
    pickerId: isPicking(game.pending) ? game.turnId : null,
    pickEndsAt: isPicking(game.pending) ? game.pendingEndsAt : null,
    pileCount: game.drawPile.length,
    discardCount: game.discard.length,
    discardTop: top ? top.key : null,
    players,
    log: log.map((line) => ({
      rev: line.rev,
      kind: line.kind,
      accountId: line.accountId,
      targetIds: line.targetIds,
      card: line.card,
      km: line.km,
      value: line.value,
    })),
  }

  return (viewerId: string) => {
    const seat = seats.find((entry) => entry.accountId === viewerId)

    // Spectators and admins read the public part only
    return { ...board, you: seat ? privateOf(input, seat) : null }
  }
}

/**
 * Board of a race as a reader gets it
 * @typedef {Object} StopGoBoardView
 */

export type StopGoBoardView = ReturnType<ReturnType<typeof buildBoards>>
