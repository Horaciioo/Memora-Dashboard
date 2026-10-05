import 'server-only'

import type { PanelMemory } from '@/core/lib/modview/commands'
import { rememberRung } from '@/core/lib/modview/commands'
import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { logger } from '@/core/lib/logger'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import type { ModeratorInspect, ViewerSanction } from '@/types/lives'
import type { AttendanceStatusName } from '@/utils/constants/workflow'
import { AbsenceStatuses } from '@/utils/constants/workflow'

/**
 * Load a live in the perimeter
 * @param {string} liveId - Live
 * @param {AccessScope} scope - Viewer perimeter
 * @return {Promise<{ id: string, youtuberId: string, calendarEventId: string | null }>} - Live row
 */

const liveInScope = async (liveId: string, scope: AccessScope) => {
  const live = await prisma.live.findFirst({
    where: scopedWhere('live', scope, { id: liveId }),
    select: { id: true, youtuberId: true, calendarEventId: true },
  })
  if (!live) throw notFound()

  return live
}

/**
 * Past sanctions of a viewer on the creator's channel
 * @param {string} liveId - Live the view opens on
 * @param {string} viewerId - Platform user identifier of the viewer
 * @param {AccessScope} scope - Reader perimeter
 * @return {Promise<ViewerSanction[]>} - Latest first
 */

export const viewerSanctions = async (
  liveId: string,
  viewerId: string,
  scope: AccessScope
): Promise<ViewerSanction[]> => {
  const live = await liveInScope(liveId, scope)

  const rows = await prisma.moderationAction.findMany({
    where: {
      targetPlatformUserId: viewerId,
      status: { not: 'FAILED' },
      live: { youtuberId: live.youtuberId },
    },
    include: {
      actor: { select: { displayName: true } },
      live: { select: { title: true } },
    },
    orderBy: { occurredAt: 'desc' },
    take: LIVE_SETTINGS.viewerHistorySize,
  })

  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    durationSeconds: row.durationSeconds,
    reason: row.reason,
    actorName: row.actor?.displayName ?? row.actorLogin ?? '',
    liveTitle: row.live.title,
    fromPanel: row.offenseId !== null,
    occurredAt: row.occurredAt.toISOString(),
  }))
}

/**
 * Activity of one moderator on a live: gestures, time, roll-call, leave
 * @param {string} liveId - Live
 * @param {string} accountId - Moderator
 * @param {AccessScope} scope - Reader perimeter
 * @return {Promise<ModeratorInspect>} - Activity
 */

export const inspectModerator = async (
  liveId: string,
  accountId: string,
  scope: AccessScope
): Promise<ModeratorInspect> => {
  const live = await liveInScope(liveId, scope)
  const now = new Date()

  const [account, attendance, absences, presences, gestures] = await Promise.all([
    prisma.account.findUnique({
      where: { id: accountId },
      select: { id: true, displayName: true, avatarUrl: true },
    }),
    live.calendarEventId
      ? prisma.eventAttendance.findUnique({
          where: { eventId_accountId: { eventId: live.calendarEventId, accountId } },
          select: { status: true },
        })
      : Promise.resolve(null),
    prisma.absence.count({
      where: {
        accountId,
        status: AbsenceStatuses.Approved,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    }),
    prisma.modViewPresence.aggregate({
      where: { liveId, accountId },
      _sum: { activeSeconds: true },
    }),
    prisma.moderationAction.findMany({
      where: { liveId, actorAccountId: accountId },
      include: { onBehalfOf: { select: { displayName: true } } },
      orderBy: { occurredAt: 'desc' },
      take: LIVE_SETTINGS.inspectSize,
    }),
  ])
  if (!account) throw notFound()

  return {
    accountId: account.id,
    name: account.displayName,
    avatar: account.avatarUrl,
    attendance: (attendance?.status as AttendanceStatusName | undefined) ?? null,
    isAbsent: absences > 0,
    activeSeconds: presences._sum.activeSeconds ?? 0,
    gestures: gestures.map((row) => ({
      id: row.id,
      kind: row.kind,
      targetLogin: row.targetLogin,
      durationSeconds: row.durationSeconds,
      reason: row.reason,
      fromPanel: row.offenseId !== null,
      onBehalfOf: row.onBehalfOf?.displayName ?? null,
      occurredAt: row.occurredAt.toISOString(),
    })),
  }
}

/**
 * Rungs already applied on a live
 * @param {string} liveId - Live
 * @return {Promise<PanelMemory>} - Memory
 */

export const readPanelMemory = async (liveId: string): Promise<PanelMemory> => {
  try {
    const rows = await prisma.moderationAction.findMany({
      where: { liveId, offenseId: { not: null }, rung: { not: null }, status: { not: 'FAILED' } },
      select: { targetPlatformUserId: true, offenseId: true, rung: true },
    })

    return rows.reduce<PanelMemory>(
      (memory, row) =>
        row.targetPlatformUserId && row.offenseId && row.rung !== null
          ? rememberRung(memory, row.targetPlatformUserId, row.offenseId, row.rung)
          : memory,
      {}
    )
  } catch (error) {
    // The log table may not be migrated yet
    logger.warn('[lives] panel memory unavailable', error instanceof Error ? error.message : '')
    return {}
  }
}
