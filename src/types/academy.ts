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
 */

export interface JuniorTraining {
  id: string
  name: string
  period: AcademyPeriodName | null
  mandatory: boolean
  completedAt: string | null
  validatorName: string | null
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
 * @property {JuniorDispositif} dispositif - Entry programme
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
  dispositif: JuniorDispositif
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
 * Moment recorded on the session thread
 * @typedef {Object} AcademyStepView
 * @property {string} id - Step identifier
 * @property {AcademyStepKindName} kind - Kind of moment
 * @property {string} title - Intitulé
 * @property {string} scheduledAt - ISO planned date
 * @property {string | null} doneAt - ISO date it was actually held
 * @property {string | null} notes - Written trace
 * @property {string | null} juniorId - Junior it concerns
 * @property {string | null} juniorName - Junior display name
 * @property {string | null} authorName - Who recorded it
 * @property {FormValues} values - Values feeding the edit form
 */

export interface AcademyStepView {
  id: string
  kind: AcademyStepKindName
  title: string
  scheduledAt: string
  doneAt: string | null
  notes: string | null
  juniorId: string | null
  juniorName: string | null
  authorName: string | null
  values: FormValues
}

/**
 * Written trace of one voice check-in, and the support of the decision that
 * authorises the following stage
 * @typedef {Object} AcademyReviewView
 * @property {string} id - Review identifier
 * @property {AcademyStageName} stage - Phase this check-in belongs to
 * @property {string} heldAt - ISO date
 * @property {number | null} durationMinutes - How long the call lasted
 * @property {string | null} authorName - Who held it
 * @property {string | null} feeling - Overall feeling
 * @property {string} summary - What moves, what blocks, what is decided
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
