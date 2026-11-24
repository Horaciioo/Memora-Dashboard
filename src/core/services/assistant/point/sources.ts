import 'server-only'

import { awayToday, upcomingBirthdays } from '@/core/services/personal/HomeService'
import { upcomingPlans } from '@/core/services/personal/HomePlanService'
import { myTasks } from '@/core/services/personal/TaskInboxService'
import { AGENDA_DAYS } from '@/core/lib/assistant/agenda/compose'
import type { ResolverContext } from '@/core/services/assistant/reply'
import type { AgendaFacts, AgendaSpan } from '@/types/agenda'
import { Permissions } from '@/utils/constants/permissions'
import { instantToWall } from '@/utils/format/time/zone'

// Wall day of a moment
const dayOf = (moment: string): string => instantToWall(moment).slice(0, 10)

// Entries read for a window, more than a day holds
const PLAN_LIMIT = 50

/**
 * Read what a point is made of, each source under the member's own rights
 * @param {ResolverContext} context - Resolver context
 * @param {AgendaSpan} span - Window told
 * @return {Promise<AgendaFacts>} - Facts, nothing the member may not read
 */

export const readAgendaFacts = async (
  { session, access, scope }: ResolverContext,
  span: AgendaSpan
): Promise<AgendaFacts> => {
  const perimeter = await scope()
  const canSeeAbsences = access.can(Permissions.AbsenceRead)

  const [tasks, plans, away, birthdays] = await Promise.all([
    myTasks(session, access),
    upcomingPlans(session, access, { days: AGENDA_DAYS[span] + 1, limit: PLAN_LIMIT }),
    canSeeAbsences ? awayToday(perimeter) : Promise.resolve([]),
    upcomingBirthdays(perimeter),
  ])

  return {
    tasks: tasks.map((task) => ({
      title: task.title,
      context: task.context,
      href: task.href,
      dueDay: task.dueAt ? dayOf(task.dueAt) : null,
    })),
    plans: plans.map((plan) => ({
      title: plan.title,
      startsAt: plan.startsAt,
      day: dayOf(plan.startsAt),
    })),
    away: away.map((entry) => ({ name: entry.displayName, day: dayOf(entry.until) })),
    birthdays: birthdays.map((entry) => ({ name: entry.displayName, day: entry.day.slice(0, 10) })),
  }
}
