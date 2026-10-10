import 'server-only'

import { prisma } from '@/core/lib/db'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { birthdaysBetween } from '@/core/services/calendar/projections'
import { HOME_SETTINGS } from '@/declarations/configurations/settings'
import { TRADE_SHORTCUTS } from '@/declarations/personal/shortcuts'
import { tradeOfFunction } from '@/declarations/reference/fixed'
import type { SessionUser } from '@/types/auth'
import type { HomeBirthday } from '@/types/personal'
import { MemberRoles } from '@/utils/constants/hierarchy'
import { addDays, startOfDay } from '@/utils/format/days'

/**
 * Read the birthdays coming up
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<HomeBirthday[]>} - Coming birthdays
 */

export const upcomingBirthdays = async (scope: AccessScope): Promise<HomeBirthday[]> => {
  const from = startOfDay(new Date())
  const occurrences = await birthdaysBetween(
    from,
    addDays(from, HOME_SETTINGS.birthdayWindowDays),
    scope
  )

  return occurrences.slice(0, HOME_SETTINGS.birthdayMax).map((occurrence) => ({
    accountId: occurrence.accountId,
    displayName: occurrence.displayName,
    avatarUrl: occurrence.avatarUrl,
    day: occurrence.day.toISOString(),
  }))
}

/**
 * Trade a moderator works in, none for the other roles
 * @param {SessionUser} session - Signed-in member
 * @return {Promise<string | null>} - Trade name
 */

export const moderatorTrade = async (session: SessionUser): Promise<string | null> => {
  if (session.role !== MemberRoles.Moderateur || session.functionIds.length === 0) return null

  const held = await prisma.jobFunction.findMany({
    where: { id: { in: session.functionIds } },
    select: { name: true },
  })

  return (
    held.map((row) => tradeOfFunction(row.name)).find((trade) => trade in TRADE_SHORTCUTS) ?? null
  )
}
