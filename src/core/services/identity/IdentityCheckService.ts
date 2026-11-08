import 'server-only'

import { prisma } from '@/core/lib/db'
import { forbidden, notFound } from '@/core/lib/errors'
import { afterIntegration } from '@/core/services/academy/parkour/ParkourService'
import type { DiscordIdentity } from '@/core/services/auth/DiscordService'
import { CREATOR_SHAPE, findPendingSeat } from '@/core/services/identity/seats'
import { discordAvatarUrl } from '@/declarations/access/discord'
import { AUTH_SETTINGS } from '@/declarations/configurations/settings'
import type { IdentityCheckView } from '@/types/identity'
import type { IntegrationCreator } from '@/types/onboarding'
import { MemberStatuses } from '@/utils/constants/hierarchy'
import { IdentityCheckStatuses } from '@/utils/constants/identity'
import type { IdentityCheckStatusName } from '@/utils/constants/identity'
import { HOUR_MS } from '@/utils/constants/time'

// Checks a person may still answer
const LIVE_STATUSES: IdentityCheckStatusName[] = [
  IdentityCheckStatuses.Open,
  IdentityCheckStatuses.Escalated,
  IdentityCheckStatuses.Resolved,
]

/**
 * Oldest moment a check is still alive
 * @return {Date} - Cut-off
 */

const aliveSince = (): Date => new Date(Date.now() - AUTH_SETTINGS.identityCheckHours * HOUR_MS)

/**
 * Write down the identity Discord proved, one live check per identity
 * @param {DiscordIdentity} identity - Identity returned by Discord
 * @param {string | null} accountId - Account it opens, nobody when unknown
 * @return {Promise<string>} - Check identifier
 */

export const openCheck = async (
  identity: DiscordIdentity,
  accountId: string | null
): Promise<string> => {
  const data = {
    discordUsername: identity.username,
    discordAvatarHash: identity.avatar,
    accountId,
  }

  // A second visit picks the same talk up
  const live = await prisma.identityCheck.findFirst({
    where: {
      discordId: identity.id,
      status: { in: LIVE_STATUSES },
      createdAt: { gt: aliveSince() },
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  })

  if (live) {
    await prisma.identityCheck.update({ where: { id: live.id }, data })

    return live.id
  }

  const created = await prisma.identityCheck.create({
    data: { discordId: identity.id, ...data },
    select: { id: true },
  })

  return created.id
}

/**
 * Read a check back for the welcome screen
 * @param {string | undefined} id - Check identifier held by the cookie
 * @return {Promise<IdentityCheckView | null>} - Live check or nothing
 */

export const readCheck = async (id: string | undefined): Promise<IdentityCheckView | null> => {
  if (!id) return null

  const row = await prisma.identityCheck.findFirst({
    where: {
      id,
      status: { in: LIVE_STATUSES },
      OR: [
        { createdAt: { gt: aliveSince() } },
        // A link handed out outlives the talk that asked for it
        { status: IdentityCheckStatuses.Resolved, linkExpiresAt: { gt: new Date() } },
      ],
    },
  })
  if (!row) return null

  const seat = row.accountId ? await findPendingSeat(row.accountId) : null

  return {
    id: row.id,
    status: row.status,
    discordId: row.discordId,
    name: row.discordUsername ?? row.discordId,
    avatarUrl: discordAvatarUrl(row.discordId, row.discordAvatarHash),
    seat,
    attempts: row.attempts,
  }
}

/**
 * Confirm the file of the person Discord identified
 * @param {string} id - Check identifier
 * @return {Promise<{ accountId: string, sessionName: string }>} - Account to sign in
 */

export const confirmCheck = async (
  id: string
): Promise<{ accountId: string; sessionName: string }> => {
  const view = await readCheck(id)

  // Only an identity matching a seat can be confirmed
  if (!view || !view.seat || view.status === IdentityCheckStatuses.Escalated) throw forbidden()
  const { seat } = view

  const account = await prisma.account.findUniqueOrThrow({
    where: { id: seat.accountId },
    select: { status: true },
  })

  // The opened account is the one that file belongs to
  const done = await prisma.identityCheck.updateMany({
    where: { id, status: { in: LIVE_STATUSES } },
    data: { status: IdentityCheckStatuses.Done, linkToken: null, linkExpiresAt: null },
  })
  if (done.count === 0) throw notFound()

  await prisma.$transaction([
    prisma.academyJunior.update({
      where: { id: seat.juniorId },
      data: { confirmedAt: new Date() },
    }),
    prisma.account.update({
      where: { id: seat.accountId },
      data: {
        status: account.status === MemberStatuses.Pending ? MemberStatuses.Academy : undefined,
      },
    }),
  ])

  // The last file back launches the promotion
  await afterIntegration(seat.juniorId)

  return { accountId: seat.accountId, sessionName: seat.sessionName }
}

/**
 * Take a link a responsable handed out and match it with the identity Discord proved
 * @param {string} token - Link token
 * @param {DiscordIdentity} identity - Identity returned by Discord
 * @return {Promise<string>} - Check identifier
 */

export const claimCheckLink = async (token: string, identity: DiscordIdentity): Promise<string> => {
  const row = await prisma.identityCheck.findUnique({ where: { linkToken: token } })
  const isLive = row?.linkExpiresAt && row.linkExpiresAt > new Date()

  if (!row || !isLive || row.status !== IdentityCheckStatuses.Resolved) throw notFound()

  // Any other identity is refused
  if (row.resolvedDiscordId !== identity.id) throw forbidden()

  const account = await prisma.account.findUnique({
    where: { discordId: identity.id },
    select: { id: true },
  })

  await prisma.identityCheck.update({
    where: { id: row.id },
    data: {
      accountId: account?.id ?? null,
      discordId: identity.id,
      discordUsername: identity.username,
      discordAvatarHash: identity.avatar,
    },
  })

  return row.id
}

/**
 * Read a link a responsable handed out, nothing when it is no longer valid
 * @param {string} token - Link token
 * @return {Promise<{ creator: IntegrationCreator | null } | null>} - Creator whose banner dresses the page
 */

export const readWelcomeLinkCreator = async (
  token: string
): Promise<{ creator: IntegrationCreator | null } | null> => {
  const row = await prisma.identityCheck.findUnique({
    where: { linkToken: token },
    select: {
      status: true,
      linkExpiresAt: true,
      candidate: { select: { session: { select: { youtuber: CREATOR_SHAPE } } } },
    },
  })

  if (!row || row.status !== IdentityCheckStatuses.Resolved) return null
  if (!row.linkExpiresAt || row.linkExpiresAt <= new Date()) return null

  return { creator: row.candidate?.session.youtuber ?? null }
}
