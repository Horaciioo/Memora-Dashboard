import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict, immutable, notFound } from '@/core/lib/errors'
import { rowsToOptions, toOptions } from '@/core/lib/forms/options'
import { readDate, readFlag, readList, readText } from '@/core/lib/forms/values'
import {
  ACADEMY_PERIOD_REGISTRY,
  MEMBER_STATUS_REGISTRY,
  ROLE_REGISTRY,
} from '@/declarations/access/roles'
import { isRootIdentity } from '@/declarations/access/identity'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { MEMBER_COPY, MEMBER_FIELD_COPY } from '@/declarations/members/copy'
import { ABSENCE_STATUS_REGISTRY } from '@/declarations/reference/registries'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { MemberAbsence, MemberDetail, MemberSummary, MemberTraining } from '@/types/members'
import { MemberStatuses } from '@/utils/constants/hierarchy'
import type {
  AcademyPeriodName,
  MemberRoleName,
  MemberStatusName,
} from '@/utils/constants/hierarchy'
import type { Prisma } from '@prisma/client'

// Relations every moderator row needs
const SUMMARY_INCLUDE = {
  division: true,
  youtuber: true,
  primaryFunction: true,
  secondaryFunction: true,
} satisfies Prisma.AccountInclude

type SummaryRow = Prisma.AccountGetPayload<{ include: typeof SUMMARY_INCLUDE }>

/**
 * Map an account row to its list shape
 * @param {SummaryRow} row - Account row with its references
 * @return {MemberSummary} - List row
 */

const toSummary = (row: SummaryRow): MemberSummary => ({
  id: row.id,
  displayName: row.displayName,
  discordId: row.discordId,
  avatarUrl: row.avatarUrl,
  role: row.role,
  status: row.status,
  academyPeriod: row.academyPeriod,
  division: row.division
    ? {
        id: row.division.id,
        label: row.division.name,
        glyph: row.division.glyph,
        imagePath: row.division.imagePath,
        rank: row.division.rank,
      }
    : null,
  youtuber: row.youtuber
    ? { id: row.youtuber.id, label: row.youtuber.name, accent: row.youtuber.accent }
    : null,
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
})

/**
 * Build the moderator form declarations
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const memberFields = async (): Promise<FieldDefinition[]> => {
  const [divisions, youtubers, functions] = await Promise.all([
    prisma.division.findMany({ orderBy: { rank: 'asc' } }),
    prisma.youtuber.findMany({ where: { archived: false }, orderBy: { position: 'asc' } }),
    prisma.jobFunction.findMany({ where: { archived: false }, orderBy: { position: 'asc' } }),
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
    },
    {
      name: 'discordId',
      kind: 'discord',
      label: MEMBER_FIELD_COPY.discordId,
      required: true,
      hint: MEMBER_FIELD_COPY.discordIdHint,
      span: 'half',
    },
    {
      name: 'role',
      kind: 'select',
      label: MEMBER_FIELD_COPY.role,
      required: true,
      options: toOptions(ROLE_REGISTRY),
      span: 'half',
    },
    {
      name: 'status',
      kind: 'select',
      label: MEMBER_FIELD_COPY.status,
      required: true,
      options: toOptions(MEMBER_STATUS_REGISTRY),
      span: 'half',
    },
    {
      name: 'academyPeriod',
      kind: 'select',
      label: MEMBER_FIELD_COPY.academyPeriod,
      options: toOptions(ACADEMY_PERIOD_REGISTRY),
      visibleWhen: { field: 'status', equals: MemberStatuses.Academy },
      span: 'half',
    },
    {
      name: 'divisionId',
      kind: 'select',
      label: MEMBER_FIELD_COPY.division,
      options: rowsToOptions(divisions),
      span: 'half',
    },
    {
      name: 'youtuberId',
      kind: 'select',
      label: MEMBER_FIELD_COPY.youtuber,
      options: rowsToOptions(youtubers),
      span: 'half',
    },
    {
      name: 'primaryFunctionId',
      kind: 'select',
      label: MEMBER_FIELD_COPY.primaryFunction,
      options: functionOptions,
      span: 'half',
    },
    {
      name: 'secondaryFunctionId',
      kind: 'select',
      label: MEMBER_FIELD_COPY.secondaryFunction,
      options: functionOptions,
      span: 'half',
    },
    { name: 'email', kind: 'email', label: MEMBER_FIELD_COPY.email, span: 'half' },
    { name: 'phone', kind: 'phone', label: MEMBER_FIELD_COPY.phone, span: 'half' },
    { name: 'birthday', kind: 'date', label: MEMBER_FIELD_COPY.birthday, span: 'half' },
    { name: 'joinedAt', kind: 'date', label: MEMBER_FIELD_COPY.joinedAt, span: 'half' },
    {
      name: 'leftAt',
      kind: 'date',
      label: MEMBER_FIELD_COPY.leftAt,
      visibleWhen: { field: 'status', equals: MemberStatuses.Left },
      span: 'half',
    },
    {
      name: 'timezone',
      kind: 'text',
      label: MEMBER_FIELD_COPY.timezone,
      maxLength: FORM_SETTINGS.shortTextMaxLength,
      span: 'half',
    },
    {
      name: 'languages',
      kind: 'tags',
      label: MEMBER_FIELD_COPY.languages,
      hint: MEMBER_FIELD_COPY.languagesHint,
      maxItems: FORM_SETTINGS.tagMaxCount,
    },
    { name: 'avatarUrl', kind: 'url', label: MEMBER_FIELD_COPY.avatarUrl },
    {
      name: 'celebrateBirthday',
      kind: 'toggle',
      label: MEMBER_FIELD_COPY.celebrateBirthday,
    },
  ]
}

/**
 * Read every moderator
 * @return {Promise<MemberSummary[]>} - List rows
 */

