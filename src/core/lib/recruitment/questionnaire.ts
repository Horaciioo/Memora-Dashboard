import {
  PLATFORM_TERMS,
  QUESTION_BANK,
  QUESTION_PART_ORDER,
} from '@/declarations/recruitment/questionnaire'
import type {
  QuestionBranch,
  QuestionDefinition,
  QuestionPartKey,
  QuestionStep,
} from '@/declarations/recruitment/questionnaire'
import type { AnswerState } from '@/types/recruitment'
import type { RecruitmentPlatformName } from '@/utils/constants/recruitment'

/**
 * Question with its words resolved for one session
 * @typedef {Object} ResolvedQuestion
 * @property {string} key - Stable identifier
 */

export interface ResolvedQuestion extends Omit<
  QuestionDefinition,
  'platforms' | 'branches' | 'steps' | 'digs'
> {
  digs: string[]
  branches: QuestionBranch[]
  steps: QuestionStep[]
}

/**
 * Replace the tokens of a sentence
 * @param {string} text - Sentence carrying tokens
 * @param {RecruitmentPlatformName} platform - Platform of the session
 * @param {string} creator - Creator recruited for
 * @return {string} - Sentence ready to read
 */

export const fillTerms = (
  text: string,
  platform: RecruitmentPlatformName,
  creator: string
): string => {
  const terms: Record<string, string> = { ...PLATFORM_TERMS[platform], creator }

  return text.replace(/\{(\w+)\}/g, (token, name: string) => terms[name] ?? token)
}

/**
 * Resolve one question for a session
 * @param {QuestionDefinition} question - Question of the bank
 * @param {RecruitmentPlatformName} platform - Platform of the session
 * @param {string} creator - Creator recruited for
 * @return {ResolvedQuestion} - Question ready to show
 */

export const resolveQuestion = (
  question: QuestionDefinition,
  platform: RecruitmentPlatformName,
  creator: string
): ResolvedQuestion => {
  const fill = (text: string) => fillTerms(text, platform, creator)
  const fillOptional = (text?: string) => (text === undefined ? undefined : fill(text))

  return {
    key: question.key,
    part: question.part,
    section: question.section,
    kind: question.kind,
    family: question.family,
    minutes: question.minutes,
    mandatory: question.mandatory,
    recommended: question.recommended,
    exercise: question.exercise,
    documents: question.documents,
    prompt: fill(question.prompt),
    when: fillOptional(question.when),
    say: fillOptional(question.say),
    hint: fillOptional(question.hint),
    scenario: fillOptional(question.scenario),
    digs: (question.digs ?? []).map(fill),
    steps: (question.steps ?? []).map((step) => ({
      prompt: fill(step.prompt),
      pause: step.pause,
    })),
    branches: (question.branches ?? []).map((branch) => ({
      when: fill(branch.when),
      say: fillOptional(branch.say),
      asks: branch.asks.map(fill),
    })),
  }
}

/**
 * Questions a platform can ask, in asking order
 * @param {RecruitmentPlatformName} platform - Platform of the session
 * @param {string} creator - Creator recruited for
 * @return {ResolvedQuestion[]} - Bank for that session
 */

export const bankFor = (platform: RecruitmentPlatformName, creator: string): ResolvedQuestion[] =>
  QUESTION_BANK.filter(
    (question) => !question.platforms || question.platforms.includes(platform)
  ).map((question) => resolveQuestion(question, platform, creator))

/**
 * Keys of the suggested pick: what is mandatory plus what is recommended
 * @param {RecruitmentPlatformName} platform - Platform of the session
 * @return {string[]} - Question keys
 */

export const recommendedKeys = (platform: RecruitmentPlatformName): string[] =>
  QUESTION_BANK.filter(
    (question) =>
      (!question.platforms || question.platforms.includes(platform)) &&
      (question.mandatory || question.recommended)
  ).map((question) => question.key)

/**
 * Keys that exist for a platform, unknown ones dropped and the mandatory ones always kept
 * @param {string[]} keys - Keys submitted
 * @param {RecruitmentPlatformName} platform - Platform of the session
 * @return {string[]} - Valid keys in bank order
 */

