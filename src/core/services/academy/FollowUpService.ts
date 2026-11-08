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

// Moments a referent carries, alone or with a responsable
const REFERENT_OWNERS: string[] = [StepOwners.Referents, StepOwners.Both]

// Promotions still running
const LIVE_SESSIONS = [AcademySessionStatuses.Open, AcademySessionStatuses.Running]

/**
 * Where a referent stands with one junior
 * @typedef {Object} JuniorFollow
 * @property {string} juniorId - Junior identifier
 * @property {string} sessionId - Promotion identifier
 * @property {string} name - Junior name
 * @property {string} current - Moment of the journey in course
 * @property {MilestoneView[]} todo - Referent moments not done yet, late and current first
 * @property {number} referentDone - Referent moments done
 * @property {number} referentTotal - Referent moments of the journey
 * @property {number} liveCount - Lives covered
 * @property {number} reviewCount - Check-ins written
 */

export interface JuniorFollow {
  juniorId: string
  sessionId: string
  name: string
  current: string
  todo: MilestoneView[]
  referentDone: number
  referentTotal: number
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
 * Follow-up of every active junior of a referent
 * @param {string} referentId - Referent account identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @param {string} [only] - Keep one junior
 * @return {Promise<JuniorFollow[]>} - One line per junior
 */

export const followReferent = async (
  referentId: string,
  scope: AcademyScope,
  only?: string
): Promise<JuniorFollow[]> => {
  const rows = await prisma.academyJunior.findMany({
    where: {
      referentId,
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
      const own = steps.filter((step) => step.owner && REFERENT_OWNERS.includes(step.owner))

      return {
        juniorId: row.id,
        sessionId: row.sessionId,
        name: row.account.displayName,
        current: steps.find((step) => step.state === 'current')?.label ?? '',
        todo: own
          .filter((step) => step.state !== 'done')
          .sort((left, right) => STATE_RANK[left.state] - STATE_RANK[right.state]),
        referentDone: own.filter((step) => step.state === 'done').length,
        referentTotal: own.length,
        liveCount: row.liveCount,
        reviewCount: row._count.reviews,
      }
    })
  )
}

/**
 * Referents who follow a junior in reach, by name
 * @param {AcademyScope} scope - Visibility fragment
 * @param {string} text - Words typed, may be empty
 * @return {Promise<{ id: string, name: string, juniorCount: number }[]>} - Referents
 */

export const listReferents = async (
  scope: AcademyScope,
  text: string
): Promise<{ id: string; name: string; juniorCount: number }[]> => {
  const rows = await prisma.academyJunior.findMany({
    where: {
      referentId: { not: null },
      status: AcademyJuniorStatuses.Active,
      session: { ...scope.session, status: { in: LIVE_SESSIONS } },
      ...scope.juniors,
      referent: { displayName: { contains: text, mode: 'insensitive' } },
    },
    select: { referentId: true, referent: { select: { displayName: true } } },
    take: ACADEMY_SETTINGS.formJuniorsLimit,
  })

  const counts = new Map<string, { name: string; juniorCount: number }>()
  for (const row of rows) {
    if (!row.referentId || !row.referent) continue
    const known = counts.get(row.referentId)
    counts.set(row.referentId, {
      name: row.referent.displayName,
      juniorCount: (known?.juniorCount ?? 0) + 1,
    })
  }

  return [...counts].map(([id, entry]) => ({ id, ...entry }))
}
