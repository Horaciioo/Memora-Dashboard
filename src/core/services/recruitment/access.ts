import 'server-only'

import { readSeatStates } from '@/core/services/recruitment/readers/SeatReader'
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
  if (access.can(Permissions.RecruitmentManage)) return 'read'

  // A temporary seat opens one session, a finished one stays readable by those who took part
  const state = (await readSeatStates(accountId, sessionId)).get(sessionId)
  if (!state) return null
  if (state.recruiting && access.can(Permissions.RecruitmentRead)) return 'read'

  return state.recruiting || state.observing || state.archived ? 'observe' : null
}
