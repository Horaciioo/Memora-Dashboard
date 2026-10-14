import 'server-only'

import { encryptField } from '@/core/lib/crypto'
import { prisma } from '@/core/lib/db'
import { forbidden, notFound } from '@/core/lib/errors'
import { readList, readText } from '@/core/lib/forms/values'
import { isInterviewLocked } from '@/core/lib/recruitment/interviewLock'
import { CANDIDATE_STAGES } from '@/core/lib/recruitment/candidateTimeline'
import { stepKey } from '@/core/lib/recruitment/exercises'
import { secondaryKeys } from '@/core/lib/recruitment/questionnaire'
import { candidateSession } from '@/core/services/recruitment/RecruitmentService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { QUESTION_BANK } from '@/declarations/recruitment/questionnaire'
import type { FormValues } from '@/types/forms'
import type { AnswerState, RecruitmentRights } from '@/types/recruitment'
import { AnswerAppreciations } from '@/utils/constants/recruitment'

// Questions a session may keep
const QUESTION_KEYS = new Set(
  QUESTION_BANK.flatMap((question) => [
    question.key,
    ...secondaryKeys(question),
    ...(question.steps ?? []).map((_, index) => stepKey(question.key, index)),
  ])
)

/**
 * Part of an answer the recruiter changed
 * @typedef {Object} AnswerPatch
 * @property {string} [notes] - Free notes
 * @property {string | null} [appreciation] - Reaction
 * @property {boolean} [skipped] - Left out
 */

export type AnswerPatch = Partial<AnswerState>

/**
 * Read an answer patch off a raw body
 * @param {Record<string, unknown>} raw - Untouched body
 * @return {AnswerPatch} - Valid fields only
 */

export const readAnswerPatch = (raw: Record<string, unknown>): AnswerPatch => {
  const patch: AnswerPatch = {}

  if (typeof raw.notes === 'string') {
    patch.notes = raw.notes.slice(0, FORM_SETTINGS.markdownMaxLength)
  }
  if (typeof raw.skipped === 'boolean') patch.skipped = raw.skipped
  if (raw.appreciation === null) patch.appreciation = null
  if (
    raw.appreciation === AnswerAppreciations.Like ||
    raw.appreciation === AnswerAppreciations.Neutral ||
    raw.appreciation === AnswerAppreciations.Dislike
  ) {
    patch.appreciation = raw.appreciation
  }

  return patch
}

/**
 * Write what the recruiter noted on one question of one candidate
 * @param {string} candidateId - Candidate identifier
 * @param {string} questionKey - Question of the bank
 * @param {AnswerPatch} patch - Fields changed
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<{ sessionId: string, created: boolean }>} - Session and whether the row is new
 */

export const saveAnswer = async (
  candidateId: string,
  questionKey: string,
  patch: AnswerPatch,
  scope: AccessScope
): Promise<{ sessionId: string; created: boolean }> => {
  if (!QUESTION_KEYS.has(questionKey)) throw notFound()

  const sessionId = await candidateSession(candidateId, scope)
  const key = { candidateId_questionKey: { candidateId, questionKey } }
  const existing = await prisma.recruitmentAnswer.findUnique({ where: key, select: { id: true } })

  const data = {
    ...(patch.notes !== undefined ? { notes: encryptField(patch.notes) ?? '' } : {}),
    ...(patch.appreciation !== undefined ? { appreciation: patch.appreciation } : {}),
    ...(patch.skipped !== undefined ? { skipped: patch.skipped } : {}),
  }

  await prisma.recruitmentAnswer.upsert({
    where: key,
    create: { candidateId, questionKey, ...data },
    update: data,
  })

  return { sessionId, created: existing === null }
}

/**
 * Tick or untick one moment of a candidate timeline
 * @param {string} candidateId - Candidate identifier
 * @param {string} stage - Moment key
 * @param {boolean} done - Wanted state
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<Record<string, boolean>>} - Marks after the change
 */

export const markStage = async (
  candidateId: string,
  stage: string,
  done: boolean,
  scope: AccessScope
): Promise<Record<string, boolean>> => {
  if (!(CANDIDATE_STAGES as readonly string[]).includes(stage)) throw notFound()

  await candidateSession(candidateId, scope)
  const row = await prisma.recruitmentCandidate.findUniqueOrThrow({
    where: { id: candidateId },
    select: { stageMarks: true },
  })

  const marks = { ...(row.stageMarks as Record<string, boolean>), [stage]: done }
  await prisma.recruitmentCandidate.update({
    where: { id: candidateId },
    data: { stageMarks: marks },
  })

  return marks
}

/**
 * Refuse a change to a finished interview unless the viewer may reopen it
 * @param {string} candidateId - Candidate identifier
 * @param {Pick<RecruitmentRights, 'manage' | 'viewerId'>} viewer - Who writes
 * @param {FormValues} [seats] - New recruiter and observers, when only those are guarded
 * @return {Promise<void>} - Resolves when allowed
 */

export const assertInterviewOpen = async (
  candidateId: string,
  viewer: Pick<RecruitmentRights, 'manage' | 'viewerId'>,
  seats?: FormValues
): Promise<void> => {
  const row = await prisma.recruitmentCandidate.findUniqueOrThrow({
    where: { id: candidateId },
    select: { attended: true, recruiterId: true, observers: { select: { accountId: true } } },
  })
  if (!isInterviewLocked(row.attended, row.recruiterId, viewer)) return
  if (!seats) throw forbidden()

  const sitting = row.observers.map((seat) => seat.accountId).sort()
  const wanted = [...readList(seats, 'observerIds')].sort()
  const isSame =
    readText(seats, 'recruiterId') === row.recruiterId &&
    sitting.length === wanted.length &&
    sitting.every((id, index) => id === wanted[index])
  if (!isSame) throw forbidden()
}
