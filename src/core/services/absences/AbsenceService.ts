import 'server-only'

import { decryptField, encryptField } from '@/core/lib/crypto'
import { prisma } from '@/core/lib/db'
import { ABSENCE_REASONS } from '@/utils/constants/absences'
import { forbidden, invalidInput, notFound } from '@/core/lib/errors'
import { readDateRange, readText } from '@/core/lib/forms/values'
import {
  ABSENCE_SETTINGS,
  FORM_SETTINGS,
  PAGINATION_SETTINGS,
} from '@/declarations/configurations/settings'
import { ABSENCE_COPY, ABSENCE_FIELD_COPY } from '@/declarations/absences/copy'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { MemberAbsence } from '@/types/members'
import { AbsenceStatuses } from '@/utils/constants/workflow'
import type { AbsenceStatusName } from '@/utils/constants/workflow'
import { countDays } from '@/utils/format/dates'
import type { Prisma } from '@prisma/client'

// Relations every absence row needs
const ABSENCE_INCLUDE = {
  account: true,
  reviewer: true,
} satisfies Prisma.AbsenceInclude

type AbsenceRow = Prisma.AbsenceGetPayload<{ include: typeof ABSENCE_INCLUDE }>

/**
 * Filter matching an absence covering the current instant
 * @return {Prisma.AbsenceWhereInput} - Where clause
 */

export const activeAbsenceFilter = (): Prisma.AbsenceWhereInput => {
  const now = new Date()

  return { status: AbsenceStatuses.Approved, startDate: { lte: now }, endDate: { gte: now } }
}

/**
 * Check a reviewer may act on one account's absences
 * @param {string} reviewerId - Reviewer account identifier
 * @param {string} accountId - Absence owner identifier
 * @param {boolean} isAdmin - Reviewer holds the admin level
 * @return {Promise<boolean>} - Authorised
 */

const canReviewAbsence = async (
  reviewerId: string,
  accountId: string,
  isAdmin: boolean
): Promise<boolean> => {
  if (isAdmin) return true

  const membership = await prisma.teamMember.findFirst({
    where: { accountId, team: { leadId: reviewerId } },
  })

  return membership !== null
}

/**
 * Map an absence row to its display shape, the member name coming from the caller
 * so a member file never re-reads the account it already holds
 * @param {Omit<AbsenceRow, 'account'>} row - Absence row with its reviewer
 * @param {string} memberName - Whose absence it is
 * @return {MemberAbsence} - List row
 */

export const toAbsence = (row: Omit<AbsenceRow, 'account'>, memberName: string): MemberAbsence => ({
  id: row.id,
  accountId: row.accountId,
  memberName,
  startDate: row.startDate.toISOString(),
  endDate: row.endDate.toISOString(),
  dayCount: row.dayCount,
  reasonLabel: row.reasonCode === null ? null : ABSENCE_REASONS.label(row.reasonCode),
  reason: decryptField(row.reason),
  status: row.status,
  reviewerName: row.reviewer?.displayName ?? null,
  reviewNote: decryptField(row.reviewNote),
})

/**
 * Read the chosen category, refusing anything outside the closed list
 * @param {FormValues} values - Parsed body
 * @return {number} - Reason identifier
 */

const readReasonCode = (values: FormValues): number => {
  const raw = Number(readText(values, 'reasonCode'))
  if (!Number.isInteger(raw) || !ABSENCE_REASONS.has(raw)) {
    throw invalidInput([{ field: 'reasonCode', message: FORM_COPY.notAnOption }])
  }

  return raw
}

/**
 * Declarations of the absence form
 * @type {FieldDefinition[]}
 */

export const ABSENCE_FIELDS: FieldDefinition[] = [
  {
    name: 'dates',
    kind: 'daterange',
    label: ABSENCE_FIELD_COPY.dates,
    required: true,
  },
  {
    name: 'reasonCode',
    kind: 'select',
    label: ABSENCE_FIELD_COPY.reason,
    hint: ABSENCE_FIELD_COPY.reasonHint,
    required: true,
    options: ABSENCE_REASONS.options.map((option) => ({
      value: String(option.value),
      label: option.label,
    })),
  },
  // Free text is kept for logistics only, never for a medical detail
  {
    name: 'reason',
    kind: 'text',
    label: ABSENCE_FIELD_COPY.detail,
    hint: ABSENCE_FIELD_COPY.detailHint,
    maxLength: FORM_SETTINGS.shortTextMaxLength,
  },
]

/**
 * Declarations of the review form
 * @type {FieldDefinition[]}
 */

export const REVIEW_FIELDS: FieldDefinition[] = [
  {
    name: 'reviewNote',
    kind: 'textarea',
    label: ABSENCE_FIELD_COPY.reviewNote,
    maxLength: FORM_SETTINGS.longTextMaxLength,
  },
]

/**
 * Read the absences of one member, newest first
 * @param {string} accountId - Account identifier
 * @param {number} [take] - Entry count
 * @return {Promise<MemberAbsence[]>} - Absences
 */

