import 'server-only'

import { prisma } from '@/core/lib/db'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { readBans } from '@/core/services/recruitment/BanService'
import { readPortraits } from '@/core/services/recruitment/CandidatePortraits'
import { sessionScope } from '@/core/services/recruitment/reach'
import { RECRUITMENT_SETTINGS } from '@/declarations/configurations/recruitment'
import type { HistoryEntry, HistoryPage } from '@/types/recruitment'

export interface HistoryQuery {
  search: string
  bannedOnly: boolean
  page: number
}

/**
 * Identifiers of the page, newest passage first
 * @param {AccessScope} scope - Perimeter
 * @param {HistoryQuery} query - Search, filter and page
 * @return {Promise<string[]>} - One more than the page holds
 */

const pageIdentifiers = async (scope: AccessScope, query: HistoryQuery): Promise<string[]> => {
  const size = RECRUITMENT_SETTINGS.historyPageSize
  const paging = { skip: query.page * size, take: size + 1 }
  const text = query.search.trim()

  // A member's name stands for their identifier
  const members = text
    ? await prisma.account.findMany({
        where: { displayName: { contains: text, mode: 'insensitive' } },
        select: { discordId: true },
        take: size,
      })
    : []
  const matching = text
    ? [
        { discordId: { contains: text, mode: 'insensitive' as const } },
        { displayName: { contains: text, mode: 'insensitive' as const } },
        { discordId: { in: members.map((member) => member.discordId) } },
      ]
    : undefined

  // The blacklist alone reads its own table, a candidacy may be long purged
  if (query.bannedOnly) {
    const rows = await prisma.recruitmentBan.findMany({
      where: {
        AND: [
          { OR: [{ sessionId: null }, { session: sessionScope(scope) }] },
          matching ? { OR: matching } : {},
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: { discordId: true },
      ...paging,
    })

    return rows.map((row) => row.discordId)
  }

  const groups = await prisma.recruitmentCandidate.groupBy({
    by: ['discordId'],
    where: { session: sessionScope(scope), ...(matching ? { OR: matching } : {}) },
    _max: { updatedAt: true },
    orderBy: { _max: { updatedAt: 'desc' } },
    ...paging,
  })

  return groups.map((group) => group.discordId)
}

/**
 * Read one page of the candidates of every session, grouped by Discord identity
 * @param {AccessScope} scope - Perimeter
 * @param {HistoryQuery} query - Search, filter and page
 * @return {Promise<HistoryPage>} - Identities with their passages
 */

export const readHistory = async (
  scope: AccessScope,
  query: HistoryQuery
): Promise<HistoryPage> => {
  const size = RECRUITMENT_SETTINGS.historyPageSize
  const asked = await pageIdentifiers(scope, query)
  const ids = asked.slice(0, size)

  const [rows, members, bans, portraits] = await Promise.all([
    prisma.recruitmentCandidate.findMany({
      where: { discordId: { in: ids }, session: sessionScope(scope) },
      include: {
        session: { select: { id: true, name: true } },
        outcome: { select: { name: true, accent: true } },
        recruiters: { include: { account: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.account.findMany({
      where: { discordId: { in: ids } },
      select: { discordId: true, displayName: true },
    }),
    readBans(ids),
    readPortraits(ids),
  ])

  const names = new Map(members.map((member) => [member.discordId, member.displayName]))
  const passages = Map.groupBy(rows, (row) => row.discordId)

  const entries: HistoryEntry[] = ids.map((discordId) => {
    const own = passages.get(discordId) ?? []
    const ban = bans.get(discordId) ?? null

    return {
      discordId,
      // Member first, else the latest name given, else the ban's own copy
      name:
        names.get(discordId) ??
        own.find((row) => row.displayName)?.displayName ??
        ban?.name ??
        discordId,
      avatarUrl: portraits.get(discordId) ?? null,
      ban,
      passages: own.map((row) => ({
        candidateId: row.id,
        sessionId: row.session.id,
        sessionName: row.session.name,
        outcome: row.outcome ? { label: row.outcome.name, accent: row.outcome.accent } : null,
        at: (row.interviewAt ?? row.createdAt).toISOString(),
        recruiters: row.recruiters.map(({ account }) => ({
          id: account.id,
          label: account.displayName,
          accent: null,
          image: account.avatarUrl,
        })),
      })),
    }
  })

  return { entries, hasMore: asked.length > size }
}
