/**
 * Match of a bracket round
 * @typedef {Object} BracketPair
 * @property {string[]} fighters - One fighter for a bye, two otherwise
 */

export interface BracketPair {
  fighters: string[]
}

// Room of the bracket, a power of two
const bracketSize = (count: number): number => 2 ** Math.max(1, Math.ceil(Math.log2(count)))

/**
 * Rounds a bracket needs
 * @param {number} count - Players
 * @return {number} - Rounds
 */

export const roundsFor = (count: number): number => Math.log2(bracketSize(count))

/**
 * First round, empty seats given as byes
 * @param {string[]} order - Players in seeding order
 * @return {BracketPair[]} - Matches
 */

export const firstRound = (order: string[]): BracketPair[] => {
  const matches = bracketSize(order.length) / 2
  const byes = matches * 2 - order.length

  // The first seeds wait a round
  const pairs: BracketPair[] = []
  let at = 0
  for (let slot = 0; slot < matches; slot += 1) {
    const size = slot < byes ? 1 : 2
    pairs.push({ fighters: order.slice(at, at + size) })
    at += size
  }

  return pairs
}

/**
 * Next round from the winners, in match order
 * @param {string[]} winners - Winners by match slot
 * @return {BracketPair[]} - Matches
 */

export const nextRound = (winners: string[]): BracketPair[] =>
  Array.from({ length: Math.ceil(winners.length / 2) }, (_, slot) => ({
    fighters: winners.slice(slot * 2, slot * 2 + 2),
  }))

/**
 * Final place of a player beaten in a round
 * @param {number} round - Round lost, from zero
 * @param {number} rounds - Rounds of the bracket
 * @return {number} - Place, shared by the beaten of a round
 */

export const placeOfLoser = (round: number, rounds: number): number => 2 ** (rounds - round - 1) + 1

/**
 * Next holder of the turn, skipping the out
 * @param {string[]} order - Fighters in seat order
 * @param {Set<string>} alive - Fighters still afloat
 * @param {string | null} current - Holder now
 * @return {string | null} - Next holder
 */

export const nextShooter = (
  order: string[],
  alive: Set<string>,
  current: string | null
): string | null => {
  const start = current ? order.indexOf(current) : -1
  for (let step = 1; step <= order.length; step += 1) {
    const candidate = order[(start + step + order.length) % order.length]
    if (alive.has(candidate)) return candidate
  }

  return null
}
