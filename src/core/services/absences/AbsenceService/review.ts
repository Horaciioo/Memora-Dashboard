import 'server-only'
import { encryptField } from '@/core/lib/crypto'
import { prisma } from '@/core/lib/db'
import { forbidden, notFound } from '@/core/lib/errors'
import { readText } from '@/core/lib/forms/values'
import { readLedCreatorIds } from '@/core/services/auth/LeadService'
import type { FormValues } from '@/types/forms'
import type { MemberAbsence } from '@/types/members'
import { AbsenceStatuses } from '@/utils/constants/workflow'
import type { AbsenceStatusName } from '@/utils/constants/workflow'
import type { Prisma } from '@prisma/client'
import { ABSENCE_INCLUDE, toAbsence } from '@/core/services/absences/AbsenceService/shape'

/**
 * Creators a reviewer answers for
 * @param {string} reviewerId - Reviewer account identifier
 * @return {Promise<string[]>} - Creator identifiers
 */

const reviewerCreatorIds = async (reviewerId: string): Promise<string[]> => {
  const [teams, anchored, own] = await Promise.all([
    prisma.team.findMany({
      where: { leads: { some: { accountId: reviewerId } }, archived: false },
      select: { youtuberId: true },
    }),
    readLedCreatorIds(reviewerId),
    prisma.account.findUnique({
      where: { id: reviewerId },
      select: { youtubers: { select: { id: true } } },
    }),
  ])

  const led = teams.map((team) => team.youtuberId).filter((id): id is string => id !== null)

  return [...new Set([...led, ...anchored, ...(own?.youtubers.map((row) => row.id) ?? [])])]
}

/**
 * Accounts a reviewer answers for
 * @param {string} reviewerId - Reviewer account identifier
 * @return {Promise<Prisma.AccountWhereInput>} - Owner filter
 */

const reviewedAccounts = async (reviewerId: string): Promise<Prisma.AccountWhereInput> => {
  const creatorIds = await reviewerCreatorIds(reviewerId)

  return {
    OR: [
      { teamMemberships: { some: { team: { leads: { some: { accountId: reviewerId } } } } } },
      { youtubers: { some: { id: { in: creatorIds } } } },
    ],
  }
}

/**
 * Check a reviewer may act on one account's absences
 * @param {string} reviewerId - Reviewer account identifier
 * @param {string} accountId - Absence owner identifier
 * @param {boolean} isAdmin - Reviewer holds the admin level
 * @return {Promise<boolean>} - Authorised
 */

export const canReviewAbsence = async (
  reviewerId: string,
  accountId: string,
  isAdmin: boolean
): Promise<boolean> => {
  if (isAdmin) return true

  // Never one's own request
  if (reviewerId === accountId) return false

  const owner = await prisma.account.findFirst({
    where: { id: accountId, ...(await reviewedAccounts(reviewerId)) },
    select: { id: true },
  })

  return owner !== null
}

/**
 * Read the pending requests one reviewer may settle
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
        : { account: { AND: [await reviewedAccounts(reviewerId), { id: { not: reviewerId } }] } }),
    },
    include: ABSENCE_INCLUDE,
    orderBy: { startDate: 'asc' },
  })

  return rows.map((row) => toAbsence(row, row.account.displayName))
}

/**
 * Responsable posting on someone's behalf
 * @typedef {Object} AbsenceApproval
 * @property {string} reviewerId - Responsable identifier
 * @property {boolean} isAdmin - Holds the admin level
 */

export interface AbsenceApproval {
  reviewerId: string
  isAdmin: boolean
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
