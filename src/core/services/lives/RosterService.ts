import 'server-only'

import { prisma } from '@/core/lib/db'
import { isOpenLive } from '@/core/lib/lives/permissions'
import { conflict, forbidden, notFound } from '@/core/lib/errors'
import { activeCoordinatorIds } from '@/core/lib/lives/coordination'
import { livePermissions } from '@/core/lib/lives/permissions'
import { respondToRollCall } from '@/core/services/calendar/attendance'
import { connectedMemberIds } from '@/core/services/lives/PresenceService'
import { syncJuniorLives } from '@/core/services/academy/parkour/LiveCountService'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import type { LiveRoster } from '@/types/lives'
import { AcademyJuniorStatuses, MemberRoles } from '@/utils/constants/hierarchy'
import { LiveStatuses } from '@/utils/constants/lives'
import type { LiveStatusName } from '@/utils/constants/lives'
import type { PermissionName } from '@/utils/constants/permissions'
import { Permissions } from '@/utils/constants/permissions'
import type { AttendanceStatusName } from '@/utils/constants/workflow'

// Permissions that see who is connected
const SUPERVISORS: PermissionName[] = [
  Permissions.LiveRoster,
  Permissions.LiveInspect,
  Permissions.LiveFocus,
]

/**
 * Load a live inside the perimeter
 * @param {string} id - Live identifier
 * @param {AccessScope} scope - Viewer perimeter
 * @return {Promise<object>} - Live row
 */

const liveInScope = async (id: string, scope: AccessScope) => {
  const live = await prisma.live.findFirst({
    where: scopedWhere('live', scope, { id }),
    select: { id: true, status: true, coordinations: true, calendarEventId: true },
  })
  if (!live) throw notFound()

  return live
}

/**
 * Read the roll-call of one live
 * @param {string} id - Live identifier
 * @param {AccessScope} scope - Viewer perimeter
 * @param {string} viewerId - Signed-in member
 * @param {PermissionName[]} held - Permissions held
 * @return {Promise<LiveRoster>} - Roll-call
 */

export const readLiveRoster = async (
  id: string,
  scope: AccessScope,
  viewerId: string,
  held: PermissionName[]
): Promise<LiveRoster> => {
  const live = await liveInScope(id, scope)
  const permissions = livePermissions(
    {
      coordinatorIds: activeCoordinatorIds(
        live.coordinations,
        new Date(),
        live.status as LiveStatusName
      ),
      status: live.status as LiveStatusName,
    },
    viewerId,
    held
  )

  const rows = live.calendarEventId
    ? await prisma.eventAttendance.findMany({
        where: { eventId: live.calendarEventId },
        select: {
          status: true,
          availableFrom: true,
          account: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
              role: true,
              academyJuniors: {
                where: { status: AcademyJuniorStatuses.Active },
                select: { id: true },
              },
            },
          },
        },
        orderBy: { account: { displayName: 'asc' } },
      })
    : []

  const reinforced = new Set(
    (
      await prisma.liveMember.findMany({
        where: { liveId: live.id, reinforcement: true },
        select: { accountId: true },
      })
    ).map((member) => member.accountId)
  )

  return {
    liveId: live.id,
    // A cancelled live keeps its roll-call frozen
    canManage:
      permissions.includes(Permissions.LiveRoster) && live.status !== LiveStatuses.Cancelled,
    // Who is in the Mod View stays with whoever supervises
    connectedIds: SUPERVISORS.some((name) => permissions.includes(name))
      ? await connectedMemberIds(live.id)
      : [],
    people: rows.map((row) => ({
      id: row.account.id,
      name: row.account.displayName,
      avatar: row.account.avatarUrl,
      status: row.status as AttendanceStatusName,
      // A member changing trade counts for their PIM too
      isJunior: row.account.role === MemberRoles.Junior || row.account.academyJuniors.length > 0,
      isReinforcement: reinforced.has(row.account.id),
      // Planned hours stay with the Responsables
      plannedFrom: permissions.includes(Permissions.LiveInspect)
        ? (row.availableFrom?.toISOString() ?? null)
        : null,
    })),
  }
}

/**
 * Move one convened member on the roll-call
 * @param {Object} input - Move
 * @param {string} input.id - Live identifier
 * @param {string} input.accountId - Member moved
 * @param {AttendanceStatusName} input.status - Column dropped on
 * @param {AccessScope} input.scope - Viewer perimeter
 * @param {string} input.viewerId - Signed-in member
 * @param {PermissionName[]} input.held - Permissions held
 * @return {Promise<LiveRoster>} - Roll-call after the move
 */

export const moveOnRoster = async ({
  id,
  accountId,
  status,
  scope,
  viewerId,
  held,
}: {
  id: string
  accountId: string
  status: AttendanceStatusName
  scope: AccessScope
  viewerId: string
  held: PermissionName[]
}): Promise<LiveRoster> => {
  const roster = await readLiveRoster(id, scope, viewerId, held)
  if (!roster.canManage) throw forbidden()

  const live = await liveInScope(id, scope)
  if (!live.calendarEventId) throw conflict()

  // Only a convened member holds a seat to move
  const row = await prisma.eventAttendance.findUnique({
    where: { eventId_accountId: { eventId: live.calendarEventId, accountId } },
    select: { id: true, respondedAt: true },
  })
  if (!row) throw notFound()

  await prisma.eventAttendance.update({
    where: { id: row.id },
    data: { status, respondedAt: row.respondedAt ?? new Date() },
  })

  await syncJuniorLives([accountId])

  return readLiveRoster(id, scope, viewerId, held)
}

/**
 * Record the answer of the viewer to the roll-call of a live, present or only passing by
 * @param {string} id - Live identifier
 * @param {AccessScope} scope - Viewer perimeter
 * @param {string} viewerId - Signed-in member
 * @param {AttendanceStatusName} status - Present or absent
 * @param {{ from: Date, to: Date } | null} [hours] - Hours expected to be there
 * @return {Promise<void>} - Recorded
 */

export const answerOwnPresence = async (
  id: string,
  scope: AccessScope,
  viewerId: string,
  status: AttendanceStatusName,
  hours: { from: Date; to: Date } | null = null
): Promise<void> => {
  const live = await liveInScope(id, scope)
  // Seats only while the live is open
  if (!live.calendarEventId || !isOpenLive(live.status as LiveStatusName)) throw conflict()

  // A member the live did not convene takes a seat by answering
  await prisma.eventAttendance.upsert({
    where: { eventId_accountId: { eventId: live.calendarEventId, accountId: viewerId } },
    create: { eventId: live.calendarEventId, accountId: viewerId },
    update: {},
  })

  await respondToRollCall({
    eventId: live.calendarEventId,
    accountId: viewerId,
    status,
    canManage: false,
    hours,
  })
}
