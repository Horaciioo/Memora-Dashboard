import { ABSENCES } from '@/declarations/assistant/domains/absences'
import { HELP } from '@/declarations/assistant/domains/help'
import { LIVES } from '@/declarations/assistant/domains/lives'
import { LOGS } from '@/declarations/assistant/domains/logs'
import { MEMBERS } from '@/declarations/assistant/domains/members'
import { NAVIGATION_DOMAIN } from '@/declarations/assistant/domains/navigation'
import { NOTIFICATIONS } from '@/declarations/assistant/domains/notifications'
import { PROJECTS } from '@/declarations/assistant/domains/projects'
import { TASKS } from '@/declarations/assistant/domains/tasks'
import type { DomainDef, IntentDef } from '@/declarations/assistant/domains/types'

/**
 * Domains, in the order examples are offered
 * @type {DomainDef[]}
 */

export const ASSISTANT_DOMAINS: readonly DomainDef[] = [
  TASKS,
  NAVIGATION_DOMAIN,
  LIVES,
  LOGS,
  MEMBERS,
  ABSENCES,
  NOTIFICATIONS,
  PROJECTS,
  HELP,
]

/**
 * Every intent by id
 * @type {Record<string, IntentDef>}
 */

export const ASSISTANT_INTENTS = {
  ...TASKS.intents,
  ...ABSENCES.intents,
  ...NOTIFICATIONS.intents,
  ...LOGS.intents,
  ...LIVES.intents,
  ...PROJECTS.intents,
  ...MEMBERS.intents,
  ...HELP.intents,
  ...NAVIGATION_DOMAIN.intents,
} as const

export type AssistantIntentName = keyof typeof ASSISTANT_INTENTS

/**
 * Intent ids
 * @type {AssistantIntentName[]}
 */

export const ASSISTANT_INTENT_ORDER = Object.keys(ASSISTANT_INTENTS) as AssistantIntentName[]

/**
 * Rule of an intent
 * @param {AssistantIntentName} intent - Intent id
 * @return {IntentDef} - Its declaration
 */

export const ruleOf = (intent: AssistantIntentName): IntentDef => ASSISTANT_INTENTS[intent]

/**
 * One sentence per domain, offered when nothing was understood
 * @type {string[]}
 */

export const ASSISTANT_EXAMPLES: readonly string[] = ASSISTANT_DOMAINS.flatMap((domain) => {
  const first = Object.values(domain.intents)[0]

  return first?.examples[0] ? [first.examples[0]] : []
}).slice(0, 5)
