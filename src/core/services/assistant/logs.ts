import 'server-only'

import { lookupName } from '@/core/lib/assistant/matching'
import { goTo } from '@/core/services/assistant/navigation'
import { refuse, slot } from '@/core/services/assistant/reply'
import type { Resolver } from '@/core/services/assistant/reply'
import { search } from '@/core/services/search/SearchService'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import { ROUTES } from '@/declarations/navigation'
import { JOURNAL_PARAMS, JOURNAL_PERIODS } from '@/declarations/system/monitoring/journal'
import type { AssistantSlot } from '@/types/assistant'
import type { SessionUser } from '@/types/auth'
import { LOG_LEVELS } from '@/utils/constants/events'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Account behind a typed name
 * @param {string} name - Typed name
 * @param {SessionUser} session - Signed-in member
 * @return {Promise<{ id: string, label: string } | null>} - Single match
 */

const findActor = async (
  name: string,
  session: SessionUser
): Promise<{ id: string; label: string } | null> => {
  const sections = await search(name, session)
  const hits = sections.find((section) => section.group === 'members')?.hits ?? []
  const found = lookupName(
    name,
    hits.map((hit) => ({ ...hit, value: hit.id })),
    ASSISTANT_SETTINGS.maxChoices
  )

  return found.kind === 'one' ? { id: found.match.id, label: found.match.label } : null
}

/**
 * Open the filtered journal
 * @param {ResolverContext} context - Resolver context
 * @return {Promise<AssistantProposal>} - Proposal
 */

export const resolveLogs: Resolver = async ({ parsed, session, access }) => {
  if (!access.can(Permissions.AccessManage)) return refuse('filterLogs')

  const params = new URLSearchParams()
  const slots: AssistantSlot[] = []

  // Level and window
  if (parsed.level) {
    params.set(JOURNAL_PARAMS.level, parsed.level)
    slots.push(slot('level', LOG_LEVELS.label(LOG_LEVELS.ids[parsed.level])))
  }
  if (parsed.period) {
    params.set(JOURNAL_PARAMS.period, parsed.period)
    slots.push(slot('period', JOURNAL_PERIODS[parsed.period].label))
  }

  // An unknown actor becomes free text
  const actor = parsed.actor ? await findActor(parsed.actor, session) : null
  if (actor) {
    params.set(JOURNAL_PARAMS.actor, actor.id)
    slots.push(slot('actor', actor.label))
  } else if (parsed.actor) {
    params.set(JOURNAL_PARAMS.search, parsed.actor)
  }

  const query = params.toString()

  return {
    ...goTo({
      intent: 'filterLogs',
      href: query ? `${ROUTES.journal}?${query}` : ROUTES.journal,
      reply: ASSISTANT_COPY.logsOpen,
    }),
    slots,
  }
}
