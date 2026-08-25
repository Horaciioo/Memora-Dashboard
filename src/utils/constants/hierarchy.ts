/**
 * Hierarchy levels
 * @type {Record<string, string>}
 */

export const MemberRoles = {
  Admin: 'ADMIN',
  Responsable: 'RESPONSABLE',
  Moderateur: 'MODERATEUR',
} as const

export type MemberRoleName = (typeof MemberRoles)[keyof typeof MemberRoles]

/**
 * Membership lifecycle
 * @type {Record<string, string>}
 */

export const MemberStatuses = {
  Academy: 'ACADEMY',
  Active: 'ACTIVE',
  Paused: 'PAUSED',
  Left: 'LEFT',
} as const

export type MemberStatusName = (typeof MemberStatuses)[keyof typeof MemberStatuses]

/**
 * Academy periods
 * @type {Record<string, string>}
 */

export const AcademyPeriods = {
  Discovery: 'DISCOVERY',
  Practice: 'PRACTICE',
} as const

export type AcademyPeriodName = (typeof AcademyPeriods)[keyof typeof AcademyPeriods]

/**
 * Lifecycle of a session
 * @type {Record<string, string>}
 */

export const AcademySessionStatuses = {
  Draft: 'DRAFT',
  Open: 'OPEN',
  Running: 'RUNNING',
  Closed: 'CLOSED',
  Archived: 'ARCHIVED',
} as const

export type AcademySessionStatusName =
  (typeof AcademySessionStatuses)[keyof typeof AcademySessionStatuses]

/**
 * Outcome of a junior inside a session
 * @type {Record<string, string>}
 */

export const AcademyJuniorStatuses = {
  Active: 'ACTIVE',
  Validated: 'VALIDATED',
  Stopped: 'STOPPED',
} as const

export type AcademyJuniorStatusName =
  (typeof AcademyJuniorStatuses)[keyof typeof AcademyJuniorStatuses]

/**
 * Kind of moment recorded on the session thread
 * @type {Record<string, string>}
 */

export const AcademyStepKinds = {
  Training: 'FORMATION',
  VoiceReview: 'BILAN_VOCAL',
  Interview: 'ENTREVUE',
  LeadCheckIn: 'POINT_RESPONSABLE',
  WorkSession: 'SESSION_TRAVAIL',
} as const

export type AcademyStepKindName = (typeof AcademyStepKinds)[keyof typeof AcademyStepKinds]

/**
 * Broad phase of a junior's PIM
 * @type {Record<string, string>}
 */

export const AcademyStages = {
  Preparation: 'PREPARATION',
  Discovery: 'DISCOVERY',
  ReviewOne: 'REVIEW_ONE',
  Practice: 'PRACTICE',
  ReviewFinal: 'REVIEW_FINAL',
  Bonus: 'BONUS',
} as const

export type AcademyStageName = (typeof AcademyStages)[keyof typeof AcademyStages]

/**
 * How a timeline step's due date is computed
 * @type {Record<string, string>}
 */

export const StepAnchors = {
  Day: 'DAY',
  Live: 'LIVE',
} as const

export type StepAnchorName = (typeof StepAnchors)[keyof typeof StepAnchors]

/**
 * Who is responsible for carrying out a timeline step
 * @type {Record<string, string>}
 */

export const StepOwners = {
  Responsable: 'RESPONSABLE',
  Formateurs: 'FORMATEURS',
  Both: 'BOTH',
  Junior: 'JUNIOR',
} as const

export type StepOwnerName = (typeof StepOwners)[keyof typeof StepOwners]

/**
 * Kind of trace kept on a junior's FSI
 * @type {Record<string, string>}
 */

export const NoteKinds = {
  Positive: 'POSITIVE',
  Negative: 'NEGATIVE',
} as const

export type NoteKindName = (typeof NoteKinds)[keyof typeof NoteKinds]

/**
 * Outcome of a junior's personal objective
 * @type {Record<string, string>}
 */

export const ObjectiveStatuses = {
  Open: 'OPEN',
  Reached: 'REACHED',
  Missed: 'MISSED',
} as const

export type ObjectiveStatusName = (typeof ObjectiveStatuses)[keyof typeof ObjectiveStatuses]

/**
 * Lifecycle of a member's attendance on one training
 * @type {Record<string, string>}
 */

export const TrainingStatuses = {
  NotStarted: 'NOT_STARTED',
  InProgress: 'IN_PROGRESS',
  Done: 'DONE',
  Abandoned: 'ABANDONED',
} as const

export type TrainingStatusName = (typeof TrainingStatuses)[keyof typeof TrainingStatuses]

/**
 * Kind of one training content block
 * @type {Record<string, string>}
 */

export const TrainingBlockKinds = {
  Text: 'TEXT',
  Quiz: 'QUIZ',
} as const

export type TrainingBlockKindName = (typeof TrainingBlockKinds)[keyof typeof TrainingBlockKinds]

/**
 * Outcome proposed at the end of a voice check-in
 * @type {Record<string, string>}
 */

export const ReviewAdvices = {
  Pass: 'PASS',
  Bonus: 'BONUS',
  Stop: 'STOP',
} as const

export type ReviewAdviceName = (typeof ReviewAdvices)[keyof typeof ReviewAdvices]

/**
 * Lifecycle of a voice check-in
 * @type {Record<string, string>}
 */

export const ReviewStatuses = {
  Draft: 'DRAFT',
  Submitted: 'SUBMITTED',
  Validated: 'VALIDATED',
  Rejected: 'REJECTED',
} as const

export type ReviewStatusName = (typeof ReviewStatuses)[keyof typeof ReviewStatuses]
