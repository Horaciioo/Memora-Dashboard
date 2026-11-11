import 'server-only'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { readBans } from '@/core/services/recruitment/BanService'
import { readPortraits } from '@/core/services/recruitment/CandidatePortraits'
import { sessionScope } from '@/core/services/recruitment/reach'
import { RECRUITMENT_SETTINGS } from '@/declarations/configurations/recruitment'
import type { HistoryOptions, HistoryOrphan, HistoryPage, HistorySession } from '@/types/recruitment'
import type { RecruitmentStatusName } from '@/utils/constants/recruitment'

/**
 * Filters of the history
 * @typedef {Object} HistoryQuery
 * @property {string} search - Name, identifier or session name
 * @property {boolean} bannedOnly - Keep the blacklisted identities
 * @property {string} outcomeId - Issue wanted, empty for all
 * @property {string} recruiterId - Recruiter wanted, empty for all
 * @property {string} status - Session phase wanted, empty for all
 * @property {number} page - Page index
 */

export interface HistoryQuery {
  search: string
  bannedOnly: boolean
  outcomeId: string
  recruiterId: string
  status: string
  page: number
}

/**
 * Identifiers standing behind a typed name
 * @param {string} text - Search term
 * @param {number} size - Members read at most
 * @return {Promise<string[]>} - Discord identifiers of the matching members
 */

const memberIdentifiers = async (text: string, size: number): Promise<string[]> => {
  if (!text) return []

  const members = await prisma.account.findMany({
    where: { displayName: { contains: text, mode: 'insensitive' } },
    select: { discordId: true },
    take: size,
  })

  return members.map((member) => member.discordId)
}

/**
 * Candidates the filters keep
 * @param {HistoryQuery} query - Filters
 * @param {string[]} bannedIds - Blacklisted identities in perimeter
 * @param {number} size - Members read at most
 * @return {Promise<Prisma.RecruitmentCandidateWhereInput>} - Where clause
 */

const candidateFilter = async (
  query: HistoryQuery,
  bannedIds: string[],
  size: number
): Promise<Prisma.RecruitmentCandidateWhereInput> => {
  const text = query.search.trim()
  const members = await memberIdentifiers(text, size)

  return {
    AND: [
      text
        ? {
            OR: [
              { discordId: { contains: text, mode: 'insensitive' } },
              { displayName: { contains: text, mode: 'insensitive' } },
              { discordId: { in: members } },
              { session: { name: { contains: text, mode: 'insensitive' } } },
            ],
          }
        : {},
      query.outcomeId ? { outcomeId: query.outcomeId } : {},
      query.recruiterId ? { recruiters: { some: { accountId: query.recruiterId } } } : {},
      query.bannedOnly ? { discordId: { in: bannedIds } } : {},
    ],
  }
}

/**
 * Values the filters offer
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<HistoryOptions>} - Issues and recruiters
 */

