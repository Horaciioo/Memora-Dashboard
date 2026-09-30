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
 * Lifecycle bucket of a workflow state
 * @type {Record<string, string>}
 */

export const WorkflowPhases = {
  Todo: 'TODO',
  Doing: 'DOING',
  Done: 'DONE',
} as const

export type WorkflowPhaseName = (typeof WorkflowPhases)[keyof typeof WorkflowPhases]

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
 * Meeting audiences
 * @type {Record<string, string>}
 */

export const MeetingAudiences = {
  Everyone: 'EVERYONE',
  Discord: 'DISCORD',
  Twitch: 'TWITCH',
  Custom: 'CUSTOM',
} as const

export type MeetingAudienceName = (typeof MeetingAudiences)[keyof typeof MeetingAudiences]

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
 * Where a member stands on a roll-call
 * @type {Record<string, string>}
 */

export const AttendanceStatuses = {
  Pending: 'PENDING',
  Present: 'PRESENT',
  Absent: 'ABSENT',
} as const

export type AttendanceStatusName = (typeof AttendanceStatuses)[keyof typeof AttendanceStatuses]

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

/**
 * Shape a calendar entry takes on the grid, anchored in code
 * @type {Record<string, string>}
 */

export const CalendarKinds = {
  Zone: 'ZONE',
  Period: 'PERIOD',
  Event: 'EVENT',
} as const

export type CalendarKindName = (typeof CalendarKinds)[keyof typeof CalendarKinds]

/**
 * Domain a calendar entry is read from, the shared calendar holding more than its own rows
 * @type {Record<string, string>}
 */

export const CalendarSources = {
  Entry: 'ENTRY',
  Absence: 'ABSENCE',
  Meeting: 'MEETING',
  Birthday: 'BIRTHDAY',
  AcademyStep: 'ACADEMY_STEP',
  AcademySession: 'ACADEMY_SESSION',
  Recruitment: 'RECRUITMENT',
  RecruitmentInterview: 'RECRUITMENT_INTERVIEW',
} as const

export type CalendarSourceName = (typeof CalendarSources)[keyof typeof CalendarSources]

/**
 * Calendars a viewer can switch on and off, each gathering the sources it draws from
 * @type {Record<string, string>}
 */

export const CalendarLayers = {
  Events: 'EVENTS',
  Meetings: 'MEETINGS',
  Absences: 'ABSENCES',
  Birthdays: 'BIRTHDAYS',
  Academy: 'ACADEMY',
  Recruitment: 'RECRUITMENT',
} as const

export type CalendarLayerName = (typeof CalendarLayers)[keyof typeof CalendarLayers]
