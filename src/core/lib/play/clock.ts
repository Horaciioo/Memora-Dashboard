import { PLAY_LOADING, PLAY_SESSION_LOAD } from '@/declarations/play/loading'
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

// Shortest load and the squares leaving, before the first number
const { curtain } = PLAY_LOADING
const LOADING_LEAD_SECONDS =
  (PLAY_SESSION_LOAD.minMs + 2 * curtain.waveMs + curtain.popMs + curtain.exitPadMs) / SECOND_MS

/**
 * Moment the first count ends: it begins once the loading screen has left
 * @param {Date} from - Start
 * @param {number} seconds - Numbers counted
 * @return {Date} - End of the count
 */

export const openingEnd = (from: Date, seconds: number): Date =>
  after(countdownEnd(from, seconds), LOADING_LEAD_SECONDS)
