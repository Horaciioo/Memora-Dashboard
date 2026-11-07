import 'server-only'

import { frenchWords } from '@/core/lib/play/dictionary'
import { BOMB_SETTINGS } from '@/declarations/play'

// Survives dev hot reloads
const globalForPrompts = globalThis as unknown as {
  bombPrompts?: Promise<Map<string, number>>
  bombPools?: Map<string, string[]>
}

/**
 * Words holding each syllable, counted once per word
 * @param {Set<string>} words - Dictionary
 * @return {Map<string, number>} - Count per syllable
 */

const countSyllables = (words: Set<string>): Map<string, number> => {
  const counts = new Map<string, number>()
  for (const word of words) {
    const seen = new Set<string>()
    // Every slice of every length, spaces excluded
    for (const length of BOMB_SETTINGS.promptLengths) {
      for (let start = 0; start + length <= word.length; start += 1) {
        const slice = word.slice(start, start + length)
        if (!slice.includes(' ')) seen.add(slice)
      }
    }
    for (const slice of seen) counts.set(slice, (counts.get(slice) ?? 0) + 1)
  }

  return counts
}

/**
 * Words a syllable may fit
 * @typedef {Object} PromptRange
 */

export interface PromptRange {
  min: number
  // Excluded
  max: number
}

/**
 * Syllables fitting a band of words
 * @param {PromptRange} range - Bounds
 * @return {Promise<string[]>} - Pool
 */

const poolOf = async ({ min, max }: PromptRange): Promise<string[]> => {
  const pools = (globalForPrompts.bombPools ??= new Map())
  const key = `${min}-${max}`
  const cached = pools.get(key)
  if (cached) return cached

  const counts = await (globalForPrompts.bombPrompts ??= frenchWords().then(countSyllables))
  const pool = [...counts]
    .filter(([, count]) => count >= min && count < max)
    .map(([slice]) => slice)
  pools.set(key, pool)

  return pool
}

/**
 * Draw a syllable other than the last one
 * @param {PromptRange} range - Word band
 * @param {string} [previous] - Prompt to avoid
 * @return {Promise<string>} - Syllable
 */

export const drawPrompt = async (range: PromptRange, previous?: string): Promise<string> => {
  const pool = await poolOf(range)
  const choices = pool.length > 1 ? pool.filter((slice) => slice !== previous) : pool
  // Any syllable when the band is empty
  if (!choices.length) return (await poolOf({ min: 1, max: Infinity }))[0]

  return choices[Math.floor(Math.random() * choices.length)]
}