export const listOwnAbsences = async (
  accountId: string,
  take: number = PAGINATION_SETTINGS.defaultPerPage
): Promise<MemberAbsence[]> => {
  const rows = await prisma.absence.findMany({
    where: { accountId },
    include: ABSENCE_INCLUDE,
    orderBy: { startDate: 'desc' },
    take,
  })

  return rows.map((row) => toAbsence(row, row.account.displayName))
}

/**
 * Read the pending requests one reviewer may settle, every team led by them, or every
 * request when they hold the admin level
 * @param {string} reviewerId - Reviewer account identifier
 * @param {boolean} isAdmin - Reviewer holds the admin level
 * @return {Promise<MemberAbsence[]>} - Pending absences
 */

export const listReviewQueue = async (
  reviewerId: string,
  isAdmin: boolean
): Promise<MemberAbsence[]> => {
  const rows = await prisma.absence.findMany({
    where: {
      status: AbsenceStatuses.Pending,
      ...(isAdmin
        ? {}
        : { account: { teamMemberships: { some: { team: { leadId: reviewerId } } } } }),
    },
    include: ABSENCE_INCLUDE,
    orderBy: { startDate: 'asc' },
  })

  return rows.map((row) => toAbsence(row, row.account.displayName))
}

/**
 * Declare an absence
 * @param {string} accountId - Account identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<MemberAbsence>} - Created absence
 */

export const createAbsence = async (
  accountId: string,
  values: FormValues
): Promise<MemberAbsence> => {
  const range = readDateRange(values, 'dates')

  if (!range) {
    throw invalidInput([{ field: 'dates', message: FORM_COPY.required }])
  }

  const [startDate, endDate] = range

  if (endDate < startDate) {
    throw invalidInput([{ field: 'dates', message: FORM_COPY.endBeforeStart }])
  }

  // Below the threshold there is nothing to declare, they just enjoy
  const dayCount = countDays(startDate, endDate)

  if (dayCount <= ABSENCE_SETTINGS.thresholdDays) {
    throw invalidInput([
      {
        field: 'dates',
        message: ABSENCE_COPY.tooShort.replace('{min}', String(ABSENCE_SETTINGS.thresholdDays + 1)),
      },
    ])
  }

  if (dayCount > ABSENCE_SETTINGS.maxDays) {
    throw invalidInput([
      {
        field: 'dates',
        message: ABSENCE_COPY.tooLong.replace('{max}', String(ABSENCE_SETTINGS.maxDays)),
      },
    ])
  }

  const row = await prisma.absence.create({
    data: {
      accountId,
      startDate,
      endDate,
      dayCount,
      reasonCode: readReasonCode(values),
      reason: encryptField(readText(values, 'reason')),
      status: AbsenceStatuses.Pending,
    },
    include: ABSENCE_INCLUDE,
  })

  return toAbsence(row, row.account.displayName)
}

/**
 * Settle an absence request
 * @param {string} id - Absence identifier
 * @param {AbsenceStatusName} status - Review outcome
 * @param {string} reviewerId - Reviewer identifier
 * @param {boolean} isAdmin - Reviewer holds the admin level
 * @param {FormValues} values - Parsed body
 * @return {Promise<MemberAbsence>} - Reviewed absence
 */

export const reviewAbsence = async (
  id: string,
  status: AbsenceStatusName,
  reviewerId: string,
  isAdmin: boolean,
  values: FormValues
): Promise<MemberAbsence> => {
  const current = await prisma.absence.findUnique({ where: { id } })
  if (!current) throw notFound()

  if (!(await canReviewAbsence(reviewerId, current.accountId, isAdmin))) throw forbidden()

  const row = await prisma.absence.update({
    where: { id },
    data: {
      status,
      reviewerId,
      reviewedAt: new Date(),
      reviewNote: encryptField(readText(values, 'reviewNote')),
    },
    include: ABSENCE_INCLUDE,
  })

  return toAbsence(row, row.account.displayName)
}

/**
 * Withdraw an absence request
 * @param {string} id - Absence identifier
 * @param {string} requesterId - Account identifier
 * @param {boolean} isAdmin - Requester holds the admin level
 * @param {boolean} hasReviewPermission - Requester holds the review permission
 * @return {Promise<void>} - Removed
 */

export const removeAbsence = async (
  id: string,
  requesterId: string,
  isAdmin: boolean,
  hasReviewPermission: boolean
): Promise<void> => {
  const row = await prisma.absence.findUnique({ where: { id } })
  if (!row) throw notFound()

  // A member always withdraws their own request
  if (row.accountId === requesterId) {
    await prisma.absence.delete({ where: { id } })
    return
  }

  // Anyone else needs the review permission, scoped to their own teams
  if (!hasReviewPermission || !(await canReviewAbsence(requesterId, row.accountId, isAdmin))) {
    throw notFound()
  }

  await prisma.absence.delete({ where: { id } })
}
