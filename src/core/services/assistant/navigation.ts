import 'server-only'

import { fill, notUnderstood, propose, refuse, slot } from '@/core/services/assistant/reply'
import type { Resolver } from '@/core/services/assistant/reply'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { ASSISTANT_PAGES } from '@/declarations/assistant/lexicon'
import type { AssistantIntentName, AssistantPage } from '@/declarations/assistant/lexicon'
import { matchesNavigation, NAVIGATION } from '@/declarations/navigation'
import type { PermissionHelpers, SessionUser } from '@/types/auth'
import type { AssistantMemory, AssistantProposal } from '@/types/assistant'

/**
 * Page open to the member
 * @param {AssistantPage} page - Named page
 * @param {SessionUser} session - Signed-in member
 * @param {PermissionHelpers} access - Permission helpers
 * @return {boolean} - Same gate as the rail
 */

export const canOpenPage = (
  page: AssistantPage,
  session: SessionUser,
  access: PermissionHelpers
): boolean => {
  const item = NAVIGATION.flatMap((group) => group.items).find((entry) => entry.href === page.href)
  const permission = item?.permission ?? page.permission

  return (!permission || access.can(permission)) && matchesNavigation(item?.visibleWhen, session)
}

/**
 * Go somewhere
 * @param {Object} input - Destination parts
 * @param {AssistantIntentName} input.intent - Recognised intent
 * @param {string} input.href - Destination
 * @param {string} input.reply - Sentence shown
 * @param {AssistantMemory} [input.memory] - References to keep
 * @return {AssistantProposal} - Ready proposal
 */

export const goTo = ({
  intent,
  href,
  reply,
  memory = {},
}: {
  intent: AssistantIntentName
  href: string
  reply: string
  memory?: AssistantMemory
}): AssistantProposal => propose(intent, { reply, memory, action: { kind: 'navigate', href } })

/**
 * Open a list page
 * @param {AssistantIntentName} intent - Recognised intent
 * @param {string} href - List page
 * @param {Parameters<Resolver>[0]} context - Resolver context
 * @return {AssistantProposal} - Page or refusal
 */

export const openListPage = (
  intent: AssistantIntentName,
  href: string,
  { session, access }: Parameters<Resolver>[0]
): AssistantProposal => {
  const page = ASSISTANT_PAGES.find((entry) => entry.href === href)
  if (!page) return notUnderstood()
  if (!canOpenPage(page, session, access)) return refuse(intent, ASSISTANT_COPY.noSuchPage)

  return {
    ...goTo({ intent, href, reply: fill(ASSISTANT_COPY.goTo, { page: page.label }) }),
    slots: [slot('page', page.label)],
  }
}

/**
 * Open a named page
 * @type {Resolver}
 */

export const resolveNavigation: Resolver = async (context) =>
  context.parsed.page
    ? openListPage('navigate', context.parsed.page.href, context)
    : notUnderstood()
