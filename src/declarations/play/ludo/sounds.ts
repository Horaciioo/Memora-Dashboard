// Sound folder, credits in CREDITS.md
const LUDO = '/play/sons/ludo'

/**
 * Effect file per board moment
 * @type {Record<string, string>}
 */

export const LUDO_SOUNDS = {
  turn: `${LUDO}/ton-tour.mp3`,
  eat: `${LUDO}/miam.mp3`,
  eaten: `${LUDO}/aie.mp3`,
  star: `${LUDO}/etoile.mp3`,
  home: `${LUDO}/arrivee.mp3`,
  finish: `${LUDO}/parcours.mp3`,
  blocked: `${LUDO}/bloque.mp3`,
  penalty: `${LUDO}/penalite.mp3`,
  clock: `${LUDO}/chrono.mp3`,
  victory: `${LUDO}/victoire.mp3`,
} as const

export type LudoSoundName = keyof typeof LUDO_SOUNDS

/**
 * Takes of a sound heard often, one drawn each time
 * @type {Record<string, readonly string[]>}
 */

export const LUDO_TAKES = {
  roll: [`${LUDO}/lancer-1.mp3`, `${LUDO}/lancer-2.mp3`, `${LUDO}/lancer-3.mp3`],
} as const

export type LudoTakeName = keyof typeof LUDO_TAKES

/**
 * Sound levels, zero to one
 * @type {Record<string, number>}
 */

export const LUDO_MIX = {
  roll: 0.9,
  clock: 0.5,
}
