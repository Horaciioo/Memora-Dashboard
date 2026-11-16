import concordat from '@/configurations/play/concordat.json'

// Every number must be finite and positive or zero
const assertNumbers = (node: unknown, path: string): void => {
  if (typeof node === 'number') {
    if (!Number.isFinite(node) || node < 0) throw new Error(`Invalid config ${path}`)

    return
  }
  if (node && typeof node === 'object') {
    for (const [key, child] of Object.entries(node)) assertNumbers(child, `${path}.${key}`)
  }
}

assertNumbers(concordat, 'play/concordat')

/**
 * Concordat rules and numbers
 * @type {typeof concordat}
 */

export const CONCORDAT = concordat

export type ConcordatRules = typeof CONCORDAT

/**
 * Seat bounds
 * @type {{ min: number, max: number }}
 */

export const CONCORDAT_SEATS = { min: CONCORDAT.minPlayers, max: CONCORDAT.maxPlayers }

/**
 * Ticks per second
 * @type {number}
 */

export const CONCORDAT_TICKS_PER_SECOND = 1000 / CONCORDAT.tickMs
