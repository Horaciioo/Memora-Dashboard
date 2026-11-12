/**
 * Add a command, newest last, repeats of the last one dropped
 * @param {string[]} entries - History
 * @param {string} entry - Typed command
 * @param {number} limit - Most entries kept
 * @return {string[]} - New history
 */

export const pushHistory = (entries: string[], entry: string, limit: number): string[] => {
  const text = entry.trim()
  if (!text || entries.at(-1) === text) return entries

  return [...entries, text].slice(-limit)
}

/**
 * Move through the history, arrows up and down
 * @param {string[]} entries - History
 * @param {number} cursor - Position, entries.length means the fresh line
 * @param {1 | -1} direction - Down is 1, up is -1
 * @return {number} - New position
 */

export const stepHistory = (entries: string[], cursor: number, direction: 1 | -1): number =>
  Math.min(entries.length, Math.max(0, cursor + direction))

/**
 * Find an older command holding a text
 * @param {string[]} entries - History
 * @param {string} query - Searched text
 * @param {number} before - Search entries under this position
 * @return {number} - Position or -1
 */

export const searchHistory = (entries: string[], query: string, before: number): number => {
  if (!query) return -1
  const needle = query.toLowerCase()

  for (let index = Math.min(before, entries.length) - 1; index >= 0; index -= 1) {
    if (entries[index].toLowerCase().includes(needle)) return index
  }

  return -1
}
