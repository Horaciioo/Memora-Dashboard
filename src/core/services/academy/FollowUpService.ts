import 'server-only'

import { prisma } from '@/core/lib/db'
import type { AcademyScope } from '@/core/services/academy/AcademyScope'
import { readTimeline } from '@/core/services/academy/parkour/PimTimelineService'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import {
  AcademyJuniorStatuses,
  AcademySessionStatuses,
  StepOwners,
} from '@/utils/constants/hierarchy'
import type { MilestoneView } from '@/core/lib/academy/parkourTimeline'

// Moments a trainer carries, alone or with a responsable
const TRAINER_OWNERS: string[] = [StepOwners.Formateurs, StepOwners.Both]

// Promotions still running
const LIVE_SESSIONS = [AcademySessionStatuses.Open, AcademySessionStatuses.Running]

/**
 * Where a trainer stands with one junior
 * @typedef {Object} JuniorFollow
 * @property {string} juniorId - Junior identifier
 * @property {string} sessionId - Promotion identifier
 * @property {string} name - Junior name
 * @property {string} current - Moment of the journey in course
 * @property {MilestoneView[]} todo - Trainer moments not done yet, late and current first
 * @property {number} trainerDone - Trainer moments done
 * @property {number} trainerTotal - Trainer moments of the journey
 * @property {number} liveCount - Lives covered
 * @property {number} reviewCount - Check-ins written
 */

export interface JuniorFollow {
  juniorId: string
  sessionId: string
  name: string
  current: string
  todo: MilestoneView[]
  trainerDone: number
  trainerTotal: number
  liveCount: number
  reviewCount: number
}

// Late first, then the one in course, then what comes
const STATE_RANK: Record<MilestoneView['state'], number> = {
  late: 0,
  current: 1,
  upcoming: 2,
  done: 3,
}

/**
 * Follow-up of every active junior of a trainer
 * @param {string} trainerId - Trainer account identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @param {string} [only] - Keep one junior
 * @return {Promise<JuniorFollow[]>} - One line per junior
 */

export const followTrainer = async (
  trainerId: string,
  scope: AcademyScope,
  only?: string
): Promise<JuniorFollow[]> => {
  const rows = await prisma.academyJunior.findMany({
    where: {
      trainerId,
      status: AcademyJuniorStatuses.Active,
      session: { ...scope.session, status: { in: LIVE_SESSIONS } },
      ...scope.juniors,
      ...(only ? { id: only } : {}),
    },
    include: {
      account: { select: { displayName: true } },
      _count: { select: { reviews: true } },
    },
    orderBy: { account: { displayName: 'asc' } },
    take: ACADEMY_SETTINGS.formJuniorsLimit,
  })

  return Promise.all(
    rows.map(async (row) => {
      const { steps } = await readTimeline(row.id, scope)
      const own = steps.filter((step) => step.owner && TRAINER_OWNERS.includes(step.owner))

      return {
        juniorId: row.id,
        sessionId: row.sessionId,
        name: row.account.displayName,
        current: steps.find((step) => step.state === 'current')?.label ?? '',
        todo: own
          .filter((step) => step.state !== 'done')
          .sort((left, right) => STATE_RANK[left.state] - STATE_RANK[right.state]),
        trainerDone: own.filter((step) => step.state === 'done').length,
        trainerTotal: own.length,
        liveCount: row.liveCount,
        reviewCount: row._count.reviews,
      }
    })
  )
}

/**
 * Trainers who follow a junior in reach, by name
 * @param {AcademyScope} scope - Visibility fragment
 * @param {string} text - Words typed, may be empty
 * @return {Promise<{ id: string, name: string, juniorCount: number }[]>} - Trainers
 */

export const listTrainers = async (
  scope: AcademyScope,
  text: string
): Promise<{ id: string; name: string; juniorCount: number }[]> => {
  const rows = await prisma.academyJunior.findMany({
    where: {
      trainerId: { not: null },
      status: AcademyJuniorStatuses.Active,
      session: { ...scope.session, status: { in: LIVE_SESSIONS } },
      ...scope.juniors,
      trainer: { displayName: { contains: text, mode: 'insensitive' } },
    },
    select: { trainerId: true, trainer: { select: { displayName: true } } },
    take: ACADEMY_SETTINGS.formJuniorsLimit,
  })

  const counts = new Map<string, { name: string; juniorCount: number }>()
  for (const row of rows) {
    if (!row.trainerId || !row.trainer) continue
    const known = counts.get(row.trainerId)
    counts.set(row.trainerId, {
      name: row.trainer.displayName,
      juniorCount: (known?.juniorCount ?? 0) + 1,
    })
  }

  return [...counts].map(([id, entry]) => ({ id, ...entry }))
}
