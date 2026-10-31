import 'server-only'

import { isObserver } from '@/core/services/recruitment/ObserverReader'
import type { PermissionHelpers } from '@/types/auth'
import { Permissions } from '@/utils/constants/permissions'

/**
 * How a member reaches a session
 * @typedef {'read' | 'observe'} RecruitmentMode
 */

export type RecruitmentMode = 'read' | 'observe'

/**
 * Read how a member reaches a session, the one rule of the page and of the socket
 * @param {PermissionHelpers} access - Permission helpers
 * @param {string} accountId - Member
 * @param {string} sessionId - Session identifier
 * @return {Promise<RecruitmentMode | null>} - Mode, null when out of reach
 */

export const recruitmentModeOf = async (
  access: PermissionHelpers,
  accountId: string,
  sessionId: string
): Promise<RecruitmentMode | null> => {
  if (access.can(Permissions.RecruitmentRead)) return 'read'

  // The Observateurs function opens every session, a named seat opens one
  const isObserving =
    access.can(Permissions.RecruitmentObserve) || (await isObserver(sessionId, accountId))

  return isObserving ? 'observe' : null
}
