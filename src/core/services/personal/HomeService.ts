import 'server-only'

import type { AccessScope } from '@/core/services/auth/ScopeService'
import { birthdaysBetween } from '@/core/services/calendar/projections'
import { HOME_SETTINGS } from '@/declarations/configurations/settings'
import type { HomeBirthday } from '@/types/personal'
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
