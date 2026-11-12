import 'server-only'

import { prisma } from '@/core/lib/db'
import { invalidInput } from '@/core/lib/errors'
import { resolveAccountPermissions } from '@/core/services/auth/GrantsService/resolve'
import { UNBAN_ERRORS } from '@/declarations/unban/copy'
import { GLOBAL_ROLES } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'

// Field the refusal points at
const ASSIGNEE_FIELD = 'assigneeId'

/**
 * Refuse a member who could not handle the requests of a creator
 * @param {string} accountId - Member to put in charge
 * @param {string} youtuberId - Creator the request belongs to
 * @return {Promise<void>} - Throws when the member cannot handle it
 */

export const assertCanHandleFor = async (accountId: string, youtuberId: string): Promise<void> => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: { youtubers: { select: { id: true } }, functions: true },
  })
  const refusal = invalidInput([{ field: ASSIGNEE_FIELD, message: UNBAN_ERRORS.badAssignee }])
  if (!account) throw refusal

  const reaches =
    GLOBAL_ROLES.includes(account.role) || account.youtubers.some(({ id }) => id === youtuberId)
  if (!reaches) throw refusal

  const granted = await resolveAccountPermissions(account, youtuberId)
  if (!granted.includes(Permissions.UnbanHandle)) throw refusal
}
