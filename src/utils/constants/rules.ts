import { createEnumeration } from '@/core/lib/enumeration'

/**
 * Control rule enumeration
 * @type {Enumeration<EnumerationSource>}
 */

export const RULE_TYPES = createEnumeration({
  Threshold: { id: 0, label: 'Threshold' },
  Pattern: { id: 1, label: 'Pattern' },
  Duplicate: { id: 2, label: 'Duplicate' },
  Frequency: { id: 3, label: 'Frequency' },
  Schedule: { id: 4, label: 'Schedule' },
  Quota: { id: 5, label: 'Quota' },
})

export type RuleTypeName = keyof typeof RULE_TYPES.ids
export type RuleTypeId = (typeof RULE_TYPES.ids)[RuleTypeName]

/**
 * Report type enumeration
 * @type {Enumeration<EnumerationSource>}
 */

export const REPORT_TYPES = createEnumeration({
  Summary: { id: 0, label: 'Summary' },
  Detailed: { id: 1, label: 'Detailed' },
  Audit: { id: 2, label: 'Audit' },
  Usage: { id: 3, label: 'Usage' },
  Incident: { id: 4, label: 'Incident' },
})

export type ReportTypeName = keyof typeof REPORT_TYPES.ids
export type ReportTypeId = (typeof REPORT_TYPES.ids)[ReportTypeName]
