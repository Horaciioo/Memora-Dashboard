import 'server-only'

import { normalizeWord } from '@/core/lib/play/baccalaureat/words'

// Loaded on the first review only
let words: Promise<Set<string>> | null = null

/**
 * French words, comparable form
 * @return {Promise<Set<string>>} - Word set
 */

const dictionary = (): Promise<Set<string>> =>
  (words ??= import('an-array-of-french-words/index.json').then(
    (module) => new Set(module.default.map(normalizeWord))
  ))

/**
 * Dictionary hint per word, never a verdict
 * @param {string[]} list - Written words
 * @return {Promise<Map<string, boolean>>} - Known per written word
 */

export const lookUpWords = async (list: string[]): Promise<Map<string, boolean>> => {
  const known = await dictionary()

  return new Map(list.map((word) => [word, known.has(normalizeWord(word))]))
}
