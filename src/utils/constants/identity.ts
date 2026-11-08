/**
 * Where a Discord identity check stands
 * @type {Record<string, string>}
 */

export const IdentityCheckStatuses = {
  Open: 'OPEN',
  Escalated: 'ESCALATED',
  Resolved: 'RESOLVED',
  Done: 'DONE',
} as const

export type IdentityCheckStatusName =
  (typeof IdentityCheckStatuses)[keyof typeof IdentityCheckStatuses]
