import type { MaturityName } from '@/declarations/maturity/registries'
import type { ParkourPhase } from '@/core/lib/academy/parkour'
import type { LivePlatformName } from '@/utils/constants/lives'
import type { TimelineStepState } from '@/core/services/academy/timeline'
import type { PimDestinationName } from '@/declarations/academy/guides'
import type { CourseSurface, CourseTrack } from '@/declarations/academy/curriculum/types'
import type { IconName } from '@/declarations/ui/icons'
import type { FormValues } from '@/types/forms'
import type { WorkPerson } from '@/types/work'
import type {
  AcademyStepKindName,
  AcademyJuniorStatusName,
  AcademyPeriodName,
  AcademySessionStatusName,
  AcademyStageName,
  NoteKindName,
  ObjectiveStatusName,
  ReviewAdviceName,
  ReviewStatusName,
  StepAnchorName,
  StepOwnerName,
  TrainingStatusName,
  TrainingBlockKindName,
} from '@/utils/constants/hierarchy'

/**
 * Entry programme a junior is placed into
 * @typedef {Object} JuniorDispositif
 * @property {string} id - Dispositif identifier
 * @property {string} name - Display name
 * @property {string | null} accent - Colour token
 */

export interface JuniorDispositif {
  id: string
  name: string
  accent: string | null
}

/**
 * Function a session is scoped to
 * @typedef {Object} SessionFunction
 * @property {string} id - Function identifier
 * @property {string} name - Display name
 * @property {string | null} summary - Surface the function covers
 * @property {string | null} accent - Colour token
 */

export interface SessionFunction {
  id: string
  name: string
  summary: string | null
  accent: string | null
}

/**
 * Training status of one junior
 * @typedef {Object} JuniorTraining
 * @property {string} id - Training identifier
 * @property {string} name - Training name
 * @property {AcademyPeriodName | null} period - Academy period
 * @property {boolean} mandatory - Required to progress
 * @property {string | null} completedAt - ISO completion date
 * @property {string | null} validatorName - Who validated it
 * @property {{ passed: number, total: number } | null} exercises - Exercises cleared
 */

export interface JuniorTraining {
  id: string
  name: string
  period: AcademyPeriodName | null
  mandatory: boolean
  completedAt: string | null
  validatorName: string | null
  exercises: { passed: number; total: number } | null
}

/**
 * Session listed on the academy board
 * @typedef {Object} SessionSummary
 * @property {string} id - Session identifier
 * @property {SessionFunction} function - Function the session is scoped to
 * @property {string} startsAt - ISO start date
 * @property {string | null} endsAt - ISO end date
 * @property {AcademySessionStatusName} status - Lifecycle state
 * @property {string | null} summary - Description
 * @property {WorkPerson[]} trainers - Moderators holding the trainer seat
 * @property {number} juniorCount - Juniors inside
 * @property {string | null} inviteToken - Token of the active admission link
 * @property {FormValues} values - Values feeding the edit form
 */

export interface SessionSummary {
  id: string
  function: SessionFunction
  startsAt: string
  endsAt: string | null
  status: AcademySessionStatusName
  summary: string | null
  trainers: WorkPerson[]
  juniorCount: number
  inviteToken: string | null
  values: FormValues
}

/**
 * Junior followed inside one session
 * @typedef {Object} JuniorView
 * @property {string} id - Junior identifier
 * @property {string} sessionId - Session identifier
 * @property {string} accountId - Moderator identifier
 * @property {string} displayName - Display name
 * @property {string | null} avatarUrl - Portrait
 * @property {JuniorDispositif | null} dispositif - Entry programme
 * @property {string | null} confirmedAt - ISO date the junior confirmed their file
 * @property {AcademyJuniorStatusName} status - Outcome so far
 * @property {AcademyStageName} stage - Current phase of the PIM
 * @property {WorkPerson | null} trainer - Trainer in charge
 * @property {string} startedAt - ISO arrival date
 * @property {string | null} validatedAt - ISO validation date
 * @property {number} liveCount - Lives already covered
 * @property {number} bonusLives - Extra lives opened by a bonus decision
 * @property {string | null} summary - Remarks
 * @property {JuniorTraining[]} trainings - Training progression
 * @property {number} completedCount - Trainings validated
 * @property {number} mandatoryPending - Mandatory trainings still open
 * @property {number} reviewCount - Voice check-ins written
 * @property {FormValues} values - Values feeding the edit form
 */

