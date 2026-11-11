import { loopSound, playSound, preloadSounds } from '@/core/lib/play/sounds'
import type { SoundLoop } from '@/core/lib/play/sounds'
import { isFlareCode, isHitCode, NavalCodes } from '@/core/lib/play/naval/state'
import type { NavalStrikeView } from '@/core/lib/play/naval/state'
import { playLevelOf } from '@/core/store/play/playSound'
import { NAVAL_SETTINGS } from '@/declarations/play/naval/settings'
import {
  NAVAL_MIX,
  NAVAL_SEA_LOOP,
  NAVAL_SOUNDS,
  NAVAL_TAKES,
} from '@/declarations/play/naval/sounds'
import type { NavalSoundName, NavalTakeName } from '@/declarations/play/naval/sounds'
import { NAVAL_WEAPONS } from '@/declarations/play/naval/weapons'
import { NavalWeapons, PlayGames } from '@/utils/constants/play'

/**
 * Naval sample at the player's level, later if asked
 * @param {NavalSoundName} sound - Sample
 * @param {number} [level] - Zero to one
 * @param {number} [delayMs] - Wait
 * @return {void}
 */

export const playNaval = (sound: NavalSoundName, level = 1, delayMs = 0): void => {
  const play = () => playSound(NAVAL_SOUNDS[sound], playLevelOf(PlayGames.Naval) * level)
  if (delayMs > 0) window.setTimeout(play, delayMs)
  else play()
}

/**
 * One take of a sample heard often
 * @param {NavalTakeName} take - Sample
 * @param {number} [level] - Zero to one
 * @param {number} [delayMs] - Wait
 * @return {void}
 */

export const playNavalTake = (take: NavalTakeName, level = 1, delayMs = 0): void => {
  const files = NAVAL_TAKES[take]
  const file = files[Math.floor(Math.random() * files.length)]
  const play = () => playSound(file, playLevelOf(PlayGames.Naval) * level)
  if (delayMs > 0) window.setTimeout(play, delayMs)
  else play()
}

/**
 * Departure of a strike: guns, planes, helicopter, submarine or flare
 * @param {string} weapon - Weapon
 * @param {number} level - Zero to one
 * @return {void}
 */

const launch = (weapon: string, level: number): void => {
  if (weapon === NavalWeapons.Airstrike || weapon === NavalWeapons.Gunship)
    return playNaval('planes', level)
  if (weapon === NavalWeapons.Torpedo) return playNaval('torpedo', level)
  if (weapon === NavalWeapons.Flare) return playNaval('flare', level)

  // Guns that fire several times in a row
  const rounds = weapon === NavalWeapons.Volley ? 3 : weapon === NavalWeapons.Pair ? 2 : 1
  for (let round = 0; round < rounds; round += 1)
    playNavalTake('cannon', level, round * NAVAL_MIX.chainMs)
}

/**
 * Sound of a whole strike, in step with its animation
 * @param {NavalStrikeView} strike - Strike
 * @param {boolean} isNear - Aimed at or fired by the viewer
 * @return {void}
 */

export const cueStrike = (strike: NavalStrikeView, isNear: boolean): void => {
  const level = isNear ? 1 : NAVAL_MIX.distant
  const weapon = NAVAL_WEAPONS[strike.weapon]?.name ?? NavalWeapons.Cannon
  launch(weapon, level)
  const at = NAVAL_SETTINGS.flightMs
  if (strike.cells.some((cell) => isFlareCode(cell.code))) {
    playNaval('flareBurst', level, at)

    return
  }

  // A few blasts in a chain, the hits first
  const heard = strike.cells
    .toSorted((a, b) => Number(isHitCode(b.code)) - Number(isHitCode(a.code)))
    .slice(0, NAVAL_MIX.chainMax)
  heard.forEach((cell, index) => {
    const when = at + index * NAVAL_MIX.chainMs
    if (!isHitCode(cell.code)) return playNavalTake('splash', level * 0.8, when)
    playNavalTake('blast', level, when)
    playNaval('hull', level * 0.7, when + 40)
  })
  if (strike.cells.some((cell) => cell.code === NavalCodes.Sunk))
    playNaval('sinking', level, at + NAVAL_SETTINGS.impactMs * 0.6)
}

/**
 * Sea bed under the battle
 * @return {SoundLoop} - Loop
 */

export const startSea = (): SoundLoop => {
  const loop = loopSound(NAVAL_SEA_LOOP)
  loop.set(playLevelOf(PlayGames.Naval) * NAVAL_MIX.sea, 1)

  return loop
}

/**
 * Every naval file fetched ahead
 * @return {void}
 */

export const preloadNavalSounds = (): void =>
  preloadSounds([
    ...Object.values(NAVAL_SOUNDS),
    ...Object.values(NAVAL_TAKES).flat(),
    NAVAL_SEA_LOOP,
  ])
