/**
 * Line picked for a ball holed, the same on every screen
 * @param {readonly string[]} lines - Lines to pick from
 * @param {string} seed - Ball and hole
 * @return {string} - Picked line
 */

export const cupCheerLine = (lines: readonly string[], seed: string): string => {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0

  return lines[hash % lines.length] ?? ''
}
