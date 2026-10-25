import 'server-only'

import { frenchWords } from '@/core/lib/play/dictionary'
import { BOMB_SETTINGS } from '@/declarations/play'

// Survives dev hot reloads
const globalForPrompts = globalThis as unknown as {
  bombPrompts?: Promise<Map<string, number>>
  bombPools?: Map<number, string[]>
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
 * Syllables fitting enough words
 * @param {number} minWords - Threshold
 * @return {Promise<string[]>} - Pool
 */

const poolOf = async (minWords: number): Promise<string[]> => {
  const pools = (globalForPrompts.bombPools ??= new Map())
  const cached = pools.get(minWords)
  if (cached) return cached

  const counts = await (globalForPrompts.bombPrompts ??= frenchWords().then(countSyllables))
  const pool = [...counts].filter(([, count]) => count >= minWords).map(([slice]) => slice)
  pools.set(minWords, pool)

  return pool
}

/**
 * Draw a syllable other than the last one
 * @param {number} minWords - Threshold
 * @param {string} [previous] - Prompt to avoid
 * @return {Promise<string>} - Syllable
 */

export const drawPrompt = async (minWords: number, previous?: string): Promise<string> => {
  const pool = await poolOf(minWords)
  const choices = pool.length > 1 ? pool.filter((slice) => slice !== previous) : pool
  // Easiest syllable when the threshold is out of reach
  if (!choices.length) return (await poolOf(1))[0]

  return choices[Math.floor(Math.random() * choices.length)]
}
