import 'server-only'

import crypto from 'crypto'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { AUTH_SETTINGS } from '@/declarations/configurations/settings'
import { discordAvatarUrl } from '@/declarations/access/discord'
import { ROOT_IDENTITY, isRootIdentity } from '@/declarations/access/identity'
import type { DiscordIdentity } from '@/core/services/auth/DiscordService'
import { MemberRoles, MemberStatuses } from '@/utils/constants/hierarchy'
import type { AccountSession } from '@/types/preferences'
import type { Account } from '@prisma/client'

// Milliseconds in one day
const DAY_MS = 86_400_000

/**
 * Where a session was opened from
 * @typedef {Object} SessionOrigin
 * @property {string} [userAgent] - Client user agent
 * @property {string} [address] - Client address
 */

export interface SessionOrigin {
  userAgent?: string
  address?: string
}

/**
 * Create an opaque session token
 * @return {string} - Random token
 */

const createToken = (): string => crypto.randomBytes(32).toString('base64url')

/**
 * Ensure the root administrator exists
 * @param {string} discordId - Root identifier
 * @return {Promise<Account>} - Root account
 */

export const ensureRootAccount = async (discordId: string): Promise<Account> =>
  prisma.account.upsert({
    where: { discordId },
    // The stored name is never overwritten, the database owns it once seeded
    update: { role: MemberRoles.Admin, status: MemberStatuses.Active, leftAt: null },
    create: {
      discordId,
      displayName: ROOT_IDENTITY.seedName ?? discordId,
      role: MemberRoles.Admin,
      status: MemberStatuses.Active,
    },
  })

/**
 * Resolve the account allowed to sign in
 * @param {string} discordId - Submitted identifier
 * @return {Promise<Account | null>} - Account or null
 */

export const resolveSignInAccount = async (discordId: string): Promise<Account | null> => {
  // The root identifier always gets an account
  if (isRootIdentity(discordId)) return ensureRootAccount(discordId)

  return prisma.account.findUnique({ where: { discordId } })
}

/**
 * Resolve the account behind a Discord identity, refreshing what Discord owns
 * @param {DiscordIdentity} identity - Identity read from Discord
 * @return {Promise<Account | null>} - Account or null
 */

export const resolveDiscordAccount = async (identity: DiscordIdentity): Promise<Account | null> => {
  const existing = await resolveSignInAccount(identity.id)
  if (!existing) return null

  // Discord owns the handle and the portrait, the dashboard owns the display name
  return prisma.account.update({
    where: { id: existing.id },
    data: {
      discordUsername: identity.username,
      discordAvatarHash: identity.avatar,
      discordSyncedAt: new Date(),
      avatarUrl: discordAvatarUrl(identity.id, identity.avatar) ?? existing.avatarUrl,
    },
  })
}

/**
 * Drop the oldest sessions once a member holds too many
 * @param {string} accountId - Account identifier
 * @return {Promise<void>} - Trimmed
 */

const trimSessions = async (accountId: string): Promise<void> => {
  const sessions = await prisma.session.findMany({
    where: { accountId },
    orderBy: { lastUsedAt: 'desc' },
    select: { id: true },
    skip: AUTH_SETTINGS.maxConcurrentSessions,
  })

  if (sessions.length === 0) return

  await prisma.session.deleteMany({ where: { id: { in: sessions.map((row) => row.id) } } })
}

/**
 * Open a session
 * @param {string} accountId - Account identifier
 * @param {SessionOrigin} [origin] - Where it was opened from
 * @return {Promise<{ token: string, expiresAt: Date }>} - Session handle
 */

export const openSession = async (
  accountId: string,
  origin: SessionOrigin = {}
): Promise<{ token: string; expiresAt: Date }> => {
  const token = createToken()
  const expiresAt = new Date(Date.now() + AUTH_SETTINGS.sessionDays * DAY_MS)

  await prisma.session.create({
    data: {
      token,
      accountId,
      userAgent: origin.userAgent,
      address: origin.address,
      expiresAt,
    },
  })

  await trimSessions(accountId)

  return { token, expiresAt }
}

/**
 * Close a session
 * @param {string} token - Session token
 * @return {Promise<void>} - Closed
 */

export const closeSession = async (token: string): Promise<void> => {
  await prisma.session.deleteMany({ where: { token } })
}

/**
 * List the sessions still open for one member
 * @param {string} accountId - Account identifier
 * @param {string} [currentToken] - Token of the session on screen
 * @return {Promise<AccountSession[]>} - Open sessions, newest first
 */

export const readSessions = async (
  accountId: string,
  currentToken?: string
): Promise<AccountSession[]> => {
  const rows = await prisma.session.findMany({
    where: { accountId, expiresAt: { gt: new Date() } },
    orderBy: { lastUsedAt: 'desc' },
  })

  return rows.map((row) => ({
    id: row.id,
    userAgent: row.userAgent,
    createdAt: row.createdAt.toISOString(),
    lastUsedAt: row.lastUsedAt.toISOString(),
    expiresAt: row.expiresAt.toISOString(),
    isCurrent: currentToken !== undefined && row.token === currentToken,
  }))
}

/**
 * Cut one session of the signed-in member
 * @param {string} accountId - Account identifier
 * @param {string} sessionId - Session identifier
 * @return {Promise<void>} - Revoked
 */

export const revokeSession = async (accountId: string, sessionId: string): Promise<void> => {
  const { count } = await prisma.session.deleteMany({ where: { id: sessionId, accountId } })
  if (count === 0) throw notFound()
}

/**
 * Cut every session but the one on screen
 * @param {string} accountId - Account identifier
 * @param {string} currentToken - Token of the session on screen
 * @return {Promise<number>} - Revoked count
 */

export const revokeOtherSessions = async (
  accountId: string,
  currentToken: string
): Promise<number> => {
  // Without a token to spare, "every other one" would mean every single one
  if (currentToken.length === 0) throw notFound()

  const { count } = await prisma.session.deleteMany({
    where: { accountId, token: { not: currentToken } },
  })

  return count
}

/**
 * Stamp a session as used, at most once a day
 * @param {string} token - Session token
 * @return {Promise<void>} - Stamped
 */

export const touchSession = async (token: string): Promise<void> => {
  const horizon = new Date(Date.now() - DAY_MS)

  await prisma.session.updateMany({
    where: { token, lastUsedAt: { lt: horizon } },
    data: { lastUsedAt: new Date() },
  })
}

/**
 * Drop expired sessions
 * @param {number} [graceDays] - Days kept past expiry
 * @return {Promise<number>} - Removed count
 */

export const pruneSessions = async (graceDays = 0): Promise<number> => {
  const horizon = new Date(Date.now() - graceDays * DAY_MS)
  const { count } = await prisma.session.deleteMany({ where: { expiresAt: { lt: horizon } } })

  return count
}
