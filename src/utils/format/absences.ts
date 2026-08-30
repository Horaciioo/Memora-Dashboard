import type { MemberAbsence } from '@/types/members'

// Separates the chosen category from its optional precision
const REASON_SEPARATOR = ' · '

/**
 * Compose what an absence shows as its reason, category first
 * @param {MemberAbsence} absence - Absence row
 * @return {string | null} - Display reason
 */

export const absenceReasonText = (absence: MemberAbsence): string | null =>
  [absence.reasonLabel, absence.reason].filter(Boolean).join(REASON_SEPARATOR) || null
