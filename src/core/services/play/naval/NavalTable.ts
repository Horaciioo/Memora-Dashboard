import 'server-only'

import type { NavalGame, NavalMatch, NavalShot, Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import type { NavalShip } from '@/core/lib/play/naval'
import { navalSea, navalSettingsOf, shipsAfloat } from '@/core/lib/play/naval'
import type { NavalGameSettings, NavalSea } from '@/core/lib/play/naval'
import { holdSession } from '@/core/services/play/PlaySessionService'
import { PLAY_ERRORS } from '@/declarations/play/copy'
import type { EngineSession } from '@/types/play'

/**
 * Captain with a typed fleet
 * @typedef {Object} NavalCaptain
 */

export interface NavalCaptain {
  id: string
  accountId: string
  slot: number
  fleet: NavalShip[] | null
  readyAt: Date | null
  eliminatedAt: Date | null
  place: number | null
  strikes: number
}

/**
 * Locked table of a naval battle
 * @typedef {Object} NavalTable
 */

export interface NavalTable {
  tx: Prisma.TransactionClient
  session: EngineSession
  settings: NavalGameSettings
  sea: NavalSea
  game: NavalGame
  captains: NavalCaptain[]
  matches: NavalMatch[]
  shots: NavalShot[]
  now: Date
  // Something to push
  isDirty: boolean
  // Revision on load
  startRev: number
}

/**
 * Run work on the locked table
 * @param {EngineSession} session - Game
 * @param {(table: NavalTable) => Promise<T>} work - Table work
 * @return {Promise<T>} - Result
 */

export const withTable = <T>(
  session: EngineSession,
  work: (table: NavalTable) => Promise<T>
): Promise<T> =>
  prisma.$transaction(async (tx) => {
    await holdSession(tx, session.id)
    const where = { sessionId: session.id }
    const [game, rows, matches, shots] = await Promise.all([
      tx.navalGame.findUnique({ where }),
      tx.navalPlayer.findMany({ where, orderBy: { slot: 'asc' } }),
      tx.navalMatch.findMany({ where, orderBy: [{ round: 'asc' }, { slot: 'asc' }] }),
      tx.navalShot.findMany({ where, orderBy: { rev: 'asc' } }),
    ])
    if (!game) throw notFound(PLAY_ERRORS.roundMissing)
    const settings = navalSettingsOf(session.settings)
    const table: NavalTable = {
      tx,
      session,
      settings,
      sea: navalSea(settings),
      game,
      captains: rows.map((row) => ({ ...row, fleet: row.fleet as NavalShip[] | null })),
      matches,
      shots,
      now: new Date(),
      isDirty: false,
      startRev: game.rev,
    }
    const result = await work(table)

    // One write of the table clock
    if (table.isDirty) {
      const { phase, startsAt, phaseEndsAt, rev } = table.game
      await tx.navalGame.update({
        where,
        data: { phase, startsAt, phaseEndsAt, rev: Math.max(rev, table.startRev + 1) },
      })
    }

    return result
  })

/**
 * Captain of an account
 * @param {NavalTable} table - Table
 * @param {string} accountId - Account
 * @return {NavalCaptain | undefined} - Captain
 */

export const captainOf = (table: NavalTable, accountId: string): NavalCaptain | undefined =>
  table.captains.find((captain) => captain.accountId === accountId)

/**
 * Captains still in the fight
 * @param {NavalTable} table - Table
 * @return {NavalCaptain[]} - Captains
 */

export const standing = (table: NavalTable): NavalCaptain[] =>
  table.captains.filter((captain) => !captain.eliminatedAt)

/**
 * Ships of a captain still afloat in a match
 * @param {NavalTable} table - Table
 * @param {NavalMatch} match - Match
 * @param {string} accountId - Captain
 * @return {number} - Ships afloat
 */

export const afloatIn = (table: NavalTable, match: NavalMatch, accountId: string): number =>
  shipsAfloat(captainOf(table, accountId)?.fleet ?? [], shotsAt(table, match.id, accountId)).length

/**
 * Fighters of a match still in the fight
 * @param {NavalTable} table - Table
 * @param {NavalMatch} match - Match
 * @return {string[]} - Accounts
 */

export const aliveIn = (table: NavalTable, match: NavalMatch): string[] =>
  match.fighters.filter((accountId) => {
    const captain = captainOf(table, accountId)
    if (!captain || captain.eliminatedAt) return false

    return !captain.fleet || afloatIn(table, match, accountId) > 0
  })

/**
 * Squares a match fired at one captain
 * @param {NavalTable} table - Table
 * @param {string} matchId - Match
 * @param {string} targetId - Captain fired at
 * @return {NavalShot[]} - Shots
 */

export const shotsAt = (table: NavalTable, matchId: string, targetId: string): NavalShot[] =>
  table.shots.filter((shot) => shot.matchId === matchId && shot.targetId === targetId)

/**
 * Write a captain and keep the table in step
 * @param {NavalTable} table - Table
 * @param {string} accountId - Captain
 * @param {Partial<NavalCaptain>} patch - Changes
 * @return {Promise<void>} - Written
 */

export const saveCaptain = async (
  table: NavalTable,
  accountId: string,
  patch: Partial<Omit<NavalCaptain, 'id' | 'accountId' | 'slot'>>
): Promise<void> => {
  const captain = captainOf(table, accountId)
  if (!captain) return
  Object.assign(captain, patch)
  const { fleet, ...rest } = patch
  await table.tx.navalPlayer.update({
    where: { id: captain.id },
    data: {
      ...rest,
      ...(fleet !== undefined && { fleet: fleet as unknown as Prisma.InputJsonValue }),
    },
  })
  table.isDirty = true
}

/**
 * Write a match and keep the table in step
 * @param {NavalTable} table - Table
 * @param {NavalMatch} match - Match
 * @param {Partial<NavalMatch>} patch - Changes
 * @return {Promise<void>} - Written
 */

export const saveMatch = async (
  table: NavalTable,
  match: NavalMatch,
  patch: Partial<Pick<NavalMatch, 'status' | 'turnId' | 'turnEndsAt' | 'winnerId'>>
): Promise<void> => {
  Object.assign(match, patch)
  await table.tx.navalMatch.update({ where: { id: match.id }, data: patch })
  table.isDirty = true
}
