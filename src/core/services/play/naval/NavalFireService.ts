import 'server-only'

import type { NavalMatch, NavalShot } from '@prisma/client'

import { conflict } from '@/core/lib/errors'
import {
  chooseSquare,
  indexOf,
  isInside,
  nextShooter,
  resolveShot,
  shipsAfloat,
  sunkShips,
  cellsOf,
} from '@/core/lib/play/naval'
import type { NavalCell, NavalKnowledge } from '@/core/lib/play/naval'
import { finishMatch, eliminate } from '@/core/services/play/naval/NavalOutcomeService'
import {
  aliveIn,
  captainOf,
  saveCaptain,
  saveMatch,
  shotsAt,
} from '@/core/services/play/naval/NavalTable'
import type { NavalTable } from '@/core/services/play/naval/NavalTable'
import { NAVAL_SETTINGS } from '@/declarations/play/naval/settings'
import { PLAY_ERRORS } from '@/declarations/play/copy'
import { NavalModes, NavalResults, PlayBotKinds } from '@/utils/constants/play'
import { SECOND_MS } from '@/utils/constants/time'

/**
 * Milliseconds the screens need to play a shot
 * @param {boolean} isSunk - A ship went down
 * @return {number} - Duration
 */

const playbackMs = (isSunk: boolean): number =>
  NAVAL_SETTINGS.flightMs + NAVAL_SETTINGS.impactMs + (isSunk ? NAVAL_SETTINGS.sunkMs : 0)

/**
 * Clock of the next shooter, the last shot left to play out first
 * @param {NavalTable} table - Table
 * @param {number} [animationMs] - Playback left
 * @return {Date} - End of the turn
 */

const clockFrom = ({ now, settings }: NavalTable, animationMs = 0): Date =>
  new Date(
    now.getTime() + animationMs + (settings.turnSeconds + NAVAL_SETTINGS.graceSeconds) * SECOND_MS
  )

/**
 * Hand the turn to the next fighter afloat
 * @param {NavalTable} table - Table
 * @param {NavalMatch} match - Match
 * @return {Promise<void>} - Written
 */

export const passTurn = async (table: NavalTable, match: NavalMatch): Promise<void> => {
  const alive = new Set(aliveIn(table, match))
  await saveMatch(table, match, {
    turnId: nextShooter(match.fighters, alive, match.turnId),
    turnEndsAt: clockFrom(table),
  })
}

/**
 * Write a shot, the target out when its last ship sinks
 * @param {NavalTable} table - Table
 * @param {NavalMatch} match - Match
 * @param {Object} shot - Shot
 * @param {string} shot.shooterId - Shooter
 * @param {string} shot.targetId - Target
 * @param {NavalCell} shot.cell - Square
 * @return {Promise<NavalShot>} - Shot written
 */

export const fireShot = async (
  table: NavalTable,
  match: NavalMatch,
  { shooterId, targetId, cell }: { shooterId: string; targetId: string; cell: NavalCell }
): Promise<NavalShot> => {
  const fleet = captainOf(table, targetId)?.fleet ?? []
  const previous = shotsAt(table, match.id, targetId)
  const { result } = resolveShot(fleet, previous, cell)

  // One revision per shot
  table.game.rev += 1
  const shot = await table.tx.navalShot.create({
    data: {
      sessionId: table.session.id,
      matchId: match.id,
      rev: table.game.rev,
      shooterId,
      targetId,
      ...cell,
      result,
    },
  })
  table.shots.push(shot)
  table.isDirty = true

  // A sunk fleet leaves the fight, a bracket waits for its match to close
  const isFleetDown = shipsAfloat(fleet, [...previous, cell]).length === 0
  if (isFleetDown && table.settings.mode !== NavalModes.Bracket) await eliminate(table, targetId)

  // Turn goes on, or the match ends
  const alive = aliveIn(table, match)
  if (alive.length <= 1) {
    await finishMatch(table, match, alive[0] ?? shooterId)

    return shot
  }
  const keeps = table.settings.rules.hitReplay && result !== NavalResults.Miss
  const nextId = keeps ? shooterId : nextShooter(match.fighters, new Set(alive), shooterId)
  await saveMatch(table, match, {
    turnId: nextId,
    turnEndsAt: clockFrom(table, playbackMs(result === NavalResults.Sunk)),
  })

  return shot
}

