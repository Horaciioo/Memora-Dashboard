import { isSimilar } from '@/core/lib/assistant/normalize'
import type { AssistantToken } from '@/core/lib/assistant/normalize'
import {
  ASSISTANT_ACTOR_MARKERS,
  ASSISTANT_CURRENT,
  ASSISTANT_DAY_OFFSETS,
  ASSISTANT_FILLERS,
  ASSISTANT_LATEST,
  ASSISTANT_LOG_LEVELS,
  ASSISTANT_LOG_PERIODS,
  ASSISTANT_OWNER_MARKERS,
  ASSISTANT_REFERENCES,
  ASSISTANT_SELF,
  ASSISTANT_STOPWORDS,
  ASSISTANT_WEEKDAYS,
} from '@/declarations/assistant/lexicon'
import type { JournalPeriod } from '@/declarations/system/monitoring/journal'
import type { LogLevelName } from '@/utils/constants/events'

/**
 * Assignee read in a sentence
 * @typedef {Object} OwnerMatch
 * @property {string} name - Typed name
 * @property {boolean} strong - Marker leaves no doubt
 * @property {boolean} self - Names the speaker
 * @property {boolean} pointed - Pointing word
 * @property {number[]} indices - Words used
 */

export interface OwnerMatch {
  name: string
  strong: boolean
  self: boolean
  pointed: boolean
  indices: number[]
}

const STOPWORDS = new Set<string>(ASSISTANT_STOPWORDS)
const FILLERS = new Set<string>(ASSISTANT_FILLERS)

// Words never read as a name
const isNameless = (word: string): boolean =>
  STOPWORDS.has(word) ||
  FILLERS.has(word) ||
  word in ASSISTANT_DAY_OFFSETS ||
  ASSISTANT_WEEKDAYS.includes(word as (typeof ASSISTANT_WEEKDAYS)[number])

/**
 * Word only steers
 * @param {string} word - Folded word
 * @return {boolean} - Carries no name
 */

export const isFiller = (word: string): boolean =>
  STOPWORDS.has(word) || FILLERS.has(word) || word in ASSISTANT_REFERENCES

/**
 * Find the assignee
 * @param {AssistantToken[]} tokens - Sentence words
 * @param {Set<number>} used - Words taken
 * @return {OwnerMatch | null} - Assignee
 */

export const extractOwner = (tokens: AssistantToken[], used: Set<number>): OwnerMatch | null => {
  // A mention leaves no doubt
  const mention = tokens.findIndex((token, index) => token.mention && !used.has(index))
  if (mention >= 0) {
    return {
      name: tokens[mention].folded,
      strong: true,
      self: false,
      pointed: false,
      indices: [mention],
    }
  }

  for (let index = 0; index < tokens.length - 1; index += 1) {
    const marker = tokens[index].folded
    const name = tokens[index + 1]
    if (!(marker in ASSISTANT_OWNER_MARKERS) || used.has(index + 1)) continue

    const self = ASSISTANT_SELF.includes(name.folded as (typeof ASSISTANT_SELF)[number])
    const pointed =
      ASSISTANT_REFERENCES[name.folded as keyof typeof ASSISTANT_REFERENCES] === 'member'
    if (!self && !pointed && isNameless(name.folded)) continue

    return {
      name: name.folded,
      strong: ASSISTANT_OWNER_MARKERS[marker],
      self,
      pointed,
      indices: [index, index + 1],
    }
  }

  return null
}

/**
 * Words after a keyword
 * @param {AssistantToken[]} tokens - Sentence words
 * @param {number} from - Keyword position
 * @param {Set<number>} used - Words taken
 * @param {number} colon - Offset of a colon
 * @return {number[]} - Following free words
 */

export const wordsAfter = (
  tokens: AssistantToken[],
  from: number,
  used: Set<number>,
  colon: number
): number[] => {
  const picked: number[] = []

  for (let index = from + 1; index < tokens.length; index += 1) {
    const isPastColon = colon >= 0 && tokens[index].start > colon
    if (isPastColon || used.has(index) || tokens[index].folded in ASSISTANT_OWNER_MARKERS) break
    picked.push(index)
  }

  // Leading articles drop
  while (picked.length > 0 && STOPWORDS.has(tokens[picked[0]].folded)) picked.shift()

  return picked
}

/**
 * Severity named
 * @param {AssistantToken[]} tokens - Sentence words
 * @return {LogLevelName | null} - Level
 */

export const extractLevel = (tokens: AssistantToken[]): LogLevelName | null =>
  tokens.map((token) => ASSISTANT_LOG_LEVELS[token.folded]).find(Boolean) ?? null

/**
 * Window named
 * @param {AssistantToken[]} tokens - Sentence words
 * @return {JournalPeriod | null} - Period
 */

export const extractPeriod = (tokens: AssistantToken[]): JournalPeriod | null =>
  tokens.map((token) => ASSISTANT_LOG_PERIODS[token.folded]).find(Boolean) ?? null

/**
 * Log actor named
 * @param {AssistantToken[]} tokens - Sentence words
 * @return {string | null} - Typed name
 */

export const extractActor = (tokens: AssistantToken[]): string | null => {
  const mention = tokens.find((token) => token.mention)
  if (mention) return mention.folded

  // A name after de or par
  const found = tokens.find((token, index) => {
    const next = tokens[index + 1]?.folded
    return (
      ASSISTANT_ACTOR_MARKERS.includes(token.folded as (typeof ASSISTANT_ACTOR_MARKERS)[number]) &&
      next !== undefined &&
      !isNameless(next) &&
      !(next in ASSISTANT_LOG_PERIODS) &&
      !(next in ASSISTANT_LOG_LEVELS) &&
      !['log', 'logs', 'journal', 'journaux'].includes(next)
    )
  })

  return found ? tokens[tokens.indexOf(found) + 1].folded : null
}

/**
 * Latest one asked
 * @param {AssistantToken[]} tokens - Sentence words
 * @return {boolean} - Latest asked
 */

export const asksLatest = (tokens: AssistantToken[]): boolean =>
  tokens.some((token) => ASSISTANT_LATEST.some((word) => isSimilar(token.folded, word)))

/**
 * Running one asked
 * @param {AssistantToken[]} tokens - Sentence words
 * @return {boolean} - Running asked
 */

export const asksCurrent = (tokens: AssistantToken[]): boolean => {
  const words = tokens.map((token) => token.folded)

  return ASSISTANT_CURRENT.some((phrase) =>
    words.some((_, start) => phrase.every((word, offset) => words[start + offset] === word))
  )
}

/**
 * Pointing word used
 * @param {AssistantToken[]} tokens - Sentence words
 * @return {'member' | 'demonstrative' | null} - Reference kind
 */

export const extractReference = (tokens: AssistantToken[]): 'member' | 'demonstrative' | null => {
  const found = tokens.find((token) => token.folded in ASSISTANT_REFERENCES)

  return found ? ASSISTANT_REFERENCES[found.folded as keyof typeof ASSISTANT_REFERENCES] : null
}
