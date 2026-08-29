import type { EmojiEntry, EmojiGroup } from '@/declarations/ui/emojis'
import { foldText } from '@/utils/format/strings'

// Ranks a match, the lowest showing first
const NAME_STARTS = 0
const NAME_HOLDS = 1
const TAG_HOLDS = 2

/**
 * One glyph folded once, so a keystroke never folds the whole catalogue again
 * @typedef {Object} EmojiSearchRow
 * @property {EmojiEntry} entry - Glyph and its names
 * @property {string[]} names - Folded French and English names
 * @property {string} tags - Folded keywords of both languages
 */

export interface EmojiSearchRow {
  entry: EmojiEntry
  names: string[]
  tags: string
}

/**
 * Fold the catalogue once, ahead of the first keystroke
 * @param {EmojiGroup[]} groups - Loaded catalogue
 * @return {EmojiSearchRow[]} - Searchable rows
 */

export const buildEmojiIndex = (groups: EmojiGroup[]): EmojiSearchRow[] =>
  groups.flatMap((group) =>
    group.emojis.map((entry) => ({
      entry,
      names: [foldText(entry.fr), foldText(entry.en)],
      tags: foldText(entry.tags.join(' ')),
    }))
  )

/**
 * Rank one row against typed text, both names weighing more than a keyword
 * @param {EmojiSearchRow} row - Folded glyph
 * @param {string} search - Folded text
 * @return {number | null} - Rank, absent while nothing matches
 */

const rank = (row: EmojiSearchRow, search: string): number | null => {
  if (row.names.some((name) => name.startsWith(search))) return NAME_STARTS
  if (row.names.some((name) => name.includes(search))) return NAME_HOLDS
  if (row.tags.includes(search)) return TAG_HOLDS

  return null
}

/**
 * Read every glyph matching typed text, accents and language aside
 * @param {EmojiSearchRow[]} index - Folded catalogue
 * @param {string} search - Typed text
 * @param {number} limit - Glyphs kept
 * @return {EmojiEntry[]} - Matching glyphs, best first
 */

export const searchEmojis = (
  index: EmojiSearchRow[],
  search: string,
  limit: number
): EmojiEntry[] => {
  const folded = foldText(search.trim())
  if (folded === '') return []

  // Rank once, sort on the stored rank rather than ranking again per comparison
  const matches: { entry: EmojiEntry; rank: number }[] = []

  for (const row of index) {
    const score = rank(row, folded)
    if (score !== null) matches.push({ entry: row.entry, rank: score })
  }

  return matches
    .sort((first, second) => first.rank - second.rank)
    .slice(0, limit)
    .map((match) => match.entry)
}

/**
 * Read the entry of one glyph, the catalogue answering in French
 * @param {EmojiGroup[]} groups - Loaded catalogue
 * @param {string} glyph - Rendered character
 * @return {EmojiEntry | null} - Catalogue entry
 */

export const findEmoji = (groups: EmojiGroup[], glyph: string): EmojiEntry | null => {
  for (const group of groups) {
    const found = group.emojis.find((entry) => entry.glyph === glyph)
    if (found) return found
  }

  return null
}
