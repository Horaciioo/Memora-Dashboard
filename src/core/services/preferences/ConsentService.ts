import 'server-only'

import { prisma } from '@/core/lib/db'
import { HISTORY_CONSENT } from '@/declarations/system/privacy'
import type { SessionUser } from '@/types/auth'

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
  await prisma.account.update({
    where: { id: accountId },
    data: { historyConsentAt: new Date(), historyConsentVersion: HISTORY_CONSENT.version },
  })
}
