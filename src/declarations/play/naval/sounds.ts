// Folder of the naval samples
const ROOT = '/play/sons/naval'

/**
 * Naval samples played once, one file each
 * @type {Record<string, string>}
 */

export const NAVAL_SOUNDS = {
  planes: `${ROOT}/avions.mp3`,
  torpedo: `${ROOT}/torpille.mp3`,
  flare: `${ROOT}/fusee.mp3`,
  flareBurst: `${ROOT}/fusee-eclat.mp3`,
  hull: `${ROOT}/coque.mp3`,
  sinking: `${ROOT}/naufrage.mp3`,
  bell: `${ROOT}/cloche.mp3`,
  place: `${ROOT}/pose.mp3`,
  tick: `${ROOT}/clic.mp3`,
} as const

export type NavalSoundName = keyof typeof NAVAL_SOUNDS

/**
 * Samples with several takes, one picked at random
 * @type {Record<string, string[]>}
 */

export const NAVAL_TAKES = {
  cannon: [`${ROOT}/canon-1.mp3`, `${ROOT}/canon-2.mp3`],
  blast: [`${ROOT}/explosion-1.mp3`, `${ROOT}/explosion-2.mp3`, `${ROOT}/explosion-3.mp3`],
  splash: [`${ROOT}/plouf-1.mp3`, `${ROOT}/plouf-2.mp3`, `${ROOT}/plouf-3.mp3`],
} as const

export type NavalTakeName = keyof typeof NAVAL_TAKES

/**
 * Levels of the mix, zero to one
 * @type {Object}
 */

export const NAVAL_MIX = {
  // Sound of a strike not aimed at or from the viewer
  distant: 0.55,
  // Gap between the blasts of one strike, in milliseconds
  chainMs: 110,
  // Most blasts heard for one strike
  chainMax: 6,
} as const
