// Read by the seed on plain node, so type declarations only
import type { ModViewScene } from '@/core/lib/modview/scene'
import type { IconName } from '@/declarations/ui/icons'
import type { ModViewTarget, ModViewWindow } from '@/types/modview'

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
 * One stop of a guided tour of the Mod View
 * @typedef {Object} TourStop
 * @property {ModViewTarget} target - Part lit
 * @property {string} label - Name in the side list
 * @property {string} body - What the bubble says
 */

export interface TourStop {
  target: ModViewTarget
  label: string
  body: string
}

/**
 * One part of the Mod View opened on its own
 * @typedef {Object} FocusItem
 * @property {string} key - Stable key
 * @property {string} label - Button label
 * @property {ModViewWindow[]} windows - Windows played on the right
 * @property {ModViewTarget} [spotlight] - Part lit in them
 * @property {ModViewScene} scene - Animation played
 * @property {string[]} points - What is said on the left, one line each
 */

export interface FocusItem {
  key: string
  label: string
  windows: ModViewWindow[]
  spotlight?: ModViewTarget
  scene: ModViewScene
  points: string[]
}

/**
 * One rung of the decision ladder, names read from the accounts
 * @typedef {Object} HierarchyRung
 * @property {'admins' | 'responsables' | 'coordinator'} source - Who stands there
 * @property {string} label - Rung name
 * @property {CourseTone} tone - Colour
 */

export interface HierarchyRung {
  source: 'admins' | 'responsables' | 'coordinator'
  label: string
  tone: CourseTone
}

/**
 * One livecon level as the course tells it
 * @typedef {Object} LiveconStop
 * @property {number} level - Level number
 * @property {string} text - What it means
 * @property {string[]} [notes] - Lines under it
 */

export interface LiveconStop {
  level: number
  text: string
  notes?: string[]
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
  | { kind: 'tour'; key: string; intro: string; scene: ModViewScene; stops: TourStop[] }
  | { kind: 'focus'; key: string; prompt: string; items: FocusItem[] }
  | { kind: 'hierarchy'; key: string; rungs: HierarchyRung[] }
  | { kind: 'livecon'; key: string; stops: LiveconStop[] }

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
      kind: 'scene'
      key: string
      title: string
      // Said before the scene plays
      context: string
      scene: ModViewScene
      // Asked once it has played
      questions: QuizQuestionSeed[]
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
  intro?: CourseIntro
  chapters: CourseChapter[]
}

/**
 * Opening page of a course, its chapter list generated
 * @typedef {Object} CourseIntro
 * @property {string} objective - What the learner will know
 * @property {string} outline - Said under the chapter list
 * @property {{ title: string, body: string }} [caseStudy] - Case followed through the course
 * @property {string} feedback - Said about the final review
 * @property {string} start - Question before the first chapter
 */

export interface CourseIntro {
  objective: string
  outline: string
  caseStudy?: { title: string; body: string }
  feedback: string
  start: string
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
  'scene',
]
