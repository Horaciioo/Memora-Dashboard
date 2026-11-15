import 'server-only'

import { conflict } from '@/core/lib/errors'
import { readBodyInteger, readBodyList } from '@/core/lib/play/parse'
import { applyCard, canPlay, isOpenCard, isStale, raceOf } from '@/core/lib/play/stopgo'
import type { StopGoHandCard } from '@/core/lib/play/stopgo'
import { passTurn, closeRace } from '@/core/services/play/stopgo/StopGoFlowService'
import { racing, saveSeat, seatOf, withTable } from '@/core/services/play/stopgo/StopGoTable'
import type { StopGoLockedTable, StopGoMoveInput } from '@/core/services/play/stopgo/StopGoTable'
import { STOPGO_CARDS, StopGoFamilies } from '@/declarations/play/stopgo/cards'
import { STOPGO_ERRORS } from '@/declarations/play/stopgo/copy'
import { StopGoRefusals } from '@/declarations/play/stopgo/refusals'
import type { StopGoRefusal } from '@/declarations/play/stopgo/refusals'
import type { EngineSession, EngineStep } from '@/types/play'
import { StopGoMoveKinds, StopGoPhases } from '@/utils/constants/play'

/**
 * Refuse a move with the message of a refusal
 * @param {StopGoRefusal} refusal - Why
 * @return {never} - Always throws
 */

const refuse = (refusal: StopGoRefusal): never => {
  throw conflict(STOPGO_ERRORS[refusal])
}

/**
 * Card of the player's hand the move names, after every guard of a turn
 * @param {StopGoLockedTable} table - Table
 * @param {string} accountId - Player
 * @param {Record<string, unknown>} raw - Body
 * @return {StopGoHandCard} - Card
 */

const cardOfTurn = (
  table: StopGoLockedTable,
  accountId: string,
  raw: Record<string, unknown>
): StopGoHandCard => {
  const { game } = table
  if (game.phase !== StopGoPhases.Playing) refuse(StopGoRefusals.RaceOver)
  if (game.turnId !== accountId) refuse(StopGoRefusals.NotYourTurn)
  if (isStale(game.turnNo, readBodyInteger(raw, 'turnNo'))) refuse(StopGoRefusals.StaleTurn)
  if (table.now < game.startsAt) refuse(StopGoRefusals.NotYourTurn)
  const cardId = typeof raw.cardId === 'string' ? raw.cardId : ''
  const card = seatOf(table, accountId)?.hand.find(
    (entry) => entry.id === cardId && !entry.isPicking
  )

  return card ?? refuse(StopGoRefusals.NotInHand)
}

/**
 * Hand and discard after a card leaves
 * @param {StopGoLockedTable} table - Table
 * @param {string} accountId - Player
 * @param {StopGoHandCard} card - Card leaving
 * @return {Promise<void>} - Written
 */

const releaseCard = async (
  table: StopGoLockedTable,
  accountId: string,
  card: StopGoHandCard
): Promise<void> => {
  const seat = seatOf(table, accountId)!
  table.game.discard = [...table.game.discard, { id: card.id, key: card.key }]
  await saveSeat(table, accountId, {
    hand: seat.hand.filter((entry) => entry.id !== card.id),
    strikes: 0,
  })
}

/**
 * Line of the log for a card played face up
 * @param {StopGoHandCard} card - Card
 * @param {string} accountId - Player
 * @param {string[]} targets - Players aimed at
 * @return {StopGoMoveInput} - Line
 */

const lineOf = (card: StopGoHandCard, accountId: string, targets: string[]): StopGoMoveInput => {
  const spec = STOPGO_CARDS[card.key]
  const kind =
    spec.family === StopGoFamilies.Distance
      ? StopGoMoveKinds.Distance
      : card.key === 'green'
        ? StopGoMoveKinds.Green
        : StopGoMoveKinds.Remedy

  return {
    kind,
    accountId,
    card: card.key,
    targetIds: targets,
    km: 'km' in spec ? spec.km : undefined,
  }
}

/**
 * Play a card of the hand
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player
 * @param {Record<string, unknown>} raw - Body with turnNo and cardId
 * @return {Promise<EngineStep>} - Step
 */

export const playCard = (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> =>
  withTable(session, async (table) => {
    const card = cardOfTurn(table, accountId, raw)
    const targets = readBodyList(raw, 'targets') ?? []
    if (!isOpenCard(card.key)) refuse(StopGoRefusals.NotYet)

    // The rules judge on the server's cars, never on a value from the client
    const race = raceOf(racing(table), table.settings.target)
    const verdict = canPlay(card.key, accountId, targets, race)
    if (verdict) refuse(verdict)
    const after = applyCard(card.key, accountId, targets, race)

    for (const [id, car] of Object.entries(after.cars).filter(
      ([id, car]) => car !== race.cars[id]
    )) {
      await saveSeat(table, id, { km: car.km, isGreen: car.isGreen, hazards: car.hazards })
    }
    await releaseCard(table, accountId, card)
    const lines = [lineOf(card, accountId, targets)]

    // Exact distance reached
    if (after.cars[accountId].km === table.settings.target)
      return closeRace(table, accountId, lines)

    return passTurn(table, accountId, lines)
  })

/**
 * Throw a card away, always allowed on the player's turn
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player
 * @param {Record<string, unknown>} raw - Body with turnNo and cardId
 * @return {Promise<EngineStep>} - Step
 */

export const discardCard = (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> =>
  withTable(session, async (table) => {
    const card = cardOfTurn(table, accountId, raw)
    await releaseCard(table, accountId, card)

    return passTurn(table, accountId, [
      { kind: StopGoMoveKinds.Discard, accountId, card: card.key },
    ])
  })
