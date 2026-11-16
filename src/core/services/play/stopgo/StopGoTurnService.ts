import 'server-only'

import { readBodyList } from '@/core/lib/play/parse'
import { applyCard, canPlay, isOpenCard, needsDraw, raceOf, sealedOf } from '@/core/lib/play/stopgo'
import type { StopGoHandCard } from '@/core/lib/play/stopgo'
import { closeRace, giveTurn, passTurn } from '@/core/services/play/stopgo/StopGoFlowService'
import { launchAttack } from '@/core/services/play/stopgo/StopGoAttackService'
import { refuse, requireTurn } from '@/core/services/play/stopgo/StopGoGuards'
import { layCard, releaseCard } from '@/core/services/play/stopgo/StopGoHand'
import { openGoodDraw } from '@/core/services/play/stopgo/StopGoDrawService'
import { sealMystery } from '@/core/services/play/stopgo/StopGoMysteryService'
import { racing, saveCars, seatOf, withTable } from '@/core/services/play/stopgo/StopGoTable'
import type { StopGoLockedTable, StopGoMoveInput } from '@/core/services/play/stopgo/StopGoTable'
import { STOPGO_CARDS, StopGoFamilies } from '@/declarations/play/stopgo/cards'
import { StopGoRefusals } from '@/declarations/play/stopgo/refusals'
import type { EngineSession, EngineStep } from '@/types/play'
import { StopGoMoveKinds } from '@/utils/constants/play'

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
  requireTurn(table, accountId, raw)
  const seat = seatOf(table, accountId)
  if (seat && needsDraw(seat.hand.length, sealedOf(seat.sealed).length)) {
    refuse(StopGoRefusals.MustDraw)
  }
  const cardId = typeof raw.cardId === 'string' ? raw.cardId : ''
  const card = seatOf(table, accountId)?.hand.find(
    (entry) => entry.id === cardId && !entry.isPicking
  )

  return card ?? refuse(StopGoRefusals.NotInHand)
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

    // An attack waits for the answers of its targets
    if (STOPGO_CARDS[card.key].family === StopGoFamilies.Attack) {
      return launchAttack(table, accountId, card, targets)
    }

    // Bonus cards
    if (card.key === 'goodDraw') return openGoodDraw(table, accountId, card)
    if (card.key === 'mystery') return sealMystery(table, accountId, card, targets)
    const after = applyCard(card.key, accountId, targets, race)

    // A safety stays on the car and gives another turn
    if (STOPGO_CARDS[card.key].family === StopGoFamilies.Safety) {
      await saveCars(table, race, after)
      await layCard(table, accountId, card)

      return giveTurn(table, accountId, [
        { kind: StopGoMoveKinds.Safety, accountId, card: card.key },
      ])
    }

    await saveCars(table, race, after)
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
