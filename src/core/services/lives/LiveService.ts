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
import { HELD_FUNCTIONS, toMemberFunctions } from '@/core/services/reference/functions'
import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { peopleInScope } from '@/core/services/work/shared'
import { publishLive } from '@/core/lib/lives/bus'
import { activeCoordinatorIds, coordinationGaps } from '@/core/lib/lives/coordination'
import type { CoordinationSeat } from '@/core/lib/lives/coordination'
import { isReopenable, liveAccess } from '@/core/lib/lives/access'
import { livePermissions } from '@/core/lib/lives/permissions'
import { liveStartedKey } from '@/declarations/academy/welcome'
import { LIVE_TOPICS } from '@/declarations/lives/topics'
import { FORM_SETTINGS, LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_FIELD_COPY, LIVE_INSTRUCTIONS_DEFAULT } from '@/declarations/lives/copy'
import { LIVE_FUNCTIONS, LIVE_PLATFORMS_SOON } from '@/declarations/lives/registries'
import { COORDINATOR_FUNCTION } from '@/declarations/reference/fixed'
import { isIconName } from '@/declarations/ui/icons'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import type { FieldDefinition, FieldOption, FormValues } from '@/types/forms'
import type { LiveBeacon, LivePerson, LiveView } from '@/types/lives'
import { activeAbsenceFilter } from '@/core/services/absences/AbsenceService'
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
import type { AttendanceStatusName } from '@/utils/constants/workflow'
import type { Prisma } from '@prisma/client'

// Roles that run a live on the floor
const RESPONSABLE_ROLES: string[] = [MemberRoles.Responsable, MemberRoles.Admin]

// Person shape every seat reads
const PERSON = { select: { id: true, displayName: true, avatarUrl: true } } as const

