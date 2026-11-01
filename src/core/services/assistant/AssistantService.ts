import 'server-only'

import { readPageContext } from '@/core/lib/assistant/context'
import { parseCommand } from '@/core/lib/assistant/parse'
import { resolveLive } from '@/core/services/assistant/lives'
import { resolveLogs } from '@/core/services/assistant/logs'
import { resolveNavigation } from '@/core/services/assistant/navigation'
import { resolveRecord } from '@/core/services/assistant/records'
import { notUnderstood } from '@/core/services/assistant/reply'
import type { Resolver, ResolverContext } from '@/core/services/assistant/reply'
import { resolveCreateTask } from '@/core/services/assistant/tasks'
import type { AssistantIntentName } from '@/declarations/assistant/lexicon'
import type { AssistantProposal, AssistantRequest } from '@/types/assistant'
import { instantToWall } from '@/utils/format/zone'

// One resolver per intent
const RESOLVERS: Record<AssistantIntentName, Resolver> = {
  createTask: resolveCreateTask,
  filterLogs: resolveLogs,
  liveReport: resolveLive,
  openLive: resolveLive,
  openTask: resolveRecord,
  openProject: resolveRecord,
  findMember: resolveRecord,
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
  // Today in the member zone
  const today = instantToWall(new Date()).slice(0, 10)
  const parsed = parseCommand(request.text, today)
  if (!parsed.intent) return notUnderstood()

  return RESOLVERS[parsed.intent]({
    ...context,
    parsed,
    request,
    page: readPageContext(request.pathname),
  })
}
