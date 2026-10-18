import 'server-only'

import { prisma } from '@/core/lib/db'
import { readAnchors } from '@/core/services/auth/LeadService'
import { closeLivePresences } from '@/core/services/lives/PresenceService'
import { conflict, forbidden, invalidInput, notFound } from '@/core/lib/errors'
import { readList, readText } from '@/core/lib/forms/values'
import { releasedFrom } from '@/core/services/academy/legacy/LegacyRelease'
import { syncJuniorLives } from '@/core/services/academy/parkour/LiveCountService'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { syncRoster } from '@/core/services/calendar/attendance'
import { notify } from '@/core/services/system/NotificationService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { roleGroupedOptions } from '@/core/lib/forms/options'
import { HELD_FUNCTIONS, toMemberFunctions } from '@/core/services/reference/functions'
import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { peopleInScope } from '@/core/services/work/shared'
import { publishLive } from '@/core/lib/lives/bus'
import { activeCoordinatorIds, coordinationGaps } from '@/core/lib/lives/coordination'
import type { CoordinationSeat } from '@/core/lib/lives/coordination'
import { livePermissions } from '@/core/lib/lives/permissions'
import { liveStartedKey } from '@/declarations/academy/welcome'
import { LIVE_TOPICS } from '@/declarations/lives/topics'
import { FORM_SETTINGS, LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_FIELD_COPY, LIVE_INSTRUCTIONS_DEFAULT } from '@/declarations/lives/copy'
import {
  LIVE_EVENT_TEMPLATE,
  LIVE_FUNCTIONS,
  LIVE_PLATFORM_REGISTRY,
} from '@/declarations/lives/registries'
import { isIconName } from '@/declarations/ui/icons'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import type { FieldDefinition, FieldOption, FormValues } from '@/types/forms'
import type { LiveBeacon, LivePerson, LiveView } from '@/types/lives'
import { GONE_MEMBER_STATUSES, MemberRoles } from '@/utils/constants/hierarchy'
import {
  CoordinationStatuses,
  LivePlatforms,
  LiveStatuses,
  OPEN_LIVE_STATUSES,
} from '@/utils/constants/lives'
import type { LivePlatformName, LiveStatusName } from '@/utils/constants/lives'
import type { PermissionName } from '@/utils/constants/permissions'
import { Permissions } from '@/utils/constants/permissions'
import { AbsenceStatuses } from '@/utils/constants/workflow'
import type { Prisma } from '@prisma/client'

const MINUTE = 60_000

// Person shape every seat reads
const PERSON = { select: { id: true, displayName: true, avatarUrl: true } } as const

