import { PLAY_END_TIMING } from '@/declarations/play/end'

/**
 * Parts of the XP earned by one game
 * @type {Record<string, string>}
 */

export const PlayXpParts = {
  Played: 'played',
  Win: 'win',
  Draw: 'draw',
  FirstGame: 'firstGame',
  FirstWin: 'firstWin',
  Mode: 'mode',
  Bots: 'bots',
  Featured: 'featured',
  Event: 'event',
  Quest: 'quest',
} as const

export type PlayXpPartName = (typeof PlayXpParts)[keyof typeof PlayXpParts]

/**
 * End of game XP screen copy
 * @type {Record<string, string>}
 */

export const PLAY_XP_COPY = {
  title: 'XP gagnée',
  game: 'XP de jeu',
  global: 'XP globale',
  gain: '+{xp} XP',
  cut: '{xp} XP',
  progress: '{into} / {needed} XP',
  maxed: 'Niveau maximum',
  boost: '+{percent} % de boosts d’XP pendant {time}',
  boostHours: '{n} h',
  boostMinutes: '{n} min',
  levelUp: 'Niveau {level}',
  total: 'Total',
  next: 'Continuer',
  level: 'Niveau {level}',
} as const

// Box title per part
export const PLAY_XP_PART_LABELS: Record<PlayXpPartName, string> = {
  [PlayXpParts.Played]: 'Partie terminée',
  [PlayXpParts.Win]: 'Finit 1er',
  [PlayXpParts.Draw]: 'Égalité',
  [PlayXpParts.FirstGame]: 'Première partie',
  [PlayXpParts.FirstWin]: 'Première victoire',
  [PlayXpParts.Mode]: 'Bonus de victoire',
  [PlayXpParts.Bots]: 'Bots à la table',
  [PlayXpParts.Featured]: 'Jeu en vedette',
  [PlayXpParts.Event]: 'Boost du moment',
  [PlayXpParts.Quest]: 'Quête de groupe',
}

/**
 * Fill timing of the bars
 * @type {Record<string, number>}
 */

export const PLAY_XP_TIMING = {
  startMs: PLAY_END_TIMING.count,
  fillMs: 1100,
  pauseMs: 300,
  boxStaggerMs: 120,
  // Screen offered only this long after the end
  windowMs: 600_000,
} as const
