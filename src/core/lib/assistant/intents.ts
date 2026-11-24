import { isSimilar } from '@/core/lib/assistant/normalize'
import type { AssistantToken } from '@/core/lib/assistant/normalize'
import { ASSISTANT_INTENT_ORDER, ruleOf } from '@/declarations/assistant/domains'
import type { IntentDef } from '@/declarations/assistant/domains/types'
import type { AssistantIntentName } from '@/declarations/assistant/domains'
import { ASSISTANT_PAGES } from '@/declarations/assistant/lexicon'
import type { AssistantPage } from '@/declarations/assistant/lexicon'
import { ASSISTANT_SCORES } from '@/declarations/assistant/scoring'

/**
 * Intent found in a sentence
 * @typedef {Object} IntentMatch
 * @property {AssistantIntentName} intent - Recognised intent
 * @property {number[]} indices - Keywords used
 * @property {AssistantPage | null} page - Named page
 * @property {number} score - Points earned
 */

export interface IntentMatch {
  intent: AssistantIntentName
  indices: number[]
  page: AssistantPage | null
  score: number
}

/**
 * Best intent and those too close to call
 * @typedef {Object} IntentReading
 * @property {IntentMatch} best - Highest score
 * @property {IntentMatch[]} rivals - Within the margin of the best
 */

export interface IntentReading {
  best: IntentMatch
  rivals: IntentMatch[]
}

// A keyword found, exact or through the typo budget
interface Hit {
  index: number
  isExact: boolean
}

/**
 * Words matching a list
 * @param {AssistantToken[]} tokens - Sentence words
 * @param {readonly string[]} [words] - Expected words
 * @return {Hit[]} - Matching positions
 */

const hitsOf = (tokens: AssistantToken[], words?: readonly string[]): Hit[] =>
  words
    ? tokens.flatMap((token, index) =>
        !token.mention && words.some((word) => isSimilar(token.folded, word))
          ? [{ index, isExact: words.includes(token.folded) }]
          : []
      )
    : []

/**
 * Find a run of words
 * @param {AssistantToken[]} tokens - Sentence words
 * @param {string} phrase - Folded words joined by spaces
 * @return {number[] | null} - Positions of the run
 */

export const findRun = (tokens: AssistantToken[], phrase: string): number[] | null => {
  const words = phrase.split(' ')

  for (let start = 0; start + words.length <= tokens.length; start += 1) {
    const fits = words.every((word, offset) => isSimilar(tokens[start + offset].folded, word))
    if (fits) return words.map((_, offset) => start + offset)
  }

  return null
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
    page.phrases.map((phrase) => ({ page, phrase, size: phrase.split(' ').length }))
  ).sort((left, right) => right.size - left.size)

  for (const { page, phrase } of phrases) {
    const indices = findRun(tokens, phrase)
    if (indices) return { page, indices }
  }

  return null
}

/**
 * Score one rule against a sentence
 * @param {AssistantToken[]} tokens - Sentence words
 * @param {IntentDef} rule - Intent rule
 * @param {string} pathname - Page on screen
 * @return {{ score: number, indices: number[] } | null} - Points and keywords, or no match
 */

const scoreRule = (
  tokens: AssistantToken[],
  rule: IntentDef,
  pathname: string
): { score: number; indices: number[] } | null => {
  const verbs = hitsOf(tokens, rule.verbs)
  const strong = hitsOf(tokens, rule.nouns)
  const weak = strong.length > 0 ? [] : hitsOf(tokens, rule.weakNouns)
  const nouns = [...strong, ...weak]
  const phrase = (rule.phrases ?? []).map((text) => findRun(tokens, text)).find(Boolean) ?? null

  const passes = {
    verb: verbs.length > 0,
    noun: nouns.length > 0,
    both: verbs.length > 0 && nouns.length > 0,
    either: verbs.length > 0 || nouns.length > 0,
  }[rule.needs]
  if (!passes && !phrase) return null

  // Only the first noun is a keyword
  const kept = [...verbs, ...nouns.slice(0, 1)]
  const { phrase: phrasePoints, noun, weak: weakPoints, verb, typo } = ASSISTANT_SCORES
  const base =
    (phrase ? phrasePoints : 0) +
    (verbs.length > 0 ? verb : 0) +
    (strong.length > 0 ? noun : weak.length > 0 ? weakPoints : 0)
  const companion = hitsOf(tokens, rule.companions).length > 0 ? ASSISTANT_SCORES.companion : 0
  const isOnScreen = rule.pages?.some((route) => pathname.startsWith(route)) ?? false
  const misspelt = kept.filter((hit) => !hit.isExact).length

  return {
    score:
      base +
      companion +
      (rule.boost ?? 0) +
      (isOnScreen ? ASSISTANT_SCORES.onScreen : 0) -
      misspelt * typo,
    indices: [...kept.map((hit) => hit.index), ...(phrase ?? [])],
  }
}

/**
 * Every intent a sentence reaches, best first
 * @param {AssistantToken[]} tokens - Sentence words
 * @param {string} [pathname] - Page on screen
 * @return {IntentMatch[]} - Matches over the floor
 */

export const scoreIntents = (tokens: AssistantToken[], pathname = ''): IntentMatch[] => {
  const matches = ASSISTANT_INTENT_ORDER.flatMap((intent): IntentMatch[] => {
    // Pages are named, not keyed
    if (ruleOf(intent).kind === 'navigate') {
      const found = findPage(tokens)

      return found
        ? [{ intent, indices: found.indices, page: found.page, score: ASSISTANT_SCORES.namedPage }]
        : []
    }

    const read = scoreRule(tokens, ruleOf(intent), pathname)

    return read ? [{ intent, indices: read.indices, page: null, score: read.score }] : []
  })

  // Stable sort keeps the declared order on equal scores
  return matches
    .filter((match) => match.score >= ASSISTANT_SCORES.floor)
    .sort((left, right) => right.score - left.score)
}

/**
 * Recognise the intent
 * @param {AssistantToken[]} tokens - Sentence words
 * @param {string} [pathname] - Page on screen
 * @return {IntentReading | null} - Best intent, its rivals, or nothing
 */

export const detectIntent = (tokens: AssistantToken[], pathname = ''): IntentReading | null => {
  const [best, ...others] = scoreIntents(tokens, pathname)
  if (!best) return null

  return {
    best,
    rivals: others.filter((match) => best.score - match.score < ASSISTANT_SCORES.margin),
  }
}
