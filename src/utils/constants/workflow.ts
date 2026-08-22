/**
 * Board scopes
 * @type {Record<string, string>}
 */

export const WorkflowScopes = {
  Project: 'PROJECT',
  Task: 'TASK',
  Meeting: 'MEETING',
} as const

export type WorkflowScopeName = (typeof WorkflowScopes)[keyof typeof WorkflowScopes]

/**
 * Meeting seat kinds
 * @type {Record<string, string>}
 */

export const AttendeeKinds = {
  Lead: 'LEAD',
  Assistant: 'ASSISTANT',
  Participant: 'PARTICIPANT',
} as const

export type AttendeeKindName = (typeof AttendeeKinds)[keyof typeof AttendeeKinds]

/**
 * Absence review outcomes
 * @type {Record<string, string>}
 */

export const AbsenceStatuses = {
  Pending: 'PENDING',
  Approved: 'APPROVED',
  Refused: 'REFUSED',
  Cancelled: 'CANCELLED',
} as const

export type AbsenceStatusName = (typeof AbsenceStatuses)[keyof typeof AbsenceStatuses]

/**
 * Function holding kinds
 * @type {Record<string, string>}
 */

export const FunctionKinds = {
  Primary: 'PRIMARY',
  Secondary: 'SECONDARY',
} as const

export type FunctionKindName = (typeof FunctionKinds)[keyof typeof FunctionKinds]

/**
 * Permission override effects
 * @type {Record<string, string>}
 */

export const PermissionEffects = {
  Allow: 'ALLOW',
  Deny: 'DENY',
} as const

export type PermissionEffectName = (typeof PermissionEffects)[keyof typeof PermissionEffects]

/**
 * Who a calendar entry is shown to
 * @type {Record<string, string>}
 */

export const EventVisibilities = {
  Everyone: 'EVERYONE',
  Responsables: 'RESPONSABLES',
  Admins: 'ADMINS',
} as const

export type EventVisibilityName = (typeof EventVisibilities)[keyof typeof EventVisibilities]
