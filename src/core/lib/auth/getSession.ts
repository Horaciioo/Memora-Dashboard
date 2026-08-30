import 'server-only'

import { cache } from 'react'
import { cookies } from 'next/headers'

import { prisma } from '@/core/lib/db'
import { SESSION_COOKIE } from '@/core/lib/auth/session'
import { resolveAccountPermissions } from '@/core/services/auth/GrantsService'
import { touchSession } from '@/core/services/auth/SessionService'
import { isRootIdentity } from '@/declarations/access/identity'
import { MemberStatuses } from '@/utils/constants/hierarchy'
import type { SessionUser } from '@/types/auth'
import type { Account, Youtuber } from '@prisma/client'

// A session records its use at most once a day
const STAMP_INTERVAL_MS = 86_400_000

/**
 * Map an account row to its session shape
 * @param {Account & { youtubers: Youtuber[] }} account - Account row
 * @return {Promise<SessionUser>} - Session user
 */

export const toSessionUser = async (
  account: Account & { youtubers: Youtuber[] }
): Promise<SessionUser> => {
  const isRoot = isRootIdentity(account.discordId)

  return {
    id: account.id,
    discordId: account.discordId,
    displayName: account.displayName,
    avatarUrl: account.avatarUrl,
    role: account.role,
    status: account.status,
    divisionId: account.divisionId,
    youtuberIds: account.youtubers.map((youtuber) => youtuber.id),
    primaryFunctionId: account.primaryFunctionId,
    secondaryFunctionId: account.secondaryFunctionId,
    isRoot,
    historyConsentVersion: account.historyConsentVersion,
    permissions: await resolveAccountPermissions(account),
  }
}

/**
 * Read the signed-in member, resolved once per render
 * @return {Promise<SessionUser | null>} - Session user or null
 */

export const getSession = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { token },
    include: { account: { include: { youtubers: true } } },
  })
  if (!session || session.expiresAt < new Date()) return null

  // A member who left keeps no access
  if (session.account.status === MemberStatuses.Left) return null

  // The stamp only moves once a day, so the hot path stays a single read
  if (session.lastUsedAt < new Date(Date.now() - STAMP_INTERVAL_MS)) {
    void touchSession(token).catch(() => undefined)
  }

  return toSessionUser(session.account)
})

/**
 * Check a session token against the database, resolved once per render
 * @param {string} token - Session cookie value
 * @return {Promise<boolean>} - Token still opens a session
 */

export const isSessionTokenValid = cache(async (token: string): Promise<boolean> => {
  const session = await prisma.session.findUnique({
    where: { token },
    select: { expiresAt: true, account: { select: { status: true } } },
  })
  if (!session || session.expiresAt < new Date()) return false

  return session.account.status !== MemberStatuses.Left
})
