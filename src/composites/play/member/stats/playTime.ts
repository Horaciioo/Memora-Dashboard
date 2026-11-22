import { fillPlayMessage, PLAY_HUB_COPY } from '@/declarations/play'
import { HOUR_SECONDS, MINUTE_SECONDS } from '@/utils/constants/time'

/**
 * Time played, hours past the hour
 * @param {number} seconds - Seconds
 * @return {string} - Duration
 */

export const playTime = (seconds: number): string => {
  const hours = Math.floor(seconds / HOUR_SECONDS)
  const minutes = Math.floor((seconds % HOUR_SECONDS) / MINUTE_SECONDS)

  return hours
    ? fillPlayMessage(PLAY_HUB_COPY.hours, { hours, minutes: String(minutes).padStart(2, '0') })
    : fillPlayMessage(PLAY_HUB_COPY.minutes, { minutes })
}
