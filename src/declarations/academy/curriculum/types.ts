// Read by the seed on plain node, so type declarations only
import type { IconName } from '@/declarations/ui/icons'

/**
 * Track a course belongs to: indispensable during the first period, secondary from the second,
 * or a module of the Legacy track
 * @typedef {'indispensable' | 'secondary' | 'legacy'} CourseTrack
 */

export type CourseTrack = 'indispensable' | 'secondary' | 'legacy'

/**
 * Surface a course is about, which decides where it is shown
 * @typedef {'general' | 'youtube' | 'twitch' | 'lives' | 'discord'} CourseSurface
 */

export type CourseSurface = 'general' | 'youtube' | 'twitch' | 'lives' | 'discord'

/**
 * One line of a chat illustration
 * @typedef {Object} ChatLine
 * @property {string} author - Pseudonym
 * @property {string} text - Message
 * @property {'viewer' | 'moderator' | 'creator' | 'vip' | 'bot'} [role] - Badge drawn before the name
 * @property {boolean} [flagged] - The line the lesson is about
 */

export interface ChatLine {
  author: string
  text: string
  role?: 'viewer' | 'moderator' | 'creator' | 'vip' | 'bot'
  flagged?: boolean
}

/**
 * Colour family of an illustration
 * @typedef {'neutral' | 'brand' | 'info' | 'success' | 'caution' | 'danger'} CourseTone
 */

export type CourseTone = 'neutral' | 'brand' | 'info' | 'success' | 'caution' | 'danger'

/**
 * One card of a key points block, readable at a glance
 * @typedef {Object} KeyPoint
 * @property {IconName} glyph - Drawing on the card
 * @property {string} title - Two or three words
 * @property {string} body - One sentence
 * @property {CourseTone} [tone] - Colour of the drawing
 */

export interface KeyPoint {
  glyph: IconName
  title: string
  body: string
  tone?: CourseTone
}

/**
 * One stop of a diagram, drawn as a glyph on a coloured disc
 * @typedef {Object} DiagramNode
 * @property {IconName} glyph - Drawing
 * @property {string} label - What it is
 * @property {string} [note] - A short line under the label
 * @property {CourseTone} [tone] - Colour of the disc
 */

export interface DiagramNode {
  glyph: IconName
  label: string
  note?: string
  tone?: CourseTone
}

/**
 * One side of a do and don't comparison
 * @typedef {Object} CompareSide
 * @property {string} title - Heading of the column
 * @property {string[]} items - Short lines
 */

export interface CompareSide {
  title: string
  items: string[]
}

/**
 * One step of a guided demonstration of the moderator view
 * @typedef {Object} DemoStep
 * @property {string} caption - What the coach says at this step
 * @property {number} [target] - Index of the line the step is about
 * @property {'delete' | 'warn' | 'timeout' | 'ban' | 'command'} [act] - Gesture played on it
 * @property {string} [detail] - Duration of a timeout, or the command typed
 * @property {ChatLine} [say] - Line that arrives in the chat at this step
 */

export interface DemoStep {
  caption: string
  target?: number
  act?: 'delete' | 'warn' | 'timeout' | 'ban' | 'command'
  detail?: string
  say?: ChatLine
}

/**
 * Read-only blocks
 * @typedef {Object} ReadBlock
 */

export type ReadBlock =
  | { kind: 'text'; key: string; body: string }
  | { kind: 'callout'; key: string; tone: 'tip' | 'warning' | 'rule'; title: string; body: string }
  | {
      kind: 'chat'
      key: string
      surface: 'twitch' | 'youtube'
      caption: string
      lines: ChatLine[]
    }
  | { kind: 'discord'; key: string; caption: string; author: string; message: string }
  | { kind: 'steps'; key: string; title: string; steps: { title: string; body: string }[] }
  | { kind: 'keypoints'; key: string; title: string; points: KeyPoint[] }
  | { kind: 'diagram'; key: string; title: string; caption?: string; nodes: DiagramNode[] }
  | { kind: 'compare'; key: string; title: string; good: CompareSide; bad: CompareSide }
  | {
      kind: 'demo'
      key: string
      title: string
      surface: 'twitch' | 'youtube' | 'discord'
      // Chat as it stands before the first step
      lines: ChatLine[]
      steps: DemoStep[]
    }

/**
 * One multiple-choice question
 * @typedef {Object} QuizQuestionSeed
 * @property {string} key - Stable key
 * @property {string} prompt - Question
 * @property {{ key: string, label: string, correct: boolean }[]} choices - Offered answers
 * @property {string} explanation - Why, shown once answered
 */

export interface QuizQuestionSeed {
  key: string
  prompt: string
  choices: { key: string; label: string; correct: boolean }[]
  explanation: string
}

