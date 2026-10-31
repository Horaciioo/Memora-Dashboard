import 'server-only'

import { decisionEffect, decisionsFor } from '@/core/lib/academy/parkour'
import { prisma } from '@/core/lib/db'
import type { AcademyScope } from '@/core/services/academy/AcademyScope'
import { conflict, invalidInput } from '@/core/lib/errors'
import { readDate, readNumberValue, readText } from '@/core/lib/forms/values'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import type { AcademyReviewView } from '@/types/academy'
import type { FormValues } from '@/types/forms'
import { AcademyStages, ReviewAdvices, ReviewStatuses } from '@/utils/constants/hierarchy'
import type {
  AcademyStageName,
  ReviewAdviceName,
  ReviewStatusName,
} from '@/utils/constants/hierarchy'
import { juniorInScope, reviewInScope, sessionTrainings } from '@/core/services/academy/lookups'

/**
 * Shape one voice check-in
 * @param {object} row - Review row
 * @return {AcademyReviewView} - Review view
 */

const toReview = (row: {
  id: string
  stage: AcademyStageName
  heldAt: Date
  durationMinutes: number | null
  feeling: string | null
  summary: string
  advice: ReviewAdviceName
  decision: ReviewAdviceName | null
  status: ReviewStatusName
  decidedAt: Date | null
  decisionNote: string | null
  author: { displayName: string; avatarUrl: string | null } | null
  decidedBy: { displayName: string } | null
}): AcademyReviewView => ({
  id: row.id,
  stage: row.stage,
  heldAt: row.heldAt.toISOString(),
  durationMinutes: row.durationMinutes,
  authorName: row.author?.displayName ?? null,
  authorAvatar: row.author?.avatarUrl ?? null,
  feeling: row.feeling,
  summary: row.summary,
  advice: row.advice,
  decision: row.decision,
  status: row.status,
  decidedByName: row.decidedBy?.displayName ?? null,
  decidedAt: row.decidedAt?.toISOString() ?? null,
  decisionNote: row.decisionNote,
  values: {
    stage: row.stage,
    heldAt: row.heldAt.toISOString().slice(0, 10),
    durationMinutes: row.durationMinutes,
    feeling: row.feeling,
    summary: row.summary,
    advice: row.advice,
  },
})

// Everything a review row needs to become a view
const REVIEW_SHAPE = { author: true, decidedBy: true } as const

/**
 * Read the voice check-ins of a junior within scope
 * @param {string} juniorId - Junior identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<AcademyReviewView[]>} - Reviews
 */

export const listReviews = async (
  juniorId: string,
  scope: AcademyScope
): Promise<AcademyReviewView[]> => {
  await juniorInScope(juniorId, scope)

  const rows = await prisma.academyReview.findMany({
    where: { juniorId },
    include: REVIEW_SHAPE,
    orderBy: { heldAt: 'desc' },
  })

  return rows.map(toReview)
}

/**
 * Turn parsed values into a review payload
 * @param {FormValues} values - Parsed body
 * @return {object} - Database payload
 */

const toReviewData = (values: FormValues) => ({
  stage: (readText(values, 'stage') ?? AcademyStages.ReviewOne) as AcademyStageName,
  heldAt: readDate(values, 'heldAt') ?? new Date(),
  durationMinutes: readNumberValue(values, 'durationMinutes'),
  feeling: readText(values, 'feeling'),
  summary: readText(values, 'summary') ?? '',
  advice: (readText(values, 'advice') ?? ReviewAdvices.Pass) as ReviewAdviceName,
})

/**
 * Write the trace of a voice check-in
 * @param {string} juniorId - Junior identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @param {string} authorId - Who held it
 * @param {FormValues} values - Parsed body
 * @return {Promise<AcademyReviewView[]>} - Reviews
 */

export const createReview = async (
  juniorId: string,
  scope: AcademyScope,
  authorId: string,
  values: FormValues
): Promise<AcademyReviewView[]> => {
  await juniorInScope(juniorId, scope)
  await prisma.academyReview.create({ data: { juniorId, authorId, ...toReviewData(values) } })

  return listReviews(juniorId, scope)
}

