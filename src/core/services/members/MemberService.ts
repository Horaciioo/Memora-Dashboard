import 'server-only'

import { prisma } from '@/core/lib/db'
import { withoutSealedWrites } from '@/core/services/auth/SealService'
import { activeFunctions, activeYoutubers, allDivisions } from '@/core/services/reference/lookups'
import { ACCESS_CATEGORY_REGISTRY } from '@/declarations/access/categories'
import { HELD_FUNCTIONS, toMemberFunctions } from '@/core/services/reference/functions'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { conflict, forbidden, immutable, notFound } from '@/core/lib/errors'
import { rowsToOptions, toOptions } from '@/core/lib/forms/options'
import { syncFunctionTeams } from '@/core/services/teams/FunctionTeamService'
import { readDate, readFlag, readList, readText } from '@/core/lib/forms/values'
import { activeAbsenceFilter, toAbsence } from '@/core/services/absences/AbsenceService'
import { fileUrl } from '@/core/services/system/FileService'
import { toMemberNote } from '@/core/services/members/MemberFileService'
import { MEMBER_STATUS_REGISTRY, ROLE_REGISTRY } from '@/declarations/access/roles'
import { isRootIdentity } from '@/declarations/access/identity'
import { FORM_SETTINGS, PAGINATION_SETTINGS } from '@/declarations/configurations/settings'
import { FORM_GROUPS } from '@/declarations/ui/copy'
import { MEMBER_COPY, MEMBER_FIELD_COPY, MEMBER_FIELD_INFO } from '@/declarations/members/copy'
import { ABSENCE_STATUS_REGISTRY } from '@/declarations/reference/registries'
import { LEAD_DIVISION_RANK, LEGACY_FUNCTION_OF } from '@/declarations/reference/fixed'
import { LANGUAGE_OPTIONS, timezoneOptions } from '@/declarations/system/locales'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { MemberAbsence, MemberDetail, MemberSummary } from '@/types/members'
import {
  AcademyJuniorStatuses,
  GONE_MEMBER_STATUSES,
  MemberRoles,
  MemberStatuses,
} from '@/utils/constants/hierarchy'
import type { MemberRoleName, MemberStatusName } from '@/utils/constants/hierarchy'
import { AbsenceStatuses, FunctionKinds } from '@/utils/constants/workflow'
import type { FunctionKindName } from '@/utils/constants/workflow'
import type { Prisma } from '@prisma/client'

// Relations every moderator row needs
const SUMMARY_INCLUDE = {
  division: true,
  youtubers: true,
  ...HELD_FUNCTIONS,
  academyJuniors: {
    where: { status: AcademyJuniorStatuses.Active },
    orderBy: { startedAt: 'desc' },
    take: 1,
    include: { dispositif: true },
  },
} satisfies Prisma.AccountInclude

type SummaryRow = Prisma.AccountGetPayload<{ include: typeof SUMMARY_INCLUDE }>

/**
 * Extra counters folded onto a list row
 * @typedef {Object} SummaryExtras
 * @property {number} notesCount - Private remarks left on the account
 * @property {boolean} isAbsent - Covered by an approved absence today
 */

interface SummaryExtras {
  notesCount: number
  isAbsent: boolean
}

/**
 * Map an account row to its list shape
 * @param {SummaryRow} row - Account row with its references
 * @param {SummaryExtras} extras - Counters resolved alongside the row
 * @return {MemberSummary} - List row
 */

const toSummary = (row: SummaryRow, extras: SummaryExtras): MemberSummary => ({
  id: row.id,
  displayName: row.displayName,
  discordId: row.discordId,
  avatarUrl: row.avatarUrl,
  bannerUrl: row.bannerUrl,
  role: row.role,
  status: row.status,
  academyDispositif: row.academyJuniors[0]?.dispositif
    ? {
        id: row.academyJuniors[0].dispositif.id,
        label: row.academyJuniors[0].dispositif.name,
        accent: row.academyJuniors[0].dispositif.accent,
      }
    : null,
  academyJuniorId: row.academyJuniors[0]?.id ?? null,
  academySessionId: row.academyJuniors[0]?.sessionId ?? null,
  division: row.division
    ? {
        id: row.division.id,
        label: row.division.name,
      }
    : null,
  youtubers: row.youtubers.map((youtuber) => ({
    id: youtuber.id,
    label: youtuber.name,
    accent: youtuber.accent,
    image: youtuber.avatarUrl,
  })),
  functions: toMemberFunctions(row.functions),
  joinedAt: row.joinedAt.toISOString(),
  isRoot: isRootIdentity(row.discordId),
  notesCount: extras.notesCount,
  isAbsent: extras.isAbsent,
})

