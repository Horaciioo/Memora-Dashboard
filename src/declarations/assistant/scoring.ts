import assistant from '@/configurations/system/assistant.json'
import { readInteger } from '@/declarations/configurations/readers'

// Weights a sentence earns per signal, then the bars an intent must clear
const SCORE_FALLBACKS = {
  phrase: 50,
  noun: 40,
  weak: 25,
  verb: 25,
  companion: 20,
  onScreen: 15,
  namedPage: 20,
  typo: 5,
  floor: 20,
  margin: 15,
} as const

/**
 * Points per signal, lowest score kept, gap that makes Memora ask
 * @type {Record<keyof typeof SCORE_FALLBACKS, number>}
 */

export const ASSISTANT_SCORES = Object.fromEntries(
  Object.entries(SCORE_FALLBACKS).map(([key, fallback]) => [
    key,
    readInteger(assistant.scores[key as keyof typeof SCORE_FALLBACKS], {
      path: `system/assistant.scores.${key}`,
      fallback,
      min: 0,
    }),
  ])
) as Record<keyof typeof SCORE_FALLBACKS, number>

// Weights of the free chat, and its bars
const CHAT_FALLBACKS = {
  phrase: 60,
  group: 50,
  word: 40,
  floor: 40,
  shortWords: 2,
  nextShown: 3,
} as const

/**
 * Points per chat signal, words under which a sentence is short, answers offered
 * @type {Record<keyof typeof CHAT_FALLBACKS, number>}
 */

export const CHAT_SCORES = Object.fromEntries(
  Object.entries(CHAT_FALLBACKS).map(([key, fallback]) => [
    key,
    readInteger(assistant.chat[key as keyof typeof CHAT_FALLBACKS], {
      path: `system/assistant.chat.${key}`,
      fallback,
      min: 0,
    }),
  ])
) as Record<keyof typeof CHAT_FALLBACKS, number>
