import { ANNUAL_REVIEW_COPY } from '@/declarations/calendar/copy'
import type { CalendarEntry } from '@/types/calendar'

/**
 * Fold the open slots of the annual reviews that follow each other into one entry per stretch, so a series of hundreds of quarters stays light to draw and easy to read
 * @param {CalendarEntry[]} entries - Entries on screen
 * @return {CalendarEntry[]} - Taken slots and everything else untouched, open slots as stretches
 */

export const groupOpenSlots = (entries: CalendarEntry[]): CalendarEntry[] => {
  const open = entries
    .filter((entry) => entry.slot === 'open')
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt))
  if (open.length === 0) return entries

  const stretches: CalendarEntry[][] = []
  for (const slot of open) {
    const stretch = stretches.at(-1)
    const last = stretch?.at(-1)

    // The same series, the next slot starting where the last one ends
    if (
      stretch &&
      last &&
      last.endsAt === slot.startsAt &&
      last.values.projectId === slot.values.projectId
    ) {
      stretch.push(slot)
    } else {
      stretches.push([slot])
    }
  }

  const ranges = stretches.map((stretch): CalendarEntry => {
    const first = stretch[0] as CalendarEntry
    const last = stretch.at(-1) as CalendarEntry

    return {
      ...first,
      id: `range:${first.id}`,
      title:
        stretch.length === 1
          ? ANNUAL_REVIEW_COPY.openOne
          : ANNUAL_REVIEW_COPY.openMany.replace('{n}', String(stretch.length)),
      endsAt: last.endsAt,
      slot: 'range',
      // A stretch is never dragged or stretched, its slots are
      readOnly: true,
      values: { ...first.values, rangeIds: stretch.map((slot) => slot.id) },
    }
  })

  return [...entries.filter((entry) => entry.slot !== 'open'), ...ranges].sort((left, right) =>
    left.startsAt.localeCompare(right.startsAt)
  )
}