export const listMembers = async (): Promise<MemberSummary[]> => {
  const rows = await prisma.account.findMany({
    include: SUMMARY_INCLUDE,
    orderBy: [{ status: 'asc' }, { displayName: 'asc' }],
  })

  return rows.map(toSummary)
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
  academyPeriod: (readText(values, 'academyPeriod') ?? null) as AcademyPeriodName | null,
  divisionId: readText(values, 'divisionId'),
  youtuberId: readText(values, 'youtuberId'),
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

  const existing = await prisma.account.findUnique({ where: { discordId: data.discordId } })
  if (existing) throw conflict()

  const row = await prisma.account.create({
    data: { ...data, joinedAt: joinedAt ?? new Date() },
    include: SUMMARY_INCLUDE,
  })

  return toSummary(row)
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

  const row = await prisma.account.update({
    where: { id },
    data: { ...data, joinedAt: joinedAt ?? current.joinedAt },
    include: SUMMARY_INCLUDE,
  })

  return toSummary(row)
}

/**
 * Drop a moderator
 * @param {string} id - Account identifier
 * @return {Promise<void>} - Removed
 */

export const removeMember = async (id: string): Promise<void> => {
  const current = await prisma.account.findUnique({ where: { id } })
  if (!current) throw notFound()
  if (isRootIdentity(current.discordId)) throw immutable(MEMBER_COPY.rootLocked)

  await prisma.account.delete({ where: { id } })
}

/**
 * Read one moderator file
 * @param {string} id - Account identifier
 * @return {Promise<MemberDetail>} - Full file
 */

export const readMember = async (id: string): Promise<MemberDetail> => {
  const row = await prisma.account.findUnique({
    where: { id },
    include: {
      ...SUMMARY_INCLUDE,
      notesReceived: {
        include: { author: true },
        orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      },
      pims: { include: { author: true }, orderBy: { heldAt: 'desc' } },
      socialLinks: { include: { network: true }, orderBy: { network: { position: 'asc' } } },
      absences: { include: { reviewer: true }, orderBy: { startDate: 'desc' } },
      trainingRecords: { include: { training: true, validator: true } },
      teamMemberships: { include: { team: true } },
      _count: { select: { projectAssists: true, ownedTasks: true, meetingSeats: true } },
    },
  })

  if (!row) throw notFound()

  // Declared trainings the member has not started yet still show as pending
  const trainings = await prisma.training.findMany({
    orderBy: [{ period: 'asc' }, { position: 'asc' }],
  })
  const recordIndex = new Map(row.trainingRecords.map((record) => [record.trainingId, record]))

  const progression: MemberTraining[] = trainings.map((training) => {
    const record = recordIndex.get(training.id)

    return {
      id: training.id,
      name: training.name,
      period: training.period,
      mandatory: training.mandatory,
      completedAt: record?.completedAt?.toISOString() ?? null,
      validatorName: record?.validator?.displayName ?? null,
    }
  })

  const absences: MemberAbsence[] = row.absences.map((absence) => ({
    id: absence.id,
    accountId: row.id,
    memberName: row.displayName,
    startDate: absence.startDate.toISOString(),
    endDate: absence.endDate.toISOString(),
    dayCount: absence.dayCount,
    reason: absence.reason,
    status: absence.status,
    reviewerName: absence.reviewer?.displayName ?? null,
    reviewNote: absence.reviewNote,
  }))

  return {
    summary: toSummary(row),
    values: {
      displayName: row.displayName,
      discordId: row.discordId,
      role: row.role,
      status: row.status,
      academyPeriod: row.academyPeriod,
      divisionId: row.divisionId,
      youtuberId: row.youtuberId,
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
    notes: row.notesReceived.map((note) => ({
      id: note.id,
      body: note.body,
      pinned: note.pinned,
      authorName: note.author?.displayName ?? null,
      createdAt: note.createdAt.toISOString(),
    })),
    pims: row.pims.map((pim) => ({
      id: pim.id,
      heldAt: pim.heldAt.toISOString(),
      sheet: pim.sheet,
      authorName: pim.author?.displayName ?? null,
    })),
    socials: row.socialLinks.map((link) => ({
      id: link.id,
      networkId: link.networkId,
      networkName: link.network.name,
      accent: link.network.accent,
      handle: link.handle,
      url: link.url,
    })),
    absences,
    trainings: progression,
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
