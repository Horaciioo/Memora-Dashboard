/**
 * Phase a recruitment campaign sits in
 * @type {Record<string, string>}
 */

export const RecruitmentStatuses = {
  Draft: 'DRAFT',
  Announced: 'ANNOUNCED',
  Interviews: 'INTERVIEWS',
  Closed: 'CLOSED',
  Archived: 'ARCHIVED',
} as const

export type RecruitmentStatusName = (typeof RecruitmentStatuses)[keyof typeof RecruitmentStatuses]

/**
 * Phases past which a campaign no longer moves
 * @type {RecruitmentStatusName[]}
 */

export const FINISHED_RECRUITMENT_STATUSES: RecruitmentStatusName[] = [
  RecruitmentStatuses.Closed,
  RecruitmentStatuses.Archived,
]

/**
 * Who carries out a recruitment timeline step
 * @type {Record<string, string>}
 */

export const RecruitmentOwners = {
  Responsable: 'RESPONSABLE',
  Recruteurs: 'RECRUTEURS',
  Both: 'BOTH',
} as const

export type RecruitmentOwnerName = (typeof RecruitmentOwners)[keyof typeof RecruitmentOwners]

/**
 * Platform an interview script is written for
 * @type {Record<string, string>}
 */

export const RecruitmentPlatforms = {
  Discord: 'DISCORD',
  Twitch: 'TWITCH',
} as const

export type RecruitmentPlatformName =
  (typeof RecruitmentPlatforms)[keyof typeof RecruitmentPlatforms]

/**
 * Recruiter's reaction to an answer
 * @type {Record<string, string>}
 */

export const AnswerAppreciations = {
  Like: 'LIKE',
  Neutral: 'NEUTRAL',
  Dislike: 'DISLIKE',
} as const

export type AnswerAppreciationName = (typeof AnswerAppreciations)[keyof typeof AnswerAppreciations]

// Observers one interview welcomes on their own, a manager may add more
export const INTERVIEW_OBSERVERS_MAX = 3

// Interviews one observer may sit in on, at most
export const OBSERVER_QUOTA_MAX = 10
