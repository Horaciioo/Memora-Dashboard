import 'server-only'

import { prisma } from '@/core/lib/db'
import { isNewcomer, nextRoute, tourRoutes } from '@/core/lib/tour/progress'
import { socialFormFields } from '@/core/services/members/MemberFileService'
import { isEncadrement } from '@/declarations/access/roles'
import { GUIDE_KEYS, tourPageKey } from '@/declarations/academy/welcome'
import { TOUR_SETTINGS } from '@/declarations/configurations/settings'
import { WELCOMES_EVERY_ACCOUNT } from '@/declarations/system/environments'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import type { TourCreator, TourState } from '@/types/tour'

// Fields the visit reads on a creator
const CREATOR_SELECT = { name: true, avatarUrl: true, bannerUrl: true } as const

/**
 * Creator the visit shows: the member's own, else the first one of the team
 * @param {string} accountId - Account identifier
 * @return {Promise<TourCreator | null>} - Creator
 */

const creatorOf = async (accountId: string): Promise<TourCreator | null> => {
  const own = await prisma.youtuber.findFirst({
    where: { archived: false, accounts: { some: { id: accountId } } },
    orderBy: { position: 'asc' },
    select: CREATOR_SELECT,
  })

  return (
    own ??
    prisma.youtuber.findFirst({
      where: { archived: false },
      orderBy: { position: 'asc' },
      select: CREATOR_SELECT,
    })
  )
}

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
  if (!WELCOMES_EVERY_ACCOUNT && isEncadrement(member.role)) return null

  const account = await prisma.account.findUnique({
    where: { id: member.id },
    select: { seenGuides: true, joinedAt: true },
  })
  if (!account) return null

  // Played once, left or finished
  if (
    account.seenGuides.includes(GUIDE_KEYS.tourSkipped) ||
    account.seenGuides.includes(GUIDE_KEYS.tourDone)
  ) {
    return null
  }

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

  // Only newcomers are welcomed, every account in development and staging
  const isWelcome =
    WELCOMES_EVERY_ACCOUNT || isNewcomer(account.joinedAt, new Date(), TOUR_SETTINGS.newcomerDays)
  if (!isIntroSeen && !isWelcome) return null

  return {
    isIntroSeen,
    routes,
    seen,
    creator: await creatorOf(member.id),
    // The welcome asks the networks as the file does
    socialFields: isIntroSeen ? [] : await socialFormFields(),
  }
}
