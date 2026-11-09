import 'server-only'
import { decisionEffect, fillDeparture } from '@/core/lib/academy/parkour'
import { prisma } from '@/core/lib/db'
import type { AcademyScope } from '@/core/services/academy/AcademyScope'
import { conflict, immutable, notFound } from '@/core/lib/errors'
import { graduateAccount, releaseAccount } from '@/core/services/academy/AdmissionService'
import { clearVolunteeredDetails } from '@/core/services/members/MemberService'
import { notify } from '@/core/services/system/NotificationService'
import { isRootIdentity } from '@/declarations/access/identity'
import {
  DEPARTURE_EMOJIS,
  DEPARTURE_TEMPLATES,
  DEPARTURE_VERBS,
  GRADUATE_DIVISION_RANK,
} from '@/declarations/academy/parkour'
import { MEMBER_COPY } from '@/declarations/members/copy'
import { tradeOfFunction } from '@/declarations/reference/fixed'
import {
  AcademyJuniorStatuses,
  AcademySessionStatuses,
  AcademyStages,
  DepartureKinds,
  MemberRoles,
  MemberStatuses,
  ReviewStatuses,
} from '@/utils/constants/hierarchy'
import type {
  AcademyStageName,
  DepartureKindName,
  ReviewAdviceName,
} from '@/utils/constants/hierarchy'
import { LiveStatuses } from '@/utils/constants/lives'
import { loadJunior, responsablesOf } from '@/core/services/academy/parkour/ParkourService/shared'
import type { ParkourRow } from '@/core/services/academy/parkour/ParkourService/shared'
import {
  openSecondPeriodWhenReady,
  syncStages,
} from '@/core/services/academy/parkour/ParkourService/reviews'
import { launchWhenReady } from '@/core/services/academy/parkour/ParkourService/launch'

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

  const isNewcomer = row.account.role === MemberRoles.Junior
  const division = await prisma.division.findUnique({
    where: { rank: GRADUATE_DIVISION_RANK },
    select: { id: true },
  })
  if (division && isNewcomer) {
    await prisma.account.update({
      where: { id: row.accountId },
      data: { divisionId: division.id },
    })
  }
}

/**
 * End a junior's parkour by dismissal or resignation: everything in course is cancelled
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

  // The seat closes
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
  ])

  // An existing member only leaves the team
  if (row.account.role === MemberRoles.Junior) await closeNewcomer(row, kind, now)
  else await releaseAccount(row.accountId, row.session.functionId)

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
 * Close a newcomer's account
 * @param {ParkourRow} row - Junior row
 * @param {DepartureKindName} kind - Departure kind
 * @param {Date} now - Departure moment
 * @return {Promise<void>} - Closed
 */

const closeNewcomer = async (
  row: ParkourRow,
  kind: DepartureKindName,
  now: Date
): Promise<void> => {
  const dismissed = kind === DepartureKinds.Dismissal

  // Future lives released
  await prisma.$transaction([
    prisma.liveMember.deleteMany({
      where: { accountId: row.accountId, live: { status: LiveStatuses.Announced } },
    }),
    prisma.eventAttendance.deleteMany({
      where: { accountId: row.accountId, event: { live: { status: LiveStatuses.Announced } } },
    }),
  ])

  // Personal data erased
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
      body: fillDeparture(DEPARTURE_TEMPLATES[kind], DEPARTURE_VERBS, {
        username: row.account.discordUsername ?? row.account.displayName,
        discordId: row.account.discordId,
        functionName: trade,
        emoji: DEPARTURE_EMOJIS[trade] ?? '',
        kind,
      }),
    },
  })
}

/**
 * Carry out what a responsable decided on a check-in
 * @param {string} reviewId - Decided check-in
 * @param {string} actorId - Responsable
 * @param {Date | null} deadlineAt - Third period deadline
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

  switch (decisionEffect(stage, review.decision as ReviewAdviceName)) {
    case 'dismiss':
      await endParkour(row.id, DepartureKinds.Dismissal, actorId)
      return
    case 'secondPeriod':
      // Late in a promotion already in period 2
      if (row.session.secondPeriodAt) {
        await prisma.academyJunior.update({
          where: { id: row.id },
          data: { stage: AcademyStages.Practice },
        })
        await syncStages([row.id])
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
 * Record a junior's resignation
 * @param {string} juniorId - Junior identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @param {string} actorId - Responsable recording it
 * @return {Promise<void>} - Recorded
 */

export const resignJunior = async (
  juniorId: string,
  scope: AcademyScope,
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
