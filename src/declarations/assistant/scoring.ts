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
