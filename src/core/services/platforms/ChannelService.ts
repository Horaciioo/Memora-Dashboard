import 'server-only'

import { invalidInput } from '@/core/lib/errors'
import { prisma } from '@/core/lib/db'
import { PlatformError } from '@/core/lib/platforms/http'
import { findTwitchUser } from '@/core/lib/platforms/twitch/oauth'
import { CHANNEL_COPY } from '@/declarations/platforms/copy'
import { isTwitchConfigured } from '@/declarations/platforms/twitch'
import type { CreatorChannelView } from '@/types/platforms'
import { LivePlatforms } from '@/utils/constants/lives'

/**
 * Twitch channel of a creator
 * @param {string} youtuberId - Creator
 * @return {Promise<CreatorChannelView | null>} - Channel
 */

export const readTwitchChannel = async (youtuberId: string): Promise<CreatorChannelView | null> => {
  const row = await prisma.youtuberChannel.findUnique({
    where: { youtuberId_platform: { youtuberId, platform: LivePlatforms.Twitch } },
    select: { login: true, displayName: true, externalId: true },
  })

  return row ? { login: row.login ?? row.externalId, displayName: row.displayName } : null
}

/**
 * Set or clear the Twitch channel of a creator, its identifier read from Twitch
 * @param {string} youtuberId - Creator
 * @param {string} login - Channel login, empty to clear
 * @return {Promise<CreatorChannelView | null>} - Channel
 */

export const saveTwitchChannel = async (
  youtuberId: string,
  login: string
): Promise<CreatorChannelView | null> => {
  const trimmed = login.trim().replace(/^@/, '')

  // Empty clears the channel
  if (!trimmed) {
    await prisma.youtuberChannel.deleteMany({
      where: { youtuberId, platform: LivePlatforms.Twitch },
    })
    return null
  }

  if (!isTwitchConfigured()) {
    throw invalidInput([{ field: 'login', message: CHANNEL_COPY.notConfigured }])
  }

  const user = await findTwitchUser(trimmed).catch((error: unknown) => {
    if (error instanceof PlatformError) return null
    throw error
  })
  if (!user) throw invalidInput([{ field: 'login', message: CHANNEL_COPY.unknown }])

  // One channel belongs to one creator
  const taken = await prisma.youtuberChannel.findUnique({
    where: { platform_externalId: { platform: LivePlatforms.Twitch, externalId: user.id } },
    select: { youtuberId: true },
  })
  if (taken && taken.youtuberId !== youtuberId) {
    throw invalidInput([{ field: 'login', message: CHANNEL_COPY.taken }])
  }

  const data = { externalId: user.id, login: user.login, displayName: user.displayName }
  await prisma.youtuberChannel.upsert({
    where: { youtuberId_platform: { youtuberId, platform: LivePlatforms.Twitch } },
    update: data,
    create: { youtuberId, platform: LivePlatforms.Twitch, ...data },
  })

  return { login: user.login, displayName: user.displayName }
}
