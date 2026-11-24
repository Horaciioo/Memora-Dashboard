import type { AssistantIntentName } from '@/declarations/assistant/domains'
import type { GestureId } from '@/declarations/assistant/gestures'
import type { ScenarioLink } from '@/types/scenario'

/**
 * Resource the assistant can point at
 * @type {'member' | 'task' | 'project' | 'live'}
 */

export type AssistantEntityKind =
  'member' | 'task' | 'project' | 'live' | 'absence' | 'meeting' | 'page'

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
 * Record the page on screen is about
 * @typedef {Object} AssistantElement
 * @property {string} kind - Record kind, the guided talk it opens
 * @property {string} id - Record identifier
 * @property {string} label - Display name
 */

export interface AssistantElement {
  kind: string
  id: string
  label: string
}

/**
 * What the palette sends
 * @typedef {Object} AssistantRequest
 * @property {string} text - Typed sentence
 * @property {string} pathname - Page on screen
 * @property {string} tab - Tab open on that page
 * @property {AssistantElement | null} element - Record the page declared
 * @property {AssistantMemory} memory - Earlier references
 * @property {Record<string, string>} filled - Answered slots
 */

export interface AssistantRequest {
  text: string
  pathname: string
  tab: string
  element: AssistantElement | null
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
 * Way into the absence talk
 * @type {'create' | 'edit' | 'delete' | 'list'}
 */

export type AssistantAbsenceMode = 'create' | 'edit' | 'delete' | 'list'

/**
 * Talk Memora leads on her own, once the sentence opened it
 * @typedef {Object} AssistantScenarioStart
 * @property {'scenario'} kind - Action kind
 * @property {'absence'} scenario - Talk to open
 * @property {AssistantAbsenceMode} entry - Way in
 */

export interface AssistantScenarioStart {
  kind: 'scenario'
  scenario: 'absence'
  entry: AssistantAbsenceMode
}

/**
 * One line Memora says, already written, with the page it points at
 * @typedef {Object} AssistantSayLine
 * @property {string} text - Sentence, names between « »
 * @property {ScenarioLink} [link] - Page the line points at
 */

export interface AssistantSayLine {
  text: string
  link?: ScenarioLink
}

/**
 * How much a gesture can hurt, it sets the confirmation
 * @type {'light' | 'medium' | 'strong'}
 */

export type AssistantRisk = 'light' | 'medium' | 'strong'

/**
 * Request a gesture sends to an existing route
 * @typedef {Object} AssistantCall
 * @property {'POST' | 'PATCH' | 'DELETE'} method - HTTP verb
 * @property {string} path - API path
 * @property {Record<string, unknown>} [body] - Payload
 */

export interface AssistantCall {
  method: 'POST' | 'PATCH' | 'DELETE'
  path: string
  body?: Record<string, unknown>
}

/**
 * Gesture Memora does in the member's place
 * @typedef {Object} AssistantGestureAction
 * @property {'act'} kind - Action kind
 * @property {GestureId} gesture - Registry entry
 * @property {AssistantRisk} risk - Confirmation level
 * @property {AssistantCall} call - Request to send
 * @property {AssistantCall | null} undo - Request that takes it back
 * @property {string} confirmLabel - Button that runs it
 * @property {string} done - Sentence once done
 * @property {string | null} sure - Second question of a strong gesture
 * @property {AssistantEntityKind | null} remember - Kind the answer names
 */

export interface AssistantGestureAction {
  kind: 'act'
  gesture: GestureId
  risk: AssistantRisk
  call: AssistantCall
  undo: AssistantCall | null
  confirmLabel: string
  done: string
  sure: string | null
  remember: AssistantEntityKind | null
}

/**
 * Action ready to run
 * @type {{ kind: 'navigate', href: string } | { kind: 'say', lines: AssistantSayLine[] } | AssistantGestureAction | AssistantScenarioStart}
 */

export type AssistantAction =
  | { kind: 'navigate'; href: string }
  | { kind: 'say'; lines: AssistantSayLine[] }
  | AssistantGestureAction
  | AssistantScenarioStart

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
 * @property {string[]} suggestions - Answers the member can click
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
