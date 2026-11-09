import { HOUR_SECONDS, MINUTE_SECONDS } from '@/utils/constants/time'

/**
 * Seconds left as a game clock
 * @param {number} seconds - Seconds left
 * @return {string} - "1:05"
 */

export const formatCountdown = (seconds: number): string => {
  const whole = Math.max(0, Math.ceil(seconds))

  return `${Math.floor(whole / MINUTE_SECONDS)}:${String(whole % MINUTE_SECONDS).padStart(2, '0')}`
}

/**
 * Delay rounded to its biggest unit
 * @param {number} seconds - Delay in seconds
 * @return {string} - "5 s", "2 min", "1 h"
 */

export const formatLag = (seconds: number): string => {
  const whole = Math.max(0, Math.round(seconds))
  if (whole >= HOUR_SECONDS) return `${Math.round(whole / HOUR_SECONDS)} h`
  if (whole >= MINUTE_SECONDS) return `${Math.round(whole / MINUTE_SECONDS)} min`

  return `${whole} s`
}

/**
 * Elapsed seconds as a stopwatch
 * @param {number} seconds - Seconds elapsed
 * @return {string} - "1:02:05"
 */

export const formatStopwatch = (seconds: number): string => {
  const whole = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(whole / HOUR_SECONDS)
  const rest = whole % HOUR_SECONDS

  return `${hours}:${String(Math.floor(rest / MINUTE_SECONDS)).padStart(2, '0')}:${String(rest % MINUTE_SECONDS).padStart(2, '0')}`
}
