import 'server-only'

import { identifiersForCreator } from '@/core/services/discord/DiscordIdentifierService'
import { prisma } from '@/core/lib/db'
import { sessionNumbers } from '@/core/services/academy/AcademyService'
import { notFound } from '@/core/lib/errors'
import { STEP_ORDER } from '@/core/lib/recruitment/stepState'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { readPortraits } from '@/core/services/recruitment/CandidatePortraits'
import { toLinkView } from '@/core/services/onboarding/IntegrationLinkService'
import { recommendedKeys } from '@/core/lib/recruitment/questionnaire'
import type {
  RecruitmentDetail,
  RecruitmentOutcomeView,
  RecruitmentStepView,
  RecruitmentSummary,
} from '@/types/recruitment'
import { COMMENT_SHAPE, toComment } from '@/core/services/academy/juniors/CommentService'
import { SUMMARY_INCLUDE, toSummary, toCandidate } from '@/core/services/recruitment/shape'
import { sessionScope } from '@/core/services/recruitment/reach'

/**
 * Read every session in perimeter
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<RecruitmentSummary[]>} - Session headers
 */

export const listSessions = async (scope: AccessScope): Promise<RecruitmentSummary[]> => {
  const rows = await prisma.recruitmentSession.findMany({
    where: sessionScope(scope),
    orderBy: [{ opensAt: 'desc' }, { createdAt: 'desc' }],
    include: SUMMARY_INCLUDE,
  })

  const numbers = await sessionNumbers()

  // One grouped count rather than one query per session
  const attended = await prisma.recruitmentCandidate.groupBy({
    by: ['sessionId'],
    where: { sessionId: { in: rows.map((row) => row.id) }, attended: true },
    _count: { _all: true },
  })

  const attendedBySession = new Map(attended.map((row) => [row.sessionId, row._count._all]))

  return rows.map((row) => toSummary(row, numbers, attendedBySession.get(row.id) ?? 0))
}

/**
 * Read one session in full
 * @param {string} id - Session identifier
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<RecruitmentDetail>} - Everything the session page renders
 */

export const readSession = async (id: string, scope: AccessScope): Promise<RecruitmentDetail> => {
  const row = await prisma.recruitmentSession.findFirst({
    where: { AND: [{ id }, sessionScope(scope)] },
    include: {
      ...SUMMARY_INCLUDE,
      steps: { orderBy: [...STEP_ORDER] },
      comments: { orderBy: { createdAt: 'asc' }, include: COMMENT_SHAPE },
      invite: true,
      candidates: {
        orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
        include: {
          recruiter: true,
          observers: { include: { account: true } },
          comments: { orderBy: { createdAt: 'desc' }, include: { author: true } },
          answers: true,
        },
      },
    },
  })

  if (!row) throw notFound()

  const [outcomes, members] = await Promise.all([
    prisma.recruitmentOutcome.findMany({
      where: { archived: false },
      orderBy: { position: 'asc' },
    }),
    // The Discord identifier is the only bridge to a moderator file
    prisma.account.findMany({
      where: { discordId: { in: row.candidates.map((candidate) => candidate.discordId) } },
      select: { id: true, discordId: true, displayName: true },
    }),
  ])

  const byDiscordId = new Map(members.map((member) => [member.discordId, member]))
  const portraits = await readPortraits(row.candidates.map((candidate) => candidate.discordId))
  const attendedCount = row.candidates.filter((candidate) => candidate.attended).length

  const steps: RecruitmentStepView[] = row.steps.map((step) => ({
    id: step.id,
    title: step.title,
    notes: step.notes,
    owner: step.owner,
    offset: step.offset,
    scheduledAt: step.scheduledAt?.toISOString() ?? null,
    doneAt: step.doneAt?.toISOString() ?? null,
    required: step.required,
    emitsInvite: step.emitsInvite,
    position: step.position,
  }))

  const outcomeViews: RecruitmentOutcomeView[] = outcomes.map((outcome) => ({
    id: outcome.id,
    label: outcome.name,
    accent: outcome.accent,
    isTerminal: outcome.isTerminal,
  }))

  return {
    summary: toSummary(row, await sessionNumbers(), attendedCount),
    instructions: row.instructions,
    comments: row.comments.map(toComment),
    candidates: row.candidates.map((candidate) => toCandidate(candidate, byDiscordId, portraits)),
    steps,
    // A session nobody configured asks the suggested pick
    questionKeys: row.questionKeys.length > 0 ? row.questionKeys : recommendedKeys(row.platform),
    outcomes: outcomeViews,
    link: row.invite ? toLinkView(row.invite) : null,
    identifiers: await identifiersForCreator(row.youtuberId),
  }
}
