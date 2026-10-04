import 'server-only'

import {
  decisionEffect,
  fillDeparture,
  livesBeforeReview,
  readyForSecondPeriod,
  readyToLaunch,
  resolvePhase,
  stageForLives,
} from '@/core/lib/academy/parkour'
import type { ParkourJunior, ParkourPhase, ParkourSession } from '@/core/lib/academy/parkour'
import { prisma } from '@/core/lib/db'
import { conflict, immutable, invalidInput, notFound } from '@/core/lib/errors'
import { readDate } from '@/core/lib/forms/values'
import { launchPromotion } from '@/core/services/academy/AcademyService'
import { graduateAccount } from '@/core/services/academy/AdmissionService'
import { readAnchors } from '@/core/services/auth/LeadService'
import { clearVolunteeredDetails } from '@/core/services/members/MemberService'
import { notify } from '@/core/services/system/NotificationService'
import { isRootIdentity } from '@/declarations/access/identity'
import {
  DEPARTURE_EMOJIS,
  DEPARTURE_TEMPLATE,
  DEPARTURE_VERBS,
  GRADUATE_DIVISION_RANK,
  PARKOUR_COPY,
} from '@/declarations/academy/parkour'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import { MEMBER_COPY } from '@/declarations/members/copy'
import { tradeOfFunction } from '@/declarations/reference/fixed'
import { LIBRARY_SKILL_NAMES } from '@/declarations/reference/library'
import { ROUTES } from '@/declarations/navigation'
import { juniorTargetId } from '@/declarations/notifications/targets'
import type { ParkourView } from '@/types/academy'
import {
  AcademyJuniorStatuses,
  AcademySessionStatuses,
  AcademyStages,
  DepartureKinds,
  GONE_MEMBER_STATUSES,
  MemberRoles,
  MemberStatuses,
  ReviewStatuses,
} from '@/utils/constants/hierarchy'
import type {
  AcademyJuniorStatusName,
  AcademySessionStatusName,
  AcademyStageName,
  DepartureKindName,
  ReviewAdviceName,
  ReviewStatusName,
} from '@/utils/constants/hierarchy'
import { IntegrationLinkKinds } from '@/utils/constants/integration'
import { EventVisibilities } from '@/utils/constants/workflow'
import { LiveStatuses } from '@/utils/constants/lives'
import { addDays, startOfDay } from '@/utils/format/days'
import type { Prisma } from '@prisma/client'
import crypto from 'crypto'

// Everything the parkour reads on a junior
const PARKOUR_SHAPE = {
  account: {
    select: { id: true, displayName: true, discordId: true, discordUsername: true },
  },
  reviews: { select: { stage: true, status: true } },
  session: {
    select: {
      id: true,
      status: true,
      secondPeriodAt: true,
      summary: true,
      functionId: true,
      jobFunction: { select: { name: true } },
      recruitmentSession: {
        select: { youtuberId: true, responsables: { select: { accountId: true } } },
      },
    },
  },
} satisfies Prisma.AcademyJuniorInclude

type ParkourRow = Prisma.AcademyJuniorGetPayload<{ include: typeof PARKOUR_SHAPE }>

// Lives thresholds, read once per call
const thresholds = () => ({
  firstPeriodLives: ACADEMY_SETTINGS.firstPeriodLives,
  secondPeriodLives: ACADEMY_SETTINGS.secondPeriodLives,
})

/**
 * Read a junior row the way the parkour reasons about it
 * @param {Object} row - Junior row with its reviews
 * @return {ParkourJunior} - Parkour junior
 */

const toParkourJunior = (row: {
  status: string
  stage: string
  trainerId: string | null
  kickoffAt: Date | null
  confirmedAt: Date | null
  liveCount: number
  deadlineAt: Date | null
  reviews: { stage: string; status: string }[]
}): ParkourJunior => ({
  status: row.status as AcademyJuniorStatusName,
  stage: row.stage as AcademyStageName,
  trainerId: row.trainerId,
  kickoffAt: row.kickoffAt,
  confirmedAt: row.confirmedAt,
  liveCount: row.liveCount,
  deadlineAt: row.deadlineAt,
  reviews: row.reviews.map((review) => ({
    stage: review.stage as AcademyStageName,
    status: review.status as ReviewStatusName,
  })),
})

