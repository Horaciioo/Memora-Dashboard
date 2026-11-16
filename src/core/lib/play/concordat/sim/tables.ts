import { CONCORDAT } from '@/declarations/play/concordat/rules'
import { CONCORDAT_TERRAIN_KEYS } from '@/utils/constants/concordat'

/**
 * Defense factor by terrain id
 * @type {Float64Array}
 */

export const TERRAIN_DEFENSE = Float64Array.from(
  CONCORDAT_TERRAIN_KEYS.map((key) => CONCORDAT.terrains[key].defense)
)

/**
 * Income unit
 * @type {number}
 */

export const INCOME_SCALE = 1_000_000

/**
 * Scaled gold per second by terrain id
 * @type {Float64Array}
 */

export const TERRAIN_INCOME = Float64Array.from(
  CONCORDAT_TERRAIN_KEYS.map((key) => Math.round(CONCORDAT.terrains[key].income * INCOME_SCALE))
)

/**
 * Seconds in one tick
 * @type {number}
 */

export const TICK_SECONDS = CONCORDAT.tickMs / 1000

/**
 * Ticks in a number of seconds
 * @param {number} seconds - Seconds
 * @return {number} - Ticks
 */

export const ticksOf = (seconds: number): number => Math.round(seconds * (1000 / CONCORDAT.tickMs))
