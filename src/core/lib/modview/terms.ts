import { plain } from '@/core/lib/modview/detection'

// Detection words split on lines, commas and semicolons
export const KEYWORD_SEPARATOR = /[\n,;]+/

// Messages split on lines only
export const PHRASE_SEPARATOR = /\n+/

/**
 * Lines of a stored field
 * @param {string | null | undefined} raw - Stored text
 * @return {string[]} - Terms
 */

export const termsOf = (raw: string | null | undefined): string[] =>
  (raw ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

/**
 * Terms added to a list
 * @param {string[]} list - Current terms
 * @param {string} raw - Typed or pasted text
 * @param {RegExp} separator - Where the text splits
 * @param {number} limit - Longest stored field
 * @return {string[]} - Next list, same one when nothing is new
 */

export const addTerms = (
  list: string[],
  raw: string,
  separator: RegExp,
  limit: number
): string[] => {
  const known = new Set(list.map(plain))
  const next = [...list]

  for (const piece of raw.split(separator)) {
    const term = piece.trim()
    const key = plain(term)
    if (!key || known.has(key)) continue

    // Field stays storable
    if ([...next, term].join('\n').length > limit) break

    known.add(key)
    next.push(term)
  }

  return next.length === list.length ? list : next
}

/**
 * Stored field of a list
 * @param {string[]} list - Terms
 * @return {string} - One term per line
 */

export const writeTerms = (list: string[]): string => list.join('\n')
