import 'server-only'

import { prisma } from '@/core/lib/db'
import { isStale, tallyBeat } from '@/core/lib/lives/presence'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'

/**
 * Count one heartbeat of a member's Mod View
 * @param {string} liveId - Live
 * @param {string} accountId - Member
 * @param {Object} beat - Beat
 * @param {boolean} beat.visible - Tab shown
 * @param {boolean} beat.active - Member acting recently
 * @param {boolean} beat.closing - Tab closing
 * @return {Promise<void>} - Counted
 */

export const beatPresence = async (
  liveId: string,
  accountId: string,
  beat: { visible: boolean; active: boolean; closing: boolean }
): Promise<void> => {
  const now = new Date()
  let open = await prisma.modViewPresence.findFirst({
    where: { liveId, accountId, closedAt: null },
    orderBy: { openedAt: 'desc' },
  })

  // A long silence closes the old presence where it stopped
  if (open && isStale(open.lastBeatAt, now, LIVE_SETTINGS.staleSeconds)) {
    await prisma.modViewPresence.update({
      where: { id: open.id },
      data: { closedAt: open.lastBeatAt, closeReason: 'TIMEOUT' },
    })
    open = null
  }

  if (!open) {
    if (beat.closing) return
    await prisma.modViewPresence.create({
      data: { liveId, accountId, openedAt: now, lastBeatAt: now },
    })
    return
  }

  // Several tabs beat the same presence, each beat counting only since the last one
  const next = tallyBeat(open, { at: now, ...beat }, LIVE_SETTINGS.heartbeatSeconds * 2)
  await prisma.modViewPresence.update({
    where: { id: open.id },
    data: {
      ...next,
      ...(beat.closing ? { closedAt: now, closeReason: 'CLOSED' as const } : {}),
    },
  })
}

/**
 * Close every presence of a live that ended
 * @param {string} liveId - Live
 * @return {Promise<void>} - Closed
 */

export const closeLivePresences = async (liveId: string): Promise<void> => {
  await prisma.modViewPresence.updateMany({
    where: { liveId, closedAt: null },
    data: { closedAt: new Date(), closeReason: 'LIVE_ENDED' },
  })
}

/**
 * Close presences whose tab went silent, at their last beat
 * @return {Promise<number>} - Closed
 */

export const sweepStalePresences = async (): Promise<number> => {
  const horizon = new Date(Date.now() - LIVE_SETTINGS.staleSeconds * 1000)
  const stale = await prisma.modViewPresence.findMany({
    where: { closedAt: null, lastBeatAt: { lt: horizon } },
    select: { id: true, lastBeatAt: true },
    take: 200,
  })

  await prisma.$transaction(
    stale.map((row) =>
      prisma.modViewPresence.update({
        where: { id: row.id },
        data: { closedAt: row.lastBeatAt, closeReason: 'TIMEOUT' },
      })
    )
  )

  return stale.length
}
