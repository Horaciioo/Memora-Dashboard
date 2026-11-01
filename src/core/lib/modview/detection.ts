import {
  COMMON_WORDS,
  MIN_PHRASE,
  NAME_WEIGHT,
  PHRASE_WEIGHT,
  WORD_STEM,
} from '@/declarations/modview/suggestions'
import type { SanctionOffenseCard, SanctionPanelView } from '@/types/sanctions'

/**
 * Text a message is read from
 * @typedef {Object} DetectionInput
 * @property {string} text - Message
 * @property {string[]} flagged - Words caught
 */

export interface DetectionInput {
  text: string
  flagged: string[]
}

/**
 * Why a message reads as an offence
 * @typedef {Object} DetectionResult
 * @property {SanctionOffenseCard | null} offense - Offence found
 * @property {'keywords' | 'text' | null} via - What found it
 * @property {string[]} words - Detection words that matched
 * @property {{ offense: string, phrase: string } | null} spared - Tolerated case that let it pass
 */

export interface DetectionResult {
  offense: SanctionOffenseCard | null
  via: 'keywords' | 'text' | null
  words: string[]
  spared: { offense: string; phrase: string } | null
}

// Name without accents or case
export const plain = (name: string): string =>
  name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()

// Close case a message holds
const toleratedBy = (offense: SanctionOffenseCard, text: string): string | null =>
  offense.tolerated.find((case_) => {
    const phrase = plain(case_)

    return phrase.length >= MIN_PHRASE && text.includes(phrase)
  }) ?? null

const isTolerated = (offense: SanctionOffenseCard, text: string): boolean =>
  toleratedBy(offense, text) !== null

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Words of a text, the common ones dropped
const wordsOf = (text: string): string[] =>
  plain(text)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length >= 3 && !COMMON_WORDS.has(word))

// Same word, or same start for the long ones
const isSame = (left: string, right: string): boolean =>
  left === right ||
  (Math.min(left.length, right.length) >= WORD_STEM &&
    left.slice(0, WORD_STEM) === right.slice(0, WORD_STEM))

/**
 * Detection words a text holds
 * @param {SanctionOffenseCard} offense - Offence
 * @param {string} text - Text without accents or case
 * @return {string[]} - Words matched
 */

export const keywordHits = (offense: SanctionOffenseCard, text: string): string[] =>
  offense.keywords.filter((keyword) => {
    const word = plain(keyword)
    if (!word) return false

    // A whole word or phrase, plural tolerated
    const edge = '[^\\p{L}\\p{N}]'
    return new RegExp(`(^|${edge})${escapeRegex(word)}s?(${edge}|$)`, 'u').test(text)
  })

/**
 * Offence whose detection words the message holds, the one with the most words first
 * @param {SanctionPanelView | null} panel - Panel at the level in force
 * @param {DetectionInput} source - Message read
 * @return {SanctionOffenseCard | null} - Offence, none when no detection word appears
 */

export const offenseByKeywords = (
  panel: SanctionPanelView | null,
  source: DetectionInput
): SanctionOffenseCard | null => {
  if (!panel) return null

  const text = plain(`${source.text} ${source.flagged.join(' ')}`)
  let best: { offense: SanctionOffenseCard; hits: number } | null = null

  for (const offense of panel.offenses) {
    if (isTolerated(offense, text)) continue

    const hits = keywordHits(offense, text).length

    if (hits > 0 && (!best || hits > best.hits)) best = { offense, hits }
  }

  return best?.offense ?? null
}

/**
 * Offence of the panel the message reads like, from the names and examples written in it, for offences without detection words
 * A word only one offence uses weighs more than one they share
 * @param {SanctionPanelView | null} panel - Panel at the level in force
 * @param {DetectionInput} source - Message read
 * @return {SanctionOffenseCard | null} - Offence, none when nothing in the panel resembles it
 */

export const offenseByText = (
  panel: SanctionPanelView | null,
  source: DetectionInput
): SanctionOffenseCard | null => {
  if (!panel) return null

  const message = [...wordsOf(source.text), ...source.flagged.flatMap(wordsOf)]
  const text = plain(source.text)
  const vocabulary = panel.offenses.map((offense) => ({
    offense,
    name: wordsOf(offense.name),
    examples: offense.examples.flatMap(wordsOf),
  }))

  // Offences that use a word, to weigh it
  const spread = (word: string): number =>
    Math.max(
      1,
      vocabulary.filter((entry) =>
        [...entry.name, ...entry.examples].some((other) => isSame(other, word))
      ).length
    )

  let best: { offense: SanctionOffenseCard; score: number } | null = null

  for (const entry of vocabulary) {
    if (isTolerated(entry.offense, text)) continue

    let score = 0
    for (const word of message) {
      if (entry.name.some((other) => isSame(other, word))) score += NAME_WEIGHT / spread(word)
      if (entry.examples.some((other) => isSame(other, word))) score += 1 / spread(word)
    }
    for (const example of entry.offense.examples.map(plain)) {
      if (example.length >= MIN_PHRASE && text.includes(example)) score += PHRASE_WEIGHT
    }
    if (score > 0 && (!best || score > best.score)) best = { offense: entry.offense, score }
  }

  return best?.offense ?? null
}

/**
 * Offence a message reads as, with the reason
 * @param {SanctionPanelView | null} panel - Panel at the level in force
 * @param {DetectionInput} source - Message read
 * @return {DetectionResult} - Offence and why
 */

export const explainDetection = (
  panel: SanctionPanelView | null,
  source: DetectionInput
): DetectionResult => {
  const none: DetectionResult = { offense: null, via: null, words: [], spared: null }
  if (!panel || !source.text.trim()) return none

  // Words first, then resemblance
  const text = plain(`${source.text} ${source.flagged.join(' ')}`)
  const byWords = offenseByKeywords(panel, source)
  if (byWords)
    return { ...none, offense: byWords, via: 'keywords', words: keywordHits(byWords, text) }

  const byText = offenseByText(panel, source)
  if (byText) return { ...none, offense: byText, via: 'text' }

  // Nothing found, maybe on purpose
  for (const offense of panel.offenses) {
    const phrase = toleratedBy(offense, text)
    if (phrase) return { ...none, spared: { offense: offense.name, phrase } }
  }

  return none
}
