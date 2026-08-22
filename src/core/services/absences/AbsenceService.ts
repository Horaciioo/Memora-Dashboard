import 'server-only'

import { prisma } from '@/core/lib/db'
import { invalidInput, notFound } from '@/core/lib/errors'
import { readDate, readText } from '@/core/lib/forms/values'
import { ABSENCE_SETTINGS, FORM_SETTINGS } from '@/declarations/configurations/settings'
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
 * Map an absence row to its display shape
 * @param {AbsenceRow} row - Absence row with its references
 * @return {MemberAbsence} - List row
 */

const toAbsence = (row: AbsenceRow): MemberAbsence => ({
  id: row.id,
  accountId: row.accountId,
  memberName: row.account.displayName,
  startDate: row.startDate.toISOString(),
  endDate: row.endDate.toISOString(),
  dayCount: row.dayCount,
  reason: row.reason,
  status: row.status,
  reviewerName: row.reviewer?.displayName ?? null,
  reviewNote: row.reviewNote,
})

/**
 * Declarations of the absence form
 * @type {FieldDefinition[]}
 */

export const ABSENCE_FIELDS: FieldDefinition[] = [
  {
    name: 'startDate',
    kind: 'date',
    label: ABSENCE_FIELD_COPY.startDate,
    required: true,
    span: 'half',
  },
  {
    name: 'endDate',
    kind: 'date',
    label: ABSENCE_FIELD_COPY.endDate,
    required: true,
    span: 'half',
  },
  {
    name: 'reason',
    kind: 'textarea',
    label: ABSENCE_FIELD_COPY.reason,
    hint: ABSENCE_FIELD_COPY.reasonHint,
    maxLength: FORM_SETTINGS.longTextMaxLength,
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
 * Read the absences of one member
 * @param {string} accountId - Account identifier
 * @return {Promise<MemberAbsence[]>} - Absences
 */

export const listOwnAbsences = async (accountId: string): Promise<MemberAbsence[]> => {
  const rows = await prisma.absence.findMany({
    where: { accountId },
    include: ABSENCE_INCLUDE,
    orderBy: { startDate: 'desc' },
  })

  return rows.map(toAbsence)
}

/**
 * Read every absence
 * @return {Promise<MemberAbsence[]>} - Absences
 */

export const listAbsences = async (): Promise<MemberAbsence[]> => {
  const rows = await prisma.absence.findMany({
    include: ABSENCE_INCLUDE,
    orderBy: { startDate: 'desc' },
  })

  return rows.map(toAbsence)
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
  const startDate = readDate(values, 'startDate')
  const endDate = readDate(values, 'endDate')

  if (!startDate || !endDate) {
    throw invalidInput([{ field: 'startDate', message: FORM_COPY.required }])
  }

  if (endDate < startDate) {
    throw invalidInput([{ field: 'endDate', message: FORM_COPY.endBeforeStart }])
  }

  // Below the threshold there is nothing to declare, they just enjoy
  const dayCount = countDays(startDate, endDate)

  if (dayCount <= ABSENCE_SETTINGS.thresholdDays) {
    throw invalidInput([
      {
        field: 'endDate',
        message: ABSENCE_COPY.tooShort.replace('{min}', String(ABSENCE_SETTINGS.thresholdDays + 1)),
      },
    ])
  }

  if (dayCount > ABSENCE_SETTINGS.maxDays) {
    throw invalidInput([
      {
        field: 'endDate',
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
      reason: readText(values, 'reason'),
      status: AbsenceStatuses.Pending,
    },
    include: ABSENCE_INCLUDE,
  })

  return toAbsence(row)
}

/**
 * Settle an absence request
 * @param {string} id - Absence identifier
 * @param {AbsenceStatusName} status - Review outcome
 * @param {string} reviewerId - Reviewer identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<MemberAbsence>} - Reviewed absence
 */

export const reviewAbsence = async (
  id: string,
  status: AbsenceStatusName,
  reviewerId: string,
  values: FormValues
): Promise<MemberAbsence> => {
  const row = await prisma.absence.update({
    where: { id },
    data: {
      status,
      reviewerId,
      reviewedAt: new Date(),
      reviewNote: readText(values, 'reviewNote'),
    },
    include: ABSENCE_INCLUDE,
  })

  return toAbsence(row)
}

/**
 * Withdraw an absence request
 * @param {string} id - Absence identifier
 * @param {string} accountId - Account identifier
 * @param {boolean} canReview - Member may act on anyone
 * @return {Promise<void>} - Removed
 */

export const removeAbsence = async (
  id: string,
  accountId: string,
  canReview: boolean
): Promise<void> => {
  const row = await prisma.absence.findUnique({ where: { id } })
  if (!row) throw notFound()

  // A member only withdraws their own request
  if (!canReview && row.accountId !== accountId) throw notFound()

  await prisma.absence.delete({ where: { id } })
}
