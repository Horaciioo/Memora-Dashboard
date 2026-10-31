import { askEntries, struckKeys } from '@/core/lib/recruitment/questionnaire'
import type { AskEntry, ResolvedQuestion } from '@/core/lib/recruitment/questionnaire'
import type { AnswerState } from '@/types/recruitment'
import { AnswerAppreciations } from '@/utils/constants/recruitment'
import type { AnswerAppreciationName } from '@/utils/constants/recruitment'

/**
 * Appreciated questions and sub-questions of an interview, grouped by reaction
 * @param {ResolvedQuestion[]} questions - Questions played
 * @param {Record<string, AnswerState>} answers - What was written, by key
 * @return {Record<AnswerAppreciationName, AskEntry[]>} - Questions per reaction
 */

export const tallyAppreciations = (
  questions: ResolvedQuestion[],
  answers: Record<string, AnswerState>
): Record<AnswerAppreciationName, AskEntry[]> => {
  const tally: Record<AnswerAppreciationName, AskEntry[]> = {
    [AnswerAppreciations.Like]: [],
    [AnswerAppreciations.Neutral]: [],
    [AnswerAppreciations.Dislike]: [],
  }

  // Branches left aside count as passed
  const struck = new Set(
    questions.flatMap((question) => struckKeys(question, answers[question.key]))
  )

  for (const entry of askEntries(questions)) {
    const answer = answers[entry.key]
    if (answer?.appreciation && !answer.skipped && !struck.has(entry.key)) {
      tally[answer.appreciation].push(entry)
    }
  }

  return tally
}