export interface JuniorView {
  id: string
  sessionId: string
  accountId: string
  displayName: string
  avatarUrl: string | null
  dispositif: JuniorDispositif | null
  confirmedAt: string | null
  status: AcademyJuniorStatusName
  stage: AcademyStageName
  trainer: WorkPerson | null
  startedAt: string
  validatedAt: string | null
  liveCount: number
  bonusLives: number
  summary: string | null
  trainings: JuniorTraining[]
  completedCount: number
  mandatoryPending: number
  reviewCount: number
  values: FormValues
}

/**
 * Competency grade of one junior on one skill
 * @typedef {Object} JuniorSkillView
 * @property {string} skillId - Skill identifier
 * @property {string} name - Skill name
 * @property {string | null} description - What the skill covers
 * @property {string} categoryId - Category identifier
 * @property {string} categoryName - Category name
 * @property {string | null} categoryAccent - Colour token
 * @property {number} percent - Mastery reached
 * @property {string | null} validatorName - Who last moved it
 * @property {string | null} updatedAt - ISO date of the last change
 */

export interface JuniorSkillView {
  skillId: string
  name: string
  description: string | null
  categoryId: string
  categoryName: string
  categoryAccent: string | null
  percent: number
  validatorName: string | null
  updatedAt: string | null
}

/**
 * Trace kept on a junior's FSI
 * @typedef {Object} JuniorNoteView
 * @property {string} id - Note identifier
 * @property {AcademyStageName} stage - Phase it was written at
 * @property {NoteKindName} kind - Positive or negative
 * @property {string} body - Written trace
 * @property {string | null} authorName - Who wrote it
 * @property {string} createdAt - ISO date
 * @property {FormValues} values - Values feeding the edit form
 */

export interface JuniorNoteView {
  id: string
  stage: AcademyStageName
  kind: NoteKindName
  body: string
  authorName: string | null
  createdAt: string
  values: FormValues
}

/**
 * Personal objective of a junior
 * @typedef {Object} JuniorObjectiveView
 * @property {string} id - Objective identifier
 * @property {string} title - Short intitulé
 * @property {string | null} description - Detail
 * @property {string | null} dueAt - ISO due date
 * @property {ObjectiveStatusName} status - Outcome so far
 * @property {number} position - Display order
 * @property {string | null} authorName - Who set it
 * @property {FormValues} values - Values feeding the edit form
 */

export interface JuniorObjectiveView {
  id: string
  title: string
  description: string | null
  dueAt: string | null
  status: ObjectiveStatusName
  position: number
  authorName: string | null
  values: FormValues
}

/**
 * Free moment on the session thread
 * @typedef {Object} AcademyStepView
 * @property {string} id - Step identifier
 * @property {AcademyStepKindName | null} kind - Kind of moment
 * @property {string} title - Intitulé
 * @property {string | null} scheduledAt - ISO planned date
 * @property {string | null} doneAt - ISO date it was actually held
 * @property {string | null} notes - Written trace
 * @property {string | null} juniorId - Junior it concerns
 * @property {string | null} accountId - Account of the junior it concerns
 * @property {string | null} juniorName - Junior display name
 * @property {string | null} authorName - Who recorded it
 * @property {string | null} templateId - PIMT template it was instantiated from
 * @property {AcademyStageName | null} stage - Phase this step belongs to
 * @property {StepAnchorName | null} anchor - Day or live threshold
 * @property {number | null} offset - Day offset or live threshold
 * @property {StepOwnerName | null} owner - Who carries it
 * @property {boolean} required - Blocks the following steps of its stage while late
 * @property {string | null} validatedAt - ISO date it was cleared
 * @property {string | null} validatedByName - Who cleared it
 * @property {TimelineStepState | null} state - Resolved position
 * @property {FormValues} values - Values feeding the edit form
 */

export interface AcademyStepView {
  id: string
  kind: AcademyStepKindName | null
  title: string
  scheduledAt: string | null
  doneAt: string | null
  notes: string | null
  juniorId: string | null
  accountId: string | null
  juniorName: string | null
  authorName: string | null
  templateId: string | null
  stage: AcademyStageName | null
  anchor: StepAnchorName | null
  offset: number | null
  owner: StepOwnerName | null
  required: boolean
  validatedAt: string | null
  validatedByName: string | null
  state: TimelineStepState | null
  values: FormValues
}

