import 'server-only'

import { prisma } from '@/core/lib/db'
import { listLevels } from '@/core/services/livecon/LiveconService'
import { readPanel } from '@/core/services/sanctions/SanctionService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_FUNCTIONS } from '@/declarations/lives/registries'
import type { CourseContext, CourseLiveconLevel } from '@/types/academy'
import { GONE_MEMBER_STATUSES, MemberRoles } from '@/utils/constants/hierarchy'
import { SanctionPanels } from '@/utils/constants/moderation'

/**
 * Names standing on each rung of the decision ladder
 * @return {Promise<CourseContext['ladder']>} - Admins and live responsables
 */

const readLadder = async (): Promise<CourseContext['ladder']> => {
  const active = { status: { notIn: GONE_MEMBER_STATUSES } }

  const [admins, leads] = await Promise.all([
    prisma.account.findMany({
      where: { ...active, role: MemberRoles.Admin },
      select: { displayName: true },
      orderBy: { joinedAt: 'asc' },
    }),
    prisma.account.findMany({
      where: { ...active, role: MemberRoles.Responsable },
      select: {
        displayName: true,
        functions: { select: { jobFunction: { select: { name: true } } } },
      },
      orderBy: { displayName: 'asc' },
    }),
  ])

  // Live responsables first
  const live = leads.filter((lead) =>
    lead.functions.some((held) => LIVE_FUNCTIONS.includes(held.jobFunction.name))
  )

  return {
    admins: admins.map((admin) => admin.displayName),
    responsables: (live.length > 0 ? live : leads).map((lead) => lead.displayName),
  }
}

/**
 * Levels
 * @param {AccessScope} scope - Learner perimeter
 * @return {Promise<CourseLiveconLevel[]>} - Levels
 */

const readLivecon = async (scope: AccessScope): Promise<CourseLiveconLevel[]> => {
  const levels = await listLevels()

  // First creator in reach holding a Twitch panel
  const creators = await prisma.sanctionOffense.findMany({
    where: { panel: SanctionPanels.Twitch, archived: false },
    select: { youtuberId: true },
    distinct: ['youtuberId'],
  })
  const creatorId =
    creators.find((row) => scope.isGlobal || scope.youtuberIds.includes(row.youtuberId))
      ?.youtuberId ?? creators[0]?.youtuberId

  return Promise.all(
    levels.map(async (level) => {
      const panel = creatorId
        ? await readPanel({ ...scope, isGlobal: true }, creatorId, SanctionPanels.Twitch, level.id)
        : null

      return {
        level: level.level,
        name: level.name,
        icon: level.icon,
        accent: level.accent,
        samples: (panel?.offenses ?? [])
          .slice(0, ACADEMY_SETTINGS.courseSampleOffenses)
          .map((offense) => ({
            offense: offense.name,
            measures: offense.firstRung?.measures.map((measure) => measure.name) ?? [],
          })),
      }
    })
  )
}

/**
 * Read what a course needs from the database
 * @param {AccessScope} scope - Learner perimeter
 * @return {Promise<CourseContext>} - Course context
 */

export const readCourseContext = async (scope: AccessScope): Promise<CourseContext> => {
  const [ladder, livecon] = await Promise.all([readLadder(), readLivecon(scope)])

  return { ladder, livecon }
}
