import { isSimilar } from '@/core/lib/assistant/normalize'
import type { AssistantToken } from '@/core/lib/assistant/normalize'
import {
  ASSISTANT_INTENT_ORDER,
  ASSISTANT_INTENTS,
  ASSISTANT_PAGES,
} from '@/declarations/assistant/lexicon'
import type {
  AssistantIntentName,
  AssistantPage,
  IntentRule,
} from '@/declarations/assistant/lexicon'

/**
 * Intent found in a sentence
 * @typedef {Object} IntentMatch
 * @property {AssistantIntentName} intent - Recognised intent
 * @property {number[]} indices - Keywords used
 * @property {AssistantPage | null} page - Named page
 */

export interface IntentMatch {
  intent: AssistantIntentName
  indices: number[]
  page: AssistantPage | null
}

/**
 * Words matching a list
 * @param {AssistantToken[]} tokens - Sentence words
 * @param {readonly string[]} [words] - Expected words
 * @return {number[]} - Matching positions
 */

const positionsOf = (tokens: AssistantToken[], words?: readonly string[]): number[] =>
  words
    ? tokens.flatMap((token, index) =>
        !token.mention && words.some((word) => isSimilar(token.folded, word)) ? [index] : []
      )
    : []

/**
 * Read one rule
 * @param {AssistantToken[]} tokens - Sentence words
 * @param {IntentRule} rule - Intent rule
 * @return {number[] | null} - Keywords or no match
 */

const readRule = (tokens: AssistantToken[], rule: IntentRule): number[] | null => {
  const verbs = positionsOf(tokens, rule.verbs)
  const nouns = positionsOf(tokens, rule.nouns)
  const passes = {
    verb: verbs.length > 0,
    noun: nouns.length > 0,
    both: verbs.length > 0 && nouns.length > 0,
    either: verbs.length > 0 || nouns.length > 0,
  }[rule.needs]

  // Only the first noun is a keyword
  return passes ? [...verbs, ...nouns.slice(0, 1)] : null
}

/**
 * Find a named page
 * @param {AssistantToken[]} tokens - Sentence words
 * @return {{ page: AssistantPage, indices: number[] } | null} - Page and words
 */

export const findPage = (
  tokens: AssistantToken[]
): { page: AssistantPage; indices: number[] } | null => {
  // Longest names first
  const phrases = ASSISTANT_PAGES.flatMap((page) =>
    page.phrases.map((phrase) => ({ page, words: phrase.split(' ') }))
  ).sort((left, right) => right.words.length - left.words.length)

  for (const { page, words } of phrases) {
    for (let start = 0; start + words.length <= tokens.length; start += 1) {
      const fits = words.every((word, offset) => isSimilar(tokens[start + offset].folded, word))
      if (fits) return { page, indices: words.map((_, offset) => start + offset) }
    }
  }

  return null
}

/**
 * Recognise the intent
 * @param {AssistantToken[]} tokens - Sentence words
 * @return {IntentMatch | null} - Intent or nothing
 */

export const detectIntent = (tokens: AssistantToken[]): IntentMatch | null => {
  for (const intent of ASSISTANT_INTENT_ORDER) {
    // Pages are named, not keyed
    if (intent === 'navigate') {
      const found = findPage(tokens)
      if (found) return { intent, indices: found.indices, page: found.page }
      continue
    }

    const indices = readRule(tokens, ASSISTANT_INTENTS[intent])
    if (indices) return { intent, indices, page: null }
  }

  return null
}
