/**
 * Check if arrays match
 * @param {T[]} array1 - First array
 * @param {T[]} array2 - Second array
 * @return {boolean} - Arrays match
 */

export function arraysMatch<T>(array1: T[], array2: T[]): boolean {
  // Check length
  if (array1.length !== array2.length) return false

  // Sort arrays
  array1.sort()
  array2.sort()

  // Compare sorted items
  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) return false
  }

  return true
}

/**
 * Check if arrays differ
 * @param {T[]} array1 - First array
 * @param {T[]} array2 - Second array
 * @return {boolean} - Arrays differ
 */

export function areArraysDifferent<T>(array1: T[], array2: T[]): boolean {
  // Check length
  if (array1.length !== array2.length) return true

  // Compare elements
  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) return true
  }

  return false
}
