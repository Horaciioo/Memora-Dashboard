import 'server-only'

import { decryptField } from '@/core/lib/crypto'
import { prisma } from '@/core/lib/db'
import { conflict, invalidInput } from '@/core/lib/errors'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import type { CommentView } from '@/types/comments'
import type {
  AnswerState,
  CandidateView,
  RecruitmentRef,
  RecruitmentStepView,
  RecruitmentSummary,
} from '@/types/recruitment'
import { sessionTitle } from '@/utils/format/academy'
import type { RecruitmentOwnerName } from '@/utils/constants/recruitment'
import { PART_BANNER_SLOTS } from '@/declarations/reference/design'

/**
 * Reject a duplicate session name or a candidate already held
 * @param {unknown} error - Caught value
 * @return {never} - Always throws
 */

export const rethrow = (error: unknown): never => {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    if ((error as { code: unknown }).code === 'P2002') throw conflict()
  }

  throw error
}

/**
 * Reject a candidate whose identifier the session already holds
 * @param {unknown} error - Caught value
 * @return {never} - Always throws
 */

export const rethrowCandidate = (error: unknown): never => {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    if ((error as { code: unknown }).code === 'P2002') {
      throw invalidInput([{ field: 'discordId', message: RECRUITMENT_COPY.duplicateCandidate }])
    }
  }

  throw error
}

/**
 * Map a reference row to the shape a session header renders
 * @param {{ id: string, name: string, accent: string | null, avatarUrl?: string | null }} row - Reference row
 * @return {RecruitmentRef} - Named row
 */

export const toRef = (row: {
  id: string
  name: string
  accent: string | null
  avatarUrl?: string | null
  icon?: string | null
}): RecruitmentRef => ({
  id: row.id,
  label: row.name,
  accent: row.accent,
  image: row.avatarUrl ?? null,
  icon: row.icon ?? null,
})

// Relations every session summary reads
export const SUMMARY_INCLUDE = {
  youtuber: {
    include: {
      banners: {
        where: { slot: { in: Object.values(PART_BANNER_SLOTS) } },
        select: { url: true, slot: true },
      },
    },
  },
  jobFunction: true,
  academySession: { include: { jobFunction: true } },
  responsables: { include: { account: true } },
  recruiters: { include: { account: true } },
  observers: true,
  _count: { select: { candidates: true } },
} as const

/**
 * Session row as the list renders it
 * @typedef {Object} SummaryRow
 */

export type SummaryRow = Awaited<
  ReturnType<typeof prisma.recruitmentSession.findMany<{ include: typeof SUMMARY_INCLUDE }>>
>[number]

/**
 * Reference to a member
 * @param {{ id: string; displayName: string; avatarUrl: string | null }} account - Member row
 * @return {RecruitmentRef} - Reference
 */

export const toPersonRef = (account: {
  id: string
  displayName: string
  avatarUrl: string | null
}): RecruitmentRef => ({
  id: account.id,
  label: account.displayName,
  accent: null,
  image: account.avatarUrl,
})

/**
 * Map a session row to its summary
 * @param {SummaryRow} row - Session row
 * @param {Map<string, number>} numbers - Promotion ranks
 * @param {number} interviewedCount - Applicants who attended
 * @return {RecruitmentSummary} - Session header
 */

export const toSummary = (
  row: SummaryRow,
  numbers: Map<string, number>,
  interviewedCount: number
): RecruitmentSummary => {
  const responsables = row.responsables.map(({ account }) => toPersonRef(account))
  const recruiters = row.recruiters.map(({ account }) => toPersonRef(account))

  return {
    id: row.id,
    name: row.name,
    status: row.status,
    summary: row.summary,
    youtuber: toRef(row.youtuber),
    jobFunction: toRef(row.jobFunction),
    responsables,
    platform: row.platform,
    academySessionId: row.academySessionId,
    promotionTitle: row.academySession
      ? sessionTitle({
          function: { name: row.academySession.jobFunction.name },
          number: numbers.get(row.academySession.id) ?? 1,
        })
      : null,
    youtuberBanner: row.youtuber.bannerUrl,
    youtuberPartBanners: Object.fromEntries(
      row.youtuber.banners.flatMap(({ slot, url }) => (slot ? [[slot, url]] : []))
    ),
    youtuberLogo: row.youtuber.logoUrl,
    announcement: row.announcement,
    opensAt: row.opensAt?.toISOString() ?? null,
    closesAt: row.closesAt?.toISOString() ?? null,
    candidateCount: row._count.candidates,
    interviewedCount,
    values: {
      youtuberId: row.youtuberId,
      functionId: row.functionId,
      status: row.status,
      summary: row.summary,
      period: row.opensAt
        ? [row.opensAt.toISOString(), (row.closesAt ?? row.opensAt).toISOString()]
        : null,
      responsableIds: responsables.map((seat) => seat.id),
      recruiterIds: recruiters.map((seat) => seat.id),
      observerIds: row.observers.map((seat) => seat.accountId),
    },
  }
}

