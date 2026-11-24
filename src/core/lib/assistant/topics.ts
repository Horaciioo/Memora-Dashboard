import { findRun } from '@/core/lib/assistant/intents'
import type { AssistantToken } from '@/core/lib/assistant/normalize'

/**
 * Something a sentence can be about, named by words
 * @typedef {Object} Nameable
 * @property {string} id - Stable identifier
 * @property {string[]} phrases - Folded words, runs of words allowed
 */

export interface Nameable {
  id: string
  phrases: readonly string[]
}

/**
 * Entries a sentence names, the most precisely named first
 * @param {AssistantToken[]} tokens - Sentence words
 * @param {Nameable[]} entries - Candidates
 * @return {{ entry: Nameable, score: number }[]} - Named entries, longest names first
 */

export const rankNamed = <T extends Nameable>(
  tokens: AssistantToken[],
  entries: readonly T[]
): { entry: T; score: number }[] =>
  entries
    .map((entry) => ({
      entry,
      // One point per word of the longest name found
      score: Math.max(
        0,
        ...entry.phrases.map((phrase) => (findRun(tokens, phrase) ? phrase.split(' ').length : 0))
      ),
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
