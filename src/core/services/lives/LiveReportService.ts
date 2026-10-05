import 'server-only'

import { prisma } from '@/core/lib/db'
import { buildLiveReport } from '@/core/lib/lives/report'
import type { LiveReport } from '@/core/lib/lives/report'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { readLive } from '@/core/services/lives/LiveService'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import type { LiveLogLine, LiveView } from '@/types/lives'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * Report of a live and its log
 * @typedef {Object} LiveReportDetail
 * @property {LiveView} live - Live
 * @property {LiveReport} report - Figures
 * @property {LiveLogLine[]} log - Latest lines
 * @property {boolean} available - The log tables exist
 */

export interface LiveReportDetail {
  live: LiveView
  report: LiveReport
  log: LiveLogLine[]
  available: boolean
}

/**
 * Read the report of one live
 * @param {string} liveId - Live
 * @param {AccessScope} scope - Viewer's perimeter
 * @param {string} viewerId - Member
 * @param {PermissionName[]} held - Permissions held
 * @return {Promise<LiveReportDetail>} - Report
 */

export const readLiveReport = async (
  liveId: string,
  scope: AccessScope,
  viewerId: string,
  held: PermissionName[]
): Promise<LiveReportDetail> => {
  const live = await readLive(liveId, scope, viewerId, held)
  const start = new Date(live.startedAt ?? live.plannedStartAt)
  const end = live.endedAt ? new Date(live.endedAt) : new Date()

  // Levels tied to the live
  const entries = await prisma.liveconEntry.findMany({
    where: {
      OR: [
        { liveId },
        {
          youtuberId: { in: [live.youtuber.id] },
          startedAt: { lt: end },
          OR: [{ endedAt: null }, { endedAt: { gt: start } }],
        },
      ],
    },
    select: { startedAt: true, endedAt: true, level: { select: { level: true, name: true } } },
    orderBy: { startedAt: 'asc' },
  })
  const levels = entries.map((entry) => ({
    level: entry.level.level,
    name: entry.level.name,
    from: entry.startedAt < start ? start : entry.startedAt,
    to: entry.endedAt,
  }))

  // The log tables may not be migrated yet
  const [actions, presences] = await Promise.all([
    prisma.moderationAction
      .findMany({
        where: { liveId },
        orderBy: { occurredAt: 'desc' },
        include: { actor: { select: { displayName: true } } },
      })
      .catch(() => null),
    prisma.modViewPresence
      .findMany({ where: { liveId }, include: { account: { select: { displayName: true } } } })
      .catch(() => null),
  ])

  const nameOf = (row: { actor: { displayName: string } | null; actorLogin: string | null }) =>
    row.actor?.displayName ?? row.actorLogin ?? '?'

  const report = buildLiveReport({
    actions: (actions ?? []).map((row) => ({
      kind: row.kind,
      actorAccountId: row.actorAccountId,
      actorName: nameOf(row),
      targetPlatformUserId: row.targetPlatformUserId,
      occurredAt: row.occurredAt,
      succeeded: row.status === 'SUCCEEDED',
    })),
    presences: (presences ?? []).map((row) => ({
      accountId: row.accountId,
      name: row.account.displayName,
      visibleSeconds: row.visibleSeconds,
      activeSeconds: row.activeSeconds,
    })),
    levels,
    start,
    end,
    bucketMinutes: LIVE_SETTINGS.reportBucketMinutes,
  })

  return {
    live,
    report,
    available: actions !== null && presences !== null,
    log: (actions ?? []).slice(0, LIVE_SETTINGS.logLines).map((row) => ({
      id: row.id,
      kind: row.kind,
      actorKey: row.actorAccountId ?? `platform:${nameOf(row)}`,
      actorName: nameOf(row),
      isMember: row.actorAccountId !== null,
      targetLogin: row.targetLogin,
      durationSeconds: row.durationSeconds,
      reason: row.reason,
      excerpt: row.messageExcerpt,
      origin: row.origin,
      status: row.status,
      liveconLevel: row.liveconLevel,
      occurredAt: row.occurredAt.toISOString(),
    })),
  }
}
