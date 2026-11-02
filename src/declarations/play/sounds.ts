// Sound folder, credits in CREDITS.md
const EFFECTS = '/play/sons/effets'

/**
 * Sounds of the count before a game
 * @type {Record<string, string>}
 */

export const PLAY_COUNTDOWN_SOUNDS = {
  tick: `${EFFECTS}/decompte.mp3`,
  go: `${EFFECTS}/depart.mp3`,
} as const

/**
 * Volume scale, zero to one
 * @type {Object}
 */

export const PLAY_VOLUME = {
  // Starting global level
  master: 0.5,
  step: 0.05,
  // Trim on every sound out, the slider at full stays gentle
  output: 0.4,
}

/**
 * Copy of the sound controls
 * @type {Record<string, string>}
 */

export const PLAY_SOUND_COPY = {
  title: 'Son de Memora Play',
  lead: 'Niveau de tous les jeux. Un jeu réglé à part garde son propre niveau.',
  name: 'Son global',
  description: 'Suit chaque jeu que tu n’as pas réglé toi-même.',
  volume: 'Volume',
  mute: 'Couper le son',
  unmute: 'Remettre le son',
  game: 'Son du jeu',
  follow: 'Suivre le son global',
  followed: 'Suit le son global',
}
