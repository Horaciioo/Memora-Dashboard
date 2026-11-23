import 'server-only'

import { prisma } from '@/core/lib/db'
import { RECAP_SETTINGS } from '@/declarations/configurations/settings'
import { DAY_MS } from '@/utils/constants/time'

/**
 * Window of a recap
 * @typedef {Object} RecapWindow
 * @property {Date} since - Start
 * @property {Date} until - End
 * @property {boolean} isAway - Gone long enough to be welcomed back
 */

export interface RecapWindow {
  since: Date
  until: Date
  isAway: boolean
}

// The window never reaches further back than the setting allows
const clampSince = (since: Date, now: Date): Date =>
  new Date(Math.max(+since, +now - RECAP_SETTINGS.maxWindowDays * DAY_MS))

/**
 * Mark the member as around now
 * @param {string} accountId - Account identifier
 * @return {Promise<void>} - Stamped
 */

export const stampPresence = async (accountId: string): Promise<void> => {
  await prisma.account.update({ where: { id: accountId }, data: { recapSeenAt: new Date() } })
}

/**
 * Window of one member, from their last sign of life or from a start they picked
 * @param {string} accountId - Account identifier
 * @param {Date | null} from - Start picked by hand, null to read the last sign of life
 * @param {Date} now - Present moment
 * @return {Promise<RecapWindow | null>} - Window, or null for a member never seen before
 */

export const resolveWindow = async (
  accountId: string,
  from: Date | null,
  now: Date
): Promise<RecapWindow | null> => {
  if (from) return { since: clampSince(from, now), until: now, isAway: false }

  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { recapSeenAt: true },
  })

  // A first visit has nothing behind it, the clock starts now
  if (!account?.recapSeenAt) {
    await stampPresence(accountId)

    return null
  }

  return {
    since: clampSince(account.recapSeenAt, now),
    until: now,
    isAway: +now - +account.recapSeenAt >= RECAP_SETTINGS.awayAfterMs,
  }
}
