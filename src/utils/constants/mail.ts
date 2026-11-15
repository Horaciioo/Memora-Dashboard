/**
 * Mails the application can send to a person
 * @type {Record<string, string>}
 */

export const MailKinds = {
  UnbanReceived: 'UnbanReceived',
  UnbanTaken: 'UnbanTaken',
  UnbanAccepted: 'UnbanAccepted',
  UnbanRefused: 'UnbanRefused',
} as const

export type MailKindName = (typeof MailKinds)[keyof typeof MailKinds]

/**
 * Outcome of one send
 * @type {Record<string, string>}
 */

export const MailStatuses = {
  Sent: 'SENT',
  Failed: 'FAILED',
  Skipped: 'SKIPPED',
} as const

export type MailStatusName = (typeof MailStatuses)[keyof typeof MailStatuses]

/**
 * Bounds of the mail layer
 * @type {{ emailMaxLength: number, timeoutMs: number, journalSize: number, errorMaxLength: number }}
 */

export const MAIL_LIMITS = {
  emailMaxLength: 254,
  timeoutMs: 8000,
  journalSize: 50,
  errorMaxLength: 300,
} as const

// Shape of an address, the provider has the last word
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
