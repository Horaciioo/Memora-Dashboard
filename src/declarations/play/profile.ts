import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Copy of the player sheet
 * @type {Record<string, string>}
 */

export const PLAY_PROFILE_COPY = {
  topGames: 'Jeux les plus joués',
  topGamesPlayed: '{count} parties',
  records: 'Records',
  recent: 'Dernières parties',
  recentEmpty: 'Aucune partie terminée pour l’instant.',
  recentAll: 'Tout l’historique',
  recordsEmpty: 'Les records arrivent avec les premières parties.',
  bestStreak: 'Meilleure série',
  streakValue: '{count} victoires',
  bestScore: 'Meilleur score',
  bestScoreGame: 'Meilleur score, {game}',
  points: '{count} pts',
  strokes: '{count} coups',
  total: '{label}, au total',
  online: 'En ligne',
  offline: 'Hors ligne',
  seen: 'Vu {since}',
  invite: 'Lancer une partie',
  inviteHere: 'Inviter à ta partie',
} as const

/**
 * Games whose best score is a stroke count: fewer is better, stored negated
 * @type {PlayGameName[]}
 */

export const PLAY_STROKE_GAMES: PlayGameName[] = [PlayGames.Golf]
