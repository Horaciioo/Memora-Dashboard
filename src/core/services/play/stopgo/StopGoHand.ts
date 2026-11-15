import 'server-only'

import type { StopGoHandCard } from '@/core/lib/play/stopgo'
import { saveSeat, seatOf } from '@/core/services/play/stopgo/StopGoTable'
import type { StopGoLockedTable } from '@/core/services/play/stopgo/StopGoTable'

/**
 * Hand and discard after a card leaves
 * @param {StopGoLockedTable} table - Table
 * @param {string} accountId - Player
 * @param {StopGoHandCard} card - Card leaving
 * @return {Promise<void>} - Written
 */

export const releaseCard = async (
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
 * Hand after a safety is laid down, it stays on the car and never reaches the discard
 * @param {StopGoLockedTable} table - Table
 * @param {string} accountId - Player
 * @param {StopGoHandCard} card - Safety leaving the hand
 * @return {Promise<void>} - Written
 */

export const layCard = async (
  table: StopGoLockedTable,
  accountId: string,
  card: StopGoHandCard
): Promise<void> => {
  const seat = seatOf(table, accountId)!
  await saveSeat(table, accountId, {
    hand: seat.hand.filter((entry) => entry.id !== card.id),
    strikes: 0,
  })
}
