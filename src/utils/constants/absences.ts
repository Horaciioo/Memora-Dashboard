import { createEnumeration } from '@/core/lib/enumeration'

/**
 * Why a member is away, kept as a closed list so no health detail is ever collected
 * @type {Enumeration}
 */

export const ABSENCE_REASONS = createEnumeration({
  Personal: { id: 0, label: 'Personnel' },
  Professional: { id: 1, label: 'Professionnel ou scolaire' },
  Health: { id: 2, label: 'Santé' },
  Holiday: { id: 3, label: 'Vacances' },
  Other: { id: 4, label: 'Autre' },
})

export type AbsenceReasonName = (typeof ABSENCE_REASONS.names)[number]
export type AbsenceReasonId = (typeof ABSENCE_REASONS.ids)[AbsenceReasonName]
