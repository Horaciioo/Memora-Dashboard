/**
 * Stars matching a percentage
 * @param {number} percent - Stored grade
 * @param {number} max - Highest percentage
 * @param {number} stars - Stars in a full grade
 * @return {number} - Whole stars
 */

export const percentToStars = (percent: number, max: number, stars: number): number =>
  Math.round((percent / max) * stars)

/**
 * Percentage matching stars
 * @param {number} count - Whole stars
 * @param {number} max - Highest percentage
 * @param {number} stars - Stars in a full grade
 * @return {number} - Stored grade
 */

export const starsToPercent = (count: number, max: number, stars: number): number =>
  Math.round((count / stars) * max)