/**
 * Reject a division move the viewer is not allowed to make
 * @param {FormValues} values - Parsed body
 * @param {boolean} isAdmin - Viewer sits at admin level
 * @param {string | null} [current] - Division the member already sits in
 * @return {Promise<void>} - Throws on a restricted division
 */

export const assertDivisionAssignable = async (
  values: FormValues,
  isAdmin: boolean,
  current: string | null = null
): Promise<void> => {
  const divisionId = readText(values, 'divisionId')

  // Leaving a member where they already are is never a move
  if (isAdmin || !divisionId || divisionId === current) return

  const division = await prisma.division.findUnique({
    where: { id: divisionId },
    select: { leadAssignable: true },
  })

  if (!division?.leadAssignable) throw forbidden()
}

// Levels below a Responsable, the only ones a Responsable sees and hands out
export const BELOW_LEAD_ROLES: MemberRoleName[] = [MemberRoles.Moderateur, MemberRoles.Junior]

// Functions only an Admin hands out
const LEGACY_FUNCTION_NAMES = Object.values(LEGACY_FUNCTION_OF)

/**
 * Who hands out roles
 * @typedef {Object} RoleActor
 * @property {string} id - Member identifier
 * @property {MemberRoleName} role - Held role
 * @property {boolean} isAdmin - Admin level
 * @property {boolean} isSystem - System holder
 */

export interface RoleActor {
  id: string
  role: MemberRoleName
  isAdmin: boolean
  isSystem: boolean
}

/**
 * Reject a role or a Junior Responsable function beyond what the viewer may hand out
 * @param {FormValues} values - Parsed body
 * @param {RoleActor} actor - Who edits
 * @param {string} [currentId] - Member being edited
 * @return {Promise<void>} - Throws on an out-of-reach change
 */

export const assertMemberAssignable = async (
  values: FormValues,
  actor: RoleActor,
  currentId?: string
): Promise<void> => {
  if (actor.isSystem) return

  const current = currentId
    ? await prisma.account.findUnique({
        where: { id: currentId },
        select: { role: true, functions: { select: { functionId: true } } },
      })
    : null

  // A Responsable never touches a peer or a superior
  if (current && !BELOW_LEAD_ROLES.includes(current.role)) throw forbidden()

  const role = (readText(values, 'role') ?? MemberRoles.Moderateur) as MemberRoleName
  if (!BELOW_LEAD_ROLES.includes(role)) throw forbidden()

  const legacy = await prisma.jobFunction.findMany({
    where: { name: { in: LEGACY_FUNCTION_NAMES } },
    select: { id: true },
  })
  const legacyIds = new Set(legacy.map((row) => row.id))
  const held = new Set((current?.functions ?? []).map((row) => row.functionId))
  const asked = [
    ...readList(values, 'primaryFunctionIds'),
    ...readList(values, 'secondaryFunctionIds'),
  ].filter((id) => legacyIds.has(id))

  // Neither a new one nor a removed one
  const added = asked.some((id) => !held.has(id))
  const removed = [...held].some((id) => legacyIds.has(id) && !asked.includes(id))
  if (added || removed) throw forbidden()
}

