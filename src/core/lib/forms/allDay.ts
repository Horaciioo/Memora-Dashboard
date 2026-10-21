import { holds } from '@/core/lib/forms/visibility'
import type { FieldDefinition, FormValues } from '@/types/forms'
import { instantToWall, isInstantText, wallToInstant } from '@/utils/format/zone'

// Hours a day gets back once the flag drops
const RESTORED_START = '09:00'
const RESTORED_END = '10:00'

/**
 * Settle the date fields bound to a flag that just changed: on, their hour is dropped, off, they get a working one back
 * @param {FieldDefinition[]} fields - Field declarations
 * @param {FormValues} after - Values after the change
 * @param {string} changed - Name of the field that changed
 * @return {FormValues} - Values with the bound fields settled
 */

export const settleAllDay = (
  fields: FieldDefinition[],
  after: FormValues,
  changed: string
): FormValues => {
  const next = { ...after }
  const isOn = after[changed] === true

  for (const field of fields) {
    if (field.hoursOffWhen !== changed) continue

    const value = next[field.name]
    if (typeof value !== 'string' || !isInstantText(value)) continue

    const day = instantToWall(value).slice(0, 10)
    const clock = isOn ? '00:00' : field.name === 'endsAt' ? RESTORED_END : RESTORED_START
    next[field.name] = wallToInstant(`${day}T${clock}`).toISOString()
  }

  return next
}

/**
 * Tell whether a toggle is forced on by the rule it carries
 * @param {FieldDefinition} field - Field declaration
 * @param {FormValues} values - Current values
 * @return {boolean} - Rule holds
 */

export const isLockedOn = (field: FieldDefinition, values: FormValues): boolean =>
  Boolean(field.lockedOnWhen) &&
  holds(field.lockedOnWhen as NonNullable<typeof field.lockedOnWhen>, values)

/**
 * Switch on the toggles a rule forces, then settle what hangs off them
 * @param {FieldDefinition[]} fields - Field declarations
 * @param {FormValues} values - Values after the change
 * @return {FormValues} - Values with the forced toggles on
 */

export const settleLocked = (fields: FieldDefinition[], values: FormValues): FormValues => {
  let next = values

  for (const field of fields) {
    if (!isLockedOn(field, next) || next[field.name] === true) continue

    next = settleAllDay(fields, { ...next, [field.name]: true }, field.name)
  }

  return next
}
