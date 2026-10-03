import 'server-only'

import { decryptSecret, encryptSecret } from '@/core/lib/crypto'
import { prisma } from '@/core/lib/db'
import { logger } from '@/core/lib/logger'
import { PlatformError } from '@/core/lib/platforms/http'
import { refreshTwitchGrant, revokeTwitchToken } from '@/core/lib/platforms/twitch/oauth'
import type { TwitchGrant, TwitchIdentity } from '@/core/lib/platforms/twitch/oauth'
import { isTwitchConfigured } from '@/declarations/platforms/twitch'
import { LivePlatforms } from '@/utils/constants/lives'
import type { PlatformLinkView } from '@/types/platforms'

// Renew this long before expiry
const REFRESH_MARGIN_MS = 60_000

/**
 * A usable Twitch seat, or why there is none
 * @typedef {Object} SeatLookup
 */

export type SeatLookup =
  | { ok: true; accessToken: string; moderatorId: string; login: string }
  | { ok: false; reason: 'notLinked' | 'revoked' | 'notConfigured' }

/**
 * Keep a Twitch grant, both tokens encrypted at rest
 * @param {string} accountId - Member
 * @param {TwitchGrant} grant - Tokens
 * @param {TwitchIdentity} identity - Twitch user
 * @return {Promise<void>} - Stored
 */

export const storeTwitchGrant = async (
  accountId: string,
  grant: TwitchGrant,
  identity: TwitchIdentity
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

  // A Twitch account belongs to one member at a time
  await prisma.$transaction([
    prisma.platformAccount.deleteMany({
      where: { platform: LivePlatforms.Twitch, externalUserId: identity.id, NOT: { accountId } },
    }),
    prisma.platformAccount.upsert({
      where: { accountId_platform: { accountId, platform: LivePlatforms.Twitch } },
      update: payload,
      create: { accountId, platform: LivePlatforms.Twitch, ...payload },
    }),
  ])
}

/**
 * Read a usable Twitch token of a member, renewed when close to expiry
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
 * Mark a member's Twitch access as refused, until they reconnect
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
 * Platform links of a member, for the settings
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
    revoked: row.revokedAt !== null,
  }))
}

/**
 * Unlink a member's Twitch account, giving the token back to Twitch
 * @param {string} accountId - Member
 * @return {Promise<void>} - Unlinked
 */

export const unlinkTwitch = async (accountId: string): Promise<void> => {
  const stored = await prisma.platformAccount.findUnique({
    where: { accountId_platform: { accountId, platform: LivePlatforms.Twitch } },
  })
  if (!stored) return

  const accessToken = decryptSecret(stored.accessToken)
  if (accessToken && isTwitchConfigured()) await revokeTwitchToken(accessToken)

  await prisma.platformAccount.delete({ where: { id: stored.id } })
}
