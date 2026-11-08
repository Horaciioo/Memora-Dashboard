import 'server-only'

import { prisma } from '@/core/lib/db'
import { blindSpans, spanSeconds } from '@/core/lib/lives/coverage'
import type { CoverageSpan, LiveCoverage } from '@/core/lib/lives/coverage'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'

/**
 * Open the period of a live, closing one a crash left behind at its last proof of life
 * @param {string} liveId - Live
 * @return {Promise<void>} - Opened
 */

export const openWatchPeriod = async (liveId: string): Promise<void> => {
  const stale = await prisma.liveWatchPeriod.findMany({
    where: { liveId, endedAt: null },
    select: { id: true, lastBeatAt: true },
  })
  // A feed still alive keeps its period
  const fresh = stale.some(
    (row) => Date.now() - row.lastBeatAt.getTime() < LIVE_SETTINGS.watchSyncSeconds * 3000
  )
  if (fresh) return

  await Promise.all(
    stale.map((row) =>
      prisma.liveWatchPeriod.update({ where: { id: row.id }, data: { endedAt: row.lastBeatAt } })
    )
  )
  await prisma.liveWatchPeriod.create({ data: { liveId } })
}

/**
 * Prove the feed of a live is still alive
 * @param {string} liveId - Live
 * @return {Promise<void>} - Beat
 */

export const beatWatchPeriod = async (liveId: string): Promise<void> => {
  await prisma.liveWatchPeriod.updateMany({
    where: { liveId, endedAt: null },
    data: { lastBeatAt: new Date() },
  })
}

/**
 * Close the open period of a live
 * @param {string} liveId - Live
 * @return {Promise<void>} - Closed
 */

export const closeWatchPeriod = async (liveId: string): Promise<void> => {
  await prisma.liveWatchPeriod.updateMany({
    where: { liveId, endedAt: null },
    data: { endedAt: new Date() },
  })
}

/**
 * Where the log of a live could not see
 * @param {string} liveId - Live
 * @param {Date} start - Live start
 * @param {Date} end - Live end
 * @return {Promise<LiveCoverage | null>} - Coverage, none when the table is not migrated
 */

export const readCoverage = async (
  liveId: string,
  start: Date,
  end: Date
): Promise<LiveCoverage | null> => {
  const rows = await prisma.liveWatchPeriod
    .findMany({ where: { liveId }, select: { startedAt: true, lastBeatAt: true, endedAt: true } })
    .catch(() => null)
  if (!rows) return null

  const covered: CoverageSpan[] = rows.map((row) => ({
    from: row.startedAt,
    to: row.endedAt ?? row.lastBeatAt,
  }))
  const gaps = blindSpans(covered, start, end, LIVE_SETTINGS.coverageMinGapSeconds)

  return {
    gaps: gaps.map((gap) => ({ from: gap.from.toISOString(), to: gap.to.toISOString() })),
    blindSeconds: spanSeconds(gaps),
  }
}
