import { SECOND_MS } from '@/utils/constants/time'

// Seconds the board takes to reach the players, so the first number is not cut short
const COUNTDOWN_LEAD_SECONDS = 0.6

/**
 * Moment past a delay
 * @param {Date} from - Start
 * @param {number} seconds - Delay
 * @return {Date} - Later moment
 */

export const after = (from: Date, seconds: number): Date =>
  new Date(from.getTime() + seconds * SECOND_MS)

/**
 * Moment a countdown ends, with the time the board needs to show it
 * @param {Date} from - Start
 * @param {number} seconds - Numbers counted
 * @return {Date} - End of the count
 */

export const countdownEnd = (from: Date, seconds: number): Date =>
  after(from, seconds + COUNTDOWN_LEAD_SECONDS)
