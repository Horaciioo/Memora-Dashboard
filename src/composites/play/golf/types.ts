/**
 * Face of a player at the table
 * @typedef {Object} GolfFace
 */

export interface GolfFace {
  accountId: string
  name: string
  avatarUrl: string | null
  // Seat colour key
  color: string
}

/**
 * Seat colour as a style value
 * @param {string} color - Seat colour key
 * @return {string} - CSS variable
 */

export const seatPaint = (color: string): string => `var(--play-${color})`

/**
 * Power orb tone as a style value
 * @param {string} power - Power key
 * @return {string} - CSS variable
 */

export const powerPaint = (power: string): string => `var(--play-power-${power})`
