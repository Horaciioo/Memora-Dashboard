import 'server-only'
import { readyForSecondPeriod, stageForLives } from '@/core/lib/academy/parkour'
import { prisma } from '@/core/lib/db'
import type { AcademyScope } from '@/core/services/academy/AcademyScope'
import {
  thresholds,
  toParkourJunior,
  toParkourSession,
} from '@/core/services/academy/parkour/phases'
import { conflict, invalidInput, notFound } from '@/core/lib/errors'
import { readDate } from '@/core/lib/forms/values'
import { notify } from '@/core/services/system/NotificationService'
import { PARKOUR_COPY } from '@/declarations/academy/parkour'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import { LIBRARY_SKILL_NAMES } from '@/declarations/reference/library'
import { juniorTargetId } from '@/declarations/notifications/targets'
import {
  AcademyJuniorStatuses,
  AcademySessionStatuses,
  AcademyStages,
  ReviewStatuses,
} from '@/utils/constants/hierarchy'
import type { AcademyStageName } from '@/utils/constants/hierarchy'
import { CalendarKinds, EventPurposes, EventVisibilities } from '@/utils/constants/workflow'
import { addDays, startOfDay } from '@/utils/format/days'
import { loadJunior, responsablesOf } from '@/core/services/academy/parkour/ParkourService/shared'
import type { ParkourRow } from '@/core/services/academy/parkour/ParkourService/shared'

// Column holding the moment a junior entered each check-in
const DUE_COLUMNS = {
  [AcademyStages.ReviewOne]: 'reviewOneDueAt',
  [AcademyStages.ReviewFinal]: 'reviewFinalDueAt',
} as const

// Calendar template each check-in is planned from
const REVIEW_PURPOSES_BY_STAGE = {
  [AcademyStages.ReviewOne]: EventPurposes.ReviewOne,
  [AcademyStages.ReviewFinal]: EventPurposes.ReviewFinal,
} as const

/**
 * Put a check-in falling due in its referent's calendar
 * @param {ParkourRow} row - Junior row
 * @param {AcademyStageName} stage - Check-in stage entered
 * @return {Promise<void>} - Planned
 */

const planReview = async (row: ParkourRow, stage: AcademyStageName): Promise<void> => {
  if (!row.referentId) return

  const purpose = REVIEW_PURPOSES_BY_STAGE[stage as keyof typeof REVIEW_PURPOSES_BY_STAGE]
  const template = purpose ? await prisma.eventTemplate.findUnique({ where: { purpose } }) : null

  await prisma.calendarEvent.create({
    data: {
      title: PARKOUR_COPY.reviewDueTitle.replace('{name}', row.account.displayName),
      templateId: template?.id ?? null,
      kind: template?.kind ?? CalendarKinds.Event,
      ownerId: row.referentId,
      accountId: row.accountId,
      juniorId: row.id,
      sessionId: row.sessionId,
      startsAt: startOfDay(new Date()),
      allDay: true,
      visibility: EventVisibilities.Responsables,
    },
  })

  await notify({
    kind: 'PimReviewDue',
    recipients: [row.referentId],
    actorId: null,
    target: 'junior',
    targetId: juniorTargetId(row.sessionId, row.id),
    subject: row.account.displayName,
  })
}

/**
 * Move juniors whose lives count reached a threshold
 * @param {string[]} juniorIds - Juniors whose count moved
 * @return {Promise<void>} - Moved
 */

export const syncStages = async (juniorIds: string[]): Promise<void> => {
  for (const juniorId of juniorIds) {
    const row = await loadJunior(juniorId)
    if (row.status !== AcademyJuniorStatuses.Active) continue

    const next = stageForLives(row.stage as AcademyStageName, row.liveCount, thresholds())
    if (next === row.stage) continue

    // The moment a check-in falls due bounds its window on the calendar
    const dueColumn = DUE_COLUMNS[next as keyof typeof DUE_COLUMNS]
    await prisma.academyJunior.update({
      where: { id: juniorId },
      data: { stage: next, ...(dueColumn ? { [dueColumn]: new Date() } : {}) },
    })
    await planReview(row, next)
  }
}

/**
 * Refuse a check-in deposit while its account or its grades are missing
 * @param {string} reviewId - Check-in
 * @return {Promise<void>} - Throws when incomplete
 */

export const assertReviewComplete = async (reviewId: string): Promise<void> => {
  const review = await prisma.academyReview.findUnique({
    where: { id: reviewId },
    select: {
      stage: true,
      summary: true,
      juniorId: true,
      junior: { select: { dispositifId: true, session: { select: { functionId: true } } } },
    },
  })
  if (!review) throw notFound()
  if (review.summary.trim() === '') throw conflict(PARKOUR_COPY.submitIncomplete)

  // The first check-in also needs every competency graded once
  if (review.stage !== AcademyStages.ReviewOne) return

  const [skills, graded] = await Promise.all([
    prisma.skill.count({
      where: {
        name: { in: [...LIBRARY_SKILL_NAMES] },
        OR: [{ functionId: null }, { functionId: review.junior.session.functionId }],
        AND: [{ OR: [{ dispositifId: null }, { dispositifId: review.junior.dispositifId }] }],
      },
    }),
    prisma.juniorSkill.count({
      where: {
        juniorId: review.juniorId,
        validatorId: { not: null },
        skill: { name: { in: [...LIBRARY_SKILL_NAMES] } },
      },
    }),
  ])

  if (graded < skills) throw conflict(PARKOUR_COPY.submitIncomplete)
}

