import type { FieldDefinition, FormValues } from '@/types/forms'
import { instantToWall, wallToInstant } from '@/utils/format/zone'

// Milliseconds in a minute
const MINUTE = 60_000

/**
 * Next day of a weekday at a wall clock, today when it is still ahead
 * @param {Date} now - Reference moment
 * @param {number} weekday - Day wanted, 1 for Monday
 * @param {string} time - Wall clock wanted
 * @return {Date} - Moment of the slot
 */

export const nextSlot = (now: Date, weekday: number, time: string): Date => {
  const today = instantToWall(now).slice(0, 10)
  const todayWeekday = ((new Date(`${today}T12:00:00Z`).getUTCDay() + 6) % 7) + 1

  for (let offset = 0; offset <= 7; offset += 1) {
    const day = new Date(`${today}T12:00:00Z`)
    day.setUTCDate(day.getUTCDate() + offset)
    if (((todayWeekday - 1 + offset) % 7) + 1 !== weekday) continue

    const slot = wallToInstant(`${day.toISOString().slice(0, 10)}T${time}`)
    if (slot.getTime() > now.getTime()) return slot
  }

  const later = new Date(`${today}T12:00:00Z`)
  later.setUTCDate(later.getUTCDate() + 7)

  return wallToInstant(`${later.toISOString().slice(0, 10)}T${time}`)
}

/**
 * Fill the dates a picked option proposes
 * @param {FieldDefinition[]} fields - Field declarations
 * @param {FormValues} after - Values after the change
 * @param {string} changed - Name of the field that changed
 * @param {Date} [now] - Reference moment
 * @return {FormValues} - Values with the proposed dates
 */

export const settleSlot = (
  fields: FieldDefinition[],
  after: FormValues,
  changed: string,
  now: Date = new Date()
): FormValues => {
  const field = fields.find((entry) => entry.name === changed)
  if (!field?.slotFor) return after

  const picked = field.options?.find((option) => option.value === after[changed])

  // An option standing for days hands them over as they are
  if (picked?.dates) {
    const end = fields.find((entry) => entry.notBefore === field.slotFor)

    return {
      ...after,
      [field.slotFor]: picked.dates.startsAt,
      ...(end && { [end.name]: picked.dates.endsAt }),
    }
  }

  const slot = picked?.slot
  if (!slot) return after

  const startsAt = nextSlot(now, slot.weekday, slot.time)
  const next = { ...after, [field.slotFor]: startsAt.toISOString() }
  const end = fields.find((entry) => entry.notBefore === field.slotFor)

  return slot.minutes && end
    ? { ...next, [end.name]: new Date(startsAt.getTime() + slot.minutes * MINUTE).toISOString() }
    : next
}

/**
 * Fill the fields a picked option sets
 * @param {FieldDefinition[]} fields - Field declarations
 * @param {FormValues} after - Values after the change
 * @param {string} changed - Name of the field that changed
 * @return {FormValues} - Values with the fields the option sets
 */

export const settleSets = (
  fields: FieldDefinition[],
  after: FormValues,
  changed: string
): FormValues => {
  const field = fields.find((entry) => entry.name === changed)
  const picked = field?.options?.find((option) => option.value === after[changed])

  return picked?.sets ? { ...after, ...picked.sets } : after
}

/**
 * Fill the fields that follow a pair of other fields
 * @param {FieldDefinition[]} fields - Field declarations
 * @param {FormValues} values - Values after the change
 * @return {FormValues} - Values with the followed fields settled
 */

export const settleDerived = (fields: FieldDefinition[], values: FormValues): FormValues => {
  let next = values

  for (const field of fields) {
    if (!field.valueFrom) continue

    for (const rule of Array.isArray(field.valueFrom) ? field.valueFrom : [field.valueFrom]) {
      const key = `${String(next[rule.fields[0]] ?? '')}|${String(next[rule.fields[1]] ?? '')}`
      const derived = rule.map[key]
      const current = next[field.name]
      const isEmpty =
        current === null ||
        current === undefined ||
        current === '' ||
        (Array.isArray(current) && current.length === 0)
      const isSame = JSON.stringify(current) === JSON.stringify(derived)

      // A frozen field always follows, any other only fills its blank
      if (derived !== undefined && (!rule.onlyIfEmpty || isEmpty) && !isSame) {
        next = { ...next, [field.name]: derived }
      }
    }
  }

  return next
}
