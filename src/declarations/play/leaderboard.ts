/**
 * Ways to rank a game, best first
 * @type {Record<string, { label: string, note: string, sort: string[] }>}
 */

export const PLAY_LEADER_METRICS = {
  wins: { label: 'Victoires', note: '{wins} victoires', sort: ['wins', 'xp'] },
  level: { label: 'Niveaux', note: 'Niv. {level} - {xp} XP', sort: ['xp', 'wins'] },
  played: { label: 'Parties', note: '{played} parties', sort: ['played', 'wins'] },
} as const satisfies Record<string, { label: string; note: string; sort: string[] }>

export type PlayLeaderMetric = keyof typeof PLAY_LEADER_METRICS

// Metric shown first
export const PLAY_LEADER_DEFAULT: PlayLeaderMetric = 'wins'

/**
 * Metrics in display order
 * @type {PlayLeaderMetric[]}
 */

export const PLAY_LEADER_KEYS = Object.keys(PLAY_LEADER_METRICS) as PlayLeaderMetric[]