const readOptions = async (scope: AccessScope): Promise<HistoryOptions> => {
  const [outcomes, recruiters] = await Promise.all([
    prisma.recruitmentOutcome.findMany({
      where: { archived: false },
      orderBy: { position: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.account.findMany({
      where: { candidateRecruiters: { some: { candidate: { session: sessionScope(scope) } } } },
      orderBy: { displayName: 'asc' },
      select: { id: true, displayName: true },
    }),
  ])

  return {
    outcomes,
    recruiters: recruiters.map((account) => ({ id: account.id, label: account.displayName })),
  }
}

/**
 * Blacklisted identities whose candidacy was purged
 * @param {AccessScope} scope - Perimeter
 * @param {string} text - Search term
 * @return {Promise<HistoryOrphan[]>} - Orphans, newest first
 */

const readOrphans = async (scope: AccessScope, text: string): Promise<HistoryOrphan[]> => {
  const rows = await prisma.recruitmentBan.findMany({
    where: {
      AND: [
        { OR: [{ sessionId: null }, { session: sessionScope(scope) }] },
        text ? { discordId: { contains: text, mode: 'insensitive' } } : {},
      ],
    },
    orderBy: { createdAt: 'desc' },
    select: { discordId: true },
  })
  const ids = rows.map((row) => row.discordId)
  const kept = await prisma.recruitmentCandidate.findMany({
    where: { discordId: { in: ids }, session: sessionScope(scope) },
    select: { discordId: true },
    distinct: ['discordId'],
  })
  const keptIds = new Set(kept.map((row) => row.discordId))
  const lonely = ids.filter((id) => !keptIds.has(id))
  const [bans, portraits] = await Promise.all([readBans(lonely), readPortraits(lonely)])

  return lonely.flatMap((discordId) => {
    const ban = bans.get(discordId)

    return ban
      ? [{ discordId, name: ban.name ?? discordId, avatarUrl: portraits.get(discordId) ?? null, ban }]
      : []
  })
}

/**
 * Read one page of the sessions with the candidates that went through them
 * @param {AccessScope} scope - Perimeter
 * @param {HistoryQuery} query - Filters and page
 * @return {Promise<HistoryPage>} - Sessions, with the options on the first page
 */

export const readHistory = async (
  scope: AccessScope,
  query: HistoryQuery
): Promise<HistoryPage> => {
  const size = RECRUITMENT_SETTINGS.historyPageSize

  const banRows = await prisma.recruitmentBan.findMany({
    where: { OR: [{ sessionId: null }, { session: sessionScope(scope) }] },
    select: { discordId: true },
  })
  const filter = await candidateFilter(
    query,
    banRows.map((row) => row.discordId),
    size
  )

  const asked = await prisma.recruitmentSession.findMany({
    where: {
      AND: [
        sessionScope(scope),
        query.status ? { status: query.status as RecruitmentStatusName } : {},
        { candidates: { some: filter } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    skip: query.page * size,
    take: size + 1,
    include: {
      youtuber: { select: { name: true } },
      candidates: {
        where: filter,
        orderBy: { updatedAt: 'desc' },
        include: {
          outcome: { select: { name: true, accent: true } },
          recruiters: { include: { account: true } },
        },
      },
    },
  })
  const rows = asked.slice(0, size)
  const ids = [...new Set(rows.flatMap((row) => row.candidates.map((entry) => entry.discordId)))]

  const [members, bans, portraits, options, orphans] = await Promise.all([
    prisma.account.findMany({
      where: { discordId: { in: ids } },
      select: { discordId: true, displayName: true },
    }),
    readBans(ids),
    readPortraits(ids),
    query.page === 0 ? readOptions(scope) : { outcomes: [], recruiters: [] },
    query.page === 0 && query.bannedOnly ? readOrphans(scope, query.search.trim()) : [],
  ])
  const names = new Map(members.map((member) => [member.discordId, member.displayName]))

  const sessions: HistorySession[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    status: row.status as RecruitmentStatusName,
    youtuber: row.youtuber.name,
    createdAt: row.createdAt.toISOString(),
    candidates: row.candidates.map((entry) => ({
      candidateId: entry.id,
      discordId: entry.discordId,
      // Member first, else the name given at application
      name: names.get(entry.discordId) ?? entry.displayName ?? entry.discordId,
      avatarUrl: portraits.get(entry.discordId) ?? null,
      outcome: entry.outcome ? { label: entry.outcome.name, accent: entry.outcome.accent } : null,
      at: (entry.interviewAt ?? entry.createdAt).toISOString(),
      recruiters: entry.recruiters.map(({ account }) => ({
        id: account.id,
        label: account.displayName,
        accent: null,
        image: account.avatarUrl,
      })),
      ban: bans.get(entry.discordId) ?? null,
    })),
  }))

  return { sessions, orphans, options, hasMore: asked.length > size }
}
