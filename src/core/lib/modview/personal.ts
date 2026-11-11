import { plain, wordPattern } from '@/core/lib/modview/detection'
import { MODVIEW_PERSONAL } from '@/declarations/modview/personal'
import { EXEMPT_BADGES } from '@/declarations/modview/suggestions'
import type { ChatMessage, ModBadword } from '@/types/modview'
import { normaliseHex } from '@/utils/format/colour'

// Word kept whole and short, empty when unusable
const cleanTerm = (raw: unknown): string =>
  typeof raw === 'string' ? raw.trim().slice(0, MODVIEW_PERSONAL.maxWordLength) : ''

/**
 * Keep the words a list accepts, once each
 * @param {unknown} raw - Untrusted list
 * @param {number} max - Longest list
 * @return {string[] | null} - Clean list, null when it is not one
 */

export const sanitizeWords = (raw: unknown, max: number): string[] | null => {
  if (!Array.isArray(raw)) return null
  const seen = new Set<string>()

  return raw
    .map(cleanTerm)
    .filter((term) => {
      const key = plain(term)
      if (!key || seen.has(key)) return false
      seen.add(key)

      return true
    })
    .slice(0, max)
}

/**
 * Keep the badwords a list accepts, once each
 * @param {unknown} raw - Untrusted list
 * @param {number} max - Longest list
 * @return {ModBadword[] | null} - Clean list, null when it is not one
 */

export const sanitizeBadwords = (raw: unknown, max: number): ModBadword[] | null => {
  if (!Array.isArray(raw)) return null
  const seen = new Set<string>()
  const badwords: ModBadword[] = []

  for (const entry of raw) {
    const source = (entry && typeof entry === 'object' ? entry : {}) as Record<string, unknown>
    const term = cleanTerm(source.term)
    const key = plain(term)
    if (!key || seen.has(key) || badwords.length >= max) continue

    seen.add(key)
    badwords.push({
      term,
      colour: typeof source.colour === 'string' ? normaliseHex(source.colour) : null,
      isSuggested: source.isSuggested === true,
    })
  }

  return badwords
}

/**
 * Whether a line is worth a moderator's eye: kept, and not from the team or a bot
 * @param {ChatMessage} message - Line
 * @return {boolean} - Worth reading
 */

export const isWatched = (message: ChatMessage): boolean =>
  !message.deletedBy && !message.author.badges.some((badge) => EXEMPT_BADGES.includes(badge))

/**
 * Reader of a text for personal words, patterns built once
 * @param {ModBadword[]} badwords - Personal words
 * @return {(text: string) => ModBadword[]} - Badwords a message holds
 */

export const matchBadwords = (badwords: ModBadword[]): ((text: string) => ModBadword[]) => {
  const matchers = badwords.flatMap((badword) => {
    const pattern = wordPattern(badword.term)

    return pattern ? [{ badword, pattern }] : []
  })

  return (text) => {
    const flat = plain(text)

    return matchers.filter(({ pattern }) => pattern.test(flat)).map(({ badword }) => badword)
  }
}

/**
 * A line holding personal words
 * @typedef {Object} PersonalLine
 * @property {ChatMessage} message - Line
 * @property {ModBadword[]} hits - Words it holds
 */

export interface PersonalLine {
  message: ChatMessage
  hits: ModBadword[]
}

/**
 * Latest lines holding personal words
 * @param {ChatMessage[]} messages - Lines, oldest first
 * @param {ModBadword[]} badwords - Personal words
 * @param {number} limit - Most lines kept
 * @return {PersonalLine[]} - Newest first
 */

export const personalLines = (
  messages: ChatMessage[],
  badwords: ModBadword[],
  limit: number
): PersonalLine[] => {
  if (badwords.length === 0) return []
  const match = matchBadwords(badwords)
  const lines: PersonalLine[] = []

  for (let index = messages.length - 1; index >= 0 && lines.length < limit; index--) {
    const message = messages[index]!
    const hits = isWatched(message) ? match(message.text) : []
    if (hits.length > 0) lines.push({ message, hits })
  }

  return lines
}
