import 'server-only'

import { prisma } from '@/core/lib/db'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'

// Last sample per live
const lastSampled = new Map<string, number>()

/**
 * Keep the viewer count of a live
 * @param {string} liveId - Live
 * @param {number} viewers - Spectators read with the stream
 * @return {Promise<void>} - Sampled
 */

export const sampleViewers = async (liveId: string, viewers: number): Promise<void> => {
  // One sample per interval
  const now = Date.now()
  if (now - (lastSampled.get(liveId) ?? 0) < LIVE_SETTINGS.sampleSeconds * 1000) return
  lastSampled.set(liveId, now)

  await prisma.liveSample.create({ data: { liveId, viewers } }).catch(() => null)
}

/**
 * Forget a closed live
 * @param {string} liveId - Live
 * @return {void}
 */

export const forgetSampling = (liveId: string): void => {
  lastSampled.delete(liveId)
}
