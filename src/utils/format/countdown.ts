import { MINUTE_SECONDS } from '@/utils/constants/time'

/**
 * Seconds left as a game clock
 * @param {number} seconds - Seconds left
 * @return {string} - "1:05"
 */

export const formatCountdown = (seconds: number): string => {
  const whole = Math.max(0, Math.ceil(seconds))

  return `${Math.floor(whole / MINUTE_SECONDS)}:${String(whole % MINUTE_SECONDS).padStart(2, '0')}`
}
