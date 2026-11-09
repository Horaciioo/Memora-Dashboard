/**
 * Finite ratio or fallback
 * @param {unknown} value - Raw value
 * @param {number} fallback - Default
 * @return {number} - Number read
 */

export const readNumber = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback
