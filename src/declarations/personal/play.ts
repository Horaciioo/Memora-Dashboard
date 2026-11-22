import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Copy of the Play news on the home
 * @type {Record<string, string>}
 */

export const HOME_PLAY_COPY = {
  title: 'Du nouveau sur Memora Play',
  open: 'Ouvrir Play',
  liveTitle: 'En ce moment',
  liveMore: 'Voir toutes les parties',
  recentTitle: 'Tes dernières parties',
  recentMore: 'Voir ton historique',
  leadersTitle: 'En tête du classement',
  leadersMore: 'Voir le classement',
  leadersEmpty: 'Personne n’est encore classé.',
} as const

/**
 * Games to show as the latest additions, newest first
 * @type {PlayGameName[]}
 */

export const HOME_PLAY_NEW: PlayGameName[] = [
  PlayGames.Concordat,
  PlayGames.StopGo,
]

/**
 * Rows listed in each Play block
 * @type {Record<string, number>}
 */

export const HOME_PLAY_ROWS = { tables: 3, recent: 3, leaders: 3 } as const
