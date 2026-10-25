import 'server-only'

import { prisma } from '@/core/lib/db'
import { emptyCounts } from '@/core/lib/lives/insights/series'
import type { LiveBaseline } from '@/core/lib/lives/insights'
import { GROUP_OF_KIND, REPORT_GROUPS } from '@/declarations/lives/reportGroups'
import { LiveStatuses } from '@/utils/constants/lives'
import { HOUR_SECONDS } from '@/utils/constants/time'

// Lives averaged
const BASELINE_LIVES = 5

/**
 * Average of the creator's previous lives
 * @param {string} youtuberId - Creator
 * @param {string} liveId - Live compared
 * @param {Date} before - Live start
 * @return {Promise<LiveBaseline | null>} - Average, none without history
 */

export const readBaseline = async (
  youtuberId: string,
  liveId: string,
  before: Date
): Promise<LiveBaseline | null> => {
  const lives = await prisma.live.findMany({
    where: {
      youtuberId,
      id: { not: liveId },
      status: LiveStatuses.Ended,
      startedAt: { lt: before },
    },
    orderBy: { startedAt: 'desc' },
    take: BASELINE_LIVES,
    select: { id: true, startedAt: true, endedAt: true },
  })
  if (lives.length === 0) return null

  const ids = lives.map((live) => live.id)
  const [kinds, viewers] = await Promise.all([
    prisma.moderationAction
      .groupBy({
        by: ['kind'],
        where: { liveId: { in: ids }, status: 'SUCCEEDED' },
        _count: { _all: true },
      })
      .catch(() => []),
    prisma.liveSample
      .groupBy({
        by: ['liveId'],
        where: { liveId: { in: ids } },
        _avg: { viewers: true },
        _max: { viewers: true },
      })
      .catch(() => []),
  ])

  // Gestures per family
  const counts = emptyCounts()
  kinds.forEach((row) => (counts[GROUP_OF_KIND[row.kind]] += row._count._all))
  const total = REPORT_GROUPS.reduce((sum, group) => sum + counts[group], 0)

  const seconds = lives.reduce(
    (sum, live) => sum + Math.max(0, (live.endedAt!.getTime() - live.startedAt!.getTime()) / 1000),
    0
  )
  const mean = (values: number[]) =>
    values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null

  return {
    lives: lives.length,
    actions: Math.round(total / lives.length),
    perHour: seconds > 0 ? (total / seconds) * HOUR_SECONDS : 0,
    durationSeconds: Math.round(seconds / lives.length),
    averageViewers: mean(viewers.map((row) => row._avg.viewers ?? 0)),
    peakViewers: mean(viewers.map((row) => row._max.viewers ?? 0)),
    mix: Object.fromEntries(
      REPORT_GROUPS.map((group) => [group, total > 0 ? counts[group] / total : 0])
    ) as LiveBaseline['mix'],
  }
}
