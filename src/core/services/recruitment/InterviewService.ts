import 'server-only'

import { prisma } from '@/core/lib/db'
import { forbidden, notFound } from '@/core/lib/errors'
import { readList } from '@/core/lib/forms/values'
import { isInterviewLocked } from '@/core/lib/recruitment/interviewLock'
import { CANDIDATE_STAGES, marksAt } from '@/core/lib/recruitment/candidateTimeline'
import type { CandidateStage } from '@/core/lib/recruitment/candidateTimeline'
import { stepKey } from '@/core/lib/recruitment/exercises'
import { secondaryKeys } from '@/core/lib/recruitment/questionnaire'
import { candidateSession } from '@/core/services/recruitment'
import { syncAdmission } from '@/core/services/academy/AdmissionService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { VERDICT_OUTCOMES } from '@/declarations/reference/fixed'
import { QUESTION_BANK } from '@/declarations/recruitment/questionnaire'
import type { FormValues } from '@/types/forms'
import type { AnswerState, InterviewPatch, RecruitmentRights } from '@/types/recruitment'
import { AnswerAppreciations } from '@/utils/constants/recruitment'

// Stable key of a branch
const BRANCH_KEY = /^\w{1,60}$/

/**
 * Keys a comment or an answer may carry
 * @type {Set<string>}
 */

export const QUESTION_KEYS = new Set(
  QUESTION_BANK.flatMap((question) => [
    question.key,
    ...secondaryKeys(question),
    ...(question.steps ?? []).map((_, index) => stepKey(question.key, index)),
  ])
)

/**
 * Part of an answer the recruiter changed
 * @typedef {Object} AnswerPatch
 * @property {string | null} [branch] - Branch unfolded
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

  if (raw.branch === null || (typeof raw.branch === 'string' && BRANCH_KEY.test(raw.branch))) {
    patch.branch = raw.branch
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
): Promise<{ sessionId: string; created: boolean; answer: AnswerState }> => {
  if (!QUESTION_KEYS.has(questionKey)) throw notFound()

  const sessionId = await candidateSession(candidateId, scope)
  const key = { candidateId_questionKey: { candidateId, questionKey } }
  const existing = await prisma.recruitmentAnswer.findUnique({ where: key, select: { id: true } })

  const data = {
    ...(patch.branch !== undefined ? { branch: patch.branch } : {}),
    ...(patch.appreciation !== undefined ? { appreciation: patch.appreciation } : {}),
    ...(patch.skipped !== undefined ? { skipped: patch.skipped } : {}),
  }

  const answer = await prisma.recruitmentAnswer.upsert({
    where: key,
    create: { candidateId, questionKey, ...data },
    update: data,
    select: { branch: true, appreciation: true, skipped: true },
  })

  return { sessionId, created: existing === null, answer }
}

/**
 * Read an interview patch off a raw body
 * @param {Record<string, unknown>} raw - Untouched body
 * @return {InterviewPatch} - Valid fields only
 */

export const readInterviewPatch = (raw: Record<string, unknown>): InterviewPatch => {
  const patch: InterviewPatch = {}

  if (typeof raw.formal === 'boolean') patch.formal = raw.formal
  if (typeof raw.started === 'boolean') patch.started = raw.started
  if (typeof raw.ended === 'boolean') patch.ended = raw.ended
  if (raw.verdictOutcomeId === null || typeof raw.verdictOutcomeId === 'string') {
    patch.verdictOutcomeId = raw.verdictOutcomeId
  }

  return patch
}

/**
 * Write the register, the start and the verdict of an interview
 * @param {string} candidateId - Candidate identifier
 * @param {InterviewPatch} patch - Fields changed
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<{ sessionId: string }>} - Session of the candidate
 */

export const saveInterview = async (
  candidateId: string,
  patch: InterviewPatch,
  scope: AccessScope
): Promise<{ sessionId: string }> => {
  const sessionId = await candidateSession(candidateId, scope)
  const current = await prisma.recruitmentCandidate.findUniqueOrThrow({
    where: { id: candidateId },
    select: { interviewStartedAt: true },
  })

  // Verdict only lands on a verdict outcome
  if (patch.verdictOutcomeId) {
    const outcome = await prisma.recruitmentOutcome.findUnique({
      where: { id: patch.verdictOutcomeId },
      select: { name: true },
    })
    if (!outcome || !VERDICT_OUTCOMES.includes(outcome.name)) throw notFound()
  }

  const now = new Date()
  const isVerdict = patch.verdictOutcomeId !== undefined

  await prisma.recruitmentCandidate.update({
    where: { id: candidateId },
    data: {
      ...(patch.formal !== undefined ? { formal: patch.formal } : {}),
      // First opening wins
      ...(patch.started && !current.interviewStartedAt ? { interviewStartedAt: now } : {}),
      ...(patch.ended !== undefined ? { interviewEndedAt: patch.ended ? now : null } : {}),
      ...(isVerdict
        ? { outcomeId: patch.verdictOutcomeId, verdictAt: patch.verdictOutcomeId ? now : null }
        : {}),
    },
  })

  // Ending the interview kills every link handed out
  if (patch.ended) {
    await prisma.exerciseLink.updateMany({
      where: { candidateId, expiredAt: null },
      data: { expiredAt: now },
    })
  }

  if (isVerdict) await syncAdmission(candidateId)

  return { sessionId }
}

/**
 * Put a candidate on one moment of their timeline
 * @param {string} candidateId - Candidate identifier
 * @param {string} stage - Moment key
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<Record<string, boolean>>} - Marks after the change
 */

export const markStage = async (
  candidateId: string,
  stage: string,
  scope: AccessScope
): Promise<Record<string, boolean>> => {
  if (!(CANDIDATE_STAGES as readonly string[]).includes(stage)) throw notFound()

  await candidateSession(candidateId, scope)
  const marks = marksAt(stage as CandidateStage)
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
 * @param {FormValues} [seats] - New observers, recruiters may always move
 * @return {Promise<void>} - Resolves when allowed
 */

export const assertInterviewOpen = async (
  candidateId: string,
  viewer: Pick<RecruitmentRights, 'manage' | 'viewerId'>,
  seats?: FormValues
): Promise<void> => {
  const row = await prisma.recruitmentCandidate.findUniqueOrThrow({
    where: { id: candidateId },
    select: {
      verdictAt: true,
      recruiters: { select: { accountId: true } },
      observers: { select: { accountId: true } },
    },
  })
  const leading = row.recruiters.map((seat) => seat.accountId)
  if (!isInterviewLocked(row.verdictAt !== null, leading, viewer)) return
  if (!seats) throw forbidden()

  const sameSeats = (current: string[], submitted: string[]) => {
    const wanted = [...submitted].sort()

    return (
      current.length === wanted.length && [...current].sort().every((id, i) => id === wanted[i])
    )
  }
  const isSame = sameSeats(
    row.observers.map((seat) => seat.accountId),
    readList(seats, 'observerIds')
  )
  if (!isSame) throw forbidden()
}
