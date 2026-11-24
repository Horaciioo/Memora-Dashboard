import type { PermissionName } from '@/utils/constants/permissions'

/**
 * What an intent does once understood
 * @type {'read' | 'act' | 'say' | 'help' | 'navigate' | 'scenario'}
 */

export type IntentKind = 'read' | 'act' | 'say' | 'help' | 'navigate' | 'scenario'

/**
 * Words an intent listens for
 * @typedef {Object} IntentDef
 * @property {string} label - Name offered when two intents tie
 * @property {IntentKind} kind - What it does
 * @property {'verb' | 'noun' | 'both' | 'either'} needs - Words required
 * @property {string[]} [verbs] - Action words
 * @property {string[]} [nouns] - Resource words, strong
 * @property {string[]} [weakNouns] - Resource words that fit many intents
 * @property {string[]} [phrases] - Fixed wordings, enough alone
 * @property {string[]} [companions] - Words that confirm the intent
 * @property {string[]} [pages] - Routes where the intent gains weight
 * @property {number} [boost] - Points when it matches, a question outranks the action words it quotes
 * @property {PermissionName} [permission] - Right needed before anything is read
 * @property {string[]} examples - Sentences it must win, offered as suggestions
 */

export interface IntentDef {
  label: string
  kind: IntentKind
  needs: 'verb' | 'noun' | 'both' | 'either'
  verbs?: readonly string[]
  nouns?: readonly string[]
  weakNouns?: readonly string[]
  phrases?: readonly string[]
  companions?: readonly string[]
  pages?: readonly string[]
  boost?: number
  permission?: PermissionName
  examples: readonly string[]
}

/**
 * Intents of one field of the app
 * @typedef {Object} DomainDef
 * @property {string} label - Domain name
 * @property {string} summary - What Memora does there, in her words
 * @property {Record<string, IntentDef>} intents - Intents by id
 */

export interface DomainDef<Intents extends Record<string, IntentDef> = Record<string, IntentDef>> {
  label: string
  summary: string
  intents: Intents
}

/**
 * Keep the literal ids of a domain
 * @param {DomainDef} domain - Domain declared
 * @return {DomainDef} - Same domain
 */

export const defineDomain = <const Intents extends Record<string, IntentDef>>(
  domain: DomainDef<Intents>
): DomainDef<Intents> => domain