/**
 * Edit the trace of a voice check-in
 * @param {string} id - Review identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @param {FormValues} values - Parsed body
 * @return {Promise<AcademyReviewView[]>} - Reviews
 */

export const updateReview = async (
  id: string,
  scope: AcademyScope,
  values: FormValues
): Promise<AcademyReviewView[]> => {
  const existing = await reviewInScope(id, scope)
  if (existing.status !== ReviewStatuses.Draft) throw conflict()

  const row = await prisma.academyReview.update({ where: { id }, data: toReviewData(values) })

  return listReviews(row.juniorId, scope)
}

/**
 * Drop the trace of a voice check-in
 * @param {string} id - Review identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<AcademyReviewView[]>} - Reviews
 */

export const removeReview = async (
  id: string,
  scope: AcademyScope
): Promise<AcademyReviewView[]> => {
  const existing = await reviewInScope(id, scope)
  if (existing.status === ReviewStatuses.Validated) throw conflict()

  const row = await prisma.academyReview.delete({ where: { id } })

  return listReviews(row.juniorId, scope)
}

/**
 * Submit a check-in for decision
 * @param {string} id - Review identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<AcademyReviewView[]>} - Reviews
 */

export const submitReview = async (
  id: string,
  scope: AcademyScope
): Promise<AcademyReviewView[]> => {
  const existing = await reviewInScope(id, scope)
  if (existing.status !== ReviewStatuses.Draft) throw conflict()

  const row = await prisma.academyReview.update({
    where: { id },
    data: { status: ReviewStatuses.Submitted },
  })

  return listReviews(row.juniorId, scope)
}

/**
 * Refuse a graduation while a mandatory training is still open
 * @param {{ session: { functionId: string }, dispositifId: string, accountId: string }} junior - Junior being closed
 * @return {Promise<void>} - Throws when a training is still pending
 */

const ensureTrainingsCleared = async (junior: {
  session: { functionId: string }
  dispositifId: string | null
  accountId: string
}): Promise<void> => {
  const [trainings, records] = await Promise.all([
    sessionTrainings(junior.session.functionId, junior.dispositifId),
    prisma.trainingRecord.findMany({ where: { accountId: junior.accountId } }),
  ])

  const completed = new Set(
    records.filter((record) => record.completedAt !== null).map((record) => record.trainingId)
  )
  const mandatoryPending = trainings.some(
    (training) => training.mandatory && !completed.has(training.id)
  )

  if (mandatoryPending) throw conflict(ACADEMY_COPY.mandatoryPending)
}

/**
 * Decide a submitted check-in: the responsable keeps an outcome
 * @param {string} id - Review identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @param {string} decidedById - Who decided
 * @param {FormValues} values - Parsed body
 * @return {Promise<AcademyReviewView[]>} - Reviews
 */

export const decideReview = async (
  id: string,
  scope: AcademyScope,
  decidedById: string,
  values: FormValues
): Promise<AcademyReviewView[]> => {
  const existing = await reviewInScope(id, scope)
  if (existing.status !== ReviewStatuses.Submitted) throw conflict()

  // Sent back to the trainer
  if (readText(values, 'status') === ReviewStatuses.Rejected) {
    await prisma.academyReview.update({
      where: { id },
      data: {
        status: ReviewStatuses.Draft,
        decisionNote: readText(values, 'decisionNote'),
      },
    })

    return listReviews(existing.juniorId, scope)
  }

  const decision = readText(values, 'decision') as ReviewAdviceName | null
  if (!decision || !decisionsFor(existing.stage).includes(decision)) {
    throw invalidInput([{ field: 'decision', message: FORM_COPY.notAnOption }])
  }

  // Graduating asks for every mandatory training done
  if (decisionEffect(existing.stage, decision) === 'graduate') {
    const junior = await prisma.academyJunior.findUniqueOrThrow({
      where: { id: existing.juniorId },
      include: { session: true },
    })
    await ensureTrainingsCleared(junior)
  }

  await prisma.academyReview.update({
    where: { id },
    data: {
      status: ReviewStatuses.Validated,
      decision,
      decidedById,
      decidedAt: new Date(),
      decisionNote: readText(values, 'decisionNote'),
    },
  })

  return listReviews(existing.juniorId, scope)
}
