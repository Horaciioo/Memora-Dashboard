import type { FormValues } from '@/types/forms'
import type { WorkPerson } from '@/types/work'
import type {
  AcademyStepKindName,
  AcademyJuniorStatusName,
  AcademyPeriodName,
  AcademyProgramName,
  AcademySessionStatusName,
  AcademyTrackName,
} from '@/utils/constants/hierarchy'

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
 * @property {AcademyProgramName} program - Training programme
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
  program: AcademyProgramName
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
 * @property {AcademyTrackName} track - Entry level
 * @property {AcademyJuniorStatusName} status - Outcome so far
 * @property {WorkPerson | null} trainer - Trainer in charge
 * @property {string} startedAt - ISO arrival date
 * @property {string | null} validatedAt - ISO validation date
 * @property {number} liveCount - Lives already covered
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
  track: AcademyTrackName
  status: AcademyJuniorStatusName
  trainer: WorkPerson | null
  startedAt: string
  validatedAt: string | null
  liveCount: number
  summary: string | null
  trainings: JuniorTraining[]
  completedCount: number
  mandatoryPending: number
  reviewCount: number
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
 * Written trace of one voice check-in
 * @typedef {Object} AcademyReviewView
 * @property {string} id - Review identifier
 * @property {string} heldAt - ISO date
 * @property {string | null} authorName - Who held it
 * @property {string | null} feeling - Overall feeling
 * @property {Record<string, string>} axes - Concrete axes explored
 * @property {string} objectives - Personal objectives
 * @property {string | null} strategies - How they get reached
 * @property {string | null} summary - What moves, what blocks, what is decided
 * @property {FormValues} values - Values feeding the edit form
 */

export interface AcademyReviewView {
  id: string
  heldAt: string
  authorName: string | null
  feeling: string | null
  axes: Record<string, string>
  objectives: string
  strategies: string | null
  summary: string | null
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
