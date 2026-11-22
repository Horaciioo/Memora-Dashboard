/**
 * Copy of the launcher home
 * @type {Record<string, string>}
 */

export const PLAY_LAUNCHER_COPY = {
  hero: 'Jeux à la une',
  slide: 'Jeu à la une',
  play: 'Jouer',
  details: 'Détails',
  waiting: 'Des joueurs t’attendent',
  resume: 'Reprendre',
  forget: 'Retirer de la liste',
  library: 'Tous les jeux',
  search: 'Chercher un jeu',
  empty: 'Aucun jeu ne correspond.',
  emptyFavorites: 'Épingle un jeu avec l’étoile pour le retrouver ici.',
  favorite: 'Épingler',
  unfavorite: 'Retirer des favoris',
  close: 'Fermer',
  howTo: 'Comment on joue',
  tables: 'Parties ouvertes',
  noTables: 'Aucune partie ouverte pour le moment, lance la tienne.',
  running: 'En cours',
  lobby: 'En attente',
  seats: '{players} / {max}',
  liveTag: 'En direct',
} as const

/**
 * Filters of the library
 * @type {{ key: string, label: string }[]}
 */

export const PLAY_LAUNCHER_FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: 'favorites', label: 'Favoris' },
  { key: 'solo', label: 'Solo' },
  { key: 'live', label: 'En direct' },
] as const

export type PlayLauncherFilter = (typeof PLAY_LAUNCHER_FILTERS)[number]['key']

// Seconds a banner stays on screen
export const PLAY_LAUNCHER_SLIDE_SECONDS = 9

// Finger travel that turns the banner on a phone
export const PLAY_LAUNCHER_SWIPE_PX = 40
