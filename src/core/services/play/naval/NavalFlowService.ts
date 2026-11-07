import 'server-only'

import type { NavalMatch } from '@prisma/client'

import { completeFleet, firstRound, nextRound, placeOfLoser } from '@/core/lib/play/naval'
import type { BracketPair } from '@/core/lib/play/naval'
import { autoFire, passTurn } from '@/core/services/play/naval/NavalFireService'
import {
  closeBattle,
  eliminate,
  finishMatch,
  roundsOf,
  survivorOf,
} from '@/core/services/play/naval/NavalOutcomeService'
import {
  afloatIn,
  aliveIn,
  captainOf,
  saveCaptain,
  standing,
} from '@/core/services/play/naval/NavalTable'
import type { NavalTable } from '@/core/services/play/naval/NavalTable'
import { NAVAL_SETTINGS } from '@/declarations/play/naval/settings'
import type { EngineStep } from '@/types/play'
import { NavalModes, NavalPhases } from '@/utils/constants/play'
import { SECOND_MS } from '@/utils/constants/time'

// Passes before the table is left as it is
const MAX_PASSES = 200

/**
 * Open the matches of a round
 * @param {NavalTable} table - Table
 * @param {number} round - Round
 * @param {BracketPair[]} pairs - Fighters per match
 * @param {number} lagSeconds - Wait before the first shot
 * @return {Promise<void>} - Written
 */

const openRound = async (
  table: NavalTable,
  round: number,
  pairs: BracketPair[],
  lagSeconds: number
): Promise<void> => {
  const startsAt = new Date(table.now.getTime() + lagSeconds * SECOND_MS)
  const turnEndsAt = new Date(
    startsAt.getTime() + (table.settings.turnSeconds + NAVAL_SETTINGS.graceSeconds) * SECOND_MS
  )

  for (const [slot, { fighters }] of pairs.entries()) {
    // A lone fighter passes on
    const isBye = fighters.length < 2
    const match = await table.tx.navalMatch.create({
      data: {
        sessionId: table.session.id,
        round,
        slot,
        fighters,
        status: isBye ? 'DONE' : 'LIVE',
        winnerId: isBye ? fighters[0] : null,
        turnId: isBye ? null : fighters[Math.floor(Math.random() * fighters.length)],
        startsAt,
        turnEndsAt,
      },
    })
    table.matches.push(match)
  }
  table.isDirty = true
}

/**
 * Leave placement for the first round
 * @param {NavalTable} table - Table
 * @return {Promise<void>} - Written
 */

const beginBattle = async (table: NavalTable): Promise<void> => {
  // Fleets left unfinished are completed
  for (const captain of standing(table)) {
    if (!captain.fleet || !captain.readyAt) {
      await saveCaptain(table, captain.accountId, {
        fleet: completeFleet(captain.fleet ?? [], table.sea),
        readyAt: table.now,
      })
    }
  }
  const order = standing(table).map((captain) => captain.accountId)
  table.game.phase = NavalPhases.Battle
  table.isDirty = true
  if (order.length < 2) return await closeBattle(table, order[0] ?? null)

  const { mode } = table.settings
  const first =
    mode === NavalModes.Bracket
      ? firstRound(order.toSorted(() => Math.random() - 0.5))
      : [{ fighters: order }]
  await openRound(table, 0, first, NAVAL_SETTINGS.countdownSeconds)
}

/**
 * Fighters who walked away or ran out of patience leave the match
 * @param {NavalTable} table - Table
 * @param {NavalMatch} match - Match
 * @return {Promise<boolean>} - Someone left
 */

const dropAbsent = async (table: NavalTable, match: NavalMatch): Promise<boolean> => {
  const present = new Set(table.session.players)
  const gone = aliveIn(table, match).filter(
    (id) =>
      !present.has(id) || (captainOf(table, id)?.strikes ?? 0) >= NAVAL_SETTINGS.strikesToForfeit
  )
  if (!gone.length) return false

  // Weakest first, the last one afloat stays
  const weakest = gone.toSorted((a, b) => afloatIn(table, match, a) - afloatIn(table, match, b))
  const place =
    table.settings.mode === NavalModes.Bracket
      ? placeOfLoser(match.round, roundsOf(table))
      : undefined
  for (const id of weakest) {
    if (aliveIn(table, match).length <= 1) break
    await eliminate(table, id, place)
  }

  return true
}