/**
 * Read a promotion row the way the parkour reasons about it
 * @param {{ status: string, secondPeriodAt: Date | null }} session - Promotion row
 * @return {ParkourSession} - Parkour promotion
 */

const toParkourSession = (session: {
  status: string
  secondPeriodAt: Date | null
}): ParkourSession => ({
  status: session.status as AcademySessionStatusName,
  secondPeriodAt: session.secondPeriodAt,
})

/**
 * Phase of one loaded junior
 * @param {ParkourRow} row - Junior row
 * @return {ParkourPhase} - Phase
 */

const phaseOf = (row: ParkourRow): ParkourPhase =>
  resolvePhase(toParkourJunior(row), toParkourSession(row.session))

/**
 * Load a junior, inside a visibility fragment when one is given
 * @param {string} juniorId - Junior identifier
 * @param {Prisma.AcademySessionWhereInput} [scope] - Visibility fragment
 * @return {Promise<ParkourRow>} - Junior row
 */

const loadJunior = async (
  juniorId: string,
  scope?: Prisma.AcademySessionWhereInput
): Promise<ParkourRow> => {
  const row = await prisma.academyJunior.findFirst({
    where: { id: juniorId, ...(scope ? { session: scope } : {}) },
    include: PARKOUR_SHAPE,
  })
  if (!row) throw notFound()

  return row
}

/**
 * Responsables a junior's parkour reports to: the campaign, then the creator, then everyone
 * @param {ParkourRow} row - Junior row
 * @return {Promise<string[]>} - Account identifiers
 */

const responsablesOf = async (row: ParkourRow): Promise<string[]> => {
  const campaign = row.session.recruitmentSession
  const named = campaign?.responsables.map((seat) => seat.accountId) ?? []
  const anchors = campaign
    ? (await readAnchors(campaign.youtuberId))
        .filter((anchor) => anchor.role === MemberRoles.Responsable)
        .map((anchor) => anchor.accountId)
    : []

  const found = [...new Set([...named, ...anchors])]
  if (found.length > 0) return found

  // No campaign behind the promotion, every responsable hears of it
  const everyone = await prisma.account.findMany({
    where: { role: MemberRoles.Responsable, status: { notIn: GONE_MEMBER_STATUSES } },
    select: { id: true },
  })

  return everyone.map((account) => account.id)
}

/**
 * Integration link of a promotion, opened when none is usable
 * @param {string} sessionId - Promotion
 * @param {string} functionId - Function trained for
 * @return {Promise<string>} - Link path
 */

