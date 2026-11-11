import 'server-only'

import type { NavalMatch } from '@prisma/client'

import { drawWeapon, rampAt } from '@/core/lib/play/naval'
import { captainOf, saveCaptain } from '@/core/services/play/naval/NavalTable'
import type { NavalTable } from '@/core/services/play/naval/NavalTable'

/**
 * Strikes a captain already fired in a match, one revision per strike
 * @param {NavalTable} table - Table
 * @param {NavalMatch} match - Match
 * @param {string} accountId - Captain
 * @return {number} - Strikes
 */

const strikesFired = (table: NavalTable, match: NavalMatch, accountId: string): number =>
  new Set(
    table.shots
      .filter((shot) => shot.matchId === match.id && shot.shooterId === accountId)
      .map((shot) => shot.rev)
  ).size

/**
 * Draw the weapon a captain fires next, strong weapons slowly more frequent
 * @param {NavalTable} table - Table
 * @param {NavalMatch} match - Match being fought
 * @param {string} accountId - Captain
 * @return {Promise<void>} - Written
 */

export const armCaptain = async (
  table: NavalTable,
  match: NavalMatch,
  accountId: string
): Promise<void> => {
  if (!captainOf(table, accountId)) return
  const boost = rampAt(table.sea.ramp, strikesFired(table, match, accountId))
  await saveCaptain(table, accountId, { weapon: drawWeapon(Math.random, boost) })
}
