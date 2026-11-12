import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Copy of the history
 * @type {Record<string, string>}
 */

export const PLAY_HISTORY_COPY = {
  title: 'Historique',
  filterLabel: 'Filtrer par jeu',
  filterAll: 'Tous',
  empty: 'Aucune partie terminée pour l’instant.',
  emptyGame: 'Aucune partie terminée à ce jeu.',
  older: 'Parties plus anciennes',
  newest: 'Retour aux plus récentes',
  against: 'Contre {names}',
  alone: 'Sans adversaire',
  detail: 'Voir le classement',
  bot: 'Bot',
  you: 'Toi',
  replay: 'Revoir la partie',
  score: '{score} pts',
  minutes: '{count} min',
  seconds: '{count} s',
  fact: '{label} : {value}',
} as const

/**
 * Counters worth quoting per game, best first, the first one played is shown
 * @type {Record<PlayGameName, Array<{ key: string; label: string }>>}
 */

export const PLAY_HISTORY_FACTS: Record<PlayGameName, Array<{ key: string; label: string }>> = {
  [PlayGames.Golf]: [
    { key: 'aces', label: 'Trous en un' },
    { key: 'holes', label: 'Trous réussis' },
    { key: 'strokes', label: 'Coups' },
  ],
  [PlayGames.Bomb]: [
    { key: 'words', label: 'Mots posés' },
    { key: 'blasts', label: 'Explosions' },
  ],
  [PlayGames.Jumble]: [
    { key: 'solved', label: 'Mots trouvés' },
    { key: 'bestStreak', label: 'Meilleure série' },
  ],
  [PlayGames.Ludo]: [
    { key: 'captures', label: 'Pions pris' },
    { key: 'pawnsHome', label: 'Pions rentrés' },
    { key: 'sixes', label: 'Six' },
  ],
  [PlayGames.Naval]: [
    { key: 'shipsSunk', label: 'Navires coulés' },
    { key: 'hits', label: 'Tirs au but' },
    { key: 'shots', label: 'Tirs' },
  ],
  [PlayGames.Baccalaureat]: [
    { key: 'uniqueWords', label: 'Mots uniques' },
    { key: 'words', label: 'Mots valides' },
    { key: 'stops', label: 'Stops' },
  ],
}

/**
 * Label of a counter
 * @param {PlayGameName} game - Game
 * @param {string} key - Counter key
 * @return {string} - Label
 */

export const historyFactLabel = (game: PlayGameName, key: string): string =>
  PLAY_HISTORY_FACTS[game].find((fact) => fact.key === key)?.label ?? key

/**
 * First counter of the viewer worth quoting
 * @param {PlayGameName} game - Game
 * @param {Record<string, number> | undefined} stats - Counters of the viewer
 * @return {{ key: string; value: number } | null} - Fact or nothing
 */

export const pickHistoryFact = (
  game: PlayGameName,
  stats: Record<string, number> | undefined
): { key: string; value: number } | null => {
  const found = PLAY_HISTORY_FACTS[game].find(({ key }) => (stats?.[key] ?? 0) > 0)

  return found && stats ? { key: found.key, value: stats[found.key] } : null
}
