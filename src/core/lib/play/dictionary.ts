import 'server-only'

import { normalizeWord } from '@/core/lib/play/baccalaureat/words'

// Loaded on first use only
let words: Promise<Set<string>> | null = null

/**
 * French words, comparable form
 * @return {Promise<Set<string>>} - Word set
 */

export const frenchWords = (): Promise<Set<string>> =>
  (words ??= import('an-array-of-french-words/index.json').then(
    (module) => new Set(module.default.map(normalizeWord))
  ))
