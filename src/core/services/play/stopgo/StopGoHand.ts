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
