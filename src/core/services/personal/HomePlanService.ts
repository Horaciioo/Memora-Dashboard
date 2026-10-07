import 'server-only'

import { listEntries, readCalendarScope } from '@/core/services/calendar/CalendarService'
import { HOME_SETTINGS } from '@/declarations/configurations/settings'
import type { PermissionHelpers, SessionUser } from '@/types/auth'
import type { HomePlanned } from '@/types/personal'
import { CalendarSources } from '@/utils/constants/workflow'
import type { CalendarSourceName } from '@/utils/constants/workflow'
import { Permissions } from '@/utils/constants/permissions'
import { addDays, startOfDay } from '@/utils/format/days'

// Told apart on the home: birthdays have their own box, absences stay on the calendar
const LEFT_OUT: CalendarSourceName[] = [CalendarSources.Birthday, CalendarSources.Absence]

/**
 * Read what the calendar plans next for a member, one more than the home shows so it knows
 * whether a continuation exists
 * @param {SessionUser} session - Signed-in member
 * @param {PermissionHelpers} access - Permission helpers
 * @return {Promise<HomePlanned[]>} - Coming entries, soonest first
 */

export const upcomingPlans = async (
  session: SessionUser,
  access: PermissionHelpers
): Promise<HomePlanned[]> => {
  if (!access.can(Permissions.CalendarRead)) return []

  const now = new Date()
  const entries = await listEntries({
    from: startOfDay(now),
    to: addDays(now, HOME_SETTINGS.plannedWindowDays),
    viewerId: session.id,
    access,
    scope: await readCalendarScope(session, access),
  })

  return (
    entries
      .filter((entry) => !LEFT_OUT.includes(entry.source))
      // What ended earlier today stays, struck through
      .filter((entry) => new Date(entry.endsAt ?? entry.startsAt) >= startOfDay(now))
      .slice(0, HOME_SETTINGS.plannedMax + 1)
      .map((entry) => ({
        id: entry.id,
        title: entry.title,
        emoji: entry.emoji,
        startsAt: entry.startsAt,
        allDay: entry.allDay,
        isDone: !entry.allDay && new Date(entry.endsAt ?? entry.startsAt) < now,
      }))
  )
}
