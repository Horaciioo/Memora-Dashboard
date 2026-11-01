import 'server-only'

import { resolveReference } from '@/core/lib/assistant/context'
import { lookupName } from '@/core/lib/assistant/matching'
import { goTo, openListPage } from '@/core/services/assistant/navigation'
import { fill, missing, propose, refuse } from '@/core/services/assistant/reply'
import type { Resolver, ResolverContext } from '@/core/services/assistant/reply'
import { listOpenLives, listPastLives } from '@/core/services/lives/LiveService'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import { ROUTES } from '@/declarations/navigation'
import type { AssistantProposal } from '@/types/assistant'
import type { LiveView } from '@/types/lives'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Lives worth reading
 * @param {ResolverContext} context - Resolver context
 * @param {boolean} ended - Only closed ones
 * @return {Promise<LiveView[]>} - Latest first
 */

const candidates = async (
  { session, scope, parsed }: ResolverContext,
  ended: boolean
): Promise<LiveView[]> => {
  const perimeter = await scope()
  const open = ended ? [] : await listOpenLives(perimeter, session.id, session.permissions)
  if (open.length > 0 && (parsed.current || !parsed.latest)) return open

  return listPastLives(perimeter, session.id, session.permissions, ASSISTANT_SETTINGS.maxChoices)
}

/**
 * Live meant by the sentence
 * @param {ResolverContext} context - Resolver context
 * @param {boolean} ended - Only closed ones
 * @return {Promise<LiveView | AssistantProposal>} - Live or answer
 */

const pickLive = async (
  context: ResolverContext,
  ended: boolean
): Promise<LiveView | AssistantProposal> => {
  const intent = context.parsed.intent!
  const lives = await candidates(context, ended)
  const pointed = context.parsed.reference
    ? resolveReference('live', context.page, context.request.memory)
    : null

  // On screen, then by creator
  const onScreen = lives.find((live) => live.id === pointed)
  if (onScreen) return onScreen
  if (!context.parsed.subject)
    return lives[0] ?? propose(intent, { status: 'notFound', reply: ASSISTANT_COPY.noLive })

  const found = lookupName(
    context.parsed.subject,
    lives.map((live) => ({ ...live, value: live.id, label: live.youtuber.name })),
    ASSISTANT_SETTINGS.maxChoices
  )

  // Latest first, so the first match wins
  return found.kind === 'none'
    ? missing(intent, context.parsed.subject)
    : found.kind === 'one'
      ? found.match
      : found.matches[0]
}

/**
 * Open a live or its report
 * @param {ResolverContext} context - Resolver context
 * @return {Promise<AssistantProposal>} - Proposal
 */

export const resolveLive: Resolver = async (context) => {
  const { parsed, access } = context
  const intent = parsed.intent!
  const isReport = intent === 'liveReport'
  if (!access.can(Permissions.LiveRead)) return refuse(intent)

  // A bare word opens the list
  const isBare =
    !isReport && !parsed.latest && !parsed.current && !parsed.subject && !parsed.reference
  if (isBare) return openListPage(intent, ROUTES.lives, context)

  const live = await pickLive(context, isReport)
  if ('reply' in live) return live

  const name = `${live.youtuber.name}, ${live.title}`

  return goTo({
    intent,
    href: isReport ? ROUTES.liveReport(live.id) : ROUTES.live(live.id),
    reply: fill(isReport ? ASSISTANT_COPY.liveReport : ASSISTANT_COPY.liveOpen, { name }),
    memory: { live: { id: live.id, label: name } },
  })
}
