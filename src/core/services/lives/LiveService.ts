import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict, invalidInput, notFound } from '@/core/lib/errors'
import { readDate, readList, readNumberValue, readText } from '@/core/lib/forms/values'
import { releasedFrom } from '@/core/services/academy/LegacyRelease'
import { assertInScope, scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { syncRoster } from '@/core/services/calendar/attendance'
import { notify } from '@/core/services/system/NotificationService'
import { memberOptions, peopleInScope, youtuberOptions } from '@/core/services/work/shared'
import { publishLive } from '@/core/lib/lives/bus'
import { livePermissions } from '@/core/lib/lives/permissions'
import { LIVE_TOPICS } from '@/declarations/lives/topics'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_FIELD_COPY } from '@/declarations/lives/copy'
import { LIVE_FUNCTIONS, LIVE_PLATFORM_REGISTRY } from '@/declarations/lives/registries'
import { isIconName } from '@/declarations/ui/icons'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { LiveBeacon, LivePerson, LiveView } from '@/types/lives'
import { MemberStatuses } from '@/utils/constants/hierarchy'
import { LivePlatforms, LiveStatuses, OPEN_LIVE_STATUSES } from '@/utils/constants/lives'
import type { LivePlatformName, LiveStatusName } from '@/utils/constants/lives'
import type { PermissionName } from '@/utils/constants/permissions'
import { AbsenceStatuses } from '@/utils/constants/workflow'
import type { Prisma } from '@prisma/client'

const MINUTE = 60_000

// Person shape every seat reads
const PERSON = { select: { id: true, displayName: true, avatarUrl: true } } as const

