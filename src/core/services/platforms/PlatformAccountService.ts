import 'server-only'

import { decryptSecret, encryptSecret } from '@/core/lib/crypto'
import { prisma } from '@/core/lib/db'
import { logger } from '@/core/lib/logger'
import { PlatformError } from '@/core/lib/platforms/http'
import type { PlatformGrant, PlatformIdentity } from '@/core/lib/platforms/grant'
import { PLATFORM_LINKERS } from '@/core/lib/platforms/linkers'
import { refreshTwitchGrant } from '@/core/lib/platforms/twitch/oauth'
import { isTwitchConfigured } from '@/declarations/platforms/twitch'
import { LivePlatforms } from '@/utils/constants/lives'
import type { LivePlatformName } from '@/utils/constants/lives'
import type { MemoraRank } from '@/types/modview'
import type { PlatformLinkView } from '@/types/platforms'
import { MemberRoles } from '@/utils/constants/hierarchy'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import { MINUTE_MS } from '@/utils/constants/time'

// Renew this long before expiry
const REFRESH_MARGIN_MS = MINUTE_MS

/**
 * A usable Twitch seat
 * @typedef {Object} SeatLookup
 */

export type SeatLookup =
  | { ok: true; accessToken: string; moderatorId: string; login: string }
  | { ok: false; reason: 'notLinked' | 'revoked' | 'notConfigured' }

/**
 * Keep a platform grant
 * @param {string} accountId - Member
 * @param {LivePlatformName} platform - Platform linked
 * @param {PlatformGrant} grant - Tokens
 * @param {PlatformIdentity} identity - Platform user
 * @return {Promise<void>} - Stored
 */

export const storePlatformGrant = async (
  accountId: string,
  platform: LivePlatformName,
  grant: PlatformGrant,
  identity: PlatformIdentity
): Promise<void> => {
  const payload = {
    externalUserId: identity.id,
    login: identity.login,
    displayName: identity.displayName,
    scopes: grant.scopes,
    accessToken: encryptSecret(grant.accessToken),
    refreshToken: encryptSecret(grant.refreshToken),
    expiresAt: grant.expiresAt,
    revokedAt: null,
  }

  // A platform account belongs to one member at a time
  await prisma.$transaction([
    prisma.platformAccount.deleteMany({
      where: { platform, externalUserId: identity.id, NOT: { accountId } },
    }),
    prisma.platformAccount.upsert({
      where: { accountId_platform: { accountId, platform } },
      update: payload,
      create: { accountId, platform, ...payload },
    }),
  ])
}

/**
 * Read a usable Twitch token of a member
 * @param {string} accountId - Member
 * @return {Promise<SeatLookup>} - Seat or reason
 */

export const readTwitchSeat = async (accountId: string): Promise<SeatLookup> => {
  if (!isTwitchConfigured()) return { ok: false, reason: 'notConfigured' }

  const stored = await prisma.platformAccount.findUnique({
    where: { accountId_platform: { accountId, platform: LivePlatforms.Twitch } },
  })
  if (!stored) return { ok: false, reason: 'notLinked' }
  if (stored.revokedAt) return { ok: false, reason: 'revoked' }

  // Still valid for a while
  if (stored.expiresAt.getTime() - Date.now() > REFRESH_MARGIN_MS) {
    const accessToken = decryptSecret(stored.accessToken)
    if (accessToken) {
      return { ok: true, accessToken, moderatorId: stored.externalUserId, login: stored.login }
    }
  }

  const refreshToken = decryptSecret(stored.refreshToken)
  try {
    if (!refreshToken) throw new PlatformError(401, 'unreadable refresh token')

    const renewed = await refreshTwitchGrant(refreshToken)
    await prisma.platformAccount.update({
      where: { id: stored.id },
      data: {
        accessToken: encryptSecret(renewed.accessToken),
        refreshToken: encryptSecret(renewed.refreshToken),
        scopes: renewed.scopes,
        expiresAt: renewed.expiresAt,
      },
    })

    return {
      ok: true,
      accessToken: renewed.accessToken,
      moderatorId: stored.externalUserId,
      login: stored.login,
    }
  } catch (error) {
    // A refused refresh means the member revoked or Twitch expired the grant
    if (error instanceof PlatformError && error.status >= 400 && error.status < 500) {
      await prisma.platformAccount.update({
        where: { id: stored.id },
        data: { revokedAt: new Date() },
      })

      return { ok: false, reason: 'revoked' }
    }

    logger.warn('[platforms] twitch refresh failed', error instanceof Error ? error.message : '')
    throw error
  }
}

/**
 * Mark a member's Twitch access as refused
 * @param {string} accountId - Member
 * @return {Promise<void>} - Marked
 */

export const markTwitchRevoked = async (accountId: string): Promise<void> => {
  await prisma.platformAccount.updateMany({
    where: { accountId, platform: LivePlatforms.Twitch },
    data: { revokedAt: new Date() },
  })
}

/**
 * Platform links of a member
 * @param {string} accountId - Member
 * @return {Promise<PlatformLinkView[]>} - Links
 */

export const listPlatformLinks = async (accountId: string): Promise<PlatformLinkView[]> => {
  const rows = await prisma.platformAccount.findMany({
    where: { accountId },
    select: { platform: true, login: true, displayName: true, revokedAt: true },
  })

  return rows.map((row) => ({
    platform: row.platform,
    login: row.displayName ?? row.login,
    handle: row.login,
    revoked: row.revokedAt !== null,
  }))
}

/**
 * Unlink a member's account on a platform
 * @param {string} accountId - Member
 * @param {LivePlatformName} platform - Platform to leave
 * @return {Promise<void>} - Unlinked
 */

export const unlinkPlatform = async (
  accountId: string,
  platform: LivePlatformName
): Promise<void> => {
  const stored = await prisma.platformAccount.findUnique({
    where: { accountId_platform: { accountId, platform } },
  })
  if (!stored) return

  const linker = PLATFORM_LINKERS[platform]
  const accessToken = decryptSecret(stored.accessToken)
  if (accessToken && linker.isConfigured()) await linker.revoke(accessToken)

  await prisma.platformAccount.delete({ where: { id: stored.id } })
}

// Memora rank by hierarchy level
const RANK_OF_ROLE: Partial<Record<MemberRoleName, MemoraRank>> = {
  [MemberRoles.Admin]: 'admin',
  [MemberRoles.Employe]: 'admin',
  [MemberRoles.Responsable]: 'responsable',
  [MemberRoles.Moderateur]: 'moderator',
}

/**
 * Memora ranks of the linked Twitch accounts
 * @return {Promise<Record<string, MemoraRank>>} - Rank by Twitch user
 */

export const readTwitchRoster = async (): Promise<Record<string, MemoraRank>> => {
  const rows = await prisma.platformAccount.findMany({
    where: { platform: LivePlatforms.Twitch, revokedAt: null },
    select: { externalUserId: true, account: { select: { role: true } } },
  })

  return Object.fromEntries(
    rows.flatMap((row) => {
      const rank = RANK_OF_ROLE[row.account.role as MemberRoleName]

      return rank ? [[row.externalUserId, rank]] : []
    })
  )
}