/**
 * Written trace of one voice check-in
 * @typedef {Object} AcademyReviewView
 * @property {string} id - Review identifier
 * @property {AcademyStageName} stage - Phase this check-in belongs to
 * @property {string} heldAt - ISO date
 * @property {number | null} durationMinutes - How long the call lasted
 * @property {string | null} authorName - Who held it
 * @property {string | null} feeling - Overall feeling
 * @property {string} summary - What moves
 * @property {ReviewAdviceName} advice - Outcome proposed by the Formateur
 * @property {ReviewStatusName} status - Lifecycle of the check-in
 * @property {string | null} decidedByName - Who decided
 * @property {string | null} decidedAt - ISO decision date
 * @property {string | null} decisionNote - Note attached to the decision
 * @property {FormValues} values - Values feeding the edit form
 */

export interface AcademyReviewView {
  id: string
  stage: AcademyStageName
  heldAt: string
  durationMinutes: number | null
  authorName: string | null
  feeling: string | null
  summary: string
  advice: ReviewAdviceName
  // Outcome the responsable kept
  decision: ReviewAdviceName | null
  status: ReviewStatusName
  decidedByName: string | null
  decidedAt: string | null
  decisionNote: string | null
  values: FormValues
}

/**
 * Everything one session screen needs
 * @typedef {Object} SessionDetail
 * @property {SessionSummary} summary - Session header
 * @property {JuniorView[]} juniors - Juniors inside
 * @property {AcademyStepView[]} steps - Session thread
 */

export interface SessionDetail {
  summary: SessionSummary
  juniors: JuniorView[]
  steps: AcademyStepView[]
}

/**
 * One training on a junior's own progression page
 * @typedef {Object} MyTrainingView
 * @property {string} id - Training identifier
 * @property {string} name - Training name
 * @property {string | null} summary - What the training covers
 * @property {AcademyPeriodName | null} period - Academy period
 * @property {boolean} mandatory - Required to progress
 * @property {TrainingStatusName} status - Lifecycle state
 * @property {number} attempts - Times restarted
 * @property {string | null} startedAt - ISO date first started
 * @property {string | null} completedAt - ISO date completed
 * @property {string | null} abandonedAt - ISO date abandoned
 */

export interface MyTrainingView {
  id: string
  name: string
  summary: string | null
  period: AcademyPeriodName | null
  mandatory: boolean
  status: TrainingStatusName
  attempts: number
  startedAt: string | null
  completedAt: string | null
  abandonedAt: string | null
}

/**
 * Move a junior may apply to their own progression on one training
 * @typedef {'start' | 'resume' | 'restart' | 'abandon' | 'complete'} MyTrainingAction
 */

export type MyTrainingAction = 'start' | 'resume' | 'restart' | 'abandon' | 'complete'

/**
 * One offered answer to a quiz question
 * @typedef {Object} QuizChoiceView
 * @property {string} id - Choice identifier
 * @property {string} label - Display label
 * @property {boolean} correct - Counts toward the score
 * @property {number} position - Display order
 * @property {FormValues} values - Values feeding the edit form
 */

export interface QuizChoiceView {
  id: string
  label: string
  correct: boolean
  position: number
  values: FormValues
}

/**
 * One question of a quiz block
 * @typedef {Object} QuizQuestionView
 * @property {string} id - Question identifier
 * @property {string} prompt - Question text
 * @property {boolean} multiple - More than one correct choice
 * @property {number} position - Display order
 * @property {QuizChoiceView[]} choices - Offered answers
 * @property {FormValues} values - Values feeding the edit form
 */

export interface QuizQuestionView {
  id: string
  prompt: string
  multiple: boolean
  position: number
  choices: QuizChoiceView[]
  values: FormValues
}

/**
 * One piece of a chapter
 * @typedef {Object} TrainingBlockView
 * @property {string} id - Block identifier
 * @property {TrainingBlockKindName} kind - Written passage or quiz
 * @property {string | null} body - Markdown body
 * @property {number} position - Display order
 * @property {QuizQuestionView[]} questions - Quiz questions
 * @property {FormValues} values - Values feeding the edit form
 */

