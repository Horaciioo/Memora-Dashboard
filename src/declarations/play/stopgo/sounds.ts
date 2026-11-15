// Sound folder, credits in CREDITS.md
const STOPGO = '/play/sons/stopgo'

/**
 * Effect file per race moment
 * @type {Record<string, string>}
 */

export const STOPGO_SOUNDS = {
  draw: `${STOPGO}/pioche.mp3`,
  card: `${STOPGO}/carte.mp3`,
  attack: `${STOPGO}/attaque.mp3`,
  remedy: `${STOPGO}/reparation.mp3`,
  joker: `${STOPGO}/joker.mp3`,
  engine: `${STOPGO}/moteur.mp3`,
  finish: `${STOPGO}/arrivee.mp3`,
} as const

export type StopGoSoundName = keyof typeof STOPGO_SOUNDS
