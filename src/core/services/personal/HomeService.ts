import 'server-only'

import type { AccessScope } from '@/core/services/auth/ScopeService'
import { prisma } from '@/core/lib/db'
import { activeAbsenceFilter } from '@/core/services/absences/AbsenceService/shape'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import { birthdaysBetween } from '@/core/services/calendar/projections'
import { HOME_SETTINGS } from '@/declarations/configurations/settings'
import type { HomeAway, HomeBirthday } from '@/types/personal'
import { addDays, startOfDay } from '@/utils/format/time/days'

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
 * Read the members away today
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<HomeAway[]>} - Approved absences covering today
 */

export const awayToday = async (scope: AccessScope): Promise<HomeAway[]> => {
  const rows = await prisma.absence.findMany({
    where: { ...activeAbsenceFilter(), account: scopedWhere('account', scope, {}) },
    include: { account: true },
    orderBy: { endDate: 'asc' },
    take: HOME_SETTINGS.awayMax,
  })

  return rows.map((row) => ({
    accountId: row.accountId,
    displayName: row.account.displayName,
    until: row.endDate.toISOString(),
  }))
}
