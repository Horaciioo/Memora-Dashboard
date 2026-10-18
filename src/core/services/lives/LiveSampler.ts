import 'server-only'

import { prisma } from '@/core/lib/db'
import { readStream } from '@/core/lib/platforms/twitch/helix'
import { readTwitchSeat } from '@/core/services/platforms/PlatformAccountService'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'

// Last sample per live
const lastSampled = new Map<string, number>()

/**
 * Keep the viewer count of a live
 * @param {Object} input - Live coordinates
 * @param {string} input.liveId - Live
 * @param {string} input.holderId - Member whose token reads
 * @param {string} input.broadcasterId - Channel
 * @return {Promise<void>} - Sampled
 */

export const sampleViewers = async (input: {
  liveId: string
  holderId: string
  broadcasterId: string
}): Promise<void> => {
  // One sample per interval
  const now = Date.now()
  if (now - (lastSampled.get(input.liveId) ?? 0) < LIVE_SETTINGS.sampleSeconds * 1000) return
  lastSampled.set(input.liveId, now)

  const seat = await readTwitchSeat(input.holderId).catch(() => null)
  if (!seat?.ok) return

  // Offline channels answer nothing
  const stream = await readStream({
    accessToken: seat.accessToken,
    moderatorId: seat.moderatorId,
    broadcasterId: input.broadcasterId,
  }).catch(() => null)
  if (!stream) return

  await prisma.liveSample
    .create({ data: { liveId: input.liveId, viewers: stream.viewers } })
    .catch(() => null)
}

/**
 * Forget a closed live
 * @param {string} liveId - Live
 * @return {void}
 */

export const forgetSampling = (liveId: string): void => {
  lastSampled.delete(liveId)
}
