import { BAC_SETUP_COPY, fillPlayMessage } from '@/declarations/play'

/**
 * Round clock in words
 * @param {number} total - Seconds
 * @return {string} - "2 min 30"
 */

export const clockLabel = (total: number): string => {
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  if (!minutes) return fillPlayMessage(BAC_SETUP_COPY.onlySeconds, { seconds })

  return seconds
    ? fillPlayMessage(BAC_SETUP_COPY.seconds, { minutes, seconds })
    : fillPlayMessage(BAC_SETUP_COPY.minutes, { minutes })
}