export interface TrainingBlockView {
  id: string
  kind: TrainingBlockKindName
  body: string | null
  position: number
  questions: QuizQuestionView[]
  values: FormValues
}

/**
 * One section of a training's content
 * @typedef {Object} TrainingChapterView
 * @property {string} id - Chapter identifier
 * @property {string} title - Display title
 * @property {number} position - Display order
 * @property {TrainingBlockView[]} blocks - Blocks under this chapter
 * @property {FormValues} values - Values feeding the edit form
 */

export interface TrainingChapterView {
  id: string
  title: string
  position: number
  blocks: TrainingBlockView[]
  values: FormValues
}

/**
 * One block on a junior's read of a training's content
 * @typedef {Object} ContentBlockView
 * @property {string} id - Block identifier
 * @property {TrainingBlockKindName} kind - Written passage or quiz
 * @property {string | null} body - Markdown body
 * @property {number} questionCount - Questions in the quiz
 * @property {boolean} answered - Every question already has an answer on file
 */

export interface ContentBlockView {
  id: string
  kind: TrainingBlockKindName
  body: string | null
  questionCount: number
  answered: boolean
}

/**
 * One chapter on a junior's read of a training's content
 * @typedef {Object} ContentChapterView
 * @property {string} id - Chapter identifier
 * @property {string} title - Display title
 * @property {ContentBlockView[]} blocks - Blocks under this chapter
 */

export interface ContentChapterView {
  id: string
  title: string
  blocks: ContentBlockView[]
}

/**
 * Why the step in course cannot move yet
 * @typedef {'notStarted' | 'awaitingReview' | 'awaitingDecision' | 'standby' | 'closed'} PimTimelineLock
 */

export type PimTimelineLock =
  'notStarted' | 'awaitingReview' | 'awaitingDecision' | 'standby' | 'closed'

/**
 * Place of a step against the one in course
 * @typedef {'done' | 'current' | 'upcoming'} PimStepPosition
 */

export type PimStepPosition = 'done' | 'current' | 'upcoming'

/**
 * One step of a junior's vertical timeline
 * @typedef {Object} PimTimelineStep
 * @property {string} id - Step identifier
 * @property {string} title - What the step is
 * @property {string | null} description - What must happen
 * @property {string | null} guide - Detailed walkthrough
 * @property {IconName | null} icon - Glyph
 * @property {PimDestinationName | null} destination - Where its owner acts
 * @property {AcademyStageName} stage - Phase it belongs to
 * @property {StepOwnerName | null} owner - Who carries it
 * @property {boolean} required - Cannot be skipped
 * @property {string | null} scheduledAt - ISO planned day
 * @property {string | null} validatedAt - ISO day it was cleared
 * @property {string | null} validatedByName - Who cleared it
 * @property {PimStepPosition} position - Against the step in course
 */

export interface PimTimelineStep {
  id: string
  title: string
  description: string | null
  guide: string | null
  icon: IconName | null
  destination: PimDestinationName | null
  stage: AcademyStageName
  owner: StepOwnerName | null
  required: boolean
  scheduledAt: string | null
  validatedAt: string | null
  validatedByName: string | null
  position: PimStepPosition
}

/**
 * Vertical timeline of one junior
 * @typedef {Object} PimTimeline
 * @property {string} juniorId - Junior identifier
 * @property {string} sessionId - Promotion identifier
 * @property {AcademyStageName} stage - Stage the junior stands in
 * @property {string | null} currentId - Step in course
 * @property {PimTimelineLock | null} lock - Why it cannot move
 * @property {PimTimelineStep[]} steps - Steps
 */

export interface PimTimeline {
  juniorId: string
  sessionId: string
  stage: AcademyStageName
  currentId: string | null
  lock: PimTimelineLock | null
  steps: PimTimelineStep[]
}

/**
 * Saved state of one exercise
 * @typedef {Object} ExerciseProgress
 * @property {boolean} passed - Cleared
 * @property {number} score - Points earned on the last try
 * @property {number} max - Points available
 * @property {unknown} answer - Last answer sent
 */

export interface ExerciseProgress {
  passed: boolean
  score: number
  max: number
  answer: unknown
}