/**
 * Squares a captain knows about one sea
 * @param {NavalTable} table - Table
 * @param {NavalMatch} match - Match
 * @param {string} targetId - Target
 * @return {NavalKnowledge} - Knowledge
 */

const knowledgeOf = (table: NavalTable, match: NavalMatch, targetId: string): NavalKnowledge => {
  const { size, fleet } = table.sea
  const shots = shotsAt(table, match.id, targetId)
  const ships = captainOf(table, targetId)?.fleet ?? []
  const sunk = sunkShips(ships, shots)
  const sunkCells = new Set(
    sunk.flatMap((ship) => cellsOf(ship).map((c) => indexOf(c.x, c.y, size)))
  )
  const remaining = [...fleet]
  for (const ship of sunk) remaining.splice(remaining.indexOf(ship.length), 1)

  return {
    size,
    fired: new Set(shots.map((shot) => indexOf(shot.x, shot.y, size))),
    wounds: new Set(
      shots
        .filter((shot) => shot.result !== NavalResults.Miss)
        .map((shot) => indexOf(shot.x, shot.y, size))
        .filter((cell) => !sunkCells.has(cell))
    ),
    remaining,
  }
}

/**
 * Shot played for a captain who let the clock run out
 * @param {NavalTable} table - Table
 * @param {NavalMatch} match - Match
 * @return {Promise<void>} - Written
 */

export const autoFire = async (table: NavalTable, match: NavalMatch): Promise<void> => {
  const shooterId = match.turnId
  const shooter = shooterId ? captainOf(table, shooterId) : undefined
  if (!shooterId || !shooter) return

  // Strikes add up to a forfeit
  await saveCaptain(table, shooterId, { strikes: shooter.strikes + 1 })
  if (shooter.strikes >= NAVAL_SETTINGS.strikesToForfeit) return

  const targets = aliveIn(table, match).filter((id) => id !== shooterId)
  const targetId = targets[Math.floor(Math.random() * targets.length)]
  const square = targetId
    ? chooseSquare({
        knowledge: knowledgeOf(table, match, targetId),
        level: PlayBotKinds.Easy,
        mistakeRate: 0,
      })
    : null
  if (square === null) return await passTurn(table, match)

  const { size } = table.sea
  await fireShot(table, match, {
    shooterId,
    targetId,
    cell: { x: square % size, y: Math.floor(square / size) },
  })
}

/**
 * Check a shot a player asks for
 * @param {NavalTable} table - Table
 * @param {NavalMatch} match - Match
 * @param {Object} ask - Shot asked
 * @param {string} ask.shooterId - Shooter
 * @param {string | null} ask.targetId - Target, the only enemy by default
 * @param {NavalCell} ask.cell - Square
 * @return {string} - Target
 */

export const checkShot = (
  table: NavalTable,
  match: NavalMatch,
  { shooterId, targetId, cell }: { shooterId: string; targetId: string | null; cell: NavalCell }
): string => {
  if (match.turnId !== shooterId || table.now < match.startsAt)
    throw conflict(PLAY_ERRORS.notYourTurn)
  const enemies = aliveIn(table, match).filter((id) => id !== shooterId)
  const target = targetId ?? (enemies.length === 1 ? enemies[0] : null)
  if (!target || !enemies.includes(target)) throw conflict(PLAY_ERRORS.badTarget)

  // Inside the sea, never fired twice
  const isRepeat = shotsAt(table, match.id, target).some(
    (shot) => shot.x === cell.x && shot.y === cell.y
  )
  if (!isInside(cell.x, cell.y, table.sea.size) || isRepeat) throw conflict(PLAY_ERRORS.badSquare)

  return target
}
