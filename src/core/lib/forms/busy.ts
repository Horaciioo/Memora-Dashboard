import { AGENDA_SETTINGS } from '@/declarations/configurations/settings'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import type { BusySlot, FieldKind, FieldValue } from '@/types/forms'
import { addDays, startOfDay } from '@/utils/format/days'

const MINUTE_MS = 60_000

/**
 * End of a slot, a bare moment lasting the default length
 * @param {BusySlot} slot - Event slot
 * @param {Date} start - Slot start
 * @return {Date} - Slot end
 */

const endOf = (slot: BusySlot, start: Date): Date =>
  slot.endsAt
    ? new Date(slot.endsAt)
    : new Date(start.getTime() + AGENDA_SETTINGS.busyDefaultMinutes * MINUTE_MS)

/**
 * Slots a date field value lands inside, a day value matching any event of that day
 * @param {FieldValue} value - Field value
 * @param {FieldKind} kind - Field kind
 * @param {BusySlot[]} slots - Events already held
 * @param {string | null} [ignoreId] - Record being edited
 * @return {BusySlot[]} - Slots in progress
 */

export const busyAt = (
  value: FieldValue,
  kind: FieldKind,
  slots: BusySlot[],
  ignoreId?: string | null
): BusySlot[] => {
  if (typeof value !== 'string' || value.length === 0) return []

  const picked = new Date(value)
  if (Number.isNaN(picked.getTime())) return []

  const candidates = slots.filter((slot) => slot.refId !== ignoreId)

  // A date alone holds the whole day
  if (kind === 'date') {
    const from = startOfDay(picked).getTime()
    const to = addDays(startOfDay(picked), 1).getTime()

    return candidates.filter((slot) => {
      const start = new Date(slot.startsAt).getTime()

      return start >= from && start < to
    })
  }

  // A time falls inside the slots it starts within
  return candidates.filter((slot) => {
    const start = new Date(slot.startsAt)

    return slot.allDay
      ? startOfDay(start).getTime() === startOfDay(picked).getTime()
      : picked >= start && picked < endOf(slot, start)
  })
}

/**
 * Sentence telling what already holds the picked moment
 * @param {FieldValue} value - Field value
 * @param {FieldKind} kind - Field kind
 * @param {BusySlot[] | undefined} slots - Events already held
 * @param {string | null} [ignoreId] - Record being edited
 * @return {string | undefined} - Warning, nothing when free
 */

export const busyNotice = (
  value: FieldValue,
  kind: FieldKind,
  slots: BusySlot[] | undefined,
  ignoreId?: string | null
): string | undefined => {
  if (!slots) return undefined

  const held = busyAt(value, kind, slots, ignoreId)
  if (held.length === 0) return undefined

  const shown = held.slice(0, AGENDA_SETTINGS.busyListMax).map((slot) => `« ${slot.label} »`)
  const rest = held.length - shown.length
  const events = [
    shown.join(', '),
    rest > 0 ? FORM_COPY.busyMore.replace('{count}', String(rest)) : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (kind === 'date' ? FORM_COPY.busyDay : FORM_COPY.busyNow).replace('{events}', events)
}
