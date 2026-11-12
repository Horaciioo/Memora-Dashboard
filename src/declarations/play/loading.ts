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

// Gesture waiting on the server, shown with the moving logo
export const PLAY_BUSY = {
  delayMs: 180,
  label: {
    default: 'Memora charge',
    create: 'Memora prépare la table',
    join: 'Memora t’installe à la table',
    joinCode: 'Memora cherche la partie',
    start: 'Lancement de la partie',
    ready: 'Memora te met prêt',
    leave: 'Memora te sort de la partie',
    end: 'Memora arrête la partie',
    cancel: 'Memora ferme la table',
    replay: 'Memora relance une partie',
    bots: 'Memora appelle les bots',
    kick: 'Memora retire le joueur',
    rules: 'Memora enregistre les règles',
  },
} as const

export type PlayBusyGesture = keyof typeof PLAY_BUSY.label