/**
 * Build the moderator form declarations
 * @param {boolean} [isAdmin] - Viewer sits at admin level
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const memberFields = async (isAdmin = false): Promise<FieldDefinition[]> => {
  const [divisions, youtubers, functions, opened] = await Promise.all([
    allDivisions(),
    activeYoutubers(),
    activeFunctions(),
    prisma.youtuberFunction.findMany({ select: { youtuberId: true, functionId: true } }),
  ])

  // Creators each function is open for, a moderator only offers those of their creators
  const creatorsOf = new Map<string, string[]>()
  for (const seat of opened) {
    creatorsOf.set(seat.functionId, [...(creatorsOf.get(seat.functionId) ?? []), seat.youtuberId])
  }

  // Each kind only offers its own functions
  const optionsOf = (kind: FunctionKindName) =>
    functions
      .filter(
        (entry) => entry.kind === kind && (isAdmin || !LEGACY_FUNCTION_NAMES.includes(entry.name))
      )
      .sort(
        (left, right) =>
          ACCESS_CATEGORY_REGISTRY.get(left.category).position -
          ACCESS_CATEGORY_REGISTRY.get(right.category).position
      )
      .flatMap((entry) =>
        rowsToOptions([entry]).map((option) => ({
          ...option,
          // Secondary functions share one category, no heading
          group:
            kind === FunctionKinds.Secondary
              ? undefined
              : ACCESS_CATEGORY_REGISTRY.get(entry.category).label,
          owners: creatorsOf.get(entry.id) ?? [],
        }))
      )

  // A restricted division still shows
  const divisionOptions = rowsToOptions(divisions).map((option, index) => ({
    ...option,
    disabled: !isAdmin && !divisions[index].leadAssignable,
  }))

  return [
    {
      name: 'displayName',
      kind: 'text',
      label: MEMBER_FIELD_COPY.displayName,
      info: MEMBER_FIELD_INFO.displayName,
      required: true,
      maxLength: FORM_SETTINGS.shortTextMaxLength,
      span: 'half',
      group: FORM_GROUPS.identity,
    },
    {
      name: 'discordId',
      kind: 'discord',
      label: MEMBER_FIELD_COPY.discordId,
      info: MEMBER_FIELD_INFO.discordId,
      required: true,
      span: 'half',
      group: FORM_GROUPS.identity,
    },
    {
      name: 'birthday',
      kind: 'date',
      dayOnly: true,
      startYear: FORM_SETTINGS.birthdayStartYear,
      label: MEMBER_FIELD_COPY.birthday,
      info: MEMBER_FIELD_INFO.birthday,
      span: 'half',
      group: FORM_GROUPS.identity,
    },
    {
      name: 'celebrateBirthday',
      kind: 'toggle',
      label: MEMBER_FIELD_COPY.celebrateBirthday,
      span: 'half',
      group: FORM_GROUPS.identity,
      binary: true,
    },
    {
      name: 'role',
      kind: 'select',
      label: MEMBER_FIELD_COPY.role,
      info: MEMBER_FIELD_INFO.role,
      required: true,
      options: toOptions(ROLE_REGISTRY).filter(
        (option) => isAdmin || BELOW_LEAD_ROLES.includes(option.value as MemberRoleName)
      ),
      mark: 'role',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'status',
      kind: 'select',
      label: MEMBER_FIELD_COPY.status,
      info: MEMBER_FIELD_INFO.status,
      required: true,
      options: toOptions(MEMBER_STATUS_REGISTRY),
      mark: 'dot',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'divisionId',
      kind: 'select',
      label: MEMBER_FIELD_COPY.division,
      info: MEMBER_FIELD_INFO.division,
      options: divisionOptions,
      mark: 'division',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'youtuberIds',
      kind: 'multiselect',
      label: MEMBER_FIELD_COPY.youtuber,
      info: MEMBER_FIELD_INFO.youtuber,
      options: rowsToOptions(youtubers),
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'primaryFunctionIds',
      kind: 'multiselect',
      label: MEMBER_FIELD_COPY.primaryFunctions,
      info: MEMBER_FIELD_INFO.primaryFunctions,
      options: optionsOf(FunctionKinds.Primary),
      ownerField: 'youtuberIds',
      mark: 'glyph',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'secondaryFunctionIds',
      kind: 'multiselect',
      label: MEMBER_FIELD_COPY.secondaryFunctions,
      info: MEMBER_FIELD_INFO.secondaryFunctions,
      options: optionsOf(FunctionKinds.Secondary),
      ownerField: 'youtuberIds',
      mark: 'glyph',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'timezone',
      kind: 'select',
      label: MEMBER_FIELD_COPY.timezone,
      info: MEMBER_FIELD_INFO.timezone,
      options: timezoneOptions(),
      span: 'half',
      group: FORM_GROUPS.contact,
    },
    {
      name: 'languages',
      kind: 'multiselect',
      label: MEMBER_FIELD_COPY.languages,
      info: MEMBER_FIELD_INFO.languages,
      options: LANGUAGE_OPTIONS,
      mark: 'flag',
      maxItems: FORM_SETTINGS.tagMaxCount,
      group: FORM_GROUPS.contact,
    },
    {
      name: 'joinedAt',
      kind: 'date',
      label: MEMBER_FIELD_COPY.joinedAt,
      info: MEMBER_FIELD_INFO.joinedAt,
      preset: 'today',
      span: 'half',
      group: FORM_GROUPS.planning,
    },
    {
      name: 'leftAt',
      kind: 'date',
      label: MEMBER_FIELD_COPY.leftAt,
      info: MEMBER_FIELD_INFO.leftAt,
      visibleWhen: { field: 'status', equals: MemberStatuses.Left },
      span: 'half',
      group: FORM_GROUPS.planning,
    },
  ]
}

/**
 * Read every moderator, a Responsable only reads those below them
 * @param {AccessScope} scope - Perimeter
 * @param {boolean} [isAdmin] - Viewer sits at admin level
 * @param {MemberRoleName[]} [roles] - Only these levels, whoever asks
 * @return {Promise<MemberSummary[]>} - List rows
 */

