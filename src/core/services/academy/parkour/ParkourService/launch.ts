import 'server-only'
import { readyToLaunch } from '@/core/lib/academy/parkour'
import { prisma } from '@/core/lib/db'
import type { AcademyScope } from '@/core/services/academy/AcademyScope'
import { toParkourJunior, toParkourSession } from '@/core/services/academy/parkour/phases'
import { conflict, notFound } from '@/core/lib/errors'
import { launchPromotion } from '@/core/services/academy/AcademyService'
import { assertRecruitmentOver, awaitsRecruitment } from '@/core/services/academy/recruitmentGate'
import { notify } from '@/core/services/system/NotificationService'
import { PARKOUR_COPY } from '@/declarations/academy/parkour'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import {
  AcademyJuniorStatuses,
  AcademySessionStatuses,
  AcademyStages,
} from '@/utils/constants/hierarchy'
import { startOfDay } from '@/utils/format/time/days'
import { loadJunior } from '@/core/services/academy/parkour/ParkourService/shared'

/**
 * Tell the juniors and their referents a promotion is running
 * @param {string} sessionId - Promotion
 * @param {string | null} actorId - Who launched it
 * @return {Promise<void>} - Told
 */

export const announceLaunch = async (sessionId: string, actorId: string | null): Promise<void> => {
  const seats = await prisma.academyJunior.findMany({
    where: { sessionId, stage: { not: AcademyStages.Preparation } },
    select: {
      accountId: true,
      referentId: true,
      session: { select: { summary: true, jobFunction: { select: { name: true } } } },
    },
  })
  const name = seats[0]?.session.summary ?? seats[0]?.session.jobFunction.name ?? ''

  await notify({
    kind: 'PimLaunched',
    recipients: seats.flatMap((seat) => [seat.accountId, seat.referentId ?? '']),
    actorId,
    target: 'home',
    subject: name,
  })
}

/**
 * Launch a promotion by hand
 * @param {string} sessionId - Promotion
 * @param {AcademyScope} scope - Visibility fragment
 * @param {string} actorId - Responsable launching
 * @return {Promise<void>} - Launched
 */

export const launchAnyway = async (
  sessionId: string,
  scope: AcademyScope,
  actorId: string
): Promise<void> => {
  const session = await prisma.academySession.findFirst({
    where: { id: sessionId, ...scope.session },
    select: { status: true },
  })
  if (!session) throw notFound()
  if (session.status === AcademySessionStatuses.Running) throw conflict()
  await assertRecruitmentOver(sessionId)

  const ready = await prisma.academyJunior.count({
    where: { sessionId, status: AcademyJuniorStatuses.Active, confirmedAt: { not: null } },
  })
  if (ready === 0) throw conflict(PARKOUR_COPY.launchNobodyReady)

  const orphans = await prisma.academyJunior.count({
    where: {
      sessionId,
      status: AcademyJuniorStatuses.Active,
      confirmedAt: { not: null },
      referentId: null,
    },
  })
  if (orphans > 0) throw conflict(ACADEMY_COPY.launchMissingReferent)

  await launchPromotion(sessionId)
  await announceLaunch(sessionId, actorId)
}

/**
 * Start a promotion once every live seat is confirmed
 * @param {string} sessionId - Promotion
 * @return {Promise<boolean>} - Launched now
 */

export const launchWhenReady = async (sessionId: string): Promise<boolean> => {
  // The campaign feeding it decides first
  if (await awaitsRecruitment(sessionId)) return false

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
 * Free the promotion a campaign feeds once the campaign ends
 * @param {string} recruitmentId - Campaign identifier
 * @return {Promise<void>} - Followed up
 */

export const afterRecruitmentClosed = async (recruitmentId: string): Promise<void> => {
  const row = await prisma.recruitmentSession.findUnique({
    where: { id: recruitmentId },
    select: { academySessionId: true },
  })

  if (row?.academySessionId) await launchWhenReady(row.academySessionId)
}

/**
 * Launch once staffed
 * @param {string} sessionId - Promotion
 * @return {Promise<void>} - Followed up
 */

export const afterReferentAssigned = async (sessionId: string): Promise<void> => {
  await launchWhenReady(sessionId)
}

/**
 * Follow up a confirmed integration form: a late seat starts alone
 * @param {string} juniorId - Junior whose form came back
 * @return {Promise<void>} - Followed up
 */

export const afterIntegration = async (juniorId: string): Promise<void> => {
  const row = await loadJunior(juniorId)

  // The promotion already runs
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
