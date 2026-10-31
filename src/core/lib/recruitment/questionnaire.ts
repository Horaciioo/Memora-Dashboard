import {
  PLATFORM_TERMS,
  QUESTION_BANK,
  QUESTION_PART_ORDER,
} from '@/declarations/recruitment/questionnaire'
import type {
  QuestionAsk,
  QuestionBranch,
  QuestionDefinition,
  QuestionPartKey,
  QuestionStep,
  SpeechLine,
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
  'platforms' | 'branches' | 'steps' | 'digs' | 'speech'
> {
  speech: SpeechLine[]
  digs: QuestionAsk[]
  branches: QuestionBranch[]
  steps: QuestionStep[]
}

// Two registers of one phrase
const REGISTER_ALTERNATIVE = /\[([^[\]|]*)\|([^[\]]*)\]/g

/**
 * Replace the tokens of a sentence
 * @param {string} text - Sentence carrying tokens
 * @param {RecruitmentPlatformName} platform - Platform of the session
 * @param {string} creator - Creator recruited for
 * @param {boolean} [formal] - Read with « vous »
 * @return {string} - Sentence ready to read
 */

export const fillTerms = (
  text: string,
  platform: RecruitmentPlatformName,
  creator: string,
  formal = false
): string => {
  const terms: Record<string, string> = { ...PLATFORM_TERMS[platform], creator }

  return text
    .replace(REGISTER_ALTERNATIVE, (_, informal: string, polite: string) =>
      formal ? polite : informal
    )
    .replace(/\{(\w+)\}/g, (token, name: string) => terms[name] ?? token)
}

/**
 * Resolve one question for a session
 * @param {QuestionDefinition} question - Question of the bank
 * @param {RecruitmentPlatformName} platform - Platform of the session
 * @param {string} creator - Creator recruited for
 * @param {boolean} [formal] - Read with « vous »
 * @return {ResolvedQuestion} - Question ready to show
 */

export const resolveQuestion = (
  question: QuestionDefinition,
  platform: RecruitmentPlatformName,
  creator: string,
  formal = false
): ResolvedQuestion => {
  const fill = (text: string) => fillTerms(text, platform, creator, formal)
  const fillOptional = (text?: string) => (text === undefined ? undefined : fill(text))
  const fillAsk = (ask: QuestionAsk): QuestionAsk => ({ key: ask.key, text: fill(ask.text) })

  return {
    key: question.key,
    part: question.part,
    section: question.section,
    kind: question.kind,
    family: question.family,
    display: question.display,
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
    speech: (question.speech ?? [])
      .map((line) => ({ ...line, text: fill(line.text) }))
      .filter((line) => line.text.length > 0),
    digs: (question.digs ?? []).map(fillAsk),
    steps: (question.steps ?? []).map((step) => ({
      prompt: fill(step.prompt),
      pause: step.pause,
    })),
    branches: (question.branches ?? []).map((branch) => ({
      key: branch.key,
      when: fill(branch.when),
      say: fillOptional(branch.say),
      asks: branch.asks.map(fillAsk),
    })),
  }
}

/**
 * Questions a platform can ask, in asking order
 * @param {RecruitmentPlatformName} platform - Platform of the session
 * @param {string} creator - Creator recruited for
 * @param {boolean} [formal] - Read with « vous »
 * @return {ResolvedQuestion[]} - Bank for that session
 */

export const bankFor = (
  platform: RecruitmentPlatformName,
  creator: string,
  formal = false
): ResolvedQuestion[] =>
  QUESTION_BANK.filter(
    (question) => !question.platforms || question.platforms.includes(platform)
  ).map((question) => resolveQuestion(question, platform, creator, formal))

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
export const BLANK_ANSWER: AnswerState = { branch: null, appreciation: null, skipped: false }

/**
 * Whether a question was handled
 * @param {AnswerState | undefined} answer - What was written
 * @param {boolean} [isCommented] - A comment sits under it
 * @return {boolean} - Comment, reaction or skip present
 */

export const isHandled = (answer: AnswerState | undefined, isCommented = false): boolean =>
  isCommented || Boolean(answer && (answer.appreciation || answer.skipped))

/**
 * Question sharing its turn of phrase with one already played
 * @param {ResolvedQuestion} question - Question looked at
 * @param {ResolvedQuestion[]} asked - Questions of the interview
 * @param {Record<string, AnswerState>} answers - What was written, by key
 * @param {ReadonlySet<string>} commented - Keys of the questions carrying a comment
 * @return {ResolvedQuestion | null} - Sibling already played
 */

export const playedSibling = (
  question: ResolvedQuestion,
  asked: ResolvedQuestion[],
  answers: Record<string, AnswerState>,
  commented: ReadonlySet<string> = new Set()
): ResolvedQuestion | null => {
  if (!question.family) return null

  return (
    asked.find((other) => {
      const answer = answers[other.key]

      return (
        other.key !== question.key &&
        other.family === question.family &&
        (commented.has(other.key) || Boolean(answer?.appreciation))
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
 * @param {string} askKey - Key of the dig
 * @return {string} - Key
 */

export const digKey = (questionKey: string, askKey: string): string =>
  `${questionKey}:dig:${askKey}`

/**
 * Answer key of one follow-up of a branch
 * @param {string} questionKey - Question of the bank
 * @param {string} branch - Key of the branch
 * @param {string} askKey - Key of the follow-up
 * @return {string} - Key
 */

export const branchKey = (questionKey: string, branch: string, askKey: string): string =>
  `${questionKey}:branch:${branch}:${askKey}`

/**
 * Keys of the sub-questions a question carries
 * @param {{ key: string, digs?: QuestionAsk[], branches?: QuestionBranch[] }} question - Question of the bank
 * @return {string[]} - Dig then branch keys
 */

export const secondaryKeys = (question: {
  key: string
  digs?: QuestionAsk[]
  branches?: QuestionBranch[]
}): string[] => [
  ...(question.digs ?? []).map((dig) => digKey(question.key, dig.key)),
  ...(question.branches ?? []).flatMap((branch) =>
    branch.asks.map((ask) => branchKey(question.key, branch.key, ask.key))
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
    ...question.digs.map((dig) => ({ key: digKey(question.key, dig.key), prompt: dig.text })),
    ...question.branches.flatMap((branch) =>
      branch.asks.map((ask) => ({
        key: branchKey(question.key, branch.key, ask.key),
        prompt: ask.text,
      }))
    ),
  ])

/**
 * Keys of the follow-ups of branches left aside, counted as passed
 * @param {ResolvedQuestion} question - Question played
 * @param {AnswerState | undefined} answer - Its answer, carrying the branch chosen
 * @return {string[]} - Follow-up keys of the other branches
 */

export const struckKeys = (
  question: ResolvedQuestion,
  answer: AnswerState | undefined
): string[] =>
  answer?.branch
    ? question.branches
        .filter((branch) => branch.key !== answer.branch)
        .flatMap((branch) => branch.asks.map((ask) => branchKey(question.key, branch.key, ask.key)))
    : []

/**
 * One drawn unit of a part: a question alone or a family of folds
 * @typedef {Object} PartBlock
 * @property {ResolvedQuestion[]} questions - One question, or the folds of a family
 * @property {boolean} isFolds - Drawn as folds
 */

export interface PartBlock {
  questions: ResolvedQuestion[]
  isFolds: boolean
}

/**
 * Questions of a part gathered into drawn units, a fold family staying together
 * @param {ResolvedQuestion[]} questions - Questions of the part
 * @return {PartBlock[]} - Blocks in asking order
 */

export const partBlocks = (questions: ResolvedQuestion[]): PartBlock[] =>
  questions.reduce<PartBlock[]>((blocks, question) => {
    const last = blocks.at(-1)
    const isFold = question.display === 'fold'

    if (isFold && last?.isFolds && last.questions[0].family === question.family) {
      last.questions.push(question)
    } else {
      blocks.push({ questions: [question], isFolds: isFold })
    }

    return blocks
  }, [])
