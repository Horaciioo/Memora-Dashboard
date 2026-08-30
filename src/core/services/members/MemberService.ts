import 'server-only'

import { prisma } from '@/core/lib/db'
import { activeFunctions, activeYoutubers, allDivisions } from '@/core/services/reference/lookups'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { conflict, immutable, notFound } from '@/core/lib/errors'
import { rowsToOptions, toOptions } from '@/core/lib/forms/options'
import { readDate, readFlag, readList, readText } from '@/core/lib/forms/values'
import { activeAbsenceFilter, toAbsence } from '@/core/services/absences/AbsenceService'
import { toMemberNote } from '@/core/services/members/MemberFileService'
import { MEMBER_STATUS_REGISTRY, ROLE_REGISTRY } from '@/declarations/access/roles'
import { isRootIdentity } from '@/declarations/access/identity'
import { FORM_SETTINGS, PAGINATION_SETTINGS } from '@/declarations/configurations/settings'
import { FORM_GROUPS } from '@/declarations/ui/copy'
import { MEMBER_COPY, MEMBER_FIELD_COPY } from '@/declarations/members/copy'
import { ABSENCE_STATUS_REGISTRY } from '@/declarations/reference/registries'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { MemberAbsence, MemberDetail, MemberSummary } from '@/types/members'
import { AcademyJuniorStatuses, MemberStatuses } from '@/utils/constants/hierarchy'
import type { MemberRoleName, MemberStatusName } from '@/utils/constants/hierarchy'
import { AbsenceStatuses } from '@/utils/constants/workflow'
import type { Prisma } from '@prisma/client'

// Relations every moderator row needs
const SUMMARY_INCLUDE = {
  division: true,
  youtubers: true,
  primaryFunction: true,
  secondaryFunction: true,
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
  role: row.role,
  status: row.status,
  academyDispositif: row.academyJuniors[0]
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
        glyph: row.division.glyph,
        imagePath: row.division.imagePath,
        rank: row.division.rank,
      }
    : null,
  youtubers: row.youtubers.map((youtuber) => ({
    id: youtuber.id,
    label: youtuber.name,
    accent: youtuber.accent,
  })),
  primaryFunction: row.primaryFunction
    ? {
        id: row.primaryFunction.id,
        label: row.primaryFunction.name,
        accent: row.primaryFunction.accent,
      }
    : null,
  secondaryFunction: row.secondaryFunction
    ? {
        id: row.secondaryFunction.id,
        label: row.secondaryFunction.name,
        accent: row.secondaryFunction.accent,
      }
    : null,
  joinedAt: row.joinedAt.toISOString(),
  isRoot: isRootIdentity(row.discordId),
  notesCount: extras.notesCount,
  isAbsent: extras.isAbsent,
})

