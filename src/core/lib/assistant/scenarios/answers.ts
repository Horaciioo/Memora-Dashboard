import { isSimilar, tokenize } from '@/core/lib/assistant/normalize'
import { ASSISTANT_ANSWERS } from '@/declarations/assistant/lexicon'
import type { ScenarioChoice } from '@/types/scenario'
import { foldText } from '@/utils/format/strings'

// Longest sentence still read as a stop
const STOP_WORDS_MAX = 3

/**
 * First yes or no word of a sentence
 * @param {string} text - Typed answer
 * @return {'yes' | 'no' | null} - Reading, or nothing
 */

const readYesNo = (text: string): 'yes' | 'no' | null => {
  for (const { folded } of tokenize(text)) {
    if (ASSISTANT_ANSWERS.yes.some((word) => isSimilar(folded, word))) return 'yes'
    if (ASSISTANT_ANSWERS.no.some((word) => isSimilar(folded, word))) return 'no'
  }

  return null
}

/**
 * Typed text read as one of the offered answers
 * @param {string} text - Typed answer
 * @param {ScenarioChoice[]} choices - Offered answers
 * @return {ScenarioChoice | null} - Answer picked, or nothing
 */

export const matchChoice = (text: string, choices: ScenarioChoice[]): ScenarioChoice | null => {
  const folded = foldText(text).trim()
  if (!folded) return null

  // Oui and non first, when offered
  const yesNo = readYesNo(text)
  const byWord = yesNo && choices.find((choice) => choice.value === yesNo)
  if (byWord) return byWord

  // A number picks by place
  const place = /^\d+$/.test(folded) ? Number(folded) - 1 : -1
  if (place >= 0 && place < choices.length) return choices[place]

  const named = choices.filter((choice) => foldText(choice.label).includes(folded))

  return folded.length >= 3 && named.length === 1 ? named[0] : null
}

/**
 * A short sentence made of stop words only
 * @param {string} text - Typed answer
 * @return {boolean} - The member wants out
 */

export const isStop = (text: string): boolean => {
  const tokens = tokenize(text)

  return (
    tokens.length > 0 &&
    tokens.length <= STOP_WORDS_MAX &&
    tokens.every((token) => ASSISTANT_ANSWERS.stop.some((word) => isSimilar(token.folded, word)))
  )
}
