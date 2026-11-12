import 'server-only'

import { prisma } from '@/core/lib/db'
import { invalidInput } from '@/core/lib/errors'
import { resolveAccountPermissions } from '@/core/services/auth/GrantsService/resolve'
import type { HolderAccount } from '@/core/services/auth/GrantsService/sync'
import { UNBAN_ERRORS } from '@/declarations/unban/copy'
import { GLOBAL_ROLES } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'

// Field the refusal points at
const ASSIGNEE_FIELD = 'assigneeId'

// Account with what the permission resolution reads
const HOLDER_INCLUDE = { youtubers: { select: { id: true } }, functions: true } as const

/**
 * Whether a member reaches a creator and may handle its requests
 * @param {HolderAccount & { youtubers: { id: string }[] }} account - Member with creators and functions
 * @param {string} youtuberId - Creator the request belongs to
 * @return {Promise<boolean>} - Can handle it
 */

const canHandle = async (
  account: HolderAccount & { youtubers: { id: string }[] },
  youtuberId: string
): Promise<boolean> => {
  const reaches =
    GLOBAL_ROLES.includes(account.role) || account.youtubers.some(({ id }) => id === youtuberId)
  if (!reaches) return false

  const granted = await resolveAccountPermissions(account, youtuberId)

  return granted.includes(Permissions.UnbanHandle)
}

/**
 * Refuse a member who could not handle the requests of a creator
 * @param {string} accountId - Member to put in charge
 * @param {string} youtuberId - Creator the request belongs to
 * @return {Promise<void>} - Throws when the member cannot handle it
 */

export const assertCanHandleFor = async (accountId: string, youtuberId: string): Promise<void> => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: HOLDER_INCLUDE,
  })

  if (!account || !(await canHandle(account, youtuberId))) {
    throw invalidInput([{ field: ASSIGNEE_FIELD, message: UNBAN_ERRORS.badAssignee }])
  }
}

/**
 * Members who may handle the requests of a creator, the same rule as an assignment
 * @param {string} youtuberId - Creator the request belongs to
 * @param {number} max - Most members kept
 * @return {Promise<string[]>} - Member identifiers
 */

export const findHandlers = async (youtuberId: string, max: number): Promise<string[]> => {
  const candidates = await prisma.account.findMany({
    where: { OR: [{ role: { in: GLOBAL_ROLES } }, { youtubers: { some: { id: youtuberId } } }] },
    include: HOLDER_INCLUDE,
    orderBy: { createdAt: 'asc' },
  })
  const verdicts = await Promise.all(candidates.map((account) => canHandle(account, youtuberId)))

  return candidates
    .filter((_, index) => verdicts[index])
    .slice(0, max)
    .map(({ id }) => id)
}