/**
 * Build the moderator form declarations
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const memberFields = async (): Promise<FieldDefinition[]> => {
  const [divisions, youtubers, functions] = await Promise.all([
    allDivisions(),
    activeYoutubers(),
    activeFunctions(),
  ])

  const functionOptions = rowsToOptions(functions)

  return [
    {
      name: 'displayName',
      kind: 'text',
      label: MEMBER_FIELD_COPY.displayName,
      required: true,
      maxLength: FORM_SETTINGS.shortTextMaxLength,
      span: 'half',
      group: FORM_GROUPS.identity,
    },
    {
      name: 'discordId',
      kind: 'discord',
      label: MEMBER_FIELD_COPY.discordId,
      required: true,
      span: 'half',
      group: FORM_GROUPS.identity,
    },
    {
      name: 'avatarUrl',
      kind: 'image',
      label: MEMBER_FIELD_COPY.avatarUrl,
      bucket: 'avatars',
      group: FORM_GROUPS.identity,
    },
    {
      name: 'birthday',
      kind: 'date',
      label: MEMBER_FIELD_COPY.birthday,
      span: 'half',
      group: FORM_GROUPS.identity,
    },
    {
      name: 'celebrateBirthday',
      kind: 'toggle',
      label: MEMBER_FIELD_COPY.celebrateBirthday,
      span: 'half',
      group: FORM_GROUPS.identity,
    },
    {
      name: 'role',
      kind: 'select',
      label: MEMBER_FIELD_COPY.role,
      required: true,
      options: toOptions(ROLE_REGISTRY),
      mark: 'dot',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'status',
      kind: 'select',
      label: MEMBER_FIELD_COPY.status,
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
      options: rowsToOptions(divisions),
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'youtuberIds',
      kind: 'multiselect',
      label: MEMBER_FIELD_COPY.youtuber,
      options: rowsToOptions(youtubers),
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'primaryFunctionId',
      kind: 'select',
      label: MEMBER_FIELD_COPY.primaryFunction,
      options: functionOptions,
      mark: 'dot',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'secondaryFunctionId',
      kind: 'select',
      label: MEMBER_FIELD_COPY.secondaryFunction,
      options: functionOptions,
      mark: 'dot',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'email',
      kind: 'email',
      label: MEMBER_FIELD_COPY.email,
      span: 'half',
      group: FORM_GROUPS.contact,
    },
    {
      name: 'phone',
      kind: 'phone',
      label: MEMBER_FIELD_COPY.phone,
      span: 'half',
      group: FORM_GROUPS.contact,
    },
    {
      name: 'timezone',
      kind: 'text',
      label: MEMBER_FIELD_COPY.timezone,
      maxLength: FORM_SETTINGS.shortTextMaxLength,
      span: 'half',
      group: FORM_GROUPS.contact,
    },
    {
      name: 'languages',
      kind: 'tags',
      label: MEMBER_FIELD_COPY.languages,
      maxItems: FORM_SETTINGS.tagMaxCount,
      group: FORM_GROUPS.contact,
    },
    {
      name: 'joinedAt',
      kind: 'date',
      label: MEMBER_FIELD_COPY.joinedAt,
      span: 'half',
      group: FORM_GROUPS.planning,
    },
    {
      name: 'leftAt',
      kind: 'date',
      label: MEMBER_FIELD_COPY.leftAt,
      visibleWhen: { field: 'status', equals: MemberStatuses.Left },
      span: 'half',
      group: FORM_GROUPS.planning,
    },
  ]
}

/**
 * Read every moderator
 * @return {Promise<MemberSummary[]>} - List rows
 */

