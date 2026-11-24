import 'server-only'

import { composeAgenda } from '@/core/lib/assistant/agenda/compose'
import { readAgendaFacts } from '@/core/services/assistant/point/sources'
import { speak } from '@/core/services/assistant/reply'
import type { Resolver } from '@/core/services/assistant/reply'
import type { AgendaFocus, AgendaSpan } from '@/types/agenda'
import { instantToWall } from '@/utils/format/time/zone'

/**
 * Tell where the member stands over a window
 * @param {AgendaSpan} span - Window told
 * @return {Resolver} - Resolver of that point
 */

const pointOf =
  (span: AgendaSpan, focus: AgendaFocus | null = null): Resolver =>
  async (context) => {
    const today = instantToWall(new Date()).slice(0, 10)
    const agenda = composeAgenda(await readAgendaFacts(context, span), today, span, focus)

    return speak({ intent: context.parsed.intent, lines: agenda.lines, replies: agenda.replies })
  }

// One resolver per window
export const resolveDayPoint = pointOf('day')
export const resolveWeekPoint = pointOf('week')

// One kind of fact asked for alone
export const resolveTodo = pointOf('week', 'tasks')
export const resolveLate = pointOf('week', 'late')
export const resolveNextPlans = pointOf('week', 'plans')
export const resolveAway = pointOf('day', 'away')
export const resolveBirthdays = pointOf('week', 'birthdays')
