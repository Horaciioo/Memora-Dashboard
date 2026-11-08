import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict } from '@/core/lib/errors'
import { admitSession } from '@/core/services/academy/AdmissionService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { reachableSession } from '@/core/services/recruitment'
import { ACCOUNT_ACTIVATION_COPY } from '@/declarations/onboarding/copy'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import type { AccountActivationView } from '@/types/recruitment'

/**
 * Where the accounts of a campaign stand
 * @param {string} recruitmentSessionId - Campaign identifier
 * @return {Promise<AccountActivationView>} - Activation state
 */

export const readActivation = async (
  recruitmentSessionId: string
): Promise<AccountActivationView> => {
  const [session, opened, confirmed] = await Promise.all([
    prisma.recruitmentSession.findUniqueOrThrow({
      where: { id: recruitmentSessionId },
      select: { accountsActivatedAt: true },
    }),
    prisma.academyJunior.count({ where: { candidate: { sessionId: recruitmentSessionId } } }),
    prisma.academyJunior.count({
      where: { candidate: { sessionId: recruitmentSessionId }, confirmedAt: { not: null } },
    }),
  ])

  return {
    activatedAt: session.accountsActivatedAt?.toISOString() ?? null,
    opened,
    confirmed,
  }
}

/**
 * Open the account of every accepted candidate, those accepted later follow on their own
 * @param {string} recruitmentSessionId - Campaign identifier
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<AccountActivationView>} - Activation state
 */

export const activateAccounts = async (
  recruitmentSessionId: string,
  scope: AccessScope
): Promise<AccountActivationView> => {
  const session = await reachableSession(recruitmentSessionId, scope)
  if (!session.academySessionId) throw conflict(ACCOUNT_ACTIVATION_COPY.noPromotion)

  // Marked first, so a candidate accepted while this runs is admitted too
  await prisma.recruitmentSession.updateMany({
    where: { id: recruitmentSessionId, accountsActivatedAt: null },
    data: { accountsActivatedAt: new Date() },
  })

  const failed = await admitSession(recruitmentSessionId)
  if (failed.length > 0) {
    throw conflict(RECRUITMENT_COPY.closeFailed.replace('{names}', failed.join(', ')))
  }

  // The step that opens the accounts is cleared by the act itself
  await prisma.recruitmentStep.updateMany({
    where: { sessionId: recruitmentSessionId, emitsInvite: true, doneAt: null },
    data: { doneAt: new Date() },
  })

  return readActivation(recruitmentSessionId)
}
