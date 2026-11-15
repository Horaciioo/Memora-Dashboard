import 'server-only'

import {
  applyMysteryReveal,
  canReveal,
  canSeal,
  drawCards,
  raceOf,
  revealSealed,
  sealedOf,
  secureRandom,
} from '@/core/lib/play/stopgo'
import type { StopGoHandCard } from '@/core/lib/play/stopgo'
import { passTurn } from '@/core/services/play/stopgo/StopGoFlowService'
import { refuse, requireTurn } from '@/core/services/play/stopgo/StopGoGuards'
import { releaseCard } from '@/core/services/play/stopgo/StopGoHand'
import {
  movedStep,
  racing,
  saveCars,
  saveSeat,
  seatOf,
  withTable,
  writeMoves,
} from '@/core/services/play/stopgo/StopGoTable'
import type { StopGoLockedTable } from '@/core/services/play/stopgo/StopGoTable'
import { StopGoRefusals } from '@/declarations/play/stopgo/refusals'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'
import type { EngineSession, EngineStep } from '@/types/play'
import { StopGoMoveKinds } from '@/utils/constants/play'

/**
 * Play the Mystery draw: top card sealed on a target
 * @param {StopGoLockedTable} table - Table
 * @param {string} accountId - Player on turn
 * @param {StopGoHandCard} card - Mystery draw from the hand
 * @param {string[]} targets - One opponent, already checked
 * @return {Promise<EngineStep>} - Step
 */

export const sealMystery = async (
  table: StopGoLockedTable,
  accountId: string,
  card: StopGoHandCard,
  targets: string[]
): Promise<EngineStep> => {
  const { game } = table
  const [targetId] = targets
  const sealed = sealedOf(seatOf(table, targetId)?.sealed)
  const verdict = canSeal(sealed)
  if (verdict) refuse(verdict)

  // Top of the pile, hidden from every board
  const found = drawCards(
    { pile: game.drawPile, discard: game.discard, reshuffles: game.reshuffles },
    1,
    STOPGO_SETTINGS.reshuffles,
    secureRandom
  )
  if (!found.cards.length) refuse(StopGoRefusals.PileEmpty)
  game.drawPile = found.piles.pile
  game.discard = found.piles.discard
  game.reshuffles = found.piles.reshuffles
  await saveSeat(table, targetId, {
    sealed: [...sealed, { card: found.cards[0], fromId: accountId, at: table.now.toISOString() }],
  })
  await releaseCard(table, accountId, card)

  // Log line carries no card
  return passTurn(table, accountId, [
    { kind: StopGoMoveKinds.Mystery, accountId, targetIds: [targetId] },
  ])
}

/**
 * Pay to turn the sealed card into a normal one
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player on turn
 * @param {Record<string, unknown>} raw - Body with turnNo
 * @return {Promise<EngineStep>} - Step
 */

export const revealMystery = (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> =>
  withTable(session, async (table) => {
    requireTurn(table, accountId, raw)
    const seat = seatOf(table, accountId)!
    const sealed = sealedOf(seat.sealed)
    const verdict = canReveal(sealed)
    if (verdict) refuse(verdict)

    // Distance paid, never below zero
    const race = raceOf(racing(table), table.settings.target)
    const next = applyMysteryReveal(race, accountId)
    const paid = seat.km - next.cars[accountId].km
    await saveCars(table, race, next)
    await saveSeat(table, accountId, revealSealed(seat.hand, sealed))
    await writeMoves(table, [{ kind: StopGoMoveKinds.Reveal, accountId, value: paid }])

    return movedStep(table)
  })