export const listMembers = async (
  scope: AccessScope,
  isAdmin = false,
  roles?: MemberRoleName[]
): Promise<MemberSummary[]> => {
  const levels = roles ?? (isAdmin ? null : BELOW_LEAD_ROLES)
  const rows = await prisma.account.findMany({
    where: scopedWhere('account', scope, levels ? { role: { in: levels } } : {}),
    include: {
      ...SUMMARY_INCLUDE,
      _count: { select: { notesReceived: true, absences: { where: activeAbsenceFilter() } } },
    },
    orderBy: { displayName: 'asc' },
  })

  return rows.map((row) =>
    toSummary(row, { notesCount: row._count.notesReceived, isAbsent: row._count.absences > 0 })
  )
}

/**
 * Turn parsed values into a database payload
 * @param {FormValues} values - Parsed body
 * @return {Prisma.AccountUncheckedCreateInput} - Database payload
 */

const toAccountData = (values: FormValues) => ({
  displayName: readText(values, 'displayName') ?? '',
  discordId: (readText(values, 'discordId') ?? '').replace(/\D/g, ''),
  role: (readText(values, 'role') ?? 'MODERATEUR') as MemberRoleName,
  status: (readText(values, 'status') ?? MemberStatuses.Academy) as MemberStatusName,
  divisionId: readText(values, 'divisionId'),
  timezone: readText(values, 'timezone'),
  birthday: readDate(values, 'birthday'),
  leftAt: readDate(values, 'leftAt'),
  languages: readList(values, 'languages'),
  celebrateBirthday: readFlag(values, 'celebrateBirthday'),
})

/**
 * Seat a responsable in the last division when none is chosen
 * @param {ReturnType<typeof toAccountData>} data - Database payload
 * @return {Promise<ReturnType<typeof toAccountData>>} - Payload with its division
 */

const withLeadDivision = async (data: ReturnType<typeof toAccountData>) => {
  if (data.role !== MemberRoles.Responsable || data.divisionId) return data

  const division = (await allDivisions()).find((entry) => entry.rank === LEAD_DIVISION_RANK)

  return { ...data, divisionId: division?.id ?? null }
}

/**
 * Read the functions a member should hold
 * @param {FormValues} values - Parsed body
 * @return {Promise<string[]>} - Function identifiers to hold
 */

const readHeldFunctionIds = async (values: FormValues): Promise<string[]> => {
  const [primaries, secondaries] = await Promise.all([
    readKindIds(readList(values, 'primaryFunctionIds'), FunctionKinds.Primary),
    readKindIds(readList(values, 'secondaryFunctionIds'), FunctionKinds.Secondary),
  ])

  return [...primaries, ...secondaries]
}

/**
 * Keep the ids that name an active function of one kind
 * @param {string[]} ids - Submitted identifiers
 * @param {FunctionKindName} kind - Principal or secondary
 * @return {Promise<string[]>} - Known identifiers
 */

const readKindIds = async (ids: string[], kind: FunctionKindName): Promise<string[]> => {
  if (ids.length === 0) return []

  const rows = await prisma.jobFunction.findMany({
    where: { id: { in: ids }, kind, archived: false },
    select: { id: true },
  })

  return rows.map((row) => row.id)
}

