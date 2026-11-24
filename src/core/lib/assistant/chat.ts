import { isSimilar, tokenize } from '@/core/lib/assistant/normalize'
import { CHAT_TOPICS } from '@/declarations/assistant/chat'
import type { ChatTopic } from '@/declarations/assistant/chat'
import { CHAT_SCORES } from '@/declarations/assistant/scoring'

// Folded words of a text
const wordsOf = (text: string): string[] => tokenize(text).map((token) => token.folded)

// Wording found as a run of words
const hasRun = (words: string[], wording: string): boolean => {
  const run = wordsOf(wording)

  return words.some((_, start) => run.every((word, offset) => words[start + offset] === word))
}

// One word found, a typo is forgiven
const hasWord = (words: string[], word: string, strict = false): boolean => {
  const folded = wordsOf(word)[0]

  return words.some((typed) => (strict ? typed === folded : isSimilar(typed, folded)))
}

/**
 * Points a sentence earns for a subject
 * @param {ChatTopic} topic - Subject
 * @param {string[]} words - Folded words of the sentence
 * @return {number} - Best signal, 0 when none
 */

export const scoreTopic = (topic: ChatTopic, words: string[]): number => {
  if (topic.exact?.some((sentence) => wordsOf(sentence).join(' ') === words.join(' ')))
    return CHAT_SCORES.phrase

  const signals = [
    topic.phrases?.some((wording) => hasRun(words, wording)) ? CHAT_SCORES.phrase : 0,
    topic.groups &&
    topic.groups.every((group) => group.some((word) => hasWord(words, word, topic.strict)))
      ? CHAT_SCORES.group
      : 0,
    topic.words?.some((word) => hasWord(words, word, topic.strict)) ? CHAT_SCORES.word : 0,
  ]

  return Math.max(...signals)
}

/**
 * Subject a sentence is about
 * @param {string} text - What the member wrote
 * @return {ChatTopic | null} - Best subject, the first wins a tie
 */

export const findTopic = (text: string): ChatTopic | null => {
  const words = wordsOf(text)
  let best: { topic: ChatTopic; score: number } | null = null

  for (const topic of CHAT_TOPICS) {
    const score = scoreTopic(topic, words)

    if (score >= CHAT_SCORES.floor && (!best || score > best.score)) best = { topic, score }
  }

  return best?.topic ?? null
}

/**
 * Sentence is a question about the wider world
 * @param {string} text - What the member wrote
 * @return {boolean} - Asks something
 */

export const isQuestion = (text: string): boolean => {
  const [first = ''] = wordsOf(text)

  return (
    text.includes('?') ||
    [
      'qui',
      'quoi',
      'quel',
      'quelle',
      'quels',
      'quelles',
      'combien',
      'pourquoi',
      'comment',
      'ou',
      'quand',
      'est',
      'peux',
      'sais',
      'connais',
    ].includes(first)
  )
}

/**
 * Sentence too short to hold on to
 * @param {string} text - What the member wrote
 * @return {boolean} - One or two words
 */

export const isShort = (text: string): boolean => wordsOf(text).length <= CHAT_SCORES.shortWords