const ensureKickoffInvite = async (sessionId: string, functionId: string): Promise<string> => {
  const existing = await prisma.integrationInvite.findFirst({
    where: { sessionId, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
    select: { token: true },
  })
  if (existing) return ROUTES.integration(existing.token)

  const created = await prisma.integrationInvite.create({
    data: {
      kind: IntegrationLinkKinds.Academy,
      sessionId,
      functionId,
      token: crypto.randomBytes(24).toString('base64url'),
      expiresAt: addDays(new Date(), ACADEMY_SETTINGS.inviteExpiryDays),
      maxUses: ACADEMY_SETTINGS.inviteMaxUses,
    },
    select: { token: true },
  })

  return ROUTES.integration(created.token)
}

/**
 * Read where a junior stands on the parkour, with what the viewer may do
 * @param {string} juniorId - Junior identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @return {Promise<ParkourView>} - Parkour view
 */

export const readParkour = async (
  juniorId: string,
  scope: Prisma.AcademySessionWhereInput
): Promise<ParkourView> => {
  const row = await loadJunior(juniorId, scope)
  const phase = phaseOf(row)
  const isPlanned = row.session.status !== AcademySessionStatuses.Running

  // Seats of the promotion, for the manual launches
  const seats = await prisma.academyJunior.findMany({
    where: { sessionId: row.sessionId },
    include: { reviews: { select: { stage: true, status: true } } },
  })
  const session = toParkourSession(row.session)
  const phases = seats.map((seat) => resolvePhase(toParkourJunior(seat), session))

  const invite =
    phase === 'awaitingInfo'
      ? await prisma.integrationInvite.findFirst({
          where: { sessionId: row.sessionId, expiresAt: { gt: new Date() } },
          orderBy: { createdAt: 'desc' },
          select: { token: true },
        })
      : null

  return {
    juniorId: row.id,
    sessionId: row.sessionId,
    phase,
    liveCount: row.liveCount,
    livesNeeded: livesBeforeReview(row.stage as AcademyStageName, thresholds()),
    deadlineAt: row.deadlineAt?.toISOString() ?? null,
    integrationPath: invite ? ROUTES.integration(invite.token) : null,
    canLaunchAnyway: isPlanned && phases.includes('ready'),
    canOpenSecondPeriod:
      !isPlanned && session.secondPeriodAt === null && phases.includes('periodOneDone'),
  }
}

/**
 * Declare the PIM start of one junior, their integration link opening
 * @param {string} juniorId - Junior identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @return {Promise<string>} - Integration link path
 */

export const declareKickoff = async (
  juniorId: string,
  scope: Prisma.AcademySessionWhereInput
): Promise<string> => {
  const row = await loadJunior(juniorId, scope)
  if (phaseOf(row) !== 'needsKickoff') throw conflict()

  await prisma.academyJunior.update({ where: { id: juniorId }, data: { kickoffAt: new Date() } })

  return ensureKickoffInvite(row.sessionId, row.session.functionId)
}

/**
 * Tell the juniors and their trainers a promotion is running
 * @param {string} sessionId - Promotion
 * @param {string | null} actorId - Who launched it, none for the automation
 * @return {Promise<void>} - Told
 */

const announceLaunch = async (sessionId: string, actorId: string | null): Promise<void> => {
  const seats = await prisma.academyJunior.findMany({
    where: { sessionId, stage: { not: AcademyStages.Preparation } },
    select: {
      accountId: true,
      trainerId: true,
      session: { select: { summary: true, jobFunction: { select: { name: true } } } },
    },
  })
  const name = seats[0]?.session.summary ?? seats[0]?.session.jobFunction.name ?? ''

  await notify({
    kind: 'PimLaunched',
    recipients: seats.flatMap((seat) => [seat.accountId, seat.trainerId ?? '']),
    actorId,
    target: 'home',
    subject: name,
  })
}

/**
 * Launch a promotion by hand, the juniors still on their form following later
 * @param {string} sessionId - Promotion
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @param {string} actorId - Responsable launching
 * @return {Promise<void>} - Launched
 */

export const launchAnyway = async (
  sessionId: string,
  scope: Prisma.AcademySessionWhereInput,
  actorId: string
): Promise<void> => {
  const session = await prisma.academySession.findFirst({
    where: { id: sessionId, ...scope },
    select: { status: true },
  })
  if (!session) throw notFound()
  if (session.status === AcademySessionStatuses.Running) throw conflict()

  const ready = await prisma.academyJunior.count({
    where: { sessionId, status: AcademyJuniorStatuses.Active, confirmedAt: { not: null } },
  })
  if (ready === 0) throw conflict(PARKOUR_COPY.launchNobodyReady)

  await launchPromotion(sessionId)
  await announceLaunch(sessionId, actorId)
}

/**
 * Start a promotion once every live seat is confirmed
 * @param {string} sessionId - Promotion
 * @return {Promise<boolean>} - Launched now
 */

const launchWhenReady = async (sessionId: string): Promise<boolean> => {
  const session = await prisma.academySession.findUniqueOrThrow({
    where: { id: sessionId },
    select: { status: true, secondPeriodAt: true },
  })
  const seats = await prisma.academyJunior.findMany({
    where: { sessionId },
    include: { reviews: { select: { stage: true, status: true } } },
  })

  if (!readyToLaunch(toParkourSession(session), seats.map(toParkourJunior))) return false

  await launchPromotion(sessionId)
  await announceLaunch(sessionId, null)

  return true
}

/**
 * Follow up a confirmed integration form: a late seat starts alone, a full promotion launches
 * @param {string} juniorId - Junior whose form came back
 * @return {Promise<void>} - Followed up
 */

export const afterIntegration = async (juniorId: string): Promise<void> => {
  const row = await loadJunior(juniorId)

  // The promotion already runs, this seat joins it on its own
  if (row.session.status === AcademySessionStatuses.Running) {
    if (row.stage === AcademyStages.Preparation) {
      await prisma.academyJunior.update({
        where: { id: juniorId },
        data: { stage: AcademyStages.Discovery, startedAt: startOfDay(new Date()) },
      })
    }
    return
  }

  await launchWhenReady(row.sessionId)
}

/**
 * Put a check-in falling due in its trainer's calendar
 * @param {ParkourRow} row - Junior row
 * @return {Promise<void>} - Planned
 */

const planReview = async (row: ParkourRow): Promise<void> => {
  if (!row.trainerId) return

  await prisma.calendarEvent.create({
    data: {
      title: PARKOUR_COPY.reviewDueTitle.replace('{name}', row.account.displayName),
      ownerId: row.trainerId,
      sessionId: row.sessionId,
      startsAt: startOfDay(new Date()),
      allDay: true,
      visibility: EventVisibilities.Responsables,
    },
  })

  await notify({
    kind: 'PimReviewDue',
    recipients: [row.trainerId],
    actorId: null,
    target: 'junior',
    targetId: juniorTargetId(row.sessionId, row.id),
    subject: row.account.displayName,
  })
}

/**
 * Move juniors whose lives count reached a threshold, their check-in falling due
 * @param {string[]} juniorIds - Juniors whose count moved
 * @return {Promise<void>} - Moved
 */

export const syncStages = async (juniorIds: string[]): Promise<void> => {
  for (const juniorId of juniorIds) {
    const row = await loadJunior(juniorId)
    if (row.status !== AcademyJuniorStatuses.Active) continue

    const next = stageForLives(row.stage as AcademyStageName, row.liveCount, thresholds())
    if (next === row.stage) continue

    await prisma.academyJunior.update({ where: { id: juniorId }, data: { stage: next } })
    await planReview(row)
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
 * @param {string} actorId - Trainer who deposited it
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
 * Read the third period deadline a decision carries, bounded by the settings
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
 * @param {string | null} actorId - Who opened it, none for the automation
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

const openSecondPeriodWhenReady = async (sessionId: string): Promise<void> => {
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
 * Open the second period by hand, the juniors still undecided joining later
 * @param {string} sessionId - Promotion
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @param {string} actorId - Responsable opening it
 * @return {Promise<void>} - Opened
 */

export const openSecondPeriodAnyway = async (
  sessionId: string,
  scope: Prisma.AcademySessionWhereInput,
  actorId: string
): Promise<void> => {
  const session = await prisma.academySession.findFirst({
    where: { id: sessionId, ...scope },
    select: { status: true, secondPeriodAt: true },
  })
  if (!session) throw notFound()
  if (session.status !== AcademySessionStatuses.Running || session.secondPeriodAt) {
    throw conflict()
  }

  await openSecondPeriod(sessionId, actorId)
}

/**
 * Graduate a junior: Modérateur, trade function, first division
 * @param {ParkourRow} row - Junior row
 * @return {Promise<void>} - Graduated
 */

const graduate = async (row: ParkourRow): Promise<void> => {
  await prisma.academyJunior.update({
    where: { id: row.id },
    data: { status: AcademyJuniorStatuses.Validated, validatedAt: new Date() },
  })
  await graduateAccount(row.accountId, row.session.functionId)

  const division = await prisma.division.findUnique({
    where: { rank: GRADUATE_DIVISION_RANK },
    select: { id: true },
  })
  if (division) {
    await prisma.account.update({
      where: { id: row.accountId },
      data: { divisionId: division.id },
    })
  }
}

/**
 * End a junior's parkour by dismissal or resignation: everything in course is cancelled, the
 * personal data erased for good and a departure announcement drafted
 * @param {string} juniorId - Junior identifier
 * @param {DepartureKindName} kind - Dismissal or resignation
 * @param {string | null} actorId - Who ended it
 * @return {Promise<void>} - Ended
 */

export const endParkour = async (
  juniorId: string,
  kind: DepartureKindName,
  actorId: string | null
): Promise<void> => {
  const row = await loadJunior(juniorId)
  if (row.status !== AcademyJuniorStatuses.Active) throw conflict()
  if (isRootIdentity(row.account.discordId)) throw immutable(MEMBER_COPY.rootLocked)

  const dismissed = kind === DepartureKinds.Dismissal
  const now = new Date()

  // The seat closes, every open check-in with it
  await prisma.$transaction([
    prisma.academyJunior.update({
      where: { id: juniorId },
      data: {
        status: dismissed ? AcademyJuniorStatuses.Stopped : AcademyJuniorStatuses.Resigned,
        leftAt: now,
      },
    }),
    prisma.academyReview.updateMany({
      where: {
        juniorId,
        status: { in: [ReviewStatuses.Draft, ReviewStatuses.Submitted] },
      },
      data: { status: ReviewStatuses.Rejected },
    }),
    // Lives still to come no longer count on them
    prisma.liveMember.deleteMany({
      where: { accountId: row.accountId, live: { status: LiveStatuses.Announced } },
    }),
    prisma.eventAttendance.deleteMany({
      where: { accountId: row.accountId, event: { live: { status: LiveStatuses.Announced } } },
    }),
  ])

  // Personal data erased, access closed, the Discord identity frozen
  await clearVolunteeredDetails(row.accountId)
  await prisma.$transaction([
    prisma.session.deleteMany({ where: { accountId: row.accountId } }),
    prisma.discordToken.deleteMany({ where: { accountId: row.accountId } }),
    prisma.account.update({
      where: { id: row.accountId },
      data: {
        status: dismissed ? MemberStatuses.Dismissed : MemberStatuses.Resigned,
        leftAt: now,
        anonymisedAt: now,
      },
    }),
  ])

  // The announcement waits in the responsables' tasks
  const trade = tradeOfFunction(row.session.jobFunction.name)
  await prisma.departureNotice.create({
    data: {
      accountId: row.accountId,
      kind,
      functionName: trade,
      body: fillDeparture(DEPARTURE_TEMPLATE, DEPARTURE_VERBS, {
        username: row.account.discordUsername ?? row.account.displayName,
        discordId: row.account.discordId,
        functionName: trade,
        emoji: DEPARTURE_EMOJIS[trade] ?? '',
        kind,
      }),
    },
  })

  await notify({
    kind: 'PimDeparture',
    recipients: await responsablesOf(row),
    actorId,
    target: 'home',
    subject: row.account.displayName,
  })

  // A seat leaving may be the one the others were waiting on
  if (row.session.status === AcademySessionStatuses.Running) {
    await openSecondPeriodWhenReady(row.sessionId)
  } else {
    await launchWhenReady(row.sessionId)
  }
}

/**
 * Carry out what a responsable decided on a check-in
 * @param {string} reviewId - Decided check-in
 * @param {string} actorId - Responsable
 * @param {Date | null} deadlineAt - Third period deadline, when one opens
 * @return {Promise<void>} - Applied
 */

export const applyDecision = async (
  reviewId: string,
  actorId: string,
  deadlineAt: Date | null
): Promise<void> => {
  const review = await prisma.academyReview.findUniqueOrThrow({
    where: { id: reviewId },
    select: { juniorId: true, stage: true, decision: true, status: true },
  })
  if (review.status !== ReviewStatuses.Validated || !review.decision) return

  const row = await loadJunior(review.juniorId)
  const stage = review.stage as AcademyStageName

  // The steps of the closed stage close with the check-in
  await prisma.academyStep.updateMany({
    where: { juniorId: row.id, stage, validatedAt: null },
    data: { validatedAt: new Date(), validatedById: actorId },
  })

  switch (decisionEffect(stage, review.decision as ReviewAdviceName)) {
    case 'dismiss':
      await endParkour(row.id, DepartureKinds.Dismissal, actorId)
      return
    case 'secondPeriod':
      // Late in a promotion already in period 2, the junior goes straight in
      if (row.session.secondPeriodAt) {
        await prisma.academyJunior.update({
          where: { id: row.id },
          data: { stage: AcademyStages.Practice },
        })
        return
      }
      await openSecondPeriodWhenReady(row.sessionId)
      return
    case 'thirdPeriod':
      await prisma.academyJunior.update({
        where: { id: row.id },
        data: { stage: AcademyStages.Bonus, deadlineAt },
      })
      return
    case 'graduate':
      await graduate(row)
  }
}

/**
 * Record a junior's resignation, a single gesture
 * @param {string} juniorId - Junior identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @param {string} actorId - Responsable recording it
 * @return {Promise<void>} - Recorded
 */

export const resignJunior = async (
  juniorId: string,
  scope: Prisma.AcademySessionWhereInput,
  actorId: string
): Promise<void> => {
  await loadJunior(juniorId, scope)
  await endParkour(juniorId, DepartureKinds.Resignation, actorId)
}

/**
 * Departure announcements still to publish
 * @return {Promise<{ id: string, name: string, body: string, createdAt: Date }[]>} - Open notices
 */

export const openDepartures = async () => {
  const rows = await prisma.departureNotice.findMany({
    where: { publishedAt: null },
    include: { account: { select: { displayName: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return rows.map((row) => ({
    id: row.id,
    name: row.account.displayName,
    body: row.body,
    createdAt: row.createdAt,
  }))
}

/**
 * Mark a departure announcement as published
 * @param {string} id - Notice identifier
 * @param {string} actorId - Who published it
 * @return {Promise<void>} - Marked
 */

export const publishDeparture = async (id: string, actorId: string): Promise<void> => {
  const { count } = await prisma.departureNotice.updateMany({
    where: { id, publishedAt: null },
    data: { publishedAt: new Date(), publishedById: actorId },
  })
  if (count === 0) throw notFound()
}

/**
 * Where one running junior stands, for the task inbox
 * @typedef {Object} ParkourStanding
 */

export interface ParkourStanding {
  juniorId: string
  sessionId: string
  sessionName: string
  sessionRunning: boolean
  name: string
  trainerId: string | null
  trainerName: string | null
  stage: AcademyStageName
  phase: ParkourPhase
}

/**
 * Phase of every running junior matching a filter
 * @param {Prisma.AcademyJuniorWhereInput} where - Juniors concerned
 * @return {Promise<ParkourStanding[]>} - Standings
 */

export const parkourStandings = async (
  where: Prisma.AcademyJuniorWhereInput
): Promise<ParkourStanding[]> => {
  const rows = await prisma.academyJunior.findMany({
    where: { ...where, status: AcademyJuniorStatuses.Active },
    include: { ...PARKOUR_SHAPE, trainer: { select: { displayName: true } } },
  })

  return rows.map((row) => ({
    juniorId: row.id,
    sessionId: row.sessionId,
    sessionName: row.session.summary ?? row.session.jobFunction.name,
    sessionRunning: row.session.status === AcademySessionStatuses.Running,
    name: row.account.displayName,
    trainerId: row.trainerId,
    trainerName: row.trainer?.displayName ?? null,
    stage: row.stage as AcademyStageName,
    phase: phaseOf(row),
  }))
}