export const listMembers = async (scope: AccessScope): Promise<MemberSummary[]> => {
  const rows = await prisma.account.findMany({
    where: scopedWhere('account', scope, {}),
    include: {
      ...SUMMARY_INCLUDE,
      _count: { select: { notesReceived: true, absences: { where: activeAbsenceFilter() } } },
    },
    orderBy: [{ status: 'asc' }, { displayName: 'asc' }],
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
  primaryFunctionId: readText(values, 'primaryFunctionId'),
  secondaryFunctionId: readText(values, 'secondaryFunctionId'),
  email: readText(values, 'email'),
  phone: readText(values, 'phone'),
  timezone: readText(values, 'timezone'),
  avatarUrl: readText(values, 'avatarUrl'),
  birthday: readDate(values, 'birthday'),
  leftAt: readDate(values, 'leftAt'),
  languages: readList(values, 'languages'),
  celebrateBirthday: readFlag(values, 'celebrateBirthday'),
})

/**
 * Add a moderator
 * @param {FormValues} values - Parsed body
 * @return {Promise<MemberSummary>} - Created row
 */

export const createMember = async (values: FormValues): Promise<MemberSummary> => {
  const data = toAccountData(values)
  const joinedAt = readDate(values, 'joinedAt')
  const youtuberIds = readList(values, 'youtuberIds')

  const existing = await prisma.account.findUnique({ where: { discordId: data.discordId } })
  if (existing) throw conflict()

  const row = await prisma.account.create({
    data: {
      ...data,
      joinedAt: joinedAt ?? new Date(),
      youtubers: { connect: youtuberIds.map((id) => ({ id })) },
    },
    include: SUMMARY_INCLUDE,
  })

  // A brand new account never carries a note or a running absence yet
  return toSummary(row, { notesCount: 0, isAbsent: false })
}

/**
 * Edit a moderator
 * @param {string} id - Account identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<MemberSummary>} - Updated row
 */

export const updateMember = async (id: string, values: FormValues): Promise<MemberSummary> => {
  const current = await prisma.account.findUnique({ where: { id } })
  if (!current) throw notFound()

  // The root administrator keeps its identifier and its level
  if (isRootIdentity(current.discordId)) throw immutable(MEMBER_COPY.rootLocked)

  const data = toAccountData(values)
  const joinedAt = readDate(values, 'joinedAt')
  const youtuberIds = readList(values, 'youtuberIds')

  const row = await prisma.account.update({
    where: { id },
    data: {
      ...data,
      joinedAt: joinedAt ?? current.joinedAt,
      youtubers: { set: youtuberIds.map((youtuberId) => ({ id: youtuberId })) },
    },
    include: {
      ...SUMMARY_INCLUDE,
      _count: { select: { notesReceived: true, absences: { where: activeAbsenceFilter() } } },
    },
  })

  return toSummary(row, { notesCount: row._count.notesReceived, isAbsent: row._count.absences > 0 })
}

/**
 * Drop the details a member volunteered, keeping everything Discord already
 * makes public. Notes of follow-up are not touched: they accompany, they do not judge
 * @param {string} id - Account identifier
 * @return {Promise<void>} - Cleared
 */

export const clearVolunteeredDetails = async (id: string): Promise<void> => {
  await prisma.$transaction([
    prisma.socialLink.deleteMany({ where: { accountId: id } }),
    prisma.account.update({
      where: { id },
      data: { email: null, phone: null, birthday: null, celebrateBirthday: false },
    }),
  ])
}

/**
 * Close a member's access and drop what they volunteered, the identity they
 * already show on Discord staying attached to the work they did
 * @param {string} id - Account identifier
 * @return {Promise<void>} - Anonymised
 */

export const anonymiseMember = async (id: string): Promise<void> => {
  const current = await prisma.account.findUnique({ where: { id } })
  if (!current) throw notFound()
  if (isRootIdentity(current.discordId)) throw immutable(MEMBER_COPY.rootLocked)

  await clearVolunteeredDetails(id)

  // Credentials go with the access, they are never part of the history
  await prisma.$transaction([
    prisma.session.deleteMany({ where: { accountId: id } }),
    prisma.discordToken.deleteMany({ where: { accountId: id } }),
    prisma.account.update({
      where: { id },
      data: {
        discordUsername: null,
        status: MemberStatuses.Left,
        leftAt: current.leftAt ?? new Date(),
        anonymisedAt: new Date(),
      },
    }),
  ])
}

/**
 * Read one moderator file, the private remarks never leaving the server unasked
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
      primaryFunctionId: row.primaryFunctionId,
      secondaryFunctionId: row.secondaryFunctionId,
      email: row.email,
      phone: row.phone,
      timezone: row.timezone,
      avatarUrl: row.avatarUrl,
      birthday: row.birthday ? row.birthday.toISOString().slice(0, 10) : null,
      joinedAt: row.joinedAt.toISOString().slice(0, 10),
      leftAt: row.leftAt ? row.leftAt.toISOString().slice(0, 10) : null,
      languages: row.languages,
      celebrateBirthday: row.celebrateBirthday,
    },
    email: row.email,
    phone: row.phone,
    birthday: row.birthday?.toISOString() ?? null,
    celebrateBirthday: row.celebrateBirthday,
    languages: row.languages,
    leftAt: row.leftAt?.toISOString() ?? null,
    notes: notes.map(toMemberNote),
    socials: row.socialLinks.map((link) => ({
      id: link.id,
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
 * Absence review labels, reused by the absence surfaces
 * @type {typeof ABSENCE_STATUS_REGISTRY}
 */

export const ABSENCE_STATUSES = ABSENCE_STATUS_REGISTRY
