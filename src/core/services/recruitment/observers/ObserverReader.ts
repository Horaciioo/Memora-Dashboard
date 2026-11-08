import 'server-only'

import { readSeatStates } from '@/core/services/recruitment/readers/SeatReader'

/**
 * Whether a member observes a session, by a named seat or by an interview they sit in
 * @param {string} sessionId - Session identifier
 * @param {string} accountId - Member
 * @return {Promise<boolean>} - Holds an observer seat
 */

export const isObserver = async (sessionId: string, accountId: string): Promise<boolean> =>
  (await readSeatStates(accountId, sessionId)).get(sessionId)?.observing === true
