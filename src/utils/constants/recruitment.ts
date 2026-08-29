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
 * Who carries out a recruitment timeline step
 * @type {Record<string, string>}
 */

export const RecruitmentOwners = {
  Responsable: 'RESPONSABLE',
  Recruteurs: 'RECRUTEURS',
  Both: 'BOTH',
} as const

export type RecruitmentOwnerName = (typeof RecruitmentOwners)[keyof typeof RecruitmentOwners]
