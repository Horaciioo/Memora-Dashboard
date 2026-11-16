import 'server-only'

import { after } from '@/core/lib/play/clock'
import {
  drawCards,
  drawFor,
  isPicking,
  keepPicked,
  needsDraw,
  PICK_PENDING,
  sealedOf,
  secureRandom,
} from '@/core/lib/play/stopgo'
import type { StopGoHandCard } from '@/core/lib/play/stopgo'
import { closeRace, passTurn } from '@/core/services/play/stopgo/StopGoFlowService'
import { refuse, requireLive, requireTurn } from '@/core/services/play/stopgo/StopGoGuards'
import { releaseCard } from '@/core/services/play/stopgo/StopGoHand'
import {
  movedStep,
  saveSeat,
  seatOf,
  withTable,
  writeMoves,
} from '@/core/services/play/stopgo/StopGoTable'
import type { StopGoLockedTable, StopGoMoveInput } from '@/core/services/play/stopgo/StopGoTable'
import { StopGoRefusals } from '@/declarations/play/stopgo/refusals'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'
import type { EngineSession, EngineStep } from '@/types/play'
import { StopGoMoveKinds } from '@/utils/constants/play'

/**
 * Play the Good draw: two cards drawn, one to keep
 * @param {StopGoLockedTable} table - Table
 * @param {string} accountId - Player on turn
 * @param {StopGoHandCard} card - Good draw from the hand
 * @return {Promise<EngineStep>} - Step
 */

export const openGoodDraw = async (
  table: StopGoLockedTable,
  accountId: string,
  card: StopGoHandCard
): Promise<EngineStep> => {
  const { game } = table
  await releaseCard(table, accountId, card)
  const line: StopGoMoveInput = { kind: StopGoMoveKinds.GoodDraw, accountId, card: card.key }

  // Piles after the draw
  const found = drawCards(
    { pile: game.drawPile, discard: game.discard, reshuffles: game.reshuffles },
    2,
    STOPGO_SETTINGS.reshuffles,
    secureRandom
  )
  game.drawPile = found.piles.pile
  game.discard = found.piles.discard
  game.reshuffles = found.piles.reshuffles
  const seat = seatOf(table, accountId)!

  // Nothing to choose from: keep what was found
  if (found.cards.length < 2) {
    await saveSeat(table, accountId, { hand: [...seat.hand, ...found.cards] })

    return passTurn(table, accountId, [line])
  }

  // Both cards wait in the hand, flagged
  await saveSeat(table, accountId, {
    hand: [...seat.hand, ...found.cards.map((entry) => ({ ...entry, isPicking: true }))],
  })
  game.pending = PICK_PENDING
  game.pendingEndsAt = after(table.now, STOPGO_SETTINGS.goodDrawSeconds)
  await writeMoves(table, [line])

  return { changed: true, finished: false, deadline: game.pendingEndsAt }
}

/**
 * Keep one drawn card, throw the other face up
 * @param {StopGoLockedTable} table - Table
 * @param {string | undefined} keepId - Kept card, the first when missing
 * @return {Promise<EngineStep>} - Step after the turn passed
 */

export const resolvePick = async (
  table: StopGoLockedTable,
  keepId?: string
): Promise<EngineStep> => {
  const { game } = table
  const seat = seatOf(table, game.turnId)!
  const { hand, dropped } = keepPicked(seat.hand, keepId)
  if (dropped) game.discard = [...game.discard, { id: dropped.id, key: dropped.key }]
  game.pending = null
  game.pendingEndsAt = null
  await saveSeat(table, seat.accountId, { hand })

  return passTurn(
    table,
    seat.accountId,
    dropped ? [{ kind: StopGoMoveKinds.Discard, accountId: seat.accountId, card: dropped.key }] : []
  )
}

/**
 * Choose the card to keep
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player on turn
 * @param {Record<string, unknown>} raw - Body with turnNo and cardId
 * @return {Promise<EngineStep>} - Step
 */

export const pickCard = (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> =>
  withTable(session, async (table) => {
    requireLive(table, raw)
    if (!isPicking(table.game.pending)) refuse(StopGoRefusals.NotPicking)
    if (table.game.turnId !== accountId) refuse(StopGoRefusals.NotYourTurn)
    const cardId = typeof raw.cardId === 'string' ? raw.cardId : ''
    const isOffered = seatOf(table, accountId)?.hand.some(
      (entry) => entry.id === cardId && entry.isPicking
    )

    return isOffered ? resolvePick(table, cardId) : refuse(StopGoRefusals.NotInHand)
  })

/**
 * Take the card of the turn from the pile, on the player's own click
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player on turn
 * @param {Record<string, unknown>} raw - Body with turnNo
 * @return {Promise<EngineStep>} - Step
 */

export const takeCard = (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> =>
  withTable(session, async (table) => {
    requireTurn(table, accountId, raw)
    const { game } = table
    const seat = seatOf(table, accountId)!
    if (!needsDraw(seat.hand.length, sealedOf(seat.sealed).length)) {
      refuse(StopGoRefusals.AlreadyDrawn)
    }
    const found = drawFor(game.drawPile, game.discard, game.reshuffles, secureRandom)

    // Pile and discard both spent: the race ends on distance
    if (!found.card) return closeRace(table, null)
    const isShuffled = found.piles.reshuffles > game.reshuffles
    game.drawPile = found.piles.pile
    game.discard = found.piles.discard
    game.reshuffles = found.piles.reshuffles
    await saveSeat(table, accountId, { hand: [...seat.hand, found.card] })
    if (isShuffled) await writeMoves(table, [{ kind: StopGoMoveKinds.Shuffle, accountId }])
    table.isDirty = true

    return movedStep(table)
  })
