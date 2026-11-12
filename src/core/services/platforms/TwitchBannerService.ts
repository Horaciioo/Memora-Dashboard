import 'server-only'

import { prisma } from '@/core/lib/db'
import { platformRequest } from '@/core/lib/platforms/http'
import { helixHeaders, readTwitchAppToken } from '@/core/lib/platforms/twitch/oauth'
import { HELIX_PATHS, TWITCH_ENDPOINTS, isTwitchConfigured } from '@/declarations/platforms/twitch'
import { LivePlatforms } from '@/utils/constants/lives'
import { HOUR_MS } from '@/utils/constants/time'

// Helix answers a hundred accounts at most
const BATCH = 100

// Banner kept by Twitch account
const cache = new Map<string, { url: string | null; at: number }>()

/**
 * Twitch banners of creators, from their linked channel
 * @param {string[]} youtuberIds - Creators
 * @return {Promise<Map<string, string>>} - Banner by creator, none when Twitch has no picture
 */

export const readTwitchBanners = async (youtuberIds: string[]): Promise<Map<string, string>> => {
  const banners = new Map<string, string>()
  if (!isTwitchConfigured() || youtuberIds.length === 0) return banners

  const channels = await prisma.youtuberChannel.findMany({
    where: { youtuberId: { in: youtuberIds }, platform: LivePlatforms.Twitch },
    select: { youtuberId: true, externalId: true },
    orderBy: { createdAt: 'asc' },
  })

  const stale = [
    ...new Set(
      channels
        .map((channel) => channel.externalId)
        .filter((id) => (cache.get(id)?.at ?? 0) < Date.now() - HOUR_MS)
    ),
  ]

  // Twitch down keeps the pictures already known
  try {
    const token = await readTwitchAppToken()
    for (let start = 0; start < stale.length; start += BATCH) {
      const ids = stale.slice(start, start + BATCH)
      const url = new URL(`${TWITCH_ENDPOINTS.helix}${HELIX_PATHS.users}`)
      url.search = new URLSearchParams(ids.map((id): [string, string] => ['id', id])).toString()
      const answer = await platformRequest<{ data: { id: string; offline_image_url?: string }[] }>({
        url: url.toString(),
        headers: helixHeaders(token),
        bucket: 'twitch:app',
      })
      const found = new Map((answer?.data ?? []).map((row) => [row.id, row.offline_image_url]))
      for (const id of ids) cache.set(id, { url: found.get(id) || null, at: Date.now() })
    }
  } catch {
    // Fall back to what the cache holds
  }

  for (const channel of channels) {
    const url = cache.get(channel.externalId)?.url
    if (url && !banners.has(channel.youtuberId)) banners.set(channel.youtuberId, url)
  }

  return banners
}

/**
 * Creator rows whose banners come from their Twitch channel, their own kept when Twitch has none
 * @param {T[]} rows - Creators
 * @return {Promise<T[]>} - Same rows, banners replaced
 */

export const withTwitchBanners = async <
  T extends { id: string; bannerUrl?: string | null; fadeBannerUrl?: string | null },
>(
  rows: T[]
): Promise<T[]> => {
  const banners = await readTwitchBanners(rows.map((row) => row.id))

  return rows.map((row) => {
    const url = banners.get(row.id)

    return url ? { ...row, bannerUrl: url, fadeBannerUrl: url } : row
  })
}
