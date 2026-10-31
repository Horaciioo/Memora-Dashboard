import 'server-only'

import { prisma } from '@/core/lib/db'
import { invalidInput } from '@/core/lib/errors'
import { HISTORY_COPY } from '@/declarations/recruitment/historyCopy'
import type { BanView } from '@/types/recruitment'

// Session read along a ban
const BAN_INCLUDE = { session: { select: { name: true } } } as const

/**
 * Map a ban row to its view
 * @param {object} row - Ban row with its session
 * @return {BanView} - Ban card
 */

export const toBan = (row: {
  discordId: string
  displayName: string | null
  reason: string | null
  sessionId: string | null
  createdAt: Date
  session: { name: string } | null
}): BanView => ({
  discordId: row.discordId,
  name: row.displayName,
  reason: row.reason,
  sessionId: row.sessionId,
  sessionName: row.session?.name ?? null,
  createdAt: row.createdAt.toISOString(),
})

/**
 * Read the bans among some identifiers
 * @param {string[]} discordIds - Identifiers asked about
 * @return {Promise<Map<string, BanView>>} - Ban by identifier
 */

export const readBans = async (discordIds: string[]): Promise<Map<string, BanView>> => {
  const rows = await prisma.recruitmentBan.findMany({
    where: { discordId: { in: discordIds } },
    include: BAN_INCLUDE,
  })

  return new Map(rows.map((row) => [row.discordId, toBan(row)]))
}

/**
 * List every barred identifier
 * @return {Promise<string[]>} - Identifiers
 */

export const bannedIdentifiers = async (): Promise<string[]> =>
  (await prisma.recruitmentBan.findMany({ select: { discordId: true } })).map(
    (row) => row.discordId
  )

/**
 * Refuse an identifier that was barred
 * @param {string} discordId - Identifier about to join a session
 * @return {Promise<void>} - Resolves when the identifier is free
 */

export const assertNotBanned = async (discordId: string): Promise<void> => {
  const ban = (await readBans([discordId])).get(discordId)
  if (!ban) return

  throw invalidInput([
    {
      field: 'discordId',
      message: ban.sessionName
        ? HISTORY_COPY.refused(ban.sessionName)
        : HISTORY_COPY.refusedAnywhere,
    },
  ])
}

/**
 * Bar an identifier from the new sessions
 * @param {Object} input - Decision
 * @param {string} input.discordId - Identifier barred
 * @param {string | null} input.sessionId - Session the decision is taken on
 * @param {string | null} input.reason - Why
 * @param {string} input.actorId - Member deciding
 * @return {Promise<BanView>} - Ban
 */

export const banIdentifier = async ({
  discordId,
  sessionId,
  reason,
  actorId,
}: {
  discordId: string
  sessionId: string | null
  reason: string | null
  actorId: string
}): Promise<BanView> => {
  // Name kept in case the candidacy is purged
  const [member, candidacy] = await Promise.all([
    prisma.account.findUnique({ where: { discordId }, select: { displayName: true } }),
    prisma.recruitmentCandidate.findFirst({
      where: { discordId, displayName: { not: null } },
      orderBy: { updatedAt: 'desc' },
      select: { displayName: true },
    }),
  ])
  const name = member?.displayName ?? candidacy?.displayName ?? discordId

  const data = { sessionId, reason, displayName: name, createdById: actorId }
  const row = await prisma.recruitmentBan.upsert({
    where: { discordId },
    create: { discordId, ...data },
    update: data,
    include: BAN_INCLUDE,
  })

  return toBan(row)
}

/**
 * Let an identifier join the sessions again
 * @param {string} discordId - Identifier freed
 * @return {Promise<BanView>} - Ban that was lifted
 */

export const liftBan = async (discordId: string): Promise<BanView> =>
  toBan(await prisma.recruitmentBan.delete({ where: { discordId }, include: BAN_INCLUDE }))
