import type { FieldValue } from '@/types/forms'

/**
 * Value counts as blank
 * @param {FieldValue | undefined} value - Stored value
 * @return {boolean} - Empty
 */

export const isBlankValue = (value: FieldValue | undefined): boolean =>
  value === null ||
  value === undefined ||
  value === '' ||
  (Array.isArray(value) && value.length === 0)

/**
 * Two values hold the same thing
 * @param {FieldValue | undefined} left - First value
 * @param {FieldValue | undefined} right - Second value
 * @return {boolean} - Equal
 */

export const isSameValue = (
  left: FieldValue | undefined,
  right: FieldValue | undefined
): boolean => {
  // Every blank is one value
  if (isBlankValue(left) || isBlankValue(right)) return isBlankValue(left) && isBlankValue(right)

  if (Array.isArray(left) || Array.isArray(right)) {
    const a = [...(Array.isArray(left) ? left : [])].map(String).sort()
    const b = [...(Array.isArray(right) ? right : [])].map(String).sort()

    return a.length === b.length && a.every((item, index) => item === b[index])
  }

  return left === right
}
