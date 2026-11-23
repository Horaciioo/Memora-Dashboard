import 'server-only'

import { prisma } from '@/core/lib/db'
import { publishLive } from '@/core/lib/lives/bus'
import { logger } from '@/core/lib/logger'
import { liveconLevelOf } from '@/core/services/lives/ModerationLogService'
import { LIVE_STREAM_EVENTS, LIVE_TOPICS } from '@/declarations/lives/topics'
import { OPEN_LIVE_STATUSES } from '@/utils/constants/lives'

/**
 * Tell every open Mod View the level in force changed, never fails the switch
 * @param {string | null} youtuberId - Creator switched, none for the whole team
 * @return {Promise<void>} - Told
 */

export const announceLivecon = async (youtuberId: string | null): Promise<void> => {
  try {
    // Every instance drops what it remembered of the level
    await publishLive(LIVE_TOPICS.livecon, { youtuberId })

    const lives = await prisma.live.findMany({
      where: { status: { in: [...OPEN_LIVE_STATUSES] }, ...(youtuberId ? { youtuberId } : {}) },
      select: { id: true, youtuberId: true },
    })

    await Promise.all(
      lives.map(async (live) =>
        publishLive(LIVE_TOPICS.live(live.id), {
          type: LIVE_STREAM_EVENTS.livecon,
          level: await liveconLevelOf(live.youtuberId),
        })
      )
    )
  } catch (error) {
    logger.warn('[livecon] switch not announced', error instanceof Error ? error.message : '')
  }
}
