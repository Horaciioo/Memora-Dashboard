import 'server-only'

import { readHiddenSeats } from '@/core/services/recruitment/SeatReader'
import { SEAT_COPY } from '@/declarations/members/seats'

/**
 * Unidentified label of each member whose archives were deleted from a session
 * @param {string} sessionId - Session identifier
 * @return {Promise<Map<string, string>>} - Label by account
 */

export const hiddenLabels = async (sessionId: string): Promise<Map<string, string>> =>
  new Map(
    [...(await readHiddenSeats(sessionId))].map(([accountId, kind]) => [
      accountId,
      SEAT_COPY.unidentified[kind],
    ])
  )
