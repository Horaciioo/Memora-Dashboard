import 'server-only'

import { forbidden, notFound } from '@/core/lib/errors'
import { prisma } from '@/core/lib/db'
import { isLinkExpired, linkStateOf } from '@/core/lib/unban/linkState'
import { assertInScope } from '@/core/services/auth/ScopeService'
import { DAY_MS } from '@/utils/constants/time'
import { Permissions } from '@/utils/constants/permissions'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import type { PermissionHelpers } from '@/types/auth'
import type { UnbanLinkView } from '@/types/unban'
import type { Prisma } from '@prisma/client'

/**
 * Who acts on a link, with the rights and perimeter they hold
 * @typedef {Object} UnbanCaller
 * @property {PermissionHelpers} access - Rights
 * @property {AccessScope} scope - Creator perimeter
 * @property {string} actorId - Member acting
 */

export interface UnbanCaller {
  access: PermissionHelpers
  scope: AccessScope
  actorId: string
}

// What a link row carries to be displayed
export const LINK_INCLUDE = {
  request: { select: { reference: true, status: true } },
  youtuber: { select: { name: true } },
} as const

export type LinkRow = Prisma.UnbanLinkGetPayload<{ include: typeof LINK_INCLUDE }>

/**
 * Link row ready for display, without any secret
 * @param {LinkRow} row - Stored link
 * @param {Date} [now] - Moment of the reading
 * @return {UnbanLinkView} - Display link
 */

export const toLinkView = (row: LinkRow, now: Date = new Date()): UnbanLinkView => ({
  id: row.id,
  youtuberId: row.youtuberId,
  youtuberName: row.youtuber.name,
  label: row.label,
  expectedDiscordId: row.expectedDiscordId,
  state: linkStateOf(row, now),
  isExpired: isLinkExpired(row, now),
  expiresAt: row.expiresAt.toISOString(),
  usedAt: row.usedAt?.toISOString() ?? null,
  createdAt: row.createdAt.toISOString(),
  request: row.request,
})

/**
 * Refuse anyone who cannot handle links
 * @param {UnbanCaller} caller - Who acts
 * @return {void}
 */

export const assertCanLink = ({ access }: UnbanCaller): void => {
  if (!access.can(Permissions.UnbanLinks)) throw forbidden()
}

/**
 * Expiry moment a number of days from now leads to
 * @param {number} days - Chosen duration
 * @param {Date} [now] - Starting moment
 * @return {Date} - Expiry
 */

export const expiryAfter = (days: number, now: Date = new Date()): Date =>
  new Date(now.getTime() + days * DAY_MS)

/**
 * Link of the perimeter, any other one does not exist for the caller
 * @param {string} id - Link identifier
 * @param {UnbanCaller} caller - Who acts
 * @return {Promise<LinkRow>} - Stored link
 */

export const loadLink = async (id: string, caller: UnbanCaller): Promise<LinkRow> => {
  assertCanLink(caller)

  const row = await prisma.unbanLink.findUnique({ where: { id }, include: LINK_INCLUDE })
  if (!row) throw notFound()

  assertInScope(caller.scope, row.youtuberId)

  return row
}
