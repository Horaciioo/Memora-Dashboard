import type { ParkourPhase } from '@/core/lib/academy/parkour'
import { PARKOUR_PHASES } from '@/declarations/academy/parkour'
import { formatDay } from '@/utils/format/dates'

/**
 * What a phase asks of the people around the junior
 * @param {ParkourPhase} phase - Phase in course
 * @param {number | null} livesNeeded - Lives before the check-in
 * @param {string | null} deadlineAt - ISO end of the 3rd period
 * @return {string} - Sentence ready to read
 */

export const phaseLead = (
  phase: ParkourPhase,
  livesNeeded: number | null,
  deadlineAt: string | Date | null
): string =>
  PARKOUR_PHASES[phase].lead
    .replace('{lives}', String(livesNeeded ?? ''))
    .replace('{deadline}', deadlineAt ? formatDay(deadlineAt) : '')