// Relations every live view needs
const LIVE_SHAPE = {
  youtuber: { select: { id: true, name: true, avatarUrl: true } },
  announcedBy: PERSON,
  coordinator: PERSON,
  members: { include: { account: PERSON }, orderBy: { convokedAt: 'asc' } },
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

const toView = (row: LiveRow, viewerId: string, held: PermissionName[]): LiveView => {
  const entry = row.liveconEntries[0]

  return {
    id: row.id,
    title: row.title,
    platform: row.platform,
    status: row.status,
    youtuber: { id: row.youtuber.id, name: row.youtuber.name, avatar: row.youtuber.avatarUrl },
    plannedStartAt: row.plannedStartAt.toISOString(),
    plannedEndAt: row.plannedEndAt?.toISOString() ?? null,
    startedAt: row.startedAt?.toISOString() ?? null,
    endedAt: row.endedAt?.toISOString() ?? null,
    announcedBy: toPerson(row.announcedBy),
    coordinator: toPerson(row.coordinator),
    members: row.members
      .map((seat) => toPerson(seat.account))
      .filter((person): person is LivePerson => person !== null),
    liveconLevel: entry
      ? {
          level: entry.level.level,
          name: entry.level.name,
          icon: entry.level.icon && isIconName(entry.level.icon) ? entry.level.icon : null,
          accent: entry.level.accent,
        }
      : null,
    permissions: livePermissions(row, viewerId, held),
  }
}

/**
 * Members on approved leave over a window
 * @param {string[]} accountIds - Candidates
 * @param {Date} startsAt - Window start
 * @param {Date} endsAt - Window end
 * @return {Promise<Set<string>>} - Absent accounts
 */

const absentOver = async (accountIds: string[], startsAt: Date, endsAt: Date) => {
  if (accountIds.length === 0) return new Set<string>()

  const rows = await prisma.absence.findMany({
    where: {
      accountId: { in: accountIds },
      status: AbsenceStatuses.Approved,
      startDate: { lte: endsAt },
      endDate: { gte: startsAt },
    },
    select: { accountId: true },
  })

  return new Set(rows.map((row) => row.accountId))
}

/**
 * Members a live convenes, absent and released ones left out
 * @param {Object} input - Roster context
 * @param {string} input.youtuberId - Creator
 * @param {string[]} input.picked - Members named by hand
 * @param {Date} input.startsAt - Planned start
 * @param {Date} input.endsAt - Planned end
 * @param {AccessScope} input.scope - Creator perimeter
 * @return {Promise<string[]>} - Convened accounts
 */

const convene = async ({
  youtuberId,
  picked,
  startsAt,
  endsAt,
  scope,
}: {
  youtuberId: string
  picked: string[]
  startsAt: Date
  endsAt: Date
  scope: AccessScope
}): Promise<string[]> => {
  // Default roster: the creator's live team
  const where: Prisma.AccountWhereInput =
    picked.length > 0
      ? { id: { in: picked } }
      : {
          youtubers: { some: { id: youtuberId } },
          functions: { some: { jobFunction: { name: { in: [...LIVE_FUNCTIONS] } } } },
        }

  const accounts = await prisma.account.findMany({
    where: { AND: [where, { status: { not: MemberStatuses.Left } }, peopleInScope(scope)] },
    select: { id: true },
  })
  const ids = accounts.map((account) => account.id)

  // Absent or released members are never called
  const [absent, released] = await Promise.all([
    absentOver(ids, startsAt, endsAt),
    releasedFrom(ids, startsAt),
  ])

  return ids.filter((id) => !absent.has(id) && !released.has(id))
}

/**
 * Build the announce form
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const liveFields = async (scope: AccessScope): Promise<FieldDefinition[]> => {
  const [youtubers, members] = await Promise.all([youtuberOptions(scope), memberOptions(scope)])

  return [
    {
      name: 'youtuberId',
      kind: 'select',
      label: LIVE_FIELD_COPY.youtuber,
      required: true,
      options: youtubers,
      mark: 'avatar',
      span: 'half',
    },
    {
      name: 'platform',
      kind: 'select',
      label: LIVE_FIELD_COPY.platform,
      required: true,
      options: LIVE_PLATFORM_REGISTRY.keys.map((key) => ({
        value: key,
        label: LIVE_PLATFORM_REGISTRY.label(key),
        icon: LIVE_PLATFORM_REGISTRY.get(key).icon,
      })),
      span: 'half',
    },
    {
      name: 'title',
      kind: 'text',
      label: LIVE_FIELD_COPY.title,
      placeholder: LIVE_FIELD_COPY.titlePlaceholder,
      required: true,
    },
    {
      name: 'plannedStartAt',
      kind: 'datetime',
      label: LIVE_FIELD_COPY.startsAt,
      required: true,
      span: 'half',
    },
    {
      name: 'durationMinutes',
      kind: 'number',
      label: LIVE_FIELD_COPY.durationMinutes,
      placeholder: String(LIVE_SETTINGS.defaultDurationMinutes),
      span: 'half',
    },
    {
      name: 'coordinatorId',
      kind: 'select',
      label: LIVE_FIELD_COPY.coordinator,
      hint: LIVE_FIELD_COPY.coordinatorHint,
      required: true,
      options: members,
      mark: 'avatar',
    },
    {
      name: 'memberIds',
      kind: 'multiselect',
      label: LIVE_FIELD_COPY.members,
      hint: LIVE_FIELD_COPY.membersHint,
      options: members,
      mark: 'avatar',
    },
  ]
}

/**
 * Read the platform picked on the form
 * @param {FormValues} values - Parsed body
 * @return {LivePlatformName} - Platform
 */

const readPlatform = (values: FormValues): LivePlatformName => {
  const raw = readText(values, 'platform')
  if (raw === LivePlatforms.Twitch || raw === LivePlatforms.YouTube) return raw

  throw invalidInput([{ field: 'platform', message: FORM_COPY.required }])
}

/**
 * Announce a live, convene its team and call its coordinator
 * @param {FormValues} values - Parsed body
 * @param {string} actorId - Announcing responsable
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<string>} - New live identifier
 */

export const announceLive = async (
  values: FormValues,
  actorId: string,
  scope: AccessScope
): Promise<string> => {
  const youtuberId = readText(values, 'youtuberId')
  const title = readText(values, 'title')
  const startsAt = readDate(values, 'plannedStartAt')
  const coordinatorId = readText(values, 'coordinatorId')

  // Required fields, read once more on the server
  const missing = [
    ['youtuberId', youtuberId],
    ['title', title],
    ['plannedStartAt', startsAt],
    ['coordinatorId', coordinatorId],
  ].filter(([, value]) => !value)
  if (missing.length > 0 || !youtuberId || !title || !startsAt || !coordinatorId) {
    throw invalidInput(
      missing.map(([field]) => ({ field: String(field), message: FORM_COPY.required }))
    )
  }

  assertInScope(scope, youtuberId)
  const platform = readPlatform(values)
  const minutes = readNumberValue(values, 'durationMinutes') ?? LIVE_SETTINGS.defaultDurationMinutes
  const endsAt = new Date(startsAt.getTime() + minutes * MINUTE)

  // Convened team, the coordinator always on it
  const convened = await convene({
    youtuberId,
    picked: readList(values, 'memberIds'),
    startsAt,
    endsAt,
    scope,
  })
  const memberIds = [...new Set([coordinatorId, ...convened])]

  // Calendar entry carries the roll-call
  const event = await prisma.calendarEvent.create({
    data: {
      title,
      ownerId: actorId,
      youtuberId,
      startsAt,
      endsAt,
      rollCall: true,
    },
  })
  await syncRoster(event.id, memberIds)

  const live = await prisma.live.create({
    data: {
      youtuberId,
      platform,
      title,
      plannedStartAt: startsAt,
      plannedEndAt: endsAt,
      announcedById: actorId,
      coordinatorId,
      calendarEventId: event.id,
      members: { create: memberIds.map((accountId) => ({ accountId })) },
    },
  })

  await publishLive(LIVE_TOPICS.lives, {
    liveId: live.id,
    youtuberId,
    status: LiveStatuses.Announced,
  })

  await notify({
    kind: 'LiveAnnounced',
    recipients: memberIds,
    actorId,
    target: 'live',
    targetId: live.id,
    subject: title,
  })

  return live.id
}

/**
 * Read the lives still announced or running
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} viewerId - Signed-in member
 * @param {PermissionName[]} held - Permissions held
 * @return {Promise<LiveView[]>} - Open lives, soonest first
 */

export const listOpenLives = async (
  scope: AccessScope,
  viewerId: string,
  held: PermissionName[]
): Promise<LiveView[]> => {
  const rows = await prisma.live.findMany({
    where: scopedWhere('live', scope, { status: { in: [...OPEN_LIVE_STATUSES] } }),
    include: LIVE_SHAPE,
    orderBy: { plannedStartAt: 'asc' },
    take: LIVE_SETTINGS.maxOpenLives,
  })

  return rows.map((row) => toView(row, viewerId, held))
}

/**
 * Read one live
 * @param {string} id - Live identifier
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} viewerId - Signed-in member
 * @param {PermissionName[]} held - Permissions held
 * @return {Promise<LiveView>} - Live view
 */

export const readLive = async (
  id: string,
  scope: AccessScope,
  viewerId: string,
  held: PermissionName[]
): Promise<LiveView> => {
  const row = await prisma.live.findFirst({
    where: scopedWhere('live', scope, { id }),
    include: LIVE_SHAPE,
  })
  if (!row) throw notFound()

  return toView(row, viewerId, held)
}

/**
 * Read what the rail and the home show
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} viewerId - Signed-in member
 * @param {boolean} seesAll - Reads every live of the perimeter
 * @return {Promise<LiveBeacon | null>} - Beacon, none without an open live
 */

export const readBeacon = async (
  scope: AccessScope,
  viewerId: string,
  seesAll: boolean
): Promise<LiveBeacon | null> => {
  // A moderator only sees the lives they are called on
  const seat: Prisma.LiveWhereInput = seesAll ? {} : { members: { some: { accountId: viewerId } } }

  const rows = await prisma.live.findMany({
    where: scopedWhere('live', scope, { status: { in: [...OPEN_LIVE_STATUSES] }, ...seat }),
    select: {
      id: true,
      status: true,
      plannedStartAt: true,
      youtuber: { select: { name: true } },
    },
    orderBy: { plannedStartAt: 'asc' },
    take: LIVE_SETTINGS.maxOpenLives,
  })

  if (rows.length === 0) return null

  return {
    status: rows.some((row) => row.status === LiveStatuses.Live)
      ? LiveStatuses.Live
      : LiveStatuses.Announced,
    lives: rows.map((row) => ({
      id: row.id,
      creator: row.youtuber.name,
      status: row.status,
      plannedStartAt: row.plannedStartAt.toISOString(),
    })),
  }
}

/**
 * Move a live to its next status, telling the team
 * @param {Object} live - Live row
 * @param {LiveStatusName} next - Next status
 * @param {string | null} actorId - Who moves it, none for the platform
 * @param {string} [streamExternalId] - Platform stream, once detected
 * @return {Promise<void>} - Moved
 */

const applyLiveStatus = async (
  live: {
    id: string
    youtuberId: string
    title: string
    status: LiveStatusName
    members: { accountId: string }[]
  },
  next: LiveStatusName,
  actorId: string | null,
  streamExternalId?: string
): Promise<void> => {
  // Allowed moves only, a closed live staying closed
  const allowed: Record<LiveStatusName, LiveStatusName[]> = {
    [LiveStatuses.Announced]: [LiveStatuses.Live, LiveStatuses.Cancelled],
    [LiveStatuses.Live]: [LiveStatuses.Ended],
    [LiveStatuses.Ended]: [],
    [LiveStatuses.Cancelled]: [],
  }
  if (!allowed[live.status].includes(next)) throw conflict()

  const now = new Date()
  await prisma.live.update({
    where: { id: live.id },
    data: {
      status: next,
      startedAt: next === LiveStatuses.Live ? now : undefined,
      endedAt: next === LiveStatuses.Ended || next === LiveStatuses.Cancelled ? now : undefined,
      ...(streamExternalId ? { streamExternalId } : {}),
    },
  })

  await publishLive(LIVE_TOPICS.lives, {
    liveId: live.id,
    youtuberId: live.youtuberId,
    status: next,
  })

  // Team told of the start or the cancel
  const recipients = live.members.map((seat) => seat.accountId)
  if (next === LiveStatuses.Live) {
    await notify({
      kind: 'LiveStarted',
      recipients,
      actorId,
      target: 'live',
      targetId: live.id,
      subject: live.title,
    })
  }
  if (next === LiveStatuses.Cancelled) {
    await notify({
      kind: 'LiveCancelled',
      recipients,
      actorId,
      target: 'live',
      targetId: live.id,
      subject: live.title,
    })
  }
}

/**
 * Move a live within the actor's perimeter
 * @param {string} id - Live identifier
 * @param {LiveStatusName} next - Next status
 * @param {string} actorId - Who moves it
 * @param {AccessScope} scope - Actor's perimeter
 * @return {Promise<void>} - Moved
 */

export const moveLive = async (
  id: string,
  next: LiveStatusName,
  actorId: string,
  scope: AccessScope
): Promise<void> => {
  const live = await prisma.live.findFirst({
    where: scopedWhere('live', scope, { id }),
    include: { members: { select: { accountId: true } } },
  })
  if (!live) throw notFound()

  await applyLiveStatus(live, next, actorId)
}

/**
 * Move a live because the platform said so: online starts it, offline ends it
 * @param {string} id - Live identifier
 * @param {LiveStatusName} next - Next status
 * @param {string} [streamExternalId] - Platform stream
 * @return {Promise<boolean>} - Moved, false when already there
 */

export const moveLiveFromPlatform = async (
  id: string,
  next: LiveStatusName,
  streamExternalId?: string
): Promise<boolean> => {
  const live = await prisma.live.findUnique({
    where: { id },
    include: { members: { select: { accountId: true } } },
  })
  if (!live || live.status === next) return false

  try {
    await applyLiveStatus(live, next, null, streamExternalId)

    return true
  } catch {
    // A live closed by hand meanwhile stays closed
    return false
  }
}
