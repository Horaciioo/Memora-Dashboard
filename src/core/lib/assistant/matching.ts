import { editDistance, typoBudget } from '@/core/lib/assistant/normalize'
import { foldText } from '@/utils/format/strings'

/**
 * Candidate named by a user
 * @typedef {Object} NamedCandidate
 * @property {string} value - Identifier
 * @property {string} label - Display name
 * @property {string} [hint] - Second line
 * @property {boolean} [disabled] - Away right now
 */

export interface NamedCandidate {
  value: string
  label: string
  hint?: string
  disabled?: boolean
}

/**
 * Result of a name lookup
 * @type {{ kind: 'one', match: T } | { kind: 'many', matches: T[] } | { kind: 'none' }}
 */

export type NameLookup<T> =
  { kind: 'one'; match: T } | { kind: 'many'; matches: T[] } | { kind: 'none' }

// Folded words only
const clean = (text: string): string =>
  foldText(text)
    .replace(/[^\p{L}\p{N} ]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()

// Match strength, lower is better
const Tiers = { Exact: 0, Word: 1, Prefix: 2, Typo: 3 } as const

/**
 * How well a label answers
 * @param {string} query - Folded query
 * @param {string} label - Display name
 * @return {number | null} - Tier or no match
 */

const tierOf = (query: string, label: string): number | null => {
  const folded = clean(label)
  const words = folded.split(' ')

  if (folded === query) return Tiers.Exact
  if (words.includes(query) || folded.includes(` ${query} `)) return Tiers.Word
  if (
    query.length >= 3 &&
    (folded.startsWith(query) || words.some((word) => word.startsWith(query)))
  )
    return Tiers.Prefix

  // A slip of the keyboard
  const budget = typoBudget(query) || (query.length >= 4 ? 1 : 0)
  const isClose = [folded, ...words].some((word) => editDistance(query, word) <= budget)

  return budget > 0 && isClose ? Tiers.Typo : null
}

/**
 * Find a candidate by name
 * @param {string} query - Typed name
 * @param {T[]} candidates - Allowed candidates
 * @param {number} limit - Choices shown
 * @return {NameLookup<T>} - One, many or none
 */

export const lookupName = <T extends NamedCandidate>(
  query: string,
  candidates: T[],
  limit: number
): NameLookup<T> => {
  const folded = clean(query)
  if (!folded) return { kind: 'none' }

  const ranked = candidates
    .map((candidate) => ({ candidate, tier: tierOf(folded, candidate.label) }))
    .filter((entry): entry is { candidate: T; tier: number } => entry.tier !== null)

  // Only the best tier counts
  const best = Math.min(...ranked.map((entry) => entry.tier))
  const matches = ranked.filter((entry) => entry.tier === best).map((entry) => entry.candidate)

  if (matches.length === 0) return { kind: 'none' }
  if (matches.length === 1) return { kind: 'one', match: matches[0] }

  return { kind: 'many', matches: matches.slice(0, limit) }
}