export const validKeys = (keys: string[], platform: RecruitmentPlatformName): string[] => {
  const wanted = new Set(keys)

  return QUESTION_BANK.filter(
    (question) =>
      (!question.platforms || question.platforms.includes(platform)) &&
      (question.mandatory || wanted.has(question.key))
  ).map((question) => question.key)
}

/**
 * Questions split by part, empty parts left out
 * @param {ResolvedQuestion[]} questions - Questions in asking order
 * @return {{ part: QuestionPartKey, questions: ResolvedQuestion[] }[]} - Parts in order
 */

export const groupByPart = (
  questions: ResolvedQuestion[]
): { part: QuestionPartKey; questions: ResolvedQuestion[] }[] =>
  QUESTION_PART_ORDER.map((part) => ({
    part,
    questions: questions.filter((question) => question.part === part),
  })).filter((group) => group.questions.length > 0)

/**
 * Minutes an interview takes
 * @param {ResolvedQuestion[]} questions - Questions asked
 * @return {number} - Estimated minutes
 */

export const totalMinutes = (questions: ResolvedQuestion[]): number =>
  questions.reduce((sum, question) => sum + (question.minutes ?? 0), 0)

// Nothing written yet
export const BLANK_ANSWER: AnswerState = { notes: '', appreciation: null, skipped: false }

/**
 * Whether a question was handled
 * @param {AnswerState | undefined} answer - What was written
 * @return {boolean} - Notes, reaction or skip present
 */

export const isHandled = (answer: AnswerState | undefined): boolean =>
  Boolean(answer && (answer.notes.trim() || answer.appreciation || answer.skipped))

/**
 * Question sharing its turn of phrase with one already played
 * @param {ResolvedQuestion} question - Question looked at
 * @param {ResolvedQuestion[]} asked - Questions of the interview
 * @param {Record<string, AnswerState>} answers - What was written, by key
 * @return {ResolvedQuestion | null} - Sibling already played
 */

export const playedSibling = (
  question: ResolvedQuestion,
  asked: ResolvedQuestion[],
  answers: Record<string, AnswerState>
): ResolvedQuestion | null => {
  if (!question.family) return null

  return (
    asked.find((other) => {
      const answer = answers[other.key]

      return (
        other.key !== question.key &&
        other.family === question.family &&
        Boolean(answer && (answer.notes.trim() || answer.appreciation))
      )
    }) ?? null
  )
}

/**
 * Question or sub-question carrying its own reaction
 * @typedef {Object} AskEntry
 * @property {string} key - Answer key
 * @property {string} prompt - What is asked
 */

export interface AskEntry {
  key: string
  prompt: string
}

/**
 * Answer key of one way to go deeper
 * @param {string} questionKey - Question of the bank
 * @param {number} index - Position in the digs
 * @return {string} - Key
 */

export const digKey = (questionKey: string, index: number): string => `${questionKey}:dig:${index}`

/**
 * Answer key of one follow-up of a branch
 * @param {string} questionKey - Question of the bank
 * @param {number} branch - Branch position
 * @param {number} index - Position in the branch asks
 * @return {string} - Key
 */

export const branchKey = (questionKey: string, branch: number, index: number): string =>
  `${questionKey}:branch:${branch}:${index}`

/**
 * Keys of the sub-questions a question carries
 * @param {{ key: string, digs?: string[], branches?: { asks: string[] }[] }} question - Question of the bank
 * @return {string[]} - Dig then branch keys
 */

export const secondaryKeys = (question: {
  key: string
  digs?: string[]
  branches?: { asks: string[] }[]
}): string[] => [
  ...(question.digs ?? []).map((_, index) => digKey(question.key, index)),
  ...(question.branches ?? []).flatMap((branch, position) =>
    branch.asks.map((_, index) => branchKey(question.key, position, index))
  ),
]

/**
 * Every question and sub-question of an interview, flat
 * @param {ResolvedQuestion[]} questions - Questions played
 * @return {AskEntry[]} - Entries in asking order
 */

export const askEntries = (questions: ResolvedQuestion[]): AskEntry[] =>
  questions.flatMap((question) => [
    { key: question.key, prompt: question.prompt },
    ...question.digs.map((prompt, index) => ({ key: digKey(question.key, index), prompt })),
    ...question.branches.flatMap((branch, position) =>
      branch.asks.map((prompt, index) => ({
        key: branchKey(question.key, position, index),
        prompt,
      }))
    ),
  ])
