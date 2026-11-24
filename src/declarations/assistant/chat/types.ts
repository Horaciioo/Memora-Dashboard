import type { ScenarioLink } from '@/types/scenario'

/**
 * One subject Memora can chat about without any data
 * @typedef {Object} ChatTopic
 * @property {string} id - Stable name
 * @property {string[]} [phrases] - Fixed wordings
 * @property {string[][]} [groups] - Every group needs one of its words
 * @property {string[]} [words] - Single words that settle the subject
 * @property {string[]} [exact] - Whole sentences that settle it
 * @property {boolean} [strict] - Words must be typed exactly
 * @property {string[][]} replies - Wordings of the same answer
 * @property {string[]} [next] - Sentences offered as clickable answers,
 * @property {ScenarioLink} [link] - Page the last line points at
 */

export interface ChatTopic {
  id: string
  phrases?: readonly string[]
  groups?: readonly (readonly string[])[]
  words?: readonly string[]
  exact?: readonly string[]
  strict?: boolean
  replies: readonly (readonly string[])[]
  next?: readonly string[]
  link?: ScenarioLink
}
