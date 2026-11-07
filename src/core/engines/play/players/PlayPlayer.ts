import { isPresent } from '@/core/lib/play/session'
import type { LoadedSession } from '@/core/lib/play/session'
import type { PlayPlayer } from '@/types/play'

/**
 * Seated players, bots marked
 * @param {LoadedSession} session - Game
 * @return {PlayPlayer[]} - Players
 */

export const playersOf = (session: LoadedSession): PlayPlayer[] =>
  session.seats
    .filter(isPresent)
    .map((seat) => ({ accountId: seat.accountId, botKind: seat.account.botKind }))
