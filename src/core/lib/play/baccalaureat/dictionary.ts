import 'server-only'

import { frenchWords } from '@/core/lib/play/dictionary'
import { normalizeWord } from '@/core/lib/play/baccalaureat/words'

/**
 * Dictionary hint per word, never a verdict
 * @param {string[]} list - Written words
 * @return {Promise<Map<string, boolean>>} - Known per written word
 */

export const lookUpWords = async (list: string[]): Promise<Map<string, boolean>> => {
  const known = await frenchWords()

  return new Map(list.map((word) => [word, known.has(normalizeWord(word))]))
}