/**
 * Refuse an identifier another file already holds
 * @param {string} discordId - Identifier to give
 * @param {string} [currentId] - File being edited
 * @return {Promise<void>} - Throws when taken
 */

export const assertIdentifierFree = async (
  discordId: string,
  currentId?: string
): Promise<void> => {
  const holder = await prisma.account.findUnique({
    where: { discordId },
    select: { id: true, status: true },
  })
  if (!holder || holder.id === currentId) return

  // A departed file keeps its identifier until it is deleted
  throw conflict(
    GONE_MEMBER_STATUSES.includes(holder.status)
      ? MEMBER_COPY.identifierHeldByGone
      : MEMBER_COPY.identifierTaken
  )
}

/**
 * Add a moderator
 * @param {FormValues} values - Parsed body
 * @return {Promise<MemberSummary>} - Created row
 */

export const createMember = async (values: FormValues): Promise<MemberSummary> => {
  const data = await withLeadDivision(toAccountData(values))
  const joinedAt = readDate(values, 'joinedAt')
  const youtuberIds = readList(values, 'youtuberIds')
  const functionIds = await readHeldFunctionIds(values)

  await assertIdentifierFree(data.discordId)

  const row = await prisma.account.create({
    data: {
      ...data,
      joinedAt: joinedAt ?? new Date(),
      youtubers: { connect: youtuberIds.map((id) => ({ id })) },
      functions: { create: functionIds.map((functionId) => ({ functionId })) },
    },
    include: SUMMARY_INCLUDE,
  })
  await syncFunctionTeams([row.id])

  // A brand new account never carries a note or a running absence yet
  return toSummary(row, { notesCount: 0, isAbsent: false })
}

/**
 * Edit a moderator
 * @param {string} id - Account identifier
 * @param {FormValues} values - Parsed body
 * @param {boolean} [byRoot] - The root administrator edits
 * @return {Promise<MemberSummary>} - Updated row
 */

export const updateMember = async (
  id: string,
  values: FormValues,
  byRoot = false
): Promise<MemberSummary> => {
  const current = await prisma.account.findUnique({ where: { id } })
  if (!current) throw notFound()

  // The root administrator is edited by nobody but itself, and keeps its identifier and its level
  const isRootTarget = isRootIdentity(current.discordId)
  if (isRootTarget && !byRoot) throw immutable(MEMBER_COPY.rootLocked)

  const kept = isRootTarget ? { discordId: current.discordId, role: current.role } : {}
  const data = {
    ...(await withoutSealedWrites(await withLeadDivision(toAccountData(values)))),
    ...kept,
  }
  if (data.discordId && data.discordId !== current.discordId) {
    await assertIdentifierFree(data.discordId, id)
  }

  const joinedAt = readDate(values, 'joinedAt')
  const youtuberIds = readList(values, 'youtuberIds')
  const functionIds = await readHeldFunctionIds(values)

  const row = await prisma.account.update({
    where: { id },
    data: {
      ...data,
      joinedAt: joinedAt ?? current.joinedAt,
      youtubers: { set: youtuberIds.map((youtuberId) => ({ id: youtuberId })) },
      // The whole set is sent every time
      functions: {
        deleteMany: {},
        create: functionIds.map((functionId) => ({ functionId })),
      },
    },
    include: {
      ...SUMMARY_INCLUDE,
      _count: { select: { notesReceived: true, absences: { where: activeAbsenceFilter() } } },
    },
  })
  await syncFunctionTeams([id])

  return toSummary(row, { notesCount: row._count.notesReceived, isAbsent: row._count.absences > 0 })
}

/**
 * Drop the details a member volunteered
 * @param {string} id - Account identifier
 * @return {Promise<void>} - Cleared
 */

export const clearVolunteeredDetails = async (id: string): Promise<void> => {
  await prisma.$transaction([
    prisma.socialLink.deleteMany({ where: { accountId: id } }),
    prisma.accountConstraint.deleteMany({ where: { accountId: id } }),
    prisma.account.update({
      where: { id },
      data: { birthday: null, celebrateBirthday: false },
    }),
  ])
}

/**
 * Erase a member and every trace holding their identifier
 * @param {string} id - Account identifier
 * @return {Promise<void>} - Deleted
 */

