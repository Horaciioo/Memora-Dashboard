import 'server-only'

import { invalidInput } from '@/core/lib/errors'
import { prisma } from '@/core/lib/db'
import { parseYoutubeChannel } from '@/core/lib/platforms/youtube'
import { PlatformError } from '@/core/lib/platforms/http'
import { findTwitchUser } from '@/core/lib/platforms/twitch/oauth'
import { CHANNEL_COPY } from '@/declarations/platforms/copy'
import { isTwitchConfigured } from '@/declarations/platforms/twitch'
import type { CreatorChannelView } from '@/types/platforms'
import { LivePlatforms } from '@/utils/constants/lives'
import type { LivePlatformName } from '@/utils/constants/lives'
import { Prisma } from '@prisma/client'

// Twitch page of a login
const twitchUrl = (login: string) => `https://www.twitch.tv/${login}`

/**
 * Channels of a creator
 * @param {string} youtuberId - Creator
 * @return {Promise<CreatorChannelView[]>} - Channels
 */

export const readChannels = async (youtuberId: string): Promise<CreatorChannelView[]> => {
  const rows = await prisma.youtuberChannel.findMany({
    where: { youtuberId },
    orderBy: { createdAt: 'asc' },
  })

  return rows.map((row) => ({
    id: row.id,
    platform: row.platform,
    login: row.login ?? row.externalId,
    displayName: row.displayName,
    url:
      row.platform === LivePlatforms.Twitch
        ? twitchUrl(row.login ?? row.externalId)
        : row.externalId,
  }))
}

/**
 * Resolve a Twitch login against Twitch
 * @param {string} login - Channel login
 * @return {Promise<{ externalId: string, login: string, displayName: string }>} - Channel identity
 */

const resolveTwitch = async (login: string) => {
  const trimmed = login.trim().replace(/^@/, '')

  if (!isTwitchConfigured()) {
    throw invalidInput([{ field: 'value', message: CHANNEL_COPY.notConfigured }])
  }

  const user = await findTwitchUser(trimmed).catch((error: unknown) => {
    if (error instanceof PlatformError) return null
    throw error
  })
  if (!user) throw invalidInput([{ field: 'value', message: CHANNEL_COPY.unknown }])

  return { externalId: user.id, login: user.login, displayName: user.displayName }
}

/**
 * Resolve a YouTube handle or link
 * @param {string} value - Handle or link
 * @return {{ externalId: string, login: string, displayName: null }} - Channel identity
 */

const resolveYoutube = (value: string) => {
  const channel = parseYoutubeChannel(value)
  if (!channel) throw invalidInput([{ field: 'value', message: CHANNEL_COPY.invalidYoutube }])

  return { externalId: channel.url, login: channel.login, displayName: null }
}

/**
 * Attach a channel to a creator
 * @param {string} youtuberId - Creator
 * @param {LivePlatformName} platform - Platform
 * @param {string} value - Login, handle or link
 * @return {Promise<CreatorChannelView[]>} - Channels
 */

export const addChannel = async (
  youtuberId: string,
  platform: LivePlatformName,
  value: string
): Promise<CreatorChannelView[]> => {
  const identity =
    platform === LivePlatforms.Twitch ? await resolveTwitch(value) : resolveYoutube(value)

  // One channel belongs to one creator, the unique key settles a race
  try {
    await prisma.youtuberChannel.create({ data: { youtuberId, platform, ...identity } })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw invalidInput([{ field: 'value', message: CHANNEL_COPY.taken }])
    }

    throw error
  }

  return readChannels(youtuberId)
}

/**
 * Detach a channel
 * @param {string} youtuberId - Creator
 * @param {string} id - Channel identifier
 * @return {Promise<CreatorChannelView[]>} - Channels
 */

export const removeChannel = async (
  youtuberId: string,
  id: string
): Promise<CreatorChannelView[]> => {
  await prisma.youtuberChannel.deleteMany({ where: { id, youtuberId } })

  return readChannels(youtuberId)
}
