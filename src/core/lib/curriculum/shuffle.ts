// Seed of a text, small and stable across server and browser
const seedOf = (value: string): number =>
  [...value].reduce((seed, char) => (seed * 31 + char.charCodeAt(0)) >>> 0, 7)

/**
 * Shuffle the same way on the server and in the browser, so nothing mismatches on hydration
 * and an order exercise never opens already solved
 * @param {T[]} items - Items in the right order
 * @param {string} salt - Text seeding the shuffle
 * @return {T[]} - Items shuffled, never in their original order
 */

export const shuffled = <T>(items: T[], salt: string): T[] => {
  const result = [...items]
  let seed = seedOf(salt)

  // Fisher-Yates over a small linear generator
  for (let index = result.length - 1; index > 0; index -= 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0
    const pick = seed % (index + 1)
    ;[result[index], result[pick]] = [result[pick]!, result[index]!]
  }

  // A shuffle landing on the original order is rotated once
  const unchanged = result.every((item, index) => item === items[index])
  if (unchanged && result.length > 1) result.push(result.shift()!)

  return result
}
