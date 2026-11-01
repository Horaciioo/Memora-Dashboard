import type { AssistantIntentName } from '@/declarations/assistant/lexicon'

/**
 * Resource the assistant can point at
 * @type {'member' | 'task' | 'project' | 'live'}
 */

export type AssistantEntityKind = 'member' | 'task' | 'project' | 'live'

/**
 * One resource already named
 * @typedef {Object} AssistantReference
 * @property {string} id - Resource identifier
 * @property {string} label - Display name
 */

export interface AssistantReference {
  id: string
  label: string
}

/**
 * Last resource of each kind
 * @type {Partial<Record<AssistantEntityKind, AssistantReference>>}
 */

export type AssistantMemory = Partial<Record<AssistantEntityKind, AssistantReference>>

/**
 * What the palette sends
 * @typedef {Object} AssistantRequest
 * @property {string} text - Typed sentence
 * @property {string} pathname - Page on screen
 * @property {AssistantMemory} memory - Earlier references
 * @property {Record<string, string>} filled - Answered slots
 */

export interface AssistantRequest {
  text: string
  pathname: string
  memory: AssistantMemory
  filled: Record<string, string>
}

/**
 * One recognised parameter
 * @typedef {Object} AssistantSlot
 * @property {string} key - Slot name
 * @property {string} label - Slot label
 * @property {string} value - Display value
 */

export interface AssistantSlot {
  key: string
  label: string
  value: string
}

/**
 * One pickable answer
 * @typedef {Object} AssistantChoice
 * @property {string} value - Stored value
 * @property {string} label - Display label
 * @property {string} [hint] - Tells homonyms apart
 */

export interface AssistantChoice {
  value: string
  label: string
  hint?: string
}

/**
 * Slot still to answer
 * @typedef {Object} AssistantQuestion
 * @property {string} slot - Slot name
 * @property {string} label - Slot label
 * @property {'text' | 'date' | 'choice'} kind - Answer shape
 * @property {AssistantChoice[]} choices - Offered answers
 */

export interface AssistantQuestion {
  slot: string
  label: string
  kind: 'text' | 'date' | 'choice'
  choices: AssistantChoice[]
}

/**
 * Action ready to run
 * @type {{ kind: 'navigate', href: string } | { kind: 'createTask', values: Record<string, string> }}
 */

export type AssistantAction =
  { kind: 'navigate'; href: string } | { kind: 'createTask'; values: Record<string, string> }

/**
 * Outcome of an interpretation
 * @type {'ready' | 'question' | 'unknown' | 'denied' | 'notFound'}
 */

export type AssistantStatus = 'ready' | 'question' | 'unknown' | 'denied' | 'notFound'

/**
 * What the assistant answers
 * @typedef {Object} AssistantProposal
 * @property {AssistantStatus} status - Outcome
 * @property {AssistantIntentName | null} intent - Recognised intent
 * @property {string} reply - Sentence shown
 * @property {AssistantSlot[]} slots - Recognised parameters
 * @property {AssistantQuestion | null} question - Missing answer
 * @property {AssistantAction | null} action - Runnable action
 * @property {boolean} confirm - Needs a yes
 * @property {string[]} suggestions - Example sentences
 * @property {AssistantMemory} memory - References to keep
 */

export interface AssistantProposal {
  status: AssistantStatus
  intent: AssistantIntentName | null
  reply: string
  slots: AssistantSlot[]
  question: AssistantQuestion | null
  action: AssistantAction | null
  confirm: boolean
  suggestions: string[]
  memory: AssistantMemory
}
