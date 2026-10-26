import type { GolfEventKind } from '@/core/lib/play/golf/types'
import type { GolfPowerName } from '@/utils/constants/play'

// Sound folders, credits in CREDITS.md
const EFFECTS = '/play/sons/effets'

/**
 * Effect file per game moment
 * @type {Record<string, string>}
 */

export const GOLF_SOUNDS = {
  hit: `${EFFECTS}/tir.mp3`,
  wall: `${EFFECTS}/rebond.mp3`,
  ball: `${EFFECTS}/collision.mp3`,
  bumper: `${EFFECTS}/bumper.mp3`,
  spinner: `${EFFECTS}/tourniquet.mp3`,
  cup: `${EFFECTS}/trou.mp3`,
  land: `${EFFECTS}/atterrissage.mp3`,
  lip: `${EFFECTS}/bord.mp3`,
  fall: `${EFFECTS}/sortie.mp3`,
  splash: `${EFFECTS}/eau.mp3`,
  orb: `${EFFECTS}/case.mp3`,
  portal: `${EFFECTS}/teleporteur.mp3`,
  vortex: `${EFFECTS}/trou-noir.mp3`,
  totem: `${EFFECTS}/totem.mp3`,
  power: `${EFFECTS}/activation.mp3`,
  reveal: `${EFFECTS}/revelation.mp3`,
  ended: `${EFFECTS}/fin-effet.mp3`,
  ready: `${EFFECTS}/pret.mp3`,
  clock: `${EFFECTS}/chrono.mp3`,
  tornado: `${EFFECTS}/tornade.mp3`,
  gust: `${EFFECTS}/bourrasque.mp3`,
  fart: `${EFFECTS}/pet.mp3`,
  ice: `${EFFECTS}/glace.mp3`,
  voteChoice: `${EFFECTS}/vote-choix.mp3`,
  voteHop: `${EFFECTS}/vote-rebond.mp3`,
  voteConfirm: `${EFFECTS}/vote-valide.mp3`,
  voteBack: `${EFFECTS}/vote-retour.mp3`,
  voteSwitch: `${EFFECTS}/vote-transition.mp3`,
} as const satisfies Record<Exclude<GolfEventKind, 'boost'>, string> & Record<string, string>

export type GolfSoundName = keyof typeof GOLF_SOUNDS

/**
 * Own sound of some powers
 * @type {Partial<Record<GolfPowerName, GolfSoundName>>}
 */

export const GOLF_POWER_SOUNDS: Partial<Record<GolfPowerName, GolfSoundName>> = {
  tornado: 'tornado',
  gust: 'gust',
  fart: 'fart',
  ice: 'ice',
}

/**
 * Sound levels, zero to one
 * @type {Object}
 */

export const GOLF_MIX = {
  // Starting master volume
  volume: 0.8,
  volumeStep: 0.05,
}
