import 'server-only'

import { prisma } from '@/core/lib/db'
import { forbidden, notFound } from '@/core/lib/errors'
import { readFullPerimeter, scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { audienceClauses } from '@/core/services/calendar/audience'
import { EVENT_VISIBILITY_REGISTRY } from '@/declarations/reference/registries'
import type { PermissionHelpers, SessionUser } from '@/types/auth'
import { EventVisibilities } from '@/utils/constants/workflow'
import type { EventVisibilityName } from '@/utils/constants/workflow'
import type { Prisma } from '@prisma/client'

/**
 * Who reads the calendar
 * @typedef {Object} EntryViewer
 * @property {string} viewerId - Member identifier
 * @property {PermissionHelpers} access - Permission helpers
 * @property {AccessScope} scope - Creator perimeter
 */

export interface EntryViewer {
  viewerId: string
  access: PermissionHelpers
  scope: AccessScope
}

/**
 * Perimeter the calendar reads through
 * @param {SessionUser} viewer - Signed-in member
 * @param {PermissionHelpers} access - Permission helpers
 * @return {Promise<AccessScope>} - Full perimeter
 */

export const readCalendarScope = async (
  viewer: SessionUser,
  access: PermissionHelpers
): Promise<AccessScope> =>
  access.isAdmin
    ? { isGlobal: true, youtuberIds: [], activeYoutuberId: null }
    : {
        isGlobal: false,
        youtuberIds: await readFullPerimeter(viewer, access),
        activeYoutuberId: null,
      }

/**
 * Calendar reader of a session
 * @param {SessionUser} session - Signed-in member
 * @param {PermissionHelpers} access - Permission helpers
 * @return {Promise<EntryViewer>} - Calendar reader
 */

export const calendarViewer = async (
  session: SessionUser,
  access: PermissionHelpers
): Promise<EntryViewer> => ({
  viewerId: session.id,
  access,
  scope: await readCalendarScope(session, access),
})

// Levels a member reads
const allowedVisibilities = (access: PermissionHelpers): EventVisibilityName[] => {
  if (access.isAdmin) return EVENT_VISIBILITY_REGISTRY.keys

  return access.isResponsable
    ? [EventVisibilities.Everyone, EventVisibilities.Responsables]
    : [EventVisibilities.Everyone]
}

// Team entries of the creators a Responsable leads
const leadershipClauses = async (
  access: PermissionHelpers,
  scope: AccessScope
): Promise<Prisma.CalendarEventWhereInput[]> => {
  if (!access.isResponsable || scope.isGlobal) return []

  const teams = await prisma.team.findMany({
    where: { youtuberId: { in: scope.youtuberIds } },
    select: { id: true },
  })

  return [
    { visibility: EventVisibilities.Team, audienceTeamId: { in: teams.map((team) => team.id) } },
  ]
}

/**
 * Entries a member may see
 * @param {EntryViewer} viewer - Calendar reader
 * @return {Promise<Prisma.CalendarEventWhereInput>} - Visibility clause
 */

export const visibleWhere = async ({
  viewerId,
  access,
  scope,
}: EntryViewer): Promise<Prisma.CalendarEventWhereInput> => {
  if (access.isAdmin) return {}

  const levels = allowedVisibilities(access)
  const [teams, leadership] = await Promise.all([
    audienceClauses(viewerId),
    leadershipClauses(access, scope),
  ])

  return {
    OR: [
      // Own posts
      { ownerId: viewerId },
      // Own roll-calls
      { attendances: { some: { accountId: viewerId } } },
      { visibility: { in: levels } },
      ...teams,
      ...leadership,
      // Whole creator team
      { visibility: EventVisibilities.Youtuber, youtuberId: { in: scope.youtuberIds } },
      { visibility: null, template: { visibility: { in: levels } } },
      { visibility: null, templateId: null },
    ],
  }
}

/**
 * Guard entries before a write
 * @param {string[]} ids - Entry identifiers
 * @param {EntryViewer} viewer - Calendar reader
 * @param {boolean} canManage - Manages every entry
 * @return {Promise<void>} - Throws when out of reach
 */

export const assertEntriesReachable = async (
  ids: string[],
  viewer: EntryViewer,
  canManage: boolean
): Promise<void> => {
  const wanted = new Set(ids).size
  const visible = scopedWhere('calendarEvent', viewer.scope, {
    id: { in: ids },
    AND: [await visibleWhere(viewer)],
  })

  // Hidden reads as missing
  if ((await prisma.calendarEvent.count({ where: visible })) !== wanted) throw notFound()
  if (canManage) return

  // Others edit their own
  const owned = await prisma.calendarEvent.count({
    where: { id: { in: ids }, ownerId: viewer.viewerId },
  })
  if (owned !== wanted) throw forbidden()
}
