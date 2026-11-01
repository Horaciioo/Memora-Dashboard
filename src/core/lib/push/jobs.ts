/**
 * Notification identifiers carried by a push job
 * @param {Record<string, unknown>} payload - Job payload
 * @return {string[]} - Identifiers
 */

export const readPushIds = (payload: Record<string, unknown>): string[] =>
  Array.isArray(payload.ids) ? payload.ids.filter((id): id is string => typeof id === 'string') : []

/**
 * Split identifiers into job-sized batches
 * @param {string[]} ids - Identifiers
 * @param {number} size - Batch size
 * @return {string[][]} - Batches
 */

export const batchesOf = (ids: string[], size: number): string[][] =>
  Array.from({ length: Math.ceil(ids.length / size) }, (_, index) =>
    ids.slice(index * size, (index + 1) * size)
  )
