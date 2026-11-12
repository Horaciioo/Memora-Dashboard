import { isHitCode, NavalCodes, strikesOf } from '@/core/lib/play/naval/state'
import type { NavalShotView } from '@/core/lib/play/naval/state'
import { NAVAL_WEAPONS } from '@/declarations/play/naval/weapons'
import type { NavalWeaponName } from '@/utils/constants/play'

/**
 * Figures of one captain
 * @typedef {Object} NavalCaptainStats
 * @property {number} strikes - Turns fired
 * @property {number} accuracy - Hit share, 0 to 100
 * @property {number} sunk - Ships sunk
 * @property {NavalWeaponName | null} bestWeapon - Most hits
 */

export interface NavalCaptainStats {
  strikes: number
  accuracy: number
  sunk: number
  bestWeapon: NavalWeaponName | null
}

/**
 * Figures of a captain from the shots
 * @param {NavalShotView[]} shots - Shots in order
 * @param {number} seat - Captain
 * @return {NavalCaptainStats} - Figures
 */

export const captainStatsOf = (shots: NavalShotView[], seat: number): NavalCaptainStats => {
  const strikes = strikesOf(shots).filter((strike) => strike.shooter === seat)
  const hitsByWeapon = new Map<NavalWeaponName, number>()
  let cells = 0
  let hits = 0
  let sunk = 0

  // Count marks that reveal
  for (const strike of strikes) {
    const name = NAVAL_WEAPONS[strike.weapon]?.name ?? NAVAL_WEAPONS[0].name
    for (const { code } of strike.cells) {
      if (code === NavalCodes.Spotted || code === NavalCodes.Clear) continue
      cells += 1
      if (!isHitCode(code)) continue
      hits += 1
      hitsByWeapon.set(name, (hitsByWeapon.get(name) ?? 0) + 1)
      if (code === NavalCodes.Sunk) sunk += 1
    }
  }
  const best = [...hitsByWeapon.entries()].sort((a, b) => b[1] - a[1])[0]

  return {
    strikes: strikes.length,
    accuracy: cells ? Math.round((hits / cells) * 100) : 0,
    sunk,
    bestWeapon: best?.[0] ?? null,
  }
}