/**
 * Map a candidate row to the shape the board renders
 * @param {object} row - Candidate row with its relations
 * @param {Map<string, { id: string, displayName: string }>} members - Moderators by Discord identifier
 * @param {Map<string, string>} portraits - Discord portraits by identifier
 * @return {CandidateView} - Candidate card
 */

export const toCandidate = (
  row: {
    id: string
    discordId: string
    displayName: string | null
    formId: string | null
    interviewAt: Date | null
    attended: boolean
    formal: boolean
    interviewStartedAt: Date | null
    interviewEndedAt: Date | null
    verdictAt: Date | null
    outcomeId: string | null
    review: string
    stageMarks: unknown
    position: number
    recruiters: { account: { id: string; displayName: string; avatarUrl: string | null } }[]
    observers: { account: { id: string; displayName: string; avatarUrl: string | null } }[]
    comments: {
      id: string
      body: string
      createdAt: Date
      questionKey: string | null
      pinnedAt: Date | null
      author: { displayName: string; avatarUrl: string | null } | null
    }[]
    answers: {
      questionKey: string
      branch: string | null
      appreciation: AnswerState['appreciation']
      skipped: boolean
    }[]
  },
  members: Map<string, { id: string; displayName: string }>,
  portraits: Map<string, string>
): CandidateView => {
  const member = members.get(row.discordId) ?? null

  const comments: CommentView[] = row.comments.map((comment) => ({
    id: comment.id,
    authorName: comment.author?.displayName ?? null,
    authorAvatar: comment.author?.avatarUrl ?? null,
    body: decryptField(comment.body) ?? '',
    createdAt: comment.createdAt.toISOString(),
    questionKey: comment.questionKey,
    pinned: comment.pinnedAt !== null,
  }))

  return {
    id: row.id,
    discordId: row.discordId,
    displayName: row.displayName,
    // The member file wins
    name: member?.displayName ?? row.displayName ?? row.discordId,
    formId: row.formId,
    recruiters: row.recruiters.map(({ account }) => toPersonRef(account)),
    observers: row.observers.map(({ account }) => ({
      id: account.id,
      label: account.displayName,
      accent: null,
      image: account.avatarUrl,
    })),
    interviewAt: row.interviewAt?.toISOString() ?? null,
    attended: row.attended,
    formal: row.formal,
    interviewStartedAt: row.interviewStartedAt?.toISOString() ?? null,
    interviewEndedAt: row.interviewEndedAt?.toISOString() ?? null,
    verdictAt: row.verdictAt?.toISOString() ?? null,
    outcomeId: row.outcomeId,
    review: row.review,
    position: row.position,
    memberId: member?.id ?? null,
    memberName: member?.displayName ?? null,
    avatarUrl: portraits.get(row.discordId) ?? null,
    stageMarks: row.stageMarks as Record<string, boolean>,
    comments,
    answers: Object.fromEntries(
      row.answers.map((answer) => [
        answer.questionKey,
        {
          branch: answer.branch,
          appreciation: answer.appreciation,
          skipped: answer.skipped,
        },
      ])
    ),
  }
}

// Relations every candidate read carries
export const CANDIDATE_INCLUDE = {
  recruiters: { include: { account: true } },
  observers: { include: { account: true } },
  comments: { orderBy: { createdAt: 'desc' }, include: { author: true } },
  answers: true,
} as const

/**
 * Map a step row to the shape the timeline renders
 * @param {object} row - Step row
 * @return {RecruitmentStepView} - Timeline moment
 */

export const toStep = (row: {
  id: string
  title: string
  notes: string | null
  owner: RecruitmentOwnerName
  offset: number
  scheduledAt: Date | null
  doneAt: Date | null
  required: boolean
  emitsInvite: boolean
  position: number
}): RecruitmentStepView => ({
  id: row.id,
  title: row.title,
  notes: row.notes,
  owner: row.owner,
  offset: row.offset,
  scheduledAt: row.scheduledAt?.toISOString() ?? null,
  doneAt: row.doneAt?.toISOString() ?? null,
  required: row.required,
  emitsInvite: row.emitsInvite,
  position: row.position,
})
