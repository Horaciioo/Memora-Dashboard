import 'server-only'

import { readAvatars } from '@/core/lib/platforms/twitch/helix'
import { readLive } from '@/core/services/lives/LiveService'
import { requireChannelModerator } from '@/core/services/lives/ModViewService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { conflict } from '@/core/lib/errors'
import type { PermissionName } from '@/utils/constants/permissions'

// Pictures kept, none when the account has not one
const avatarCache = new Map<string, { url: string | null; until: number }>()

// Entries one cache holds at most
const CACHE_LIMIT = 5000

/**
 * Profile pictures of chatters, asked in batches and kept a day
 * @param {string} liveId - Live
 * @param {AccessScope} scope - Viewer's perimeter
 * @param {string} viewerId - Member
 * @param {PermissionName[]} held - Permissions held
 * @param {string[]} ids - Platform accounts
 * @return {Promise<Record<string, string | null>>} - Picture address by account
 */

export const readLiveAvatars = async (
  liveId: string,
  scope: AccessScope,
  viewerId: string,
  held: PermissionName[],
  ids: string[]
): Promise<Record<string, string | null>> => {
  const live = await readLive(liveId, scope, viewerId, held)
  if (live.access !== 'open') throw conflict()
  const found = await requireChannelModerator(viewerId, live)
  if (!found) return {}

  // Only what the cache lacks goes to Twitch
  const now = Date.now()
  const wanted = [...new Set(ids)].slice(0, LIVE_SETTINGS.avatarBatchMax)
  const missing = wanted.filter((id) => (avatarCache.get(id)?.until ?? 0) <= now)
  if (missing.length > 0) {
    const fresh = await readAvatars(found.seat, missing).catch(() => null)
    if (fresh) {
      if (avatarCache.size > CACHE_LIMIT) avatarCache.clear()
      const until = now + LIVE_SETTINGS.avatarCacheSeconds * 1000
      for (const id of missing) avatarCache.set(id, { url: fresh.get(id) ?? null, until })
    }
  }

  return Object.fromEntries(wanted.map((id) => [id, avatarCache.get(id)?.url ?? null]))
}
