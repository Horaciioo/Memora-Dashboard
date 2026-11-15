import 'server-only'

import { prisma } from '@/core/lib/db'
import { forbidden, notFound } from '@/core/lib/errors'
import { requestWhere } from '@/core/lib/unban/requestFilter'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import { readActive } from '@/core/services/unban/UnbanFormService'
import { readRecordTreeActivity } from '@/core/services/system/ActivityService'
import type { ActivityEntry } from '@/core/services/system/ActivityService'
import { PAGINATION_SETTINGS } from '@/declarations/configurations/settings'
import { Permissions } from '@/utils/constants/permissions'
import { DETAIL_INCLUDE, ITEM_INCLUDE, toDetail, toItem } from './views'
import type { RequestFilters } from '@/core/lib/unban/requestFilter'
import type { UnbanCaller } from '@/core/services/unban/requests/caller'
import type { UnbanRequestDetail, UnbanRequestPage } from '@/types/unban'

/**
 * Refuse anyone who cannot read requests
 * @param {UnbanCaller} caller - Who acts
 * @return {void}
 */

export const assertCanRead = ({ access }: UnbanCaller): void => {
  if (!access.can(Permissions.UnbanRead)) throw forbidden()
}

/**
 * Page size asked for, held between one and the maximum
 * @param {number | undefined} limit - Size asked for
 * @return {number} - Size used
 */

const pageSize = (limit: number | undefined): number =>
  Math.min(Math.max(1, limit ?? PAGINATION_SETTINGS.defaultPerPage), PAGINATION_SETTINGS.maxPerPage)

/**
 * Requests of the perimeter, newest first, cut by a cursor
 * @param {RequestFilters} filters - Narrowing
 * @param {UnbanCaller} caller - Who acts
 * @return {Promise<UnbanRequestPage>} - One page
 */

export const listRequests = async (
  filters: RequestFilters,
  caller: UnbanCaller
): Promise<UnbanRequestPage> => {
  assertCanRead(caller)

  const size = pageSize(filters.limit)
  const rows = await prisma.unbanRequest.findMany({
    where: scopedWhere('unbanRequest', caller.scope, requestWhere(filters, caller.actorId)),
    include: ITEM_INCLUDE,
    orderBy: [{ submittedAt: 'desc' }, { id: 'desc' }],
    take: size + 1,
    ...(filters.cursor ? { cursor: { id: filters.cursor }, skip: 1 } : {}),
  })

  const hasMore = rows.length > size

  return {
    items: rows.slice(0, size).map(toItem),
    nextCursor: hasMore ? rows[size - 1].id : null,
  }
}

/**
 * File of one request, hidden when it is out of the perimeter
 * @param {string} id - Request identifier
 * @param {UnbanCaller} caller - Who acts
 * @return {Promise<UnbanRequestDetail>} - Detail
 */

export const readRequest = async (id: string, caller: UnbanCaller): Promise<UnbanRequestDetail> => {
  assertCanRead(caller)

  const row = await prisma.unbanRequest.findFirst({
    where: scopedWhere('unbanRequest', caller.scope, { id }),
    include: DETAIL_INCLUDE,
  })
  if (!row) throw notFound()

  const active = await readActive()

  return toDetail(row, active.number, caller)
}

/**
 * Journal of a request and of its link, newest first
 * @param {string} id - Request identifier
 * @param {UnbanCaller} caller - Who acts
 * @return {Promise<ActivityEntry[]>} - Entries
 */

export const readHistory = async (id: string, caller: UnbanCaller): Promise<ActivityEntry[]> => {
  assertCanRead(caller)

  const row = await prisma.unbanRequest.findFirst({
    where: scopedWhere('unbanRequest', caller.scope, { id }),
    select: { id: true },
  })
  if (!row) throw notFound()

  return readRecordTreeActivity('unbanRequest', id, 'unbanRequest', [])
}
