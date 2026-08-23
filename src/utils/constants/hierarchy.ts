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
 * Training programmes a session runs
 * @type {Record<string, string>}
 */

export const AcademyPrograms = {
  Twitch: 'PIMT',
  Youtube: 'PIMY',
  Discord: 'PIMD',
  Polyvalent: 'PIMP',
} as const

export type AcademyProgramName = (typeof AcademyPrograms)[keyof typeof AcademyPrograms]

/**
 * Entry level of a junior
 * @type {Record<string, string>}
 */

export const AcademyTracks = {
  Entry: 'ENTREE',
  Adaptation: 'ADAPTATION',
} as const

export type AcademyTrackName = (typeof AcademyTracks)[keyof typeof AcademyTracks]

/**
 * Lifecycle of a session
 * @type {Record<string, string>}
 */

export const AcademySessionStatuses = {
  Planned: 'PLANNED',
  Running: 'RUNNING',
  Closed: 'CLOSED',
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
