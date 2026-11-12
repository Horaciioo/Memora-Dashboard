import 'server-only'

import { prisma } from '@/core/lib/db'
import { linkStateWhere } from '@/core/lib/unban/linkFilter'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import { UNBAN_SETTINGS } from '@/declarations/configurations/settings'
import { assertCanLink, LINK_INCLUDE, toLinkView } from './shared'
import type { UnbanLinkStateName } from '@/utils/constants/unban'
import type { UnbanLinkView } from '@/types/unban'
import type { UnbanCaller } from './shared'
import type { Prisma } from '@prisma/client'

/**
 * What narrows the list of links
 * @typedef {Object} LinkFilters
 * @property {string} [youtuberId] - One creator only
 * @property {UnbanLinkStateName} [state] - One state only
 * @property {number} [page] - Page, from 1
 */

export interface LinkFilters {
  youtuberId?: string
  state?: UnbanLinkStateName
  page?: number
}

/**
 * One page of links
 * @typedef {Object} LinkPage
 * @property {UnbanLinkView[]} items - Links, newest first
 * @property {number} total - Links matching the filters
 */

export interface LinkPage {
  items: UnbanLinkView[]
  total: number
}

/**
 * Links a caller may see, narrowed by the filters
 * @param {LinkFilters} filters - Narrowing
 * @param {UnbanCaller} caller - Who acts
 * @param {Date} now - Moment of the reading
 * @return {Prisma.UnbanLinkWhereInput} - Clause
 */

const buildWhere = (
  filters: LinkFilters,
  caller: UnbanCaller,
  now: Date
): Prisma.UnbanLinkWhereInput =>
  scopedWhere('unbanLink', caller.scope, {
    ...(filters.youtuberId ? { youtuberId: filters.youtuberId } : {}),
    ...(filters.state ? linkStateWhere(filters.state, now) : {}),
  })

/**
 * Links of the perimeter, with the request each one produced
 * @param {LinkFilters} filters - Narrowing
 * @param {UnbanCaller} caller - Who acts
 * @return {Promise<LinkPage>} - One page
 */

export const listLinks = async (filters: LinkFilters, caller: UnbanCaller): Promise<LinkPage> => {
  assertCanLink(caller)

  const now = new Date()
  const where = buildWhere(filters, caller, now)
  const size = UNBAN_SETTINGS.listedLinks
  const page = Math.max(1, Math.floor(filters.page ?? 1))

  const [rows, total] = await Promise.all([
    prisma.unbanLink.findMany({
      where,
      include: LINK_INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: size,
      skip: (page - 1) * size,
    }),
    prisma.unbanLink.count({ where }),
  ])

  return { items: rows.map((row) => toLinkView(row, now)), total }
}
