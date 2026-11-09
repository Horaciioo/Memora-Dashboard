import 'server-only'
import { decryptField } from '@/core/lib/crypto'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { ABSENCE_FIELD_COPY, ABSENCE_FIELD_INFO } from '@/declarations/absences/copy'
import { DEFAULT_ZONE } from '@/declarations/ui/dates'
import type { FieldDefinition } from '@/types/forms'
import type { MemberAbsence } from '@/types/members'
import { AbsenceStatuses } from '@/utils/constants/workflow'
import { instantToWall } from '@/utils/format/time/zone'
import type { Prisma } from '@prisma/client'

// Relations every absence row needs
export const ABSENCE_INCLUDE = {
  account: true,
  reviewer: true,
} satisfies Prisma.AbsenceInclude

type AbsenceRow = Prisma.AbsenceGetPayload<{ include: typeof ABSENCE_INCLUDE }>

/**
 * Team day of a moment
 * @param {Date} [moment] - Instant
 * @return {Date} - Day as stored
 */

export const absenceDay = (moment: Date = new Date()): Date =>
  new Date(`${instantToWall(moment, DEFAULT_ZONE).slice(0, 10)}T00:00:00.000Z`)

/**
 * Approved absences over a window
 * @param {Date} [from] - Window start
 * @param {Date} [to] - Window end
 * @return {Prisma.AbsenceWhereInput} - Absence clause
 */

export const activeAbsenceFilter = (
  from: Date = new Date(),
  to: Date = from
): Prisma.AbsenceWhereInput => ({
  status: AbsenceStatuses.Approved,
  startDate: { lte: absenceDay(to) },
  endDate: { gte: absenceDay(from) },
})

/**
 * Map an absence row to its display shape
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
  reason: decryptField(row.reason),
  status: row.status,
  reviewNote: decryptField(row.reviewNote),
})

/**
 * Declarations of the absence form
 * @type {FieldDefinition[]}
 */

export const ABSENCE_FIELDS: FieldDefinition[] = [
  {
    name: 'dates',
    kind: 'daterange',
    dayOnly: true,
    label: ABSENCE_FIELD_COPY.dates,
    info: ABSENCE_FIELD_INFO.dates,
    required: true,
  },
  // Free text is kept for logistics only
  {
    name: 'reason',
    kind: 'textarea',
    label: ABSENCE_FIELD_COPY.reason,
    info: ABSENCE_FIELD_INFO.reason,
    hint: ABSENCE_FIELD_COPY.reasonHint,
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
    info: ABSENCE_FIELD_INFO.reviewNote,
    maxLength: FORM_SETTINGS.longTextMaxLength,
  },
]
