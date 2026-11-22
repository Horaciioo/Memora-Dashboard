import { PLAY_BOARD_ADMIN_COPY as COPY } from '@/declarations/play/admin'

/**
 * Ranges of the charts, in days
 * @type {{ value: string; label: string; days: number }[]}
 */

export const PLAY_STAT_RANGES = [
  { value: '7', label: COPY.statsRange7, days: 7 },
  { value: '30', label: COPY.statsRange30, days: 30 },
] as const

// Hours written under the hour chart
export const PLAY_STAT_HOUR_AXIS = [0, 12, 23] as const

/**
 * Glyph and colour token of each figure card
 * @type {Record<string, { icon: IconName; tone: string }>}
 */

export const PLAY_STAT_CARDS = {
  lobby: { icon: 'members', tone: '--play-echo' },
  running: { icon: 'dashboard', tone: '--play-golf' },
  today: { icon: 'history', tone: '--play-key' },
  players: { icon: 'members', tone: '--play-key' },
  active: { icon: 'playPlayers', tone: '--play-golf' },
  banned: { icon: 'playKick', tone: '--play-alert' },
  xp: { icon: 'playStar', tone: '--play-gold' },
  finished: { icon: 'dashboard', tone: '--play-key' },
  minutes: { icon: 'history', tone: '--play-echo' },
  hours: { icon: 'playClock', tone: '--play-bomb' },
} as const
