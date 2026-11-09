import 'server-only'
import { rankOfRole } from '@/core/lib/modview/tier'
import { activeCoordinatorIds, coordinationGaps } from '@/core/lib/lives/coordination'
import { isReopenable, liveAccess } from '@/core/lib/lives/access'
import { livePermissions } from '@/core/lib/lives/permissions'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { isIconName } from '@/declarations/ui/icons'
import type { LivePerson, LiveView } from '@/types/lives'
import { LEADERSHIP_ROLES } from '@/utils/constants/hierarchy'
import { CoordinationStatuses } from '@/utils/constants/lives'
import type { LiveStatusName } from '@/utils/constants/lives'
import type { PermissionName } from '@/utils/constants/permissions'
import { Permissions } from '@/utils/constants/permissions'
import type { AttendanceStatusName } from '@/utils/constants/workflow'
import type { Prisma } from '@prisma/client'
import { MINUTE_MS } from '@/utils/constants/time'

// Roles that run a live on the floor
const RESPONSABLE_ROLES: string[] = LEADERSHIP_ROLES

// Person shape every seat reads
const PERSON = { select: { id: true, displayName: true, avatarUrl: true } } as const

// Relations every live view needs
export const LIVE_SHAPE = {
  youtuber: {
    select: { id: true, name: true, avatarUrl: true, bannerUrl: true, fadeBannerUrl: true },
  },
  announcedBy: PERSON,
  coordinations: { include: { account: PERSON }, orderBy: { askedAt: 'asc' } },
  calendarEvent: {
    select: {
      attendances: {
        select: { accountId: true, status: true, availableFrom: true, availableTo: true },
      },
    },
  },
  members: {
    include: { account: { select: { ...PERSON.select, role: true } } },
    orderBy: { convokedAt: 'asc' },
  },
  liveconEntries: {
    where: { endedAt: null },
    include: { level: true },
    orderBy: { startedAt: 'desc' },
    take: 1,
  },
} satisfies Prisma.LiveInclude

type LiveRow = Prisma.LiveGetPayload<{ include: typeof LIVE_SHAPE }>

/**
 * Map an account to a seat
 * @param {Object | null} account - Account row
 * @return {LivePerson | null} - Seat
 */

const toPerson = (
  account: { id: string; displayName: string; avatarUrl: string | null } | null
): LivePerson | null =>
  account ? { id: account.id, name: account.displayName, avatar: account.avatarUrl } : null

/**
 * Map a live row to its view
 * @param {LiveRow} row - Live row
 * @param {string} viewerId - Signed-in member
 * @param {PermissionName[]} held - Permissions held
 * @return {LiveView} - Live view
 */

export const toView = (row: LiveRow, viewerId: string, held: PermissionName[]): LiveView => {
  const entry = row.liveconEntries[0]
  const coordinatorIds = activeCoordinatorIds(
    row.coordinations,
    new Date(),
    row.status as LiveStatusName
  )
  const mySeat = row.calendarEvent?.attendances.find((seat) => seat.accountId === viewerId)

  const prepMs = LIVE_SETTINGS.prepMinutes * MINUTE_MS

  return {
    id: row.id,
    access: liveAccess(
      { status: row.status, plannedStartAt: row.plannedStartAt },
      new Date(),
      LIVE_SETTINGS.prepMinutes
    ),
    opensAt: new Date(+row.plannedStartAt - prepMs).toISOString(),
    canReopen:
      isReopenable(row, new Date(), LIVE_SETTINGS.recentHours) &&
      (held.includes(Permissions.LiveAnnounce) ||
        row.coordinations.some(
          (seat) => seat.accountId === viewerId && seat.status === CoordinationStatuses.Accepted
        )),
    title: row.title,
    platform: row.platform,
    status: row.status,
    youtuber: {
      id: row.youtuber.id,
      name: row.youtuber.name,
      avatar: row.youtuber.avatarUrl,
      banner: row.youtuber.fadeBannerUrl ?? row.youtuber.bannerUrl,
    },
    plannedStartAt: row.plannedStartAt.toISOString(),
    plannedEndAt: row.plannedEndAt?.toISOString() ?? null,
    startedAt: row.startedAt?.toISOString() ?? null,
    endedAt: row.endedAt?.toISOString() ?? null,
    announcedBy: toPerson(row.announcedBy),
    coordinators: row.coordinations.map((seat) => ({
      person: toPerson(seat.account) as LivePerson,
      status: seat.status,
      startsAt: seat.startsAt?.toISOString() ?? null,
      endsAt: seat.endsAt?.toISOString() ?? null,
    })),
    gaps: coordinationGaps(row.plannedStartAt, row.plannedEndAt, row.coordinations).map((gap) => ({
      from: gap.from.toISOString(),
      to: gap.to.toISOString(),
    })),
    isCoordinating: coordinatorIds.includes(viewerId),
    instructions: row.instructions,
    myAttendance: (mySeat?.status as AttendanceStatusName | undefined) ?? null,
    myHours:
      mySeat?.availableFrom && mySeat.availableTo
        ? { from: mySeat.availableFrom.toISOString(), to: mySeat.availableTo.toISOString() }
        : null,
    responsables: row.members
      .filter((seat) => RESPONSABLE_ROLES.includes(seat.account.role))
      .map((seat) => toPerson(seat.account) as LivePerson),
    members: row.members.flatMap((seat) => {
      const person = toPerson(seat.account)

      return person
        ? [
            {
              ...person,
              isReinforcement: seat.reinforcement,
              rank: rankOfRole(seat.account.role),
            },
          ]
        : []
    }),
    liveconLevel: entry
      ? {
          level: entry.level.level,
          name: entry.level.name,
          icon: entry.level.icon && isIconName(entry.level.icon) ? entry.level.icon : null,
          accent: entry.level.accent,
        }
      : null,
    permissions: livePermissions({ coordinatorIds, status: row.status }, viewerId, held),
  }
}
