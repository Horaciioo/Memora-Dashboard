import type { AbsenceAutopilot } from '@/declarations/absences/demo'
import { toDayKey } from '@/utils/format/calendar'
import { addDays } from '@/utils/format/days'

/**
 * Days of the example absence, long enough to be worth declaring
 * @param {Date} today - Current day
 * @param {number} thresholdDays - Days an absence must exceed
 * @param {AbsenceAutopilot} script - Example played
 * @return {{ start: string, end: string }} - ISO days
 */

export const demoSpan = (
  today: Date,
  thresholdDays: number,
  script: AbsenceAutopilot
): { start: string; end: string } => {
  const start = addDays(today, script.startInDays)

  return {
    start: toDayKey(start),
    end: toDayKey(addDays(start, thresholdDays + script.extraDays)),
  }
}
