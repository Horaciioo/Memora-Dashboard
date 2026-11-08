import 'server-only'

import { drawOffer, weaponOf } from '@/core/lib/play/naval'
import { captainOf, saveCaptain } from '@/core/services/play/naval/NavalTable'
import type { NavalTable } from '@/core/services/play/naval/NavalTable'
import { NAVAL_SETTINGS } from '@/declarations/play/naval/settings'
import type { NavalWeaponName } from '@/utils/constants/play'

/**
 * Arm a captain for a turn: weapons drawn, ammo on a new turn
 * @param {NavalTable} table - Table
 * @param {string} accountId - Captain
 * @param {boolean} isNewTurn - Turn just handed over
 * @return {Promise<void>} - Written
 */

export const armCaptain = async (
  table: NavalTable,
  accountId: string,
  isNewTurn: boolean
): Promise<void> => {
  const captain = captainOf(table, accountId)
  if (!captain) return
  const { perTurn, max } = NAVAL_SETTINGS.ammo
  await saveCaptain(table, accountId, {
    ammo: isNewTurn ? Math.min(max, captain.ammo + perTurn) : captain.ammo,
    offer: drawOffer(NAVAL_SETTINGS.offerSize),
  })
}

/**
 * Pay for a weapon fired
 * @param {NavalTable} table - Table
 * @param {string} accountId - Captain
 * @param {NavalWeaponName} name - Weapon
 * @return {Promise<void>} - Written
 */

export const spendWeapon = async (
  table: NavalTable,
  accountId: string,
  name: NavalWeaponName
): Promise<void> => {
  const captain = captainOf(table, accountId)
  const { cost } = weaponOf(name)
  if (!captain || cost === 0) return
  await saveCaptain(table, accountId, {
    ammo: captain.ammo - cost,
    offer: captain.offer.filter((entry) => entry !== name),
  })
}