/**
 * Tell the responsables a check-in waits on their decision
 * @param {string} reviewId - Check-in
 * @param {string} actorId - Referent who deposited it
 * @return {Promise<void>} - Told
 */

export const afterReviewSubmitted = async (reviewId: string, actorId: string): Promise<void> => {
  const review = await prisma.academyReview.findUniqueOrThrow({
    where: { id: reviewId },
    select: { juniorId: true },
  })
  const row = await loadJunior(review.juniorId)

  await notify({
    kind: 'PimReviewSubmitted',
    recipients: await responsablesOf(row),
    actorId,
    target: 'junior',
    targetId: juniorTargetId(row.sessionId, row.id),
    subject: row.account.displayName,
  })
}

/**
 * Read the third period deadline a decision carries
 * @param {Record<string, unknown>} raw - Request body
 * @return {Date} - Deadline
 */

export const readThirdPeriodDeadline = (raw: Record<string, unknown>): Date => {
  const picked = readDate(
    { deadlineAt: typeof raw.deadlineAt === 'string' ? raw.deadlineAt : null },
    'deadlineAt'
  )
  const today = startOfDay(new Date())
  const earliest = addDays(today, ACADEMY_SETTINGS.thirdPeriodMinDays)
  const latest = addDays(today, ACADEMY_SETTINGS.thirdPeriodMaxDays)

  if (!picked || picked < earliest || picked > latest) {
    throw invalidInput([
      {
        field: 'deadlineAt',
        message: PARKOUR_COPY.deadlineInvalid
          .replace('{min}', String(ACADEMY_SETTINGS.thirdPeriodMinDays))
          .replace('{max}', String(ACADEMY_SETTINGS.thirdPeriodMaxDays)),
      },
    ])
  }

  return picked
}

/**
 * Open the second period for a whole promotion
 * @param {string} sessionId - Promotion
 * @param {string | null} actorId - Who opened it
 * @return {Promise<void>} - Opened
 */

const openSecondPeriod = async (sessionId: string, actorId: string | null): Promise<void> => {
  const now = new Date()
  await prisma.academySession.update({ where: { id: sessionId }, data: { secondPeriodAt: now } })

  // Juniors whose passage was granted enter it together
  const granted = await prisma.academyJunior.findMany({
    where: {
      sessionId,
      status: AcademyJuniorStatuses.Active,
      stage: AcademyStages.ReviewOne,
      reviews: { some: { stage: AcademyStages.ReviewOne, status: ReviewStatuses.Validated } },
    },
    select: { id: true, accountId: true },
  })

  await prisma.academyJunior.updateMany({
    where: { id: { in: granted.map((junior) => junior.id) } },
    data: { stage: AcademyStages.Practice },
  })
  await syncStages(granted.map((junior) => junior.id))

  await notify({
    kind: 'PimSecondPeriod',
    recipients: granted.map((junior) => junior.accountId),
    actorId,
    target: 'training',
    subject: null,
  })
}

/**
 * Open the second period once every junior of the promotion is decided
 * @param {string} sessionId - Promotion
 * @return {Promise<void>} - Opened when ready
 */

export const openSecondPeriodWhenReady = async (sessionId: string): Promise<void> => {
  const session = await prisma.academySession.findUniqueOrThrow({
    where: { id: sessionId },
    select: { status: true, secondPeriodAt: true },
  })
  const seats = await prisma.academyJunior.findMany({
    where: { sessionId },
    include: { reviews: { select: { stage: true, status: true } } },
  })

  if (readyForSecondPeriod(toParkourSession(session), seats.map(toParkourJunior))) {
    await openSecondPeriod(sessionId, null)
  }
}

/**
 * Open the second period by hand
 * @param {string} sessionId - Promotion
 * @param {AcademyScope} scope - Visibility fragment
 * @param {string} actorId - Responsable opening it
 * @return {Promise<void>} - Opened
 */

export const openSecondPeriodAnyway = async (
  sessionId: string,
  scope: AcademyScope,
  actorId: string
): Promise<void> => {
  const session = await prisma.academySession.findFirst({
    where: { id: sessionId, ...scope.session },
    select: { status: true, secondPeriodAt: true },
  })
  if (!session) throw notFound()
  if (session.status !== AcademySessionStatuses.Running || session.secondPeriodAt) {
    throw conflict()
  }

  await openSecondPeriod(sessionId, actorId)
}
