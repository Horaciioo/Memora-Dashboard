import 'server-only'

import { fill, notUnderstood, propose, refuse, slot } from '@/core/services/assistant/reply'
import type { Resolver } from '@/core/services/assistant/reply'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { ASSISTANT_PAGES } from '@/declarations/assistant/lexicon'
import type { AssistantIntentName } from '@/declarations/assistant/domains'
import type { AssistantPage } from '@/declarations/assistant/lexicon'
import { matchesNavigation, NAVIGATION } from '@/declarations/navigation'
import type { PermissionHelpers, SessionUser } from '@/types/auth'
import type { PermissionName } from '@/utils/constants/permissions'
import type { AssistantMemory, AssistantProposal } from '@/types/assistant'

/**
 * Why a page is open or shut to a member
 * @typedef {Object} PageGate
 * @property {boolean} isOpen - Same gate as the rail
 * @property {PermissionName | null} missing - Right the member lacks
 * @property {boolean} isRoleLocked - The page is kept for other roles or statuses
 */

export interface PageGate {
  isOpen: boolean
  missing: PermissionName | null
  isRoleLocked: boolean
}

/**
 * Read the gate of a page for a member
 * @param {AssistantPage} page - Named page
 * @param {SessionUser} session - Signed-in member
 * @param {PermissionHelpers} access - Permission helpers
 * @return {PageGate} - Open or what keeps it shut
 */

export const gateOf = (
  page: Pick<AssistantPage, 'href' | 'permission'>,
  session: SessionUser,
  access: PermissionHelpers
): PageGate => {
  const item = NAVIGATION.flatMap((group) => group.items).find((entry) => entry.href === page.href)
  const permission = item?.permission ?? page.permission
  const missing = permission && !access.can(permission) ? permission : null
  const isRoleLocked = !matchesNavigation(item?.visibleWhen, session)

  return { isOpen: !missing && !isRoleLocked, missing, isRoleLocked }
}

/**
 * Page open to the member
 * @param {AssistantPage} page - Named page
 * @param {SessionUser} session - Signed-in member
 * @param {PermissionHelpers} access - Permission helpers
 * @return {boolean} - Same gate as the rail
 */

export const canOpenPage = (
  page: Pick<AssistantPage, 'href' | 'permission'>,
  session: SessionUser,
  access: PermissionHelpers
): boolean => gateOf(page, session, access).isOpen

/**
 * Name of a page as the rail shows it
 * @param {string} href - Page address
 * @return {string} - Rail label, else the label Memora knows it by
 */

export const pageName = (href: string): string =>
  NAVIGATION.flatMap((group) => group.items).find((entry) => entry.href === href)?.label ??
  ASSISTANT_PAGES.find((page) => page.href === href)?.label ??
  href

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
