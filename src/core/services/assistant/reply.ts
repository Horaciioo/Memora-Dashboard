import type { ParsedCommand } from '@/core/lib/assistant/parse'
import type { PageContext } from '@/core/lib/assistant/context'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { ASSISTANT_COPY, ASSISTANT_SLOT_LABELS } from '@/declarations/assistant/copy'
import type { AssistantSlotKey } from '@/declarations/assistant/copy'
import { ASSISTANT_EXAMPLES } from '@/declarations/assistant/lexicon'
import type { AssistantIntentName } from '@/declarations/assistant/lexicon'
import type { PermissionHelpers, SessionUser } from '@/types/auth'
import type {
  AssistantChoice,
  AssistantProposal,
  AssistantRequest,
  AssistantSlot,
} from '@/types/assistant'

/**
 * What a resolver reads
 * @typedef {Object} ResolverContext
 * @property {ParsedCommand} parsed - Sentence parts
 * @property {AssistantRequest} request - Palette request
 * @property {SessionUser} session - Signed-in member
 * @property {PermissionHelpers} access - Permission helpers
 * @property {() => Promise<AccessScope>} scope - Creator perimeter
 * @property {PageContext | null} page - Resource on screen
 */

export interface ResolverContext {
  parsed: ParsedCommand
  request: AssistantRequest
  session: SessionUser
  access: PermissionHelpers
  scope: () => Promise<AccessScope>
  page: PageContext | null
}

/**
 * One intent resolver
 * @type {(context: ResolverContext) => Promise<AssistantProposal>}
 */

export type Resolver = (context: ResolverContext) => Promise<AssistantProposal>

/**
 * Fill a sentence
 * @param {string} template - Sentence with slots
 * @param {Record<string, string>} values - Slot values
 * @return {string} - Sentence
 */

export const fill = (template: string, values: Record<string, string>): string =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match)

/**
 * Build a proposal
 * @param {AssistantIntentName | null} intent - Recognised intent
 * @param {Partial<AssistantProposal>} parts - Known parts
 * @return {AssistantProposal} - Full proposal
 */

export const propose = (
  intent: AssistantIntentName | null,
  parts: Partial<AssistantProposal>
): AssistantProposal => ({
  status: 'ready',
  intent,
  reply: '',
  slots: [],
  question: null,
  action: null,
  confirm: false,
  suggestions: [],
  memory: {},
  ...parts,
})

/**
 * One recognised parameter
 * @param {AssistantSlotKey} key - Slot name
 * @param {string} value - Display value
 * @return {AssistantSlot} - Slot
 */

export const slot = (key: AssistantSlotKey, value: string): AssistantSlot => ({
  key,
  label: ASSISTANT_SLOT_LABELS[key],
  value,
})

/**
 * Nothing understood
 * @return {AssistantProposal} - Unknown reply
 */

export const notUnderstood = (): AssistantProposal =>
  propose(null, {
    status: 'unknown',
    reply: ASSISTANT_COPY.unknown,
    suggestions: [...ASSISTANT_EXAMPLES],
  })

/**
 * Access refused
 * @param {AssistantIntentName} intent - Recognised intent
 * @param {string} [reply] - Specific reason
 * @return {AssistantProposal} - Denied reply
 */

export const refuse = (intent: AssistantIntentName, reply?: string): AssistantProposal =>
  propose(intent, { status: 'denied', reply: reply ?? ASSISTANT_COPY.denied })

/**
 * Nothing by that name
 * @param {AssistantIntentName} intent - Recognised intent
 * @param {string} name - Typed name
 * @return {AssistantProposal} - Not found reply
 */

export const missing = (intent: AssistantIntentName, name: string): AssistantProposal =>
  propose(intent, { status: 'notFound', reply: fill(ASSISTANT_COPY.notFound, { name }) })

/**
 * Ask to pick one
 * @param {Object} input - Question parts
 * @param {AssistantIntentName} input.intent - Recognised intent
 * @param {AssistantSlotKey} input.slotKey - Slot answered
 * @param {string} input.reply - Question asked
 * @param {AssistantChoice[]} input.choices - Offered answers
 * @param {AssistantSlot[]} [input.slots] - Known parameters
 * @return {AssistantProposal} - Question
 */

export const askChoice = ({
  intent,
  slotKey,
  reply,
  choices,
  slots = [],
}: {
  intent: AssistantIntentName
  slotKey: AssistantSlotKey
  reply: string
  choices: AssistantChoice[]
  slots?: AssistantSlot[]
}): AssistantProposal =>
  propose(intent, {
    status: 'question',
    reply,
    slots,
    question: { slot: slotKey, label: ASSISTANT_SLOT_LABELS[slotKey], kind: 'choice', choices },
  })
