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

/**
 * Feature switch that opens the public side of Déban.
 * @type {string}
 */

export const UNBAN_INTAKE_FEATURE = 'unban.intake'

/**
 * Shape of the secrets a link and a request are made of
 * @type {Record<string, number | string>}
 */

export const UNBAN_TOKEN = {
  // 256 bits of entropy
  bytes: 32,
  // Characters of 32 bytes in base64url
  length: 43,
  referencePrefix: 'DB-',
  referenceLength: 5,
  // No 0, O, 1 or I
  referenceAlphabet: '23456789ABCDEFGHJKLMNPQRSTUVWXYZ',
  referenceAttempts: 5,
} as const

// Longest note a moderator attaches to a link
export const UNBAN_LABEL_MAX_LENGTH = 80

/**
 * Names of the fields the public form carries besides the questions
 * @type {Record<string, string>}
 */

export const UNBAN_FORM_FIELDS = {
  fillToken: 'fillToken',
  // A bait only a robot fills
  trap: 'website',
  discordId: 'discordId',
  discordName: 'discordName',
} as const

/**
 * How the public form is cut into steps
 * @type {{ maxShort: number }}
 */

export const UNBAN_STEP = { maxShort: 3 } as const
