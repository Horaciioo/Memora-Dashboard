import 'server-only'

import { cache } from 'react'
import { cookies } from 'next/headers'

import { prisma } from '@/core/lib/db'
import { readActiveCreator } from '@/core/lib/auth/activeCreator'
import { logger } from '@/core/lib/logger'
import { SESSION_COOKIE } from '@/core/lib/auth/session'
import { resolveAccountPermissions } from '@/core/services/auth/GrantsService'
import { touchSession } from '@/core/services/auth/SessionService'
import { syncReferenceLibrary } from '@/core/services/reference/ReferenceSync'
import { toDisplayPreferences } from '@/core/services/preferences/DisplayService'
import { isRootIdentity } from '@/declarations/access/identity'
import { GONE_MEMBER_STATUSES } from '@/utils/constants/hierarchy'
import type { SessionUser } from '@/types/auth'
import type { Account, AccountFunction, Youtuber } from '@prisma/client'

// Account row a session is built from
type SessionAccount = Account & { youtubers: Youtuber[]; functions: AccountFunction[] }

// A session records its use at most once a day
const STAMP_INTERVAL_MS = 86_400_000

/**
 * Map an account row to its session shape
 * @param {SessionAccount} account - Account row with its creators and functions
 * @return {Promise<SessionUser>} - Session user
 */

export const toSessionUser = async (account: SessionAccount): Promise<SessionUser> => {
  const isRoot = isRootIdentity(account.discordId)

  // Overwrites narrowed to a creator only land while that creator is the one being worked on
  const activeYoutuberId = await readActiveCreator()

  return {
    id: account.id,
    discordId: account.discordId,
    displayName: account.displayName,
    avatarUrl: account.avatarUrl,
    role: account.role,
    status: account.status,
    divisionId: account.divisionId,
    youtuberIds: account.youtubers.map((youtuber) => youtuber.id),
    functionIds: account.functions.map((held) => held.functionId),
    isRoot,
    display: toDisplayPreferences(account),
    historyConsentVersion: account.historyConsentVersion,
    seenReleaseVersion: account.seenReleaseVersion,
    permissions: await resolveAccountPermissions(account, activeYoutuberId),
  }
}

/**
 * Read the signed-in member
 * @return {Promise<SessionUser | null>} - Session user or null
 */

export const getSession = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { token },
    include: { account: { include: { youtubers: true, functions: true } } },
  })
  if (!session || session.expiresAt < new Date()) return null

  // A member who left keeps no access
  if (GONE_MEMBER_STATUSES.includes(session.account.status)) return null

  // Collections fixed in code sit in the database before anything reads them
  await syncReferenceLibrary().catch((error: unknown) =>
    logger.error('[reference] library sync failed', error)
  )

  // The stamp only moves once a day
  if (session.lastUsedAt < new Date(Date.now() - STAMP_INTERVAL_MS)) {
    void touchSession(token).catch(() => undefined)
  }

  return toSessionUser(session.account)
})

/**
 * Check a session token against the database
 * @param {string} token - Session cookie value
 * @return {Promise<boolean>} - Token still opens a session
 */

export const isSessionTokenValid = cache(async (token: string): Promise<boolean> => {
  const session = await prisma.session.findUnique({
    where: { token },
    select: { expiresAt: true, account: { select: { status: true } } },
  })
  if (!session || session.expiresAt < new Date()) return false

  return !GONE_MEMBER_STATUSES.includes(session.account.status)
})
