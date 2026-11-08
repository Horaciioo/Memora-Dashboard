import 'server-only'
import { livesBeforeReview, resolvePhase } from '@/core/lib/academy/parkour'
import type { ParkourPhase } from '@/core/lib/academy/parkour'
import { prisma } from '@/core/lib/db'
import type { AcademyScope } from '@/core/services/academy/AcademyScope'
import {
  thresholds,
  toParkourJunior,
  toParkourSession,
} from '@/core/services/academy/parkour/phases'
import { ROUTES } from '@/declarations/navigation'
import type { ParkourView } from '@/types/academy'
import {
  AcademyJuniorStatuses,
  AcademySessionStatuses,
  AcademyStages,
} from '@/utils/constants/hierarchy'
import type { AcademyStageName } from '@/utils/constants/hierarchy'
import type { Prisma } from '@prisma/client'
import {
  PARKOUR_SHAPE,
  loadJunior,
  phaseOf,
} from '@/core/services/academy/parkour/ParkourService/shared'

/**
 * Read where a junior stands on the parkour
 * @param {string} juniorId - Junior identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<ParkourView>} - Parkour view
 */

export const readParkour = async (juniorId: string, scope: AcademyScope): Promise<ParkourView> => {
  const row = await loadJunior(juniorId, scope)
  const phase = phaseOf(row)
  const isPlanned = row.session.status !== AcademySessionStatuses.Running

  // Seats of the promotion
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
          orderBy: [
            { recruitmentSessionId: { sort: 'desc', nulls: 'last' } },
            { createdAt: 'desc' },
          ],
          select: { token: true },
        })
      : null

  return {
    juniorId: row.id,
    sessionId: row.sessionId,
    phase,
    liveCount: row.liveCount,
    livesNeeded:
      row.stage === AcademyStages.Bonus && row.bonusLives > 0
        ? thresholds().firstPeriodLives + thresholds().secondPeriodLives + row.bonusLives
        : livesBeforeReview(row.stage as AcademyStageName, thresholds()),
    deadlineAt: row.deadlineAt?.toISOString() ?? null,
    integrationPath: invite ? ROUTES.integration(invite.token) : null,
    canLaunchAnyway: isPlanned && phases.includes('ready'),
    canOpenSecondPeriod:
      !isPlanned && session.secondPeriodAt === null && phases.includes('periodOneDone'),
  }
}

/**
 * Where one running junior stands
 * @typedef {Object} ParkourStanding
 */

export interface ParkourStanding {
  juniorId: string
  sessionId: string
  sessionName: string
  sessionRunning: boolean
  name: string
  referentId: string | null
  referentName: string | null
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
    include: { ...PARKOUR_SHAPE, referent: { select: { displayName: true } } },
  })

  return rows.map((row) => ({
    juniorId: row.id,
    sessionId: row.sessionId,
    sessionName: row.session.summary ?? row.session.jobFunction.name,
    sessionRunning: row.session.status === AcademySessionStatuses.Running,
    name: row.account.displayName,
    referentId: row.referentId,
    referentName: row.referent?.displayName ?? null,
    stage: row.stage as AcademyStageName,
    phase: phaseOf(row),
  }))
}
