// Longest label kept
export const FAVORITE_LABEL_MAX = 80

// Paths a member may star
export const FAVORITE_PATH = /^\/[a-z0-9\-_/]{1,160}$/i

// Stars a member may hold
export const FAVORITE_LIMIT = 3

/**
 * Home favorites box, lines under one another before the next column starts
 * @type {Record<string, number>}
 */

export const HOME_FAVORITES = {
  rows: 3,
  shown: 6,
  // Paths kept in the browser, some may not resolve to a page
  kept: 20,
} as const

/**
 * Favorite copy
 * @type {Record<string, string>}
 */

export const FAVORITE_COPY = {
  add: 'Ajouter aux favoris',
  remove: 'Retirer des favoris',
  full: `Tu as déjà ${FAVORITE_LIMIT} favoris`,
  group: 'Favoris',
} as const