// Relations every live view needs
const LIVE_SHAPE = {
  youtuber: { select: { id: true, name: true, avatarUrl: true, bannerUrl: true } },
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

const toView = (row: LiveRow, viewerId: string, held: PermissionName[]): LiveView => {
  const entry = row.liveconEntries[0]
  const coordinatorIds = activeCoordinatorIds(row.coordinations)
  const mySeat = row.calendarEvent?.attendances.find((seat) => seat.accountId === viewerId)

  const prepMs = LIVE_SETTINGS.prepMinutes * 60_000

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

      return person ? [{ ...person, isReinforcement: seat.reinforcement }] : []
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
 * Holders of the Coordinator function, never a Junior
 * @param {string} [youtuberId] - Creator the live is for, every creator when absent
 * @return {Prisma.AccountWhereInput} - Account filter
 */

const holderWhere = (youtuberId?: string): Prisma.AccountWhereInput => ({
  status: { notIn: GONE_MEMBER_STATUSES },
  role: { not: MemberRoles.Junior },
  functions: { some: { jobFunction: { name: COORDINATOR_FUNCTION } } },
  ...(youtuberId && { youtubers: { some: { id: youtuberId } } }),
})

/**
 * Who may coordinate a live: the Coordinators, the Responsables of the creator and every Admin
 * @param {string} [youtuberId] - Creator the live is for, every creator when absent
 * @return {Prisma.AccountWhereInput} - Account filter
 */

const coordinatorWhere = (youtuberId?: string): Prisma.AccountWhereInput => ({
  status: { notIn: GONE_MEMBER_STATUSES },
  OR: [
    holderWhere(youtuberId),
    { role: MemberRoles.Admin },
    {
      role: MemberRoles.Responsable,
      ...(youtuberId && { youtubers: { some: { id: youtuberId } } }),
    },
  ],
})

// Order the picker lists them in: Coordinators, Responsables, Admins, anyone already seated
const COORDINATOR_RANKS: Record<string, number> = {
  [MemberRoles.Responsable]: 1,
  [MemberRoles.Admin]: 2,
}

/**
 * Members offered as Coordinators, each tied to the creators they cover
 * @param {AccessScope} [scope] - Creator perimeter
 * @param {string[]} [seated] - Members already asked, kept in the list so editing never drops them
 * @return {Promise<FieldOption[]>} - Select options
 */

export const coordinatorOptions = async (
  scope?: AccessScope,
  seated: string[] = []
): Promise<FieldOption[]> => {
  const rows = await prisma.account.findMany({
    where: {
      AND: [
        { OR: [coordinatorWhere(), ...(seated.length > 0 ? [{ id: { in: seated } }] : [])] },
        peopleInScope(scope),
      ],
    },
    orderBy: { displayName: 'asc' },
    include: { ...HELD_FUNCTIONS, youtubers: { select: { id: true } } },
  })

  // An Admin stays an Admin, the function never moves one up
  const holds = (row: (typeof rows)[number]) =>
    row.role !== MemberRoles.Admin &&
    row.functions.some((held) => held.jobFunction.name === COORDINATOR_FUNCTION)
  const rankOf = (row: (typeof rows)[number]) =>
    holds(row) ? 0 : (COORDINATOR_RANKS[row.role] ?? 3)

  return [...rows]
    .sort(
      (left, right) =>
        rankOf(left) - rankOf(right) || left.displayName.localeCompare(right.displayName, 'fr')
    )
    .map((row) => ({
      value: row.id,
      label: row.displayName,
      image: row.avatarUrl,
      group: holds(row) ? LIVE_FIELD_COPY.coordinatorGroup : ROLE_REGISTRY.get(row.role).plural,
      // An Admin is proposed whichever creator is picked
      owners:
        row.role === MemberRoles.Admin ? undefined : row.youtubers.map((youtuber) => youtuber.id),
      hint: toMemberFunctions(row.functions)[0]?.label ?? ROLE_REGISTRY.label(row.role),
    }))
}

// Coordinators proposed for each live
const PROPOSED_COORDINATORS = 2

/**
 * Members proposed as Coordinators for each creator: the holders of the function who coordinated the least recently, nobody absent
 * @param {FieldOption[]} coordinators - Members offered, tied to the creators they cover
 * @return {Promise<Record<string, string[]>>} - Proposed member identifiers by creator
 */

const coordinatorPicks = async (coordinators: FieldOption[]): Promise<Record<string, string[]>> => {
  const youtuberIds = [...new Set(coordinators.flatMap((option) => option.owners ?? []))]
  const picks: Record<string, string[]> = {}

  for (const youtuberId of youtuberIds) {
    const members = await prisma.account.findMany({
      where: {
        AND: [
          holderWhere(youtuberId),
          // Admins are never asked on their own
          { role: { not: MemberRoles.Admin } },
          { absences: { none: activeAbsenceFilter() } },
        ],
      },
      select: { id: true },
    })
    const ids = members.map((member) => member.id)
    if (ids.length === 0) continue

    const last = await prisma.liveCoordination.groupBy({
      by: ['accountId'],
      where: { accountId: { in: ids } },
      _max: { askedAt: true },
    })
    const askedAt = new Map(last.map((row) => [row.accountId, row._max.askedAt?.getTime() ?? 0]))

    picks[youtuberId] = ids
      .sort((left, right) => (askedAt.get(left) ?? 0) - (askedAt.get(right) ?? 0))
      .slice(0, PROPOSED_COORDINATORS)
  }

  return picks
}

/**
 * Calendar templates a live is filed under, one per platform
 * @return {Promise<Map<string, LivePlatformName>>} - Platform of each live template
 */

export const readLiveTemplates = async (): Promise<Map<string, LivePlatformName>> => {
  const rows = await prisma.eventTemplate.findMany({
    where: { platform: { not: null }, archived: false },
    select: { id: true, platform: true },
  })

  return new Map(rows.map((row) => [row.id, row.platform as LivePlatformName]))
}

/**
 * Template the Live button of "Live en cours" opens the form on
 * @return {Promise<string | null>} - First live template
 */

export const readLiveTemplateId = async (): Promise<string | null> =>
  [...(await readLiveTemplates())].find(
    ([, platform]) => !LIVE_PLATFORMS_SOON.includes(platform)
  )?.[0] ?? null

/**
 * Hand a live entry the platform of its template
 * @param {FormValues} values - Parsed body
 * @param {Map<string, LivePlatformName>} templates - Live templates
 * @return {FormValues} - Values holding the platform
 */

export const withTemplatePlatform = (
  values: FormValues,
  templates: Map<string, LivePlatformName>
): FormValues => {
  const platform = templates.get(readText(values, 'templateId') ?? '')

  return platform ? { ...values, platform } : values
}

/**
 * Live fields the calendar form shows once the Live template is picked
 * @param {AccessScope} [scope] - Creator perimeter
 * @param {string[]} templateIds - Live templates
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const liveFormFields = async (
  scope: AccessScope | undefined,
  templateIds: string[]
): Promise<FieldDefinition[]> => {
  const coordinators = await coordinatorOptions(scope)
  const visibleWhen = { field: 'templateId', oneOf: templateIds }

  return [
    {
      name: 'coordinatorIds',
      kind: 'multiselect',
      label: LIVE_FIELD_COPY.coordinator,
      options: coordinators,
      ownerField: 'youtuberId',
      // Two holders of the Coordinator function who coordinated the least recently, nobody absent
      defaultPicks: await coordinatorPicks(coordinators),
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
  if (raw === LivePlatforms.Twitch || raw === LivePlatforms.YouTube) {
    if (LIVE_PLATFORMS_SOON.includes(raw)) {
      throw invalidInput([{ field: 'templateId', message: LIVE_FIELD_COPY.platformSoon }])
    }

    return raw
  }

  throw invalidInput([{ field: 'platform', message: FORM_COPY.required }])
}

/**
 * Coordinators the creator's live team may name
 * @param {string} youtuberId - Creator
 * @param {string[]} picked - Members named
 * @return {Promise<void>} - Throws on a member that cannot coordinate
 */

export const assertCoordinators = async (youtuberId: string, picked: string[]): Promise<void> => {
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

  const [liveTemplates, lives] = await Promise.all([
    templateId ? readLiveTemplates() : null,
    entryIds.length > 0 ? prisma.live.count({ where: { calendarEventId: { in: entryIds } } }) : 0,
  ])
  if ((templateId && liveTemplates?.has(templateId)) || lives > 0) throw forbidden()
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
    // The creator's live team is convened, nobody else is named
    pickedIds: [],
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
  // Planned end is the one typed, none is invented, closing the live stays manual
  const { endsAt } = entry

  const convened = await convene({
    youtuberId: input.youtuberId,
    picked: input.pickedIds,
    startsAt: entry.startsAt,
    endsAt: endsAt ?? entry.startsAt,
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
 * Read the lives closed within the last day
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} viewerId - Signed-in member
 * @param {PermissionName[]} held - Permissions held
 * @return {Promise<LiveView[]>} - Lives closed lately, latest first
 */

export const listRecentLives = async (
  scope: AccessScope,
  viewerId: string,
  held: PermissionName[]
): Promise<LiveView[]> => {
  const since = new Date(Date.now() - LIVE_SETTINGS.recentHours * 3_600_000)
  const rows = await prisma.live.findMany({
    where: scopedWhere('live', scope, { status: LiveStatuses.Ended, endedAt: { gte: since } }),
    include: LIVE_SHAPE,
    orderBy: { endedAt: 'desc' },
    take: LIVE_SETTINGS.maxOpenLives,
  })

  return rows.map((row) => toView(row, viewerId, held))
}

/**
 * Put back a live closed by mistake
 * @param {string} id - Live identifier
 * @param {string} viewerId - Signed-in member
 * @param {PermissionName[]} held - Permissions held
 * @param {AccessScope} scope - Actor's perimeter
 * @return {Promise<LiveView>} - Live running again
 */

export const reopenLive = async (
  id: string,
  viewerId: string,
  held: PermissionName[],
  scope: AccessScope
): Promise<LiveView> => {
  const live = await readLive(id, scope, viewerId, held)
  if (!live.canReopen) throw forbidden()

  await prisma.live.update({
    where: { id },
    data: { status: LiveStatuses.Live, endedAt: null },
  })
  await publishLive(LIVE_TOPICS.lives, {
    liveId: id,
    youtuberId: live.youtuber.id,
    status: LiveStatuses.Live,
  })

  return readLive(id, scope, viewerId, held)
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
  limit: number,
  onlyCoordinated = false
): Promise<LiveView[]> => {
  const rows = await prisma.live.findMany({
    where: scopedWhere('live', scope, {
      status: LiveStatuses.Ended,
      ...(onlyCoordinated && { coordinations: { some: { accountId: viewerId } } }),
    }),
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
      members: { where: { accountId: viewerId, reinforcement: true }, select: { accountId: true } },
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
      isReinforcement: row.members.length > 0,
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
