/**
 * Guided talks Memora can lead
 * @type {'absence' | 'recruitment' | 'candidate' | 'task' | 'junior' | 'identity' | 'live'}
 */

export type ScenarioId =
  | 'absence'
  | 'recruitment'
  | 'candidate'
  | 'task'
  | 'junior'
  | 'identity'
  | 'live'

/**
 * One answer Memora offers
 * @typedef {Object} ScenarioChoice
 * @property {string} value - Stored value
 * @property {string} label - Shown label
 * @property {string} [hint] - Small detail under the label
 * @property {'success' | 'danger'} [tone] - Colour of its button
 */

export interface ScenarioChoice {
  value: string
  label: string
  hint?: string
  tone?: 'success' | 'danger'
}

/**
 * Days taken, both ends counted
 * @typedef {Object} ScenarioSpan
 * @property {string} start - First ISO day
 * @property {string} end - Last ISO day
 */

export interface ScenarioSpan {
  start: string
  end: string
}

/**
 * What Memora waits for after her lines
 * @type {{ kind: 'choices', choices: ScenarioChoice[] } | { kind: 'period', booked: ScenarioSpan[], focus?: string } | { kind: 'text' } | { kind: 'search', placeholder?: string } | { kind: 'multi', choices: ScenarioChoice[] } | { kind: 'percent', value: number, max: number }}
 */

export type ScenarioAsk =
  | { kind: 'choices'; choices: ScenarioChoice[] }
  | { kind: 'period'; booked: ScenarioSpan[]; focus?: string }
  | { kind: 'text' }
  | { kind: 'search'; placeholder?: string }
  | { kind: 'multi'; choices: ScenarioChoice[] }
  | { kind: 'percent'; value: number; max: number }

/**
 * What the member answered
 * @typedef {Object} ScenarioAnswer
 * @property {string} value - Value read, "start/end" for a period
 * @property {string} label - Line shown as theirs
 */

export interface ScenarioAnswer {
  value: string
  label: string
}

/**
 * Where a line points
 * @typedef {Object} ScenarioLink
 * @property {string} label - Shown text
 * @property {string} href - Page opened
 */

export interface ScenarioLink {
  label: string
  href: string
}

/**
 * A person drawn in the thread: portrait, name, identifier
 * @typedef {Object} ScenarioCard
 * @property {string} name - Name shown
 * @property {string} id - Identifier shown under it
 * @property {string | null} avatarUrl - Portrait
 */

export interface ScenarioCard {
  name: string
  id: string
  avatarUrl: string | null
}

/**
 * A line, with a link or a person under it
 * @type {string | { text: string, link: ScenarioLink } | { text: string, card: ScenarioCard }}
 */

export type ScenarioLine =
  string | { text: string; link: ScenarioLink } | { text: string; card: ScenarioCard }

/**
 * What a step hands back
 * @typedef {Object} ScenarioMove
 * @property {ScenarioLine[]} say - Lines written one after the other
 * @property {ScenarioAsk} [ask] - Answer waited for, the next step gets it
 * @property {string} [next] - Step run after the answer, or straight on without an ask
 * @property {boolean} [thinking] - Memora thinks before the next step
 * @property {Record<string, string>} [data] - Values kept for later steps
 */

export interface ScenarioMove {
  say: ScenarioLine[]
  ask?: ScenarioAsk
  next?: string
  thinking?: boolean
  data?: Record<string, string>
}

/**
 * What a step reads
 * @typedef {Object} ScenarioContext
 * @property {string} today - ISO day of the member
 * @property {string} accountId - Signed-in member
 * @property {string} name - First name of the signed-in member
 * @property {Record<string, string>} data - Values kept so far
 * @property {() => void} refresh - Reloads the page behind the chat
 */

export interface ScenarioContext {
  today: string
  accountId: string
  name: string
  data: Record<string, string>
  refresh: () => void
}

/**
 * One step of a talk
 * @type {(context: ScenarioContext, answer: ScenarioAnswer | null) => Promise<ScenarioMove>}
 */

export type ScenarioStep = (
  context: ScenarioContext,
  answer: ScenarioAnswer | null
) => Promise<ScenarioMove>

/**
 * A guided talk
 * @typedef {Object} Scenario
 * @property {Record<string, string>} entries - First step per way in
 * @property {Record<string, ScenarioStep>} steps - Every step by name
 */

export interface Scenario {
  entries: Record<string, string>
  steps: Record<string, ScenarioStep>
}
