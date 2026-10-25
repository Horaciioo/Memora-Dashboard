import 'server-only'

import { cache } from 'react'
import { cookies } from 'next/headers'

import { prisma } from '@/core/lib/db'
import { digestSessionToken } from '@/core/lib/auth/sessionDigest'
import { readActiveCreator, readNavigationView } from '@/core/lib/auth/activeCreator'
import { logger } from '@/core/lib/logger'
import { holdRequestZone } from '@/core/lib/http/requestZone'
import { SESSION_COOKIE } from '@/core/lib/auth/session'
import { simulatedRoleOf } from '@/core/lib/auth/simulation'
import { resolveAccountPermissions } from '@/core/services/auth/GrantsService'
import { simulatedCreatorIds } from '@/core/services/auth/SimulationService'
import { touchSession } from '@/core/services/auth/SessionService'
import { syncReferenceLibrary } from '@/core/services/reference/ReferenceSync'
import { toFavorites } from '@/core/services/preferences/FavoriteService'
import { toDisplayPreferences } from '@/core/services/preferences/DisplayService'
import { isRootIdentity } from '@/declarations/access/identity'
import { isAccessClosed } from '@/core/lib/auth/closed'
import type { SessionUser } from '@/types/auth'
import { MemberRoles, MemberStatuses } from '@/utils/constants/hierarchy'
import type { Account, AccountFunction, Youtuber } from '@prisma/client'
import { DAY_MS } from '@/utils/constants/time'

// Account row a session is built from
type SessionAccount = Account & { youtubers: Youtuber[]; functions: AccountFunction[] }

// A session records its use at most once a day
const STAMP_INTERVAL_MS = DAY_MS

/**
 * Map an account row to its session shape
 * @param {SessionAccount} account - Account row with its creators and functions
 * @return {Promise<SessionUser>} - Session user
 */

export const toSessionUser = async (account: SessionAccount): Promise<SessionUser> => {
  const isRoot = isRootIdentity(account.discordId)
  const youtuberIds = account.youtubers.map((youtuber) => youtuber.id)
  const actual = { role: account.role, isRoot, youtuberIds }

  // Overwrites narrowed to a creator only land while that creator is the one being worked on
  const [activeYoutuberId, view] = await Promise.all([readActiveCreator(), readNavigationView()])

  // A lower view swaps the role only
  const wearing = simulatedRoleOf(view, actual)
  const held = wearing ? { ...account, role: wearing } : account

  return {
    id: account.id,
    discordId: account.discordId,
    displayName: account.displayName,
    avatarUrl: account.avatarUrl,
    role: held.role,
    status: wearing === MemberRoles.Junior ? MemberStatuses.Academy : account.status,
    divisionId: account.divisionId,
    youtuberIds: wearing
      ? await simulatedCreatorIds(account.id, actual, activeYoutuberId)
      : youtuberIds,
    functionIds: held.functions.map((entry) => entry.functionId),
    isRoot: isRoot && !wearing,
    actual,
    display: toDisplayPreferences(account),
    timezone: account.timezone,
    historyConsentVersion: account.historyConsentVersion,
    seenReleaseVersion: account.seenReleaseVersion,
    favorites: toFavorites(account.favorites),
    permissions: await resolveAccountPermissions(held, activeYoutuberId, !wearing),
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
    where: { token: digestSessionToken(token) },
    include: { account: { include: { youtubers: true, functions: true } } },
  })
  if (!session || session.expiresAt < new Date()) return null

  // A member who left or froze keeps no access
  if (isAccessClosed(session.account)) return null

  // Collections fixed in code sit in the database before anything reads them
  await syncReferenceLibrary().catch((error: unknown) =>
    logger.error('[reference] library sync failed', error)
  )

  // The stamp only moves once a day
  if (session.lastUsedAt < new Date(Date.now() - STAMP_INTERVAL_MS)) {
    void touchSession(token).catch(() => undefined)
  }

  // Clock times read in the member zone
  holdRequestZone(session.account.timezone)

  return toSessionUser(session.account)
})

/**
 * Check a session token against the database
 * @param {string} token - Session cookie value
 * @return {Promise<boolean>} - Token still opens a session
 */

export const isSessionTokenValid = cache(async (token: string): Promise<boolean> => {
  const session = await prisma.session.findUnique({
    where: { token: digestSessionToken(token) },
    select: { expiresAt: true, account: { select: { status: true, frozenAt: true } } },
  })
  if (!session || session.expiresAt < new Date()) return false

  return !isAccessClosed(session.account)
})
