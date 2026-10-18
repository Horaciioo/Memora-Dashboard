/**
 * Read an environment secret, empty reads as absent
 * @param {string | undefined} raw - Raw value
 * @return {string | null} - Value or nothing
 */

export const readSecret = (raw: string | undefined): string | null => {
  const value = raw?.trim() ?? ''

  return value.length > 0 ? value : null
}
