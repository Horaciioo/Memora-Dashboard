import 'server-only'
import { encryptField } from '@/core/lib/crypto'
import { prisma } from '@/core/lib/db'
import { forbidden, invalidInput, notFound } from '@/core/lib/errors'
import { readDateRange, readText } from '@/core/lib/forms/values'
import { ABSENCE_SETTINGS, PAGINATION_SETTINGS } from '@/declarations/configurations/settings'
import { ABSENCE_COPY } from '@/declarations/absences/copy'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import type { FormValues } from '@/types/forms'
import type { MemberAbsence } from '@/types/members'
import { AbsenceStatuses } from '@/utils/constants/workflow'
import { countDays } from '@/utils/format/time/dates'
import {
  ABSENCE_INCLUDE,
  absenceDay,
  toAbsence,
} from '@/core/services/absences/AbsenceService/shape'
import { canReviewAbsence } from '@/core/services/absences/AbsenceService/review'
import type { AbsenceApproval } from '@/core/services/absences/AbsenceService/review'

/**
 * Read the absences of one member
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
 * Validated span of an absence form
 * @param {FormValues} values - Parsed body
 * @return {{ startDate: Date, endDate: Date, dayCount: number }} - Checked span
 */

const readSpan = (values: FormValues): { startDate: Date; endDate: Date; dayCount: number } => {
  const range = readDateRange(values, 'dates')

  if (!range) {
    throw invalidInput([{ field: 'dates', message: FORM_COPY.required }])
  }

  const [startDate, endDate] = range

  if (endDate < startDate) {
    throw invalidInput([{ field: 'dates', message: FORM_COPY.endBeforeStart }])
  }

  // Below the threshold there is nothing to declare
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

  return { startDate, endDate, dayCount }
}

/**
 * Refuse a span that crosses an absence still counting
 * @param {string} accountId - Owner of the absence
 * @param {Date} startDate - First day
 * @param {Date} endDate - Last day
 * @param {string} [exceptId] - Absence being edited
 * @return {Promise<void>}
 */

const assertFree = async (
  accountId: string,
  startDate: Date,
  endDate: Date,
  exceptId?: string
): Promise<void> => {
  const clash = await prisma.absence.findFirst({
    where: {
      accountId,
      id: exceptId ? { not: exceptId } : undefined,
      status: { in: [AbsenceStatuses.Pending, AbsenceStatuses.Approved] },
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
    select: { id: true },
  })

  if (clash) throw invalidInput([{ field: 'dates', message: ABSENCE_COPY.overlap }])
}

/**
 * Declare an absence
 * @param {string} accountId - Account identifier
 * @param {FormValues} values - Parsed body
 * @param {AbsenceApproval} [approval] - Posting responsable
 * @return {Promise<MemberAbsence>} - Created absence
 */

export const createAbsence = async (
  accountId: string,
  values: FormValues,
  approval?: AbsenceApproval
): Promise<MemberAbsence> => {
  // Only for someone they lead
  if (approval && !(await canReviewAbsence(approval.reviewerId, accountId, approval.isAdmin))) {
    throw forbidden()
  }

  const { startDate, endDate, dayCount } = readSpan(values)
  await assertFree(accountId, startDate, endDate)

  const row = await prisma.absence.create({
    data: {
      accountId,
      startDate,
      endDate,
      dayCount,
      reason: encryptField(readText(values, 'reason')),
      ...(approval
        ? {
            status: AbsenceStatuses.Approved,
            reviewerId: approval.reviewerId,
            reviewedAt: new Date(),
          }
        : { status: AbsenceStatuses.Pending }),
    },
    include: ABSENCE_INCLUDE,
  })

  return toAbsence(row, row.account.displayName)
}

/**
 * Edit the dates and the reason of a current absence, by its owner or a responsable
 * @param {string} id - Absence identifier
 * @param {string} reviewerId - Editing member identifier
 * @param {boolean} isAdmin - Editor holds the admin level
 * @param {FormValues} values - Parsed body
 * @return {Promise<MemberAbsence>} - Edited absence
 */

export const updateAbsence = async (
  id: string,
  reviewerId: string,
  isAdmin: boolean,
  values: FormValues
): Promise<MemberAbsence> => {
  const current = await prisma.absence.findUnique({ where: { id } })
  if (!current) throw notFound()

  // The owner moves their own, anyone else needs a review right
  const isOwner = current.accountId === reviewerId
  if (!isOwner && !(await canReviewAbsence(reviewerId, current.accountId, isAdmin))) {
    throw forbidden()
  }

  // Only a current absence can move
  const today = absenceDay()

  if (
    current.status === AbsenceStatuses.Refused ||
    current.status === AbsenceStatuses.Cancelled ||
    current.endDate < today
  ) {
    throw forbidden()
  }

  const { startDate, endDate, dayCount } = readSpan(values)
  await assertFree(current.accountId, startDate, endDate, id)

  const row = await prisma.absence.update({
    where: { id },
    data: {
      startDate,
      endDate,
      dayCount,
      // Unsent reason stays
      ...('reason' in values ? { reason: encryptField(readText(values, 'reason')) } : {}),
      // New dates need a new look from the responsables
      ...(isOwner && !isAdmin && current.status === AbsenceStatuses.Approved
        ? {
            status: AbsenceStatuses.Pending,
            reviewerId: null,
            reviewedAt: null,
            reviewNote: null,
          }
        : {}),
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

  // Anyone else needs the review permission
  if (!hasReviewPermission || !(await canReviewAbsence(requesterId, row.accountId, isAdmin))) {
    throw notFound()
  }

  await prisma.absence.delete({ where: { id } })
}