export const deleteMember = async (id: string): Promise<void> => {
  const current = await prisma.account.findUnique({ where: { id } })
  if (!current) throw notFound()
  if (isRootIdentity(current.discordId)) throw immutable(MEMBER_COPY.rootLocked)

  const filePrefix = fileUrl('')
  const avatarId = current.avatarUrl?.startsWith(filePrefix)
    ? current.avatarUrl.slice(filePrefix.length)
    : null

  // Owned rows follow through the foreign keys, loose references go by hand
  await prisma.$transaction([
    prisma.activityLog.deleteMany({
      where: { OR: [{ subjectId: id }, { targetType: 'member', targetId: id }] },
    }),
    prisma.notification.deleteMany({ where: { targetType: 'member', targetId: id } }),
    prisma.integrationClaim.deleteMany({ where: { discordId: current.discordId } }),
    ...(avatarId ? [prisma.storageEntry.deleteMany({ where: { id: avatarId } })] : []),
    prisma.account.delete({ where: { id } }),
  ])
}

/**
 * Read one moderator file
 * @param {string} id - Account identifier
 * @param {boolean} canReadNotes - Member may read private remarks
 * @return {Promise<MemberDetail>} - Full file
 */

export const readMember = async (id: string, canReadNotes = false): Promise<MemberDetail> => {
  const row = await prisma.account.findUnique({
    where: { id },
    include: {
      ...SUMMARY_INCLUDE,
      socialLinks: { orderBy: { position: 'asc' } },
      absences: {
        include: { reviewer: true },
        orderBy: { startDate: 'desc' },
        take: PAGINATION_SETTINGS.defaultPerPage,
      },
      teamMemberships: { include: { team: true } },
      _count: {
        select: {
          notesReceived: true,
          projectAssists: true,
          ownedTasks: true,
          meetingSeats: true,
        },
      },
    },
  })

  if (!row) throw notFound()

  // Never queried at all when the reader may not open them
  const notes = canReadNotes
    ? await prisma.accountNote.findMany({
        where: { accountId: id },
        include: { author: true },
        orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      })
    : []

  const absences: MemberAbsence[] = row.absences.map((absence) =>
    toAbsence(absence, row.displayName)
  )

  const now = new Date()
  const isAbsent = row.absences.some(
    (absence) =>
      absence.status === AbsenceStatuses.Approved &&
      absence.startDate <= now &&
      absence.endDate >= now
  )

  return {
    summary: toSummary(row, { notesCount: row._count.notesReceived, isAbsent }),
    values: {
      displayName: row.displayName,
      discordId: row.discordId,
      role: row.role,
      status: row.status,
      divisionId: row.divisionId,
      youtuberIds: row.youtubers.map((youtuber) => youtuber.id),
      primaryFunctionIds: row.functions
        .filter((held) => held.jobFunction.kind === FunctionKinds.Primary)
        .map((held) => held.functionId),
      secondaryFunctionIds: row.functions
        .filter((held) => held.jobFunction.kind === FunctionKinds.Secondary)
        .map((held) => held.functionId),
      timezone: row.timezone,
      birthday: row.birthday ? row.birthday.toISOString().slice(0, 10) : null,
      joinedAt: row.joinedAt.toISOString().slice(0, 10),
      leftAt: row.leftAt ? row.leftAt.toISOString().slice(0, 10) : null,
      languages: row.languages,
      celebrateBirthday: row.celebrateBirthday,
    },
    birthday: row.birthday?.toISOString() ?? null,
    celebrateBirthday: row.celebrateBirthday,
    languages: row.languages,
    leftAt: row.leftAt?.toISOString() ?? null,
    erased: row.anonymisedAt !== null,
    notes: notes.map(toMemberNote),
    socials: row.socialLinks.map((link) => ({
      id: link.id,
      networkId: link.networkId,
      label: link.label,
      handle: link.handle,
      url: link.url,
      accent: link.accent,
    })),
    absences,
    teams: row.teamMemberships.map((membership) => membership.team.name),
    projectCount: row._count.projectAssists,
    taskCount: row._count.ownedTasks,
    meetingCount: row._count.meetingSeats,
  }
}

/**
 * Absence review labels
 * @type {typeof ABSENCE_STATUS_REGISTRY}
 */

export const ABSENCE_STATUSES = ABSENCE_STATUS_REGISTRY
