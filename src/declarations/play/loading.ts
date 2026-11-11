/**
 * Game loading screen
 * @type {Record<string, string | number>}
 */

export const PLAY_LOADING = {
  title: 'Chargement de la partie',
  hint: 'Ça peut prendre un moment.',
  // Bar eases toward the ceiling, the real page replaces it
  ceiling: 94,
  ease: 0.06,
  tickMs: 120,
} as const