/**
 * One step of a chat simulation
 * @typedef {Object} SimulationStepSeed
 * @property {string} key - Stable key
 * @property {ChatLine[]} lines - What appears in the chat
 * @property {string} prompt - What the learner must decide
 * @property {{ key: string, label: string, correct: boolean, feedback: string }[]} options - Moves
 */

export interface SimulationStepSeed {
  key: string
  lines: ChatLine[]
  prompt: string
  options: { key: string; label: string; correct: boolean; feedback: string }[]
}

/**
 * One question of a case study
 * @typedef {Object} CaseQuestionSeed
 */

export type CaseQuestionSeed =
  | (QuizQuestionSeed & { type: 'choice' })
  | { type: 'open'; key: string; prompt: string; expert: string }

/**
 * Gesture a moderator can play on a message
 * @typedef {'leave' | 'delete' | 'timeout' | 'ban'} PlungeGesture
 */

export type PlungeGesture = 'leave' | 'delete' | 'timeout' | 'ban'

/**
 * What the team makes of a message: nothing to do, a gesture owed, or a call that splits them
 * @typedef {'leave' | 'act' | 'split'} PlungeVerdict
 */

export type PlungeVerdict = 'leave' | 'act' | 'split'

/**
 * One message of the opening scene, with what the team makes of it
 * @typedef {Object} PlungeMessage
 * @property {string} key - Stable key
 * @property {ChatLine} line - What arrives in the chat
 * @property {PlungeVerdict} verdict - The team call
 * @property {string} why - Reasoning shown once the scene is over
 * @property {{ after: string, acted: ChatLine, left: ChatLine }} [reaction] - Line whose text
 *   depends on how the message it follows was handled
 */

export interface PlungeMessage {
  key: string
  line: ChatLine
  verdict: PlungeVerdict
  why: string
  reaction?: { after: string; acted: ChatLine; left: ChatLine }
}

/**
 * Exercise blocks, each scored
 * @typedef {Object} ExerciseBlock
 */

export type ExerciseBlock =
  | { kind: 'quiz'; key: string; title: string; questions: QuizQuestionSeed[] }
  | {
      kind: 'fill'
      key: string
      title: string
      // Holes written [[answer|variant]], every variant accepted
      text: string
      bank?: string[]
      explanation: string
    }
  | {
      kind: 'sort'
      key: string
      title: string
      prompt: string
      buckets: { key: string; label: string }[]
      items: { key: string; label: string; bucket: string }[]
      explanation: string
    }
  | {
      kind: 'order'
      key: string
      title: string
      prompt: string
      // Written in the right order, shuffled on screen
      items: { key: string; label: string }[]
      explanation: string
    }
  | {
      kind: 'simulation'
      key: string
      title: string
      surface: 'twitch' | 'youtube' | 'discord'
      context: string
      steps: SimulationStepSeed[]
    }
  | {
      kind: 'case'
      key: string
      title: string
      context: string
      questions: CaseQuestionSeed[]
    }
  | {
      kind: 'command'
      key: string
      title: string
      prompt: string
      // Accepted answers, compared without case nor extra spaces
      accepted: string[]
      hint: string
      explanation: string
    }
  | {
      kind: 'plunge'
      key: string
      title: string
      // Said before the scene, nothing more
      context: string
      streamer: string
      messages: PlungeMessage[]
      // Drawn after the scene, once the learner has failed in their own way
      lessons: KeyPoint[]
    }

/**
 * Any block of a chapter
 * @typedef {ReadBlock | ExerciseBlock} CourseBlock
 */

export type CourseBlock = ReadBlock | ExerciseBlock

/**
 * One chapter of a course
 * @typedef {Object} CourseChapter
 * @property {string} key - Stable key
 * @property {string} title - Heading
 * @property {CourseBlock[]} blocks - Content, top to bottom
 */

export interface CourseChapter {
  key: string
  title: string
  blocks: CourseBlock[]
}

/**
 * One interactive course
 * @typedef {Object} Course
 * @property {string} key - Stable key, stored on the training row
 * @property {string} name - Title, unique
 * @property {string} summary - What it teaches, one line
 * @property {CourseTrack} track - Indispensable or secondary
 * @property {CourseSurface} surface - What it is about
 * @property {string[]} functions - Trades it is for, empty for every one
 * @property {number} minutes - Expected length
 * @property {CourseChapter[]} chapters - Chapters, in order
 */

export interface Course {
  key: string
  name: string
  summary: string
  track: CourseTrack
  surface: CourseSurface
  functions: string[]
  minutes: number
  chapters: CourseChapter[]
}

/**
 * Kinds that are scored
 * @type {readonly string[]}
 */

export const EXERCISE_KINDS: readonly string[] = [
  'quiz',
  'fill',
  'sort',
  'order',
  'simulation',
  'case',
  'command',
  'plunge',
]
