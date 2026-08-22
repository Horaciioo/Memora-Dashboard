import { createEnumeration } from '@/core/lib/enumeration'

/**
 * Entity lifecycle enumeration
 * @type {Enumeration<EnumerationSource>}
 */

export const ENTITY_STATUSES = createEnumeration({
  Draft: { id: 0, label: 'Draft' },
  Pending: { id: 1, label: 'Pending' },
  Active: { id: 2, label: 'Active' },
  Suspended: { id: 3, label: 'Suspended' },
  Archived: { id: 4, label: 'Archived' },
})

export type EntityStatusName = keyof typeof ENTITY_STATUSES.ids
export type EntityStatusId = (typeof ENTITY_STATUSES.ids)[EntityStatusName]

/**
 * Severity level enumeration
 * @type {Enumeration<EnumerationSource>}
 */

export const SEVERITY_LEVELS = createEnumeration({
  Low: { id: 0, label: 'Low' },
  Medium: { id: 1, label: 'Medium' },
  High: { id: 2, label: 'High' },
  Critical: { id: 3, label: 'Critical' },
})

export type SeverityLevelName = keyof typeof SEVERITY_LEVELS.ids
export type SeverityLevelId = (typeof SEVERITY_LEVELS.ids)[SeverityLevelName]
