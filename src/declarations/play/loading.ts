/**
 * Game loading screen
 * @type {Record<string, string | number>}
 */

export const PLAY_LOADING = {
  title: 'Chargement de la partie',
  hint: 'Ça peut prendre un moment.',
  // Rotation of the tips at the bottom
  tipMs: 4500,
  // Cover and reveal of the squares
  // Two salves of squares, each spreading over waveMs, then popMs for the last square
  curtain: { columns: 12, rows: 8, waveMs: 900, popMs: 260, exitPadMs: 150 },
  brand: 'Memora Play',
  // Bar eases toward the ceiling, the real page replaces it
  ceiling: 30,
  ease: 0.06,
  tickMs: 120,
} as const

// Button label while a hub loads
export const PLAY_HUB_LOADING = 'Chargement du Hub de partie…'

// Gesture waiting on the server, shown with the moving logo
export const PLAY_BUSY = {
  delayMs: 180,
  label: {
    default: 'Memora charge',
    create: 'Memora prépare la table',
    join: 'Memora t’installe à la table',
    joinCode: 'Memora cherche la partie',
    start: 'Lancement de la partie',
    solo: 'Memora prépare ta partie solo',
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

// Feed line of a table loading in the player's browser
export const PLAY_SESSION_LOAD = {
  author: 'Memora',
  loading: 'La session se charge... ({percent}%)',
  done: 'Session chargée !',
  failed: 'Cette session ne s’est pas démarrée comme prévue.',
  // Past this wait without the last step the session is reported as failed
  timeoutMs: 20000,
  // Percent reached at the end of each step
  // Shortest load: the bar never runs faster, so the squares are seen
  minMs: 1800,
  floor: 30,
  percent: { mounted: 35, socket: 55, fonts: 70, images: 85, painted: 100 },
} as const

export type PlayBusyGesture = keyof typeof PLAY_BUSY.label
