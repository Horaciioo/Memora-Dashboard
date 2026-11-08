import type { IconName } from '@/declarations/ui/icons'

/**
 * Ways to rank a game, best first
 * @type {Record<string, { label: string, icon: IconName, note: string, sort: string[] }>}
 */

export const PLAY_LEADER_METRICS = {
  level: {
    label: 'Niveaux',
    icon: 'playStar',
    note: 'Niv. {level} - {xp} XP',
    sort: ['xp', 'wins'],
  },
  wins: { label: 'Victoires', icon: 'playTrophy', note: '{wins} victoires', sort: ['wins', 'xp'] },
  played: {
    label: 'Nombre de parties',
    icon: 'playPawn',
    note: '{played} parties',
    sort: ['played', 'wins'],
  },
} as const satisfies Record<string, { label: string; icon: IconName; note: string; sort: string[] }>

export type PlayLeaderMetric = keyof typeof PLAY_LEADER_METRICS

// Metric shown first
export const PLAY_LEADER_DEFAULT: PlayLeaderMetric = 'level'

/**
 * Metrics in display order
 * @type {PlayLeaderMetric[]}
 */

export const PLAY_LEADER_KEYS = Object.keys(PLAY_LEADER_METRICS) as PlayLeaderMetric[]