// Relations every live view needs
const LIVE_SHAPE = {
  youtuber: { select: { id: true, name: true, avatarUrl: true, bannerUrl: true } },
  announcedBy: PERSON,
  coordinations: { include: { account: PERSON }, orderBy: { askedAt: 'asc' } },
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
  const coordinatorIds = activeCoordinatorIds(row.coordinations)

  return {
    id: row.id,
    title: row.title,
    platform: row.platform,
    status: row.status,
    youtuber: {
      id: row.youtuber.id,
      name: row.youtuber.name,
      avatar: row.youtuber.avatarUrl,
      banner: row.youtuber.bannerUrl,
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
    permissions: livePermissions({ coordinatorIds, status: row.status }, viewerId, held),
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
 * Members a live convenes
 * @param {Object} input - Roster context
 * @param {string} input.youtuberId - Creator
 * @param {string[]} input.picked - Members named on top of the live team
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
  // The creator's live team is always convened, the members named come on top
  const where: Prisma.AccountWhereInput = {
    OR: [
      {
        youtubers: { some: { id: youtuberId } },
        functions: { some: { jobFunction: { name: { in: [...LIVE_FUNCTIONS] } } } },
      },
      ...(picked.length > 0 ? [{ id: { in: picked } }] : []),
    ],
  }

  const accounts = await prisma.account.findMany({
    where: { AND: [where, { status: { notIn: GONE_MEMBER_STATUSES } }, peopleInScope(scope)] },
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
 * Who may coordinate a live: the live team of the creator, never a Junior, plus its Responsables and every Admin
 * @param {string} [youtuberId] - Creator the live is for, every creator when absent
 * @return {Prisma.AccountWhereInput} - Account filter
 */

const coordinatorWhere = (youtuberId?: string): Prisma.AccountWhereInput => ({
  status: { notIn: GONE_MEMBER_STATUSES },
  role: { not: MemberRoles.Junior },
  OR: [
    { role: MemberRoles.Admin },
    {
      ...(youtuberId && { youtubers: { some: { id: youtuberId } } }),
      OR: [
        { role: MemberRoles.Responsable },
        { functions: { some: { jobFunction: { name: { in: [...LIVE_FUNCTIONS] } } } } },
      ],
    },
  ],
})

/**
 * Members offered as Coordinators, each tied to the creators they cover
 * @param {AccessScope} [scope] - Creator perimeter
 * @return {Promise<FieldOption[]>} - Select options
 */

const coordinatorOptions = async (scope?: AccessScope): Promise<FieldOption[]> => {
  const rows = await prisma.account.findMany({
    where: { AND: [coordinatorWhere(), peopleInScope(scope)] },
    orderBy: { displayName: 'asc' },
    include: { ...HELD_FUNCTIONS, youtubers: { select: { id: true } } },
  })

  return roleGroupedOptions(rows, (row) => ({
    // An Admin is proposed whichever creator is picked
    owners:
      row.role === MemberRoles.Admin ? undefined : row.youtubers.map((youtuber) => youtuber.id),
    hint: toMemberFunctions(row.functions)[0]?.label ?? ROLE_REGISTRY.label(row.role),
  }))
}

/**
 * Calendar template every live is filed under
 * @return {Promise<string | null>} - Template identifier
 */

export const readLiveTemplateId = async (): Promise<string | null> => {
  const template = await prisma.eventTemplate.findUnique({
    where: { name: LIVE_EVENT_TEMPLATE },
    select: { id: true },
  })

  return template?.id ?? null
}

/**
 * Live fields the calendar form shows once the Live template is picked
 * @param {AccessScope} [scope] - Creator perimeter
 * @param {string | null} templateId - Live template
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const liveFormFields = async (
  scope: AccessScope | undefined,
  templateId: string | null
): Promise<FieldDefinition[]> => {
  const coordinators = await coordinatorOptions(scope)
  const visibleWhen = { field: 'templateId', oneOf: templateId ? [templateId] : [] }

  return [
    {
      name: 'platform',
      kind: 'select',
      label: LIVE_FIELD_COPY.platform,
      options: LIVE_PLATFORM_REGISTRY.keys.map((key) => ({
        value: key,
        label: LIVE_PLATFORM_REGISTRY.label(key),
        icon: LIVE_PLATFORM_REGISTRY.get(key).icon,
      })),
      mark: 'glyph',
      visibleWhen,
    },
    {
      name: 'coordinatorIds',
      kind: 'multiselect',
      label: LIVE_FIELD_COPY.coordinator,
      hint: LIVE_FIELD_COPY.coordinatorHint,
      options: coordinators,
      ownerField: 'youtuberId',
      mark: 'avatar',
      visibleWhen,
    },
    {
      name: 'instructions',
      kind: 'markdown',
      label: LIVE_FIELD_COPY.instructions,
      hint: LIVE_FIELD_COPY.instructionsHint,
      maxLength: FORM_SETTINGS.markdownMaxLength,
      visibleWhen,
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
 * Coordinators the creator's live team may name
 * @param {string} youtuberId - Creator
 * @param {string[]} picked - Members named
 * @return {Promise<void>} - Throws on a member that cannot coordinate
 */

const assertCoordinators = async (youtuberId: string, picked: string[]): Promise<void> => {
  if (picked.length === 0) return

  const allowed = await prisma.account.count({
    where: { AND: [{ id: { in: picked } }, coordinatorWhere(youtuberId)] },
  })
  if (allowed !== picked.length) {
    throw invalidInput([{ field: 'coordinatorIds', message: LIVE_FIELD_COPY.coordinatorRefused }])
  }
}

/**
 * Only whoever announces lives may post, edit or drop one on the calendar
 * @param {Object} input - What is touched
 * @param {boolean} input.canAnnounce - Viewer holds the announce permission
 * @param {string | null} [input.templateId] - Template an entry is posted under
 * @param {string[]} [input.entryIds] - Entries edited or dropped
 * @return {Promise<void>} - Throws when a live is touched without the permission
 */

export const assertLiveAccess = async ({
  canAnnounce,
  templateId,
  entryIds = [],
}: {
  canAnnounce: boolean
  templateId?: string | null
  entryIds?: string[]
}): Promise<void> => {
  if (canAnnounce) return

  const [liveTemplateId, lives] = await Promise.all([
    templateId ? readLiveTemplateId() : null,
    entryIds.length > 0 ? prisma.live.count({ where: { calendarEventId: { in: entryIds } } }) : 0,
  ])
  if ((templateId && templateId === liveTemplateId) || lives > 0) throw forbidden()
}

/**
 * What the Live template adds to a calendar entry
 * @typedef {Object} LiveInput
 * @property {string} youtuberId - Creator
 * @property {LivePlatformName} platform - Platform
 * @property {string[]} coordinatorIds - Members asked to coordinate
 * @property {string[]} pickedIds - Members convened on top of the live team
 * @property {string | null} instructions - Notes for the team
 */

export interface LiveInput {
  youtuberId: string
  platform: LivePlatformName
  coordinatorIds: string[]
  pickedIds: string[]
  instructions: string | null
}

/**
 * Read and check what the Live template needs, before anything is written
 * @param {FormValues} values - Parsed body
 * @return {Promise<LiveInput>} - Live fields
 */

export const readLiveInput = async (values: FormValues): Promise<LiveInput> => {
  const youtuberId = readText(values, 'youtuberId')
  if (!youtuberId) {
    throw invalidInput([{ field: 'youtuberId', message: FORM_COPY.required }])
  }

  const platform = readPlatform(values)
  const coordinatorIds = readList(values, 'coordinatorIds')
  await assertCoordinators(youtuberId, coordinatorIds)

  return {
    youtuberId,
    platform,
    coordinatorIds,
    pickedIds: readList(values, 'memberIds'),
    instructions: readText(values, 'instructions'),
  }
}

/**
 * Open the live behind a calendar entry: convene the team and ask the Coordinators
 * @param {Object} input - Entry and live fields
 * @param {{ id: string, title: string, startsAt: Date, endsAt: Date | null }} input.entry - Calendar entry
 * @param {LiveInput} input.live - Live fields
 * @param {string} input.actorId - Who posts it
 * @param {AccessScope} input.scope - Creator perimeter
 * @return {Promise<string>} - New live identifier
 */

export const openLive = async ({
  entry,
  live: input,
  actorId,
  scope,
}: {
  entry: { id: string; title: string; startsAt: Date; endsAt: Date | null }
  live: LiveInput
  actorId: string
  scope: AccessScope
}): Promise<string> => {
  // Planned end is informative, closing the live stays manual
  const endsAt =
    entry.endsAt ??
    new Date(entry.startsAt.getTime() + LIVE_SETTINGS.defaultDurationMinutes * MINUTE)

  const convened = await convene({
    youtuberId: input.youtuberId,
    picked: input.pickedIds,
    startsAt: entry.startsAt,
    endsAt,
    scope,
  })
  const memberIds = [...new Set([...input.coordinatorIds, ...convened])]
  await syncRoster(entry.id, memberIds)

  const live = await prisma.live.create({
    data: {
      youtuberId: input.youtuberId,
      platform: input.platform,
      title: entry.title,
      plannedStartAt: entry.startsAt,
      plannedEndAt: endsAt,
      announcedById: actorId,
      calendarEventId: entry.id,
      instructions: input.instructions ?? LIVE_INSTRUCTIONS_DEFAULT,
      members: { create: memberIds.map((accountId) => ({ accountId })) },
      coordinations: { create: input.coordinatorIds.map((accountId) => ({ accountId })) },
    },
  })

  await publishLive(LIVE_TOPICS.lives, {
    liveId: live.id,
    youtuberId: input.youtuberId,
    status: LiveStatuses.Announced,
  })

  // Coordinators are asked, never assigned
  await notify({
    kind: 'LiveCoordinatorAsked',
    recipients: input.coordinatorIds,
    actorId,
    target: 'home',
    subject: entry.title,
  })

  await notify({
    kind: 'LiveAnnounced',
    recipients: memberIds.filter((id) => !input.coordinatorIds.includes(id)),
    actorId,
    target: 'live',
    targetId: live.id,
    subject: entry.title,
  })

  await recordEvent({
    eventType: 'LiveAnnounced',
    actorId,
    targetType: 'live',
    targetId: live.id,
    summary: entry.title,
  })

  return live.id
}

/**
 * Keep an announced live in step with its calendar entry
 * @param {string} entryId - Calendar entry
 * @param {FormValues} [values] - Form values when the entry was edited by hand
 * @param {string} [actorId] - Who edited it
 * @return {Promise<void>} - Live updated
 */

export const syncLiveWithEntry = async (
  entryId: string,
  values?: FormValues,
  actorId?: string
): Promise<void> => {
  const live = await prisma.live.findUnique({
    where: { calendarEventId: entryId },
    include: { coordinations: { select: { accountId: true } } },
  })
  // A live under way or closed keeps its own record
  if (!live || live.status !== LiveStatuses.Announced) return

  const entry = await prisma.calendarEvent.findUnique({ where: { id: entryId } })
  if (!entry) return

  const picked = values ? readText(values, 'platform') : null
  const known = new Set(live.coordinations.map((seat) => seat.accountId))
  const added = values ? readList(values, 'coordinatorIds').filter((id) => !known.has(id)) : []
  await assertCoordinators(live.youtuberId, added)

  await prisma.live.update({
    where: { id: live.id },
    data: {
      title: entry.title,
      plannedStartAt: entry.startsAt,
      plannedEndAt: entry.endsAt,
      ...(entry.youtuberId && { youtuberId: entry.youtuberId }),
      ...((picked === LivePlatforms.Twitch || picked === LivePlatforms.YouTube) && {
        platform: picked,
      }),
      ...(values &&
        readText(values, 'instructions') && {
          instructions: readText(values, 'instructions') ?? live.instructions,
        }),
      coordinations: { create: added.map((accountId) => ({ accountId })) },
    },
  })

  if (added.length > 0) {
    await notify({
      kind: 'LiveCoordinatorAsked',
      recipients: added,
      actorId,
      target: 'home',
      subject: entry.title,
    })
  }

  await publishLive(LIVE_TOPICS.lives, {
    liveId: live.id,
    youtuberId: live.youtuberId,
    status: LiveStatuses.Announced,
  })
}

/**
 * Call off the announced lives behind calendar entries about to be dropped
 * @param {string[]} entryIds - Calendar entries
 * @return {Promise<void>} - Lives cancelled
 */

export const cancelLivesOfEntries = async (entryIds: string[]): Promise<void> => {
  await prisma.live.updateMany({
    where: { calendarEventId: { in: entryIds }, status: LiveStatuses.Announced },
    data: { status: LiveStatuses.Cancelled },
  })
}

/**
 * Read the lives still announced or running
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} viewerId - Signed-in member
 * @param {PermissionName[]} held - Permissions held
 * @return {Promise<LiveView[]>} - Open lives
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
 * Read the lives already over
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} viewerId - Signed-in member
 * @param {PermissionName[]} held - Permissions held
 * @param {number} limit - Lives read
 * @return {Promise<LiveView[]>} - Past lives
 */

export const listPastLives = async (
  scope: AccessScope,
  viewerId: string,
  held: PermissionName[],
  limit: number
): Promise<LiveView[]> => {
  const rows = await prisma.live.findMany({
    where: scopedWhere('live', scope, { status: LiveStatuses.Ended }),
    include: LIVE_SHAPE,
    orderBy: { endedAt: 'desc' },
    take: limit,
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
 * @return {Promise<LiveBeacon | null>} - Beacon
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
      platform: true,
      plannedStartAt: true,
      youtuber: { select: { name: true, avatarUrl: true } },
    },
    orderBy: { plannedStartAt: 'asc' },
    take: LIVE_SETTINGS.maxOpenLives,
  })

  if (rows.length === 0) return null

  // The bubble tells each live once
  const account = await prisma.account.findUnique({
    where: { id: viewerId },
    select: { seenGuides: true },
  })
  const unseen = rows.find(
    (row) =>
      row.status === LiveStatuses.Live && !account?.seenGuides.includes(liveStartedKey(row.id))
  )

  return {
    unseenStart: unseen ? { id: unseen.id, creator: unseen.youtuber.name } : null,
    status: rows.some((row) => row.status === LiveStatuses.Live)
      ? LiveStatuses.Live
      : LiveStatuses.Announced,
    lives: rows.map((row) => ({
      id: row.id,
      creator: row.youtuber.name,
      creatorAvatar: row.youtuber.avatarUrl,
      platform: row.platform,
      status: row.status,
      plannedStartAt: row.plannedStartAt.toISOString(),
    })),
  }
}

/**
 * Move a live to its next status
 * @param {Object} live - Live row
 * @param {LiveStatusName} next - Next status
 * @param {string | null} actorId - Who moves it
 * @param {string} [streamExternalId] - Platform stream
 * @return {Promise<void>} - Moved
 */

const applyLiveStatus = async (
  live: {
    id: string
    youtuberId: string
    title: string
    status: LiveStatusName
    coordinations: CoordinationSeat[]
    members: { accountId: string }[]
  },
  next: LiveStatusName,
  actorId: string | null,
  streamExternalId?: string
): Promise<void> => {
  // Allowed moves only
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

  // The end closes every Mod View presence
  if (next === LiveStatuses.Ended) {
    await closeLivePresences(live.id).catch(() => null)

    // The creator's responsables and the coordinator get the report
    const anchors = await readAnchors(live.youtuberId)
    await notify({
      kind: 'LiveReportReady',
      recipients: [
        ...anchors.map((anchor) => anchor.accountId),
        ...live.coordinations
          .filter((seat) => seat.status === CoordinationStatuses.Accepted)
          .map((seat) => seat.accountId),
      ],
      actorId,
      target: 'liveReport',
      targetId: live.id,
      subject: live.title,
    })
  }

  // A closed live moves the PIM count of the juniors present
  const recipients = live.members.map((seat) => seat.accountId)
  if (next === LiveStatuses.Ended || next === LiveStatuses.Cancelled) {
    await syncJuniorLives(recipients)
  }

  // Team told of the start or the cancel
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
    include: { members: { select: { accountId: true } }, coordinations: true },
  })
  if (!live) throw notFound()

  await applyLiveStatus(live, next, actorId)
}

/**
 * Move a live because the platform said so: online starts it
 * @param {string} id - Live identifier
 * @param {LiveStatusName} next - Next status
 * @param {string} [streamExternalId] - Platform stream
 * @return {Promise<boolean>} - Moved
 */

export const moveLiveFromPlatform = async (
  id: string,
  next: LiveStatusName,
  streamExternalId?: string
): Promise<boolean> => {
  const live = await prisma.live.findUnique({
    where: { id },
    include: { members: { select: { accountId: true } }, coordinations: true },
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

/**
 * Rewrite the instructions of a live
 * @param {Object} input - Edit
 * @param {string} input.id - Live identifier
 * @param {string} input.instructions - Markdown
 * @param {AccessScope} input.scope - Editor perimeter
 * @param {string} input.viewerId - Editor
 * @param {PermissionName[]} input.held - Permissions held
 * @return {Promise<LiveView>} - Live after the edit
 */

export const saveInstructions = async ({
  id,
  instructions,
  scope,
  viewerId,
  held,
}: {
  id: string
  instructions: string
  scope: AccessScope
  viewerId: string
  held: PermissionName[]
}): Promise<LiveView> => {
  const live = await readLive(id, scope, viewerId, held)
  if (!held.includes(Permissions.LiveAnnounce) && !live.isCoordinating) throw forbidden()

  await prisma.live.update({
    where: { id },
    data: { instructions: instructions.slice(0, FORM_SETTINGS.markdownMaxLength) },
  })

  return readLive(id, scope, viewerId, held)
}
