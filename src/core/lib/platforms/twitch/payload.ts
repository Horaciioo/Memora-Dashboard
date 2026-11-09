/**
 * Nested object of a payload
 * @param {Record<string, unknown>} payload - Payload
 * @param {string} key - Field
 * @return {Record<string, unknown>} - Object or empty
 */

export const child = (payload: Record<string, unknown>, key: string): Record<string, unknown> => {
  const value = payload[key]

  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}
