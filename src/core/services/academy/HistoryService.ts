import 'server-only'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import type { AcademyScope } from '@/core/services/academy/AcademyScope'
import { sessionNumbers } from '@/core/services/academy/sessionView'
import { RECRUITMENT_SETTINGS } from '@/declarations/configurations/recruitment'
import type { AcademyHistoryPage } from '@/types/academy'
import type { AcademyJuniorStatusName, AcademySessionStatusName } from '@/utils/constants/hierarchy'
import { sessionTitle } from '@/utils/format/academy'

/**
 * Filters of the Academy history
 * @typedef {Object} AcademyHistoryQuery
 * @property {string} search - Junior name
 * @property {string} status - Session phase wanted, empty for all
 * @property {string} juniorStatus - Junior outcome wanted, empty for all
 * @property {string} referentId - Referent wanted, empty for all
 * @property {number} page - Page index
 */

export interface AcademyHistoryQuery {
  search: string
  status: string
  juniorStatus: string
  referentId: string
  page: number
}

/**
 * Read one page of the sessions with the juniors that went through them
 * @param {AcademyScope} scope - Perimeter
 * @param {AcademyHistoryQuery} query - Filters and page
 * @return {Promise<AcademyHistoryPage>} - Sessions, with the referents on the first page
 */

export const readAcademyHistory = async (
  scope: AcademyScope,
  query: AcademyHistoryQuery
): Promise<AcademyHistoryPage> => {
  const size = RECRUITMENT_SETTINGS.historyPageSize
  const text = query.search.trim()

  const juniors: Prisma.AcademyJuniorWhereInput = {
    AND: [
      scope.juniors,
      text ? { account: { displayName: { contains: text, mode: 'insensitive' } } } : {},
      query.juniorStatus ? { status: query.juniorStatus as AcademyJuniorStatusName } : {},
      query.referentId ? { referentId: query.referentId } : {},
    ],
  }

  const [rows, numbers, referents] = await Promise.all([
    prisma.academySession.findMany({
      where: {
        AND: [
          scope.session,
          query.status ? { status: query.status as AcademySessionStatusName } : {},
          { juniors: { some: juniors } },
        ],
      },
      orderBy: { startsAt: 'desc' },
      skip: query.page * size,
      take: size + 1,
      include: {
        jobFunction: { select: { name: true } },
        juniors: {
          where: juniors,
          orderBy: { startedAt: 'asc' },
          include: { account: { select: { displayName: true, avatarUrl: true } }, referent: true },
        },
      },
    }),
    sessionNumbers(),
    query.page === 0
      ? prisma.account.findMany({
          where: { referredJuniors: { some: scope.juniors } },
          orderBy: { displayName: 'asc' },
          select: { id: true, displayName: true },
        })
      : [],
  ])

  return {
    sessions: rows.slice(0, size).map((row) => ({
      id: row.id,
      title: sessionTitle({ function: row.jobFunction, number: numbers.get(row.id) ?? 1 }),
      status: row.status,
      startsAt: row.startsAt.toISOString(),
      juniors: row.juniors.map((junior) => ({
        id: junior.id,
        name: junior.account.displayName,
        avatarUrl: junior.account.avatarUrl,
        status: junior.status,
        referent: junior.referent?.displayName ?? null,
        startedAt: junior.startedAt.toISOString(),
      })),
    })),
    referents: referents.map((account) => ({ id: account.id, label: account.displayName })),
    hasMore: rows.length > size,
  }
}
