// Fixed seed
let state = 20260928

/**
 * Next pseudo-random number
 * @return {number} - Between 0 and 1
 */

export const random = (): number => {
  state = (state * 1103515245 + 12345) % 2147483648

  return state / 2147483648
}

/**
 * Integer in a closed range
 * @param {number} low - Lowest value
 * @param {number} high - Highest value
 * @return {number} - Value
 */

export const between = (low: number, high: number): number =>
  low + Math.floor(random() * (high - low + 1))

/**
 * True with the given probability
 * @param {number} rate - Probability
 * @return {boolean} - Outcome
 */

export const chance = (rate: number): boolean => random() < rate

/**
 * One entry of a list
 * @template TItem - Entry type
 * @param {readonly TItem[]} items - Candidates
 * @return {TItem} - Picked entry
 */

export const pick = <TItem>(items: readonly TItem[]): TItem =>
  items[Math.floor(random() * items.length)] as TItem

/**
 * Several distinct entries of a list
 * @template TItem - Entry type
 * @param {readonly TItem[]} items - Candidates
 * @param {number} count - How many to keep
 * @return {TItem[]} - Picked entries
 */

export const sample = <TItem>(items: readonly TItem[], count: number): TItem[] => {
  const pool = [...items]
  const kept: TItem[] = []

  while (kept.length < count && pool.length > 0) {
    kept.push(pool.splice(Math.floor(random() * pool.length), 1)[0] as TItem)
  }

  return kept
}

/**
 * One entry picked by weight
 * @template TItem - Entry type
 * @param {Array<[TItem, number]>} entries - Candidates and their weight
 * @return {TItem} - Picked entry
 */

export const weighted = <TItem>(entries: [TItem, number][]): TItem => {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0)
  let roll = random() * total

  for (const [item, weight] of entries) {
    roll -= weight
    if (roll <= 0) return item
  }

  return entries[entries.length - 1][0]
}

/**
 * Random token
 * @param {number} length - Characters
 * @return {string} - Token
 */

export const token = (length: number): string =>
  Array.from({ length }, () => pick('abcdefghijklmnopqrstuvwxyz0123456789'.split(''))).join('')
