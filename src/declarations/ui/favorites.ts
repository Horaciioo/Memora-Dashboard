// Longest label kept
export const FAVORITE_LABEL_MAX = 80

// Paths a member may star
export const FAVORITE_PATH = /^\/[a-z0-9\-_/]{1,160}$/i

// Stars a member may hold
export const FAVORITE_LIMIT = 3

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