/**
 * Saved state of one course
 * @typedef {Object} CourseProgress
 * @property {Record<string, ExerciseProgress>} blocks - State per exercise key
 */

export interface CourseProgress {
  blocks: Record<string, ExerciseProgress>
}

/**
 * One course of the catalogue
 * @typedef {Object} CourseCard
 * @property {string} id - Training identifier
 * @property {string} key - Course key
 * @property {string} name - Title
 * @property {string} summary - What it teaches
 * @property {CourseTrack} track - Indispensable or secondary
 * @property {CourseSurface} surface - What it is about
 * @property {number} minutes - Expected length
 * @property {number} chapters - Chapters
 * @property {number} exercises - Exercises
 * @property {number} passed - Exercises cleared
 * @property {TrainingStatusName} status - Where the member stands
 * @property {boolean} isLocked - Not in its period yet
 */

export interface CourseCard {
  id: string
  key: string
  name: string
  summary: string
  track: CourseTrack
  surface: CourseSurface
  minutes: number
  chapters: number
  exercises: number
  passed: number
  status: TrainingStatusName
  isLocked: boolean
  maturity?: MaturityName
}

/**
 * What a course reads from the database around its declared content
 * @typedef {Object} CourseContext
 * @property {{ admins: string[], responsables: string[] }} ladder - Names of the decision ladder
 * @property {CourseLiveconLevel[]} livecon - Levels with their panel offences
 * @property {string} creator - Creator the course is about
 */

export interface CourseContext {
  ladder: { admins: string[]; responsables: string[] }
  livecon: CourseLiveconLevel[]
  creator: string
}

/**
 * One livecon level as a course shows it
 * @typedef {Object} CourseLiveconLevel
 */

export interface CourseLiveconLevel {
  level: number
  name: string
  icon: string | null
  accent: string | null
  samples: { offense: string; measures: string[] }[]
}

/**
 * One written review
 * @typedef {Object} TrainingFeedbackComment
 * @property {string} id - Review identifier
 * @property {string} memberName - Author
 * @property {string | null} avatarUrl - Author portrait
 * @property {number} content - Content mark
 * @property {number} fluency - Fluency mark
 * @property {string} comment - Written comment
 * @property {string} createdAt - ISO date
 */

export interface TrainingFeedbackComment {
  id: string
  memberName: string
  avatarUrl: string | null
  content: number
  fluency: number
  comment: string
  createdAt: string
}

/**
 * Reviews of one training
 * @typedef {Object} TrainingFeedbackSummary
 * @property {number} reviews - Reviews received
 * @property {number | null} content - Average content mark
 * @property {number | null} fluency - Average fluency mark
 * @property {TrainingFeedbackComment[]} comments - Latest comments
 */

export interface TrainingFeedbackSummary {
  reviews: number
  content: number | null
  fluency: number | null
  comments: TrainingFeedbackComment[]
}

/**
 * Where one junior stands on the AcademicParkour
 * @typedef {Object} ParkourView
 * @property {string} juniorId - Junior identifier
 * @property {string} sessionId - Promotion
 * @property {ParkourPhase} phase - Phase
 * @property {number} liveCount - Lives where they were present
 * @property {number | null} livesNeeded - Lives before the next check-in
 * @property {string | null} deadlineAt - Third period deadline
 * @property {string | null} integrationPath - Integration link
 * @property {boolean} canLaunchAnyway - Promotion launchable by hand
 * @property {boolean} canOpenSecondPeriod - Second period openable by hand
 */

export interface ParkourView {
  juniorId: string
  sessionId: string
  phase: ParkourPhase
  liveCount: number
  livesNeeded: number | null
  deadlineAt: string | null
  integrationPath: string | null
  canLaunchAnyway: boolean
  canOpenSecondPeriod: boolean
}

/**
 * One live a junior accompanied
 * @typedef {Object} AccompaniedLiveView
 * @property {string} liveId - Live identifier
 * @property {string} title - Live title
 * @property {string} creator - Creator name
 * @property {LivePlatformName} platform - Platform
 * @property {string} startedAt - ISO start
 */

export interface AccompaniedLiveView {
  liveId: string
  title: string
  creator: string
  platform: LivePlatformName
  startedAt: string
}
