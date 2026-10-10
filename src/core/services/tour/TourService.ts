import 'server-only'

import { prisma } from '@/core/lib/db'
import { isNewcomer, nextRoute, tourRoutes } from '@/core/lib/tour/progress'
import { isEncadrement } from '@/declarations/access/roles'
import { GUIDE_KEYS, tourPageKey } from '@/declarations/academy/welcome'
import { TOUR_SETTINGS } from '@/declarations/configurations/settings'
import { APP_ENVIRONMENT } from '@/declarations/system/environments'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import type { TourState } from '@/types/tour'

/**
 * Where a member stands in the first visit, nothing when it has nothing to show
 * @param {Object} member - Signed-in member
 * @param {string} member.id - Account identifier
 * @param {MemberRoleName} member.role - Hierarchy level
 * @param {string[]} open - Routes the member can open
 * @return {Promise<TourState | null>} - State or null
 */

export const readTourState = async (
  member: { id: string; role: MemberRoleName },
  open: string[]
): Promise<TourState | null> => {
  // Responsables have their own tour to come, written for what they hold
  if (APP_ENVIRONMENT !== 'dev' && isEncadrement(member.role)) return null

  const account = await prisma.account.findUnique({
    where: { id: member.id },
    select: { seenGuides: true, joinedAt: true },
  })
  if (!account || account.seenGuides.includes(GUIDE_KEYS.tourSkipped)) return null

  const held = await prisma.accountFunction.findMany({
    where: { accountId: member.id },
    select: { jobFunction: { select: { name: true } } },
  })
  const routes = tourRoutes(
    open,
    held.map((row) => row.jobFunction.name)
  )
  const seen = routes.filter((route) => account.seenGuides.includes(tourPageKey(route)))
  const isIntroSeen = account.seenGuides.includes(GUIDE_KEYS.tourIntro)

  // Everything explained
  if (isIntroSeen && !nextRoute(routes, seen)) return null

  // Only newcomers are welcomed, every account in development
  const isWelcome =
    APP_ENVIRONMENT === 'dev' ||
    isNewcomer(account.joinedAt, new Date(), TOUR_SETTINGS.newcomerDays)
  if (!isIntroSeen && !isWelcome) return null

  return { isIntroSeen, routes, seen }
}
