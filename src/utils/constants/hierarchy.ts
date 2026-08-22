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
