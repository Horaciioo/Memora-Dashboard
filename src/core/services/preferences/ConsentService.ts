import 'server-only'

import { prisma } from '@/core/lib/db'
import { HISTORY_CONSENT } from '@/declarations/system/privacy'
import { CONSENT_COPY } from '@/declarations/ui/copy/privacy'
import type { SessionUser } from '@/types/auth'
import { EVENT_ORIGINS, EVENT_TYPES } from '@/utils/constants/events'

/**
 * Whether a member still owes the current agreement
 * @param {SessionUser} session - Signed-in member
 * @return {boolean} - Consent missing or outdated
 */

export const needsHistoryConsent = (session: SessionUser): boolean =>
  (session.historyConsentVersion ?? 0) < HISTORY_CONSENT.version

/**
 * Record the agreement of one member at the current version
 * @param {string} accountId - Account identifier
 * @return {Promise<void>} - Recorded
 */

export const acceptHistoryConsent = async (accountId: string): Promise<void> => {
  const version = HISTORY_CONSENT.version

  // Agreement and its proof together
  await prisma.$transaction([
    prisma.account.update({
      where: { id: accountId },
      data: { historyConsentAt: new Date(), historyConsentVersion: version },
    }),
    prisma.activityLog.create({
      data: {
        eventType: EVENT_TYPES.ids.ConsentAccepted,
        origin: EVENT_ORIGINS.ids.User,
        actorId: accountId,
        subjectId: accountId,
        summary: CONSENT_COPY.recorded(version),
        payload: { version },
      },
    }),
  ])
}
