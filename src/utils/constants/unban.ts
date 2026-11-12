/**
 * Where a request stands, values mirror the database enum
 * @type {Record<string, string>}
 */

export const UnbanStatuses = {
  Pending: 'PENDING',
  InReview: 'IN_REVIEW',
  Accepted: 'ACCEPTED',
  Refused: 'REFUSED',
} as const

export type UnbanStatusName = (typeof UnbanStatuses)[keyof typeof UnbanStatuses]

/**
 * Where a link stands, worked out from its dates and uses
 * @type {Record<string, string>}
 */

export const UnbanLinkStates = {
  Active: 'ACTIVE',
  Used: 'USED',
  Expired: 'EXPIRED',
  Revoked: 'REVOKED',
} as const

export type UnbanLinkStateName = (typeof UnbanLinkStates)[keyof typeof UnbanLinkStates]

/**
 * Kinds of question a form can ask
 * @type {Record<string, string>}
 */

export const UnbanQuestionTypes = {
  ShortText: 'SHORT_TEXT',
  LongText: 'LONG_TEXT',
  SingleChoice: 'SINGLE_CHOICE',
  MultipleChoice: 'MULTIPLE_CHOICE',
  Dropdown: 'DROPDOWN',
  Scale: 'SCALE',
  Date: 'DATE',
} as const

export type UnbanQuestionTypeName = (typeof UnbanQuestionTypes)[keyof typeof UnbanQuestionTypes]
