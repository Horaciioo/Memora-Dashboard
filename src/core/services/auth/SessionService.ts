import 'server-only'

import crypto from 'crypto'

import { prisma } from '@/core/lib/db'
import { ROOT_IDENTITY, isRootIdentity } from '@/declarations/access/identity'
import { MemberRoles, MemberStatuses } from '@/utils/constants/hierarchy'
import type { Account } from '@prisma/client'

// Milliseconds in one day
const DAY_MS = 86_400_000

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
    update: { role: MemberRoles.Admin, status: MemberStatuses.Active, leftAt: null },
    create: {
      discordId,
      displayName: ROOT_IDENTITY.displayName,
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
 * Open a session
 * @param {string} accountId - Account identifier
 * @param {string} [userAgent] - Client user agent
 * @return {Promise<{ token: string, expiresAt: Date }>} - Session handle
 */

export const openSession = async (
  accountId: string,
  userAgent?: string
): Promise<{ token: string; expiresAt: Date }> => {
  const token = createToken()
  const expiresAt = new Date(Date.now() + ROOT_IDENTITY.sessionDays * DAY_MS)

  await prisma.session.create({ data: { token, accountId, userAgent, expiresAt } })

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
 * Drop expired sessions
 * @return {Promise<number>} - Removed count
 */

export const pruneSessions = async (): Promise<number> => {
  const { count } = await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } })

  return count
}
