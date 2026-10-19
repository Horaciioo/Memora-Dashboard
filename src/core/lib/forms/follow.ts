import { holds } from '@/core/lib/forms/visibility'
import type { FieldDefinition, FormValues } from '@/types/forms'

// Milliseconds in a minute
const MINUTE = 60_000

/**
 * Settle the date fields trailing a field that just changed: they move along while untouched
 * @param {FieldDefinition[]} fields - Field declarations
 * @param {FormValues} before - Values before the change
 * @param {FormValues} after - Values after the change
 * @param {string} changed - Name of the field that changed
 * @return {FormValues} - Values with the trailing fields settled
 */

export const settleFollowers = (
  fields: FieldDefinition[],
  before: FormValues,
  after: FormValues,
  changed: string
): FormValues => {
  const next = { ...after }
  const start = Date.parse(String(after[changed] ?? ''))
  if (Number.isNaN(start)) return next

  for (const field of fields) {
    const rule = field.follows
    if (rule?.field !== changed || (rule.when && !holds(rule.when, after))) continue

    const delay = rule.minutes * MINUTE
    const previous = Date.parse(String(before[changed] ?? ''))
    const current = Date.parse(String(after[field.name] ?? ''))

    // Empty, behind the new start, or still on the old automatic value: it moves along
    const isUntouched =
      Number.isNaN(current) ||
      current < start ||
      (!Number.isNaN(previous) && current === previous + delay)
    if (isUntouched) next[field.name] = new Date(start + delay).toISOString()
  }

  return next
}