/**
 * Round done: next matches or the end
 * @param {NavalTable} table - Table
 * @return {Promise<boolean>} - Table moved
 */

const closeRound = async (table: NavalTable): Promise<boolean> => {
  if (!table.matches.length) return false
  const round = Math.max(...table.matches.map((match) => match.round))
  const last = table.matches.filter((match) => match.round === round)
  if (last.some((match) => match.status !== 'DONE')) return false

  const winners = last.map((match) => match.winnerId).filter((id): id is string => Boolean(id))
  if (table.settings.mode !== NavalModes.Bracket || winners.length < 2) {
    await closeBattle(table, winners[0] ?? null)

    return true
  }
  await openRound(
    table,
    round + 1,
    nextRound(winners),
    NAVAL_SETTINGS.roundPauseSeconds + NAVAL_SETTINGS.countdownSeconds
  )

  return true
}

/**
 * Settle one live match
 * @param {NavalTable} table - Table
 * @param {NavalMatch} match - Match
 * @return {Promise<boolean>} - Match moved
 */

const settleMatch = async (table: NavalTable, match: NavalMatch): Promise<boolean> => {
  const left = await dropAbsent(table, match)
  const alive = aliveIn(table, match)
  if (alive.length <= 1) {
    await finishMatch(table, match, survivorOf(table, match) ?? match.fighters[0])

    return true
  }
  if (left || !match.turnId || !alive.includes(match.turnId)) {
    await passTurn(table, match)

    return true
  }
  if (table.now < match.startsAt || table.now < match.turnEndsAt) return false
  await autoFire(table, match)

  return true
}

/**
 * One pass over the table
 * @param {NavalTable} table - Table
 * @return {Promise<boolean>} - Table moved
 */

const pass = async (table: NavalTable): Promise<boolean> => {
  const { phase } = table.game
  if (phase === NavalPhases.Over) return false

  // Leavers drop out of placement
  const present = new Set(table.session.players)
  if (phase === NavalPhases.Placement) {
    const leavers = standing(table).filter((captain) => !present.has(captain.accountId))
    for (const captain of leavers) await eliminate(table, captain.accountId)
    const ready = standing(table).every((captain) => captain.readyAt)
    if (ready || table.now >= table.game.phaseEndsAt || standing(table).length < 2) {
      await beginBattle(table)

      return true
    }

    return leavers.length > 0
  }

  // Every live match, then the round
  let moved = false
  for (const match of table.matches.filter((entry) => entry.status === 'LIVE')) {
    moved = (await settleMatch(table, match)) || moved
  }

  return (await closeRound(table)) || moved
}

/**
 * Next deadline of the table
 * @param {NavalTable} table - Table
 * @return {Date | null} - Deadline
 */

const deadlineOf = (table: NavalTable): Date | null => {
  if (table.game.phase === NavalPhases.Over) return null
  if (table.game.phase === NavalPhases.Placement) return table.game.phaseEndsAt
  const live = table.matches.filter((match) => match.status === 'LIVE')

  return live.length ? new Date(Math.min(...live.map((match) => match.turnEndsAt.getTime()))) : null
}

/**
 * Bring the table up to date
 * @param {NavalTable} table - Table
 * @return {Promise<EngineStep>} - Step
 */

export const advance = async (table: NavalTable): Promise<EngineStep> => {
  for (let guard = 0; guard < MAX_PASSES; guard += 1) {
    if (!(await pass(table))) break
  }

  return {
    changed: table.isDirty,
    finished: table.game.phase === NavalPhases.Over,
    deadline: deadlineOf(table),
  }
}
