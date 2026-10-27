// Sound folder, credits in CREDITS.md
const BOMB = '/play/sons/bomb'

/**
 * Effect file per board moment
 * @type {Record<string, string>}
 */

export const BOMB_SOUNDS = {
  fuse: `${BOMB}/meche.mp3`,
  explosion: `${BOMB}/explosion.mp3`,
  word: `${BOMB}/mot.mp3`,
  miss: `${BOMB}/rate.mp3`,
  turn: `${BOMB}/ton-tour.mp3`,
  clock: `${BOMB}/chrono.mp3`,
  go: `${BOMB}/partez.mp3`,
  life: `${BOMB}/vie.mp3`,
  out: `${BOMB}/elimine.mp3`,
  victory: `${BOMB}/victoire.mp3`,
} as const

export type BombSoundName = keyof typeof BOMB_SOUNDS

/**
 * Takes of a sound heard often, one drawn each time
 * @type {Record<string, readonly string[]>}
 */

export const BOMB_TAKES = {
  typing: [`${BOMB}/frappe-1.mp3`, `${BOMB}/frappe-2.mp3`, `${BOMB}/frappe-3.mp3`],
} as const

export type BombTakeName = keyof typeof BOMB_TAKES

/**
 * Sound levels, zero to one, and fuse speeds
 * @type {Record<string, number>}
 */

export const BOMB_MIX = {
  fuse: 0.12,
  fuseMine: 0.4,
  fuseRate: 1,
  fuseRateMine: 1.8,
  word: 0.6,
  miss: 0.7,
  turn: 0.8,
  typing: 0.25,
  clock: 0.5,
  life: 0.7,
  out: 0.7,
}
