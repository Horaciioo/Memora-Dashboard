import type { RecruitmentPlatformName } from '@/utils/constants/recruitment'

/**
 * Part of the interview
 * @typedef {'profile' | 'discovery' | 'situation' | 'closing'} QuestionPartKey
 */

export type QuestionPartKey = 'profile' | 'discovery' | 'situation' | 'closing'

/**
 * Exercise a question belongs to
 * @typedef {'sixty' | 'written' | 'cases' | 'documents'} ExerciseKey
 */

export type ExerciseKey = 'sixty' | 'written' | 'cases' | 'documents'

/**
 * How a question is played
 * @typedef {'open' | 'choice' | 'exercise'} QuestionKind
 */

export type QuestionKind = 'open' | 'choice' | 'exercise'

/**
 * Follow-up asked only on one answer
 * @typedef {Object} QuestionBranch
 * @property {string} when - Answer that triggers it
 * @property {string} [say] - Line read out loud
 * @property {string[]} asks - What to ask next
 */

export interface QuestionBranch {
  when: string
  say?: string
  asks: string[]
}

/**
 * One timed ask of an exercise
 * @typedef {Object} QuestionStep
 * @property {string} prompt - What is asked
 * @property {string} [pause] - Time left to answer
 */

export interface QuestionStep {
  prompt: string
  pause?: string
}

/**
 * Document handed to the candidate
 * @typedef {Object} QuestionDocument
 * @property {string} label - Document name
 * @property {string} url - Where it lives
 */

export interface QuestionDocument {
  label: string
  url: string
}

/**
 * Question of the interview bank
 * @typedef {Object} QuestionDefinition
 * @property {string} key - Stable identifier
 * @property {QuestionPartKey} part - Part of the interview
 * @property {string} section - Heading inside the part
 * @property {QuestionKind} kind - How it is played
 * @property {string} prompt - What is asked
 * @property {string} [when] - Situation that calls for it
 * @property {boolean} [mandatory] - Cannot be left out
 * @property {boolean} [recommended] - Part of the suggested pick
 * @property {string} [say] - Line read out loud
 * @property {string} [hint] - Indication for the recruiter
 * @property {string[]} [digs] - Ways to go deeper
 * @property {QuestionBranch[]} [branches] - Answers and their follow-ups
 * @property {QuestionStep[]} [steps] - Timed asks of an exercise
 * @property {string} [scenario] - Text read or shared
 * @property {QuestionDocument[]} [documents] - Documents handed out
 * @property {ExerciseKey} [exercise] - Exercise it is played in
 * @property {string} [family] - Questions sharing a turn of phrase
 * @property {number} [minutes] - Time it takes
 * @property {RecruitmentPlatformName[]} [platforms] - Platforms it fits, both when absent
 */

export interface QuestionDefinition {
  key: string
  part: QuestionPartKey
  section: string
  kind: QuestionKind
  prompt: string
  when?: string
  mandatory?: boolean
  recommended?: boolean
  say?: string
  hint?: string
  digs?: string[]
  branches?: QuestionBranch[]
  steps?: QuestionStep[]
  scenario?: string
  documents?: QuestionDocument[]
  exercise?: ExerciseKey
  family?: string
  minutes?: number
  platforms?: RecruitmentPlatformName[]
}

/**
 * Difficulty of a written context
 * @typedef {'moderate' | 'complex'} ContextLevel
 */

export type ContextLevel = 'moderate' | 'complex'

/**
 * One line of a scripted chat
 * @typedef {Object} ContextLine
 * @property {string} author - Pseudonym
 * @property {string} text - Message
 * @property {'moderator'} [role] - Badge drawn before the name
 */

export interface ContextLine {
  author: string
  text: string
  role?: 'moderator'
}

/**
 * Situation the candidate watches then answers in writing
 * @typedef {Object} WrittenContext
 * @property {string} key - Stable identifier
 * @property {ContextLevel} level - Difficulty
 * @property {string} title - Name in the recruiter list
 * @property {string} brief - What the candidate must write
 * @property {ContextLine[]} lines - Chat that plays
 */

export interface WrittenContext {
  key: string
  level: ContextLevel
  title: string
  brief: string
  lines: ContextLine[]
}
