import { fillPlayMessage, PLAY_HISTORY_COPY } from '@/declarations/play'

const MINUTE = 60

/**
 * Length of a game, minutes once past one
 * @param {number | null} seconds - Length
 * @return {string} - Spoken length, empty when unknown
 */

export const formatPlayDuration = (seconds: number | null): string => {
  if (seconds === null) return ''
  if (seconds < MINUTE) return fillPlayMessage(PLAY_HISTORY_COPY.seconds, { count: seconds })

  return fillPlayMessage(PLAY_HISTORY_COPY.minutes, { count: Math.round(seconds / MINUTE) })
}
