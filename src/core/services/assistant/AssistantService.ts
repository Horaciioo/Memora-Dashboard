import 'server-only'

import { readPageContext } from '@/core/lib/assistant/context'
import { isNexusInput } from '@/core/lib/nexus/intercept'
import { parseCommand } from '@/core/lib/assistant/parse'
import { resolveAbsence } from '@/core/services/assistant/absences'
import {
  resolveAway,
  resolveBirthdays,
  resolveDayPoint,
  resolveLate,
  resolveNextPlans,
  resolveTodo,
  resolveWeekPoint,
} from '@/core/services/assistant/point'
import { resolveStats } from '@/core/services/assistant/stats'
import {
  resolveAnnouncements,
  resolveLateProjects,
  resolveNextMeeting,
  resolvePendingAbsences,
  resolvePendingUnban,
  resolveProjectPoint,
} from '@/core/services/assistant/work'
import { resolveGesture } from '@/core/services/assistant/gestures'
import { resolveWhy } from '@/core/services/assistant/access'
import { resolveWhatsNew } from '@/core/services/assistant/news'
import { resolveCapabilities, resolveGuide, resolveWhere } from '@/core/services/assistant/help'
import { resolveLive } from '@/core/services/assistant/lives'
import { resolveLogs } from '@/core/services/assistant/logs'
import { resolveNavigation } from '@/core/services/assistant/navigation'
import { resolveRecord } from '@/core/services/assistant/records'
import { askChoice, notUnderstood, refuse } from '@/core/services/assistant/reply'
import type { Resolver, ResolverContext } from '@/core/services/assistant/reply'
import { resolveCreateTask } from '@/core/services/assistant/tasks'
import { ruleOf } from '@/declarations/assistant/domains'
import type { AssistantIntentName } from '@/declarations/assistant/domains'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import type { AssistantProposal, AssistantRequest } from '@/types/assistant'
import { instantToWall } from '@/utils/format/time/zone'

// One resolver per intent
const RESOLVERS: Record<AssistantIntentName, Resolver> = {
  stats: resolveStats,
  projectPoint: resolveProjectPoint,
  lateProjects: resolveLateProjects,
  nextMeeting: resolveNextMeeting,
  weekAnnouncements: resolveAnnouncements,
  pendingAbsences: resolvePendingAbsences,
  pendingUnban: resolvePendingUnban,
  dayPoint: resolveDayPoint,
  weekPoint: resolveWeekPoint,
  myTodo: resolveTodo,
  myLate: resolveLate,
  nextPlans: resolveNextPlans,
  whoAway: resolveAway,
  nextBirthdays: resolveBirthdays,
  createTask: resolveCreateTask,
  completeTask: resolveGesture,
  reopenTask: resolveGesture,
  deleteTask: resolveGesture,
  approveAbsence: resolveGesture,
  refuseAbsence: resolveGesture,
  readNotifications: resolveGesture,
  absence: resolveAbsence,
  filterLogs: resolveLogs,
  liveReport: resolveLive,
  openLive: resolveLive,
  openTask: resolveRecord,
  openProject: resolveRecord,
  openMeeting: resolveRecord,
  openPage: resolveRecord,
  findMember: resolveRecord,
  capabilities: resolveCapabilities,
  howTo: resolveGuide,
  define: resolveGuide,
  whereIs: resolveWhere,
  whyNot: resolveWhy,
  whatsNew: resolveWhatsNew,
  navigate: resolveNavigation,
}

/**
 * Interpret a sentence
 * @param {AssistantRequest} request - Palette request
 * @param {Omit<ResolverContext, 'parsed' | 'request' | 'page'>} context - Signed-in member
 * @return {Promise<AssistantProposal>} - Proposal, never run
 */

export const interpret = async (
  request: AssistantRequest,
  context: Omit<ResolverContext, 'parsed' | 'request' | 'page'>
): Promise<AssistantProposal> => {
  // The console has its own door only
  if (isNexusInput(request.text)) return notUnderstood()

  // Today in the member zone
  const today = instantToWall(new Date()).slice(0, 10)
  const parsed = parseCommand(request.text, today, {
    pathname: request.pathname,
    intent: request.filled.intent,
  })
  if (!parsed.intent) return notUnderstood(request.pathname)

  // Two readings too close: the member picks one
  if (parsed.rivals.length > 0) {
    return askChoice({
      intent: parsed.intent,
      slotKey: 'intent',
      reply: ASSISTANT_COPY.whichIntent,
      choices: [parsed.intent, ...parsed.rivals].map((intent) => ({
        value: intent,
        label: ruleOf(intent).label,
      })),
    })
  }

  // The right is checked before anything is read
  const permission = ruleOf(parsed.intent).permission
  if (permission && !context.access.can(permission)) return refuse(parsed.intent)

  return RESOLVERS[parsed.intent]({
    ...context,
    parsed,
    request,
    page: readPageContext(request.pathname, request.element),
  })
}
