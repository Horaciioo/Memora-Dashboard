import 'server-only'

import type { NavalMatch } from '@prisma/client'

import { roundsFor, placeOfLoser, standingScore } from '@/core/lib/play/naval'
import {
  aliveIn,
  captainOf,
  saveCaptain,
  saveMatch,
  standing,
} from '@/core/services/play/naval/NavalTable'
import type { NavalTable } from '@/core/services/play/naval/NavalTable'
import { NavalModes, NavalPhases, NavalResults } from '@/utils/constants/play'

/**
 * Rounds of the bracket in play
 * @param {NavalTable} table - Table
 * @return {number} - Rounds
 */

export const roundsOf = (table: NavalTable): number =>
  roundsFor(
    table.matches.filter((match) => match.round === 0).flatMap((match) => match.fighters).length
  )

/**
 * Put a captain out of the fight
 * @param {NavalTable} table - Table
 * @param {string} accountId - Captain
 * @param {number} [place] - Place won, the standing count by default
 * @return {Promise<void>} - Written
 */

export const eliminate = async (
  table: NavalTable,
  accountId: string,
  place?: number
): Promise<void> => {
  const captain = captainOf(table, accountId)
  if (!captain || captain.eliminatedAt) return

  await saveCaptain(table, accountId, {
    eliminatedAt: table.now,
    place: place ?? standing(table).length,
  })
}

/**
 * Close a match, the beaten of a bracket fall out
 * @param {NavalTable} table - Table
 * @param {NavalMatch} match - Match
 * @param {string} winnerId - Winner
 * @return {Promise<void>} - Written
 */

export const finishMatch = async (
  table: NavalTable,
  match: NavalMatch,
  winnerId: string
): Promise<void> => {
  await saveMatch(table, match, { status: 'DONE', turnId: null, winnerId })
  await saveCaptain(table, winnerId, { strikes: 0 })
  if (table.settings.mode !== NavalModes.Bracket) return

  // Beaten fighters leave the bracket together
  const place = placeOfLoser(match.round, roundsOf(table))
  for (const id of match.fighters.filter((fighter) => fighter !== winnerId)) {
    await eliminate(table, id, place)
  }
}

/**
 * Shots of one captain, as the score reads them
 * @param {NavalTable} table - Table
 * @param {string} accountId - Shooter
 * @return {{ sunk: number; hits: number }} - Counters
 */

const tallyOf = (table: NavalTable, accountId: string) => {
  const fired = table.shots.filter((shot) => shot.shooterId === accountId)

  return {
    sunk: fired.filter((shot) => shot.result === NavalResults.Sunk).length,
    hits: fired.filter((shot) => shot.result !== NavalResults.Miss).length,
  }
}

/**
 * End the battle, places and scores written
 * @param {NavalTable} table - Table
 * @param {string | null} winnerId - Last captain afloat
 * @return {Promise<void>} - Written
 */

export const closeBattle = async (table: NavalTable, winnerId: string | null): Promise<void> => {
  if (winnerId) await saveCaptain(table, winnerId, { place: 1 })
  const { captains } = table

  for (const captain of captains) {
    // Whoever is left without a place shares the last one
    const place = captain.place ?? captains.length
    await table.tx.playSeat.update({
      where: {
        sessionId_accountId: { sessionId: table.session.id, accountId: captain.accountId },
      },
      data: {
        score: standingScore({
          place,
          players: captains.length,
          ...tallyOf(table, captain.accountId),
        }),
      },
    })
  }
  table.game.phase = NavalPhases.Over
  table.isDirty = true
}

/**
 * Winner of the match left standing
 * @param {NavalTable} table - Table
 * @param {NavalMatch} match - Match
 * @return {string | null} - Winner
 */

export const survivorOf = (table: NavalTable, match: NavalMatch): string | null =>
  aliveIn(table, match)[0] ?? null
