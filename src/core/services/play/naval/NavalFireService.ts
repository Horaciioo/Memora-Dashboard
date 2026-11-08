import 'server-only'

import type { NavalMatch, NavalShot } from '@prisma/client'

import { conflict } from '@/core/lib/errors'
import {
  canWield,
  cellsOf,
  chooseSquare,
  indexOf,
  isInside,
  nextShooter,
  shipsAfloat,
  strike,
  sunkShips,
  turnsOf,
  weaponOf,
} from '@/core/lib/play/naval'
import type { NavalCell, NavalKnowledge, NavalStrikeCell } from '@/core/lib/play/naval'
import { armCaptain, spendWeapon } from '@/core/services/play/naval/NavalArmsService'
import { finishMatch, eliminate } from '@/core/services/play/naval/NavalOutcomeService'
import {
  aliveIn,
  captainOf,
  saveCaptain,
  saveMatch,
  seenAt,
  shotsAt,
} from '@/core/services/play/naval/NavalTable'
import type { NavalTable } from '@/core/services/play/naval/NavalTable'
import { NAVAL_SETTINGS } from '@/declarations/play/naval/settings'
import { PLAY_ERRORS } from '@/declarations/play/copy'
import { NavalModes, NavalResults, NavalWeapons, PlayBotKinds } from '@/utils/constants/play'
import type { NavalWeaponName } from '@/utils/constants/play'
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
  const nextId = nextShooter(match.fighters, alive, match.turnId)
  await saveMatch(table, match, { turnId: nextId, turnEndsAt: clockFrom(table) })
  if (nextId) await armCaptain(table, nextId, true)
}

/**
 * Strike asked by a shooter
 * @typedef {Object} NavalStrikeAsk
 */

export interface NavalStrikeAsk {
  shooterId: string
  targetId: string
  cell: NavalCell
  weapon: NavalWeaponName
  orientation: number
}

/**
 * Squares a strike would resolve on its target
 * @param {NavalTable} table - Table
 * @param {NavalMatch} match - Match
 * @param {NavalStrikeAsk} ask - Strike
 * @return {NavalStrikeCell[]} - Squares
 */

const strikeCells = (
  table: NavalTable,
  match: NavalMatch,
  { targetId, cell, weapon, orientation }: NavalStrikeAsk
): NavalStrikeCell[] =>
  strike({
    weapon: weaponOf(weapon),
    origin: cell,
    orientation,
    fleet: captainOf(table, targetId)?.fleet ?? [],
    fired: shotsAt(table, match.id, targetId),
    seen: seenAt(table, match.id, targetId),
    size: table.sea.size,
  })

/**
 * Write a strike, the target out when its last ship sinks
 * @param {NavalTable} table - Table
 * @param {NavalMatch} match - Match
 * @param {NavalStrikeAsk} ask - Strike
 * @return {Promise<NavalShot[]>} - Squares written
 */

export const fireShot = async (
  table: NavalTable,
  match: NavalMatch,
  ask: NavalStrikeAsk
): Promise<NavalShot[]> => {
  const { shooterId, targetId, weapon, orientation } = ask
  const cells = strikeCells(table, match, ask)
  const fleet = captainOf(table, targetId)?.fleet ?? []

  // One revision per strike, every square shares it
  table.game.rev += 1
  const shots = await table.tx.navalShot.createManyAndReturn({
    data: cells.map(({ x, y, result }) => ({
      sessionId: table.session.id,
      matchId: match.id,
      rev: table.game.rev,
      shooterId,
      targetId,
      x,
      y,
      result,
      weapon,
      orientation,
    })),
  })
  table.shots.push(...shots)
  table.isDirty = true
  await spendWeapon(table, shooterId, weapon)

  // A sunk fleet leaves the fight, a bracket waits for its match to close
  const isFleetDown = shipsAfloat(fleet, shotsAt(table, match.id, targetId)).length === 0
  if (isFleetDown && table.settings.mode !== NavalModes.Bracket) await eliminate(table, targetId)

  // Turn goes on, or the match ends
  const alive = aliveIn(table, match)
  if (alive.length <= 1) {
    await finishMatch(table, match, alive[0] ?? shooterId)

    return shots
  }
  const isHit = cells.some(
    ({ result }) => result === NavalResults.Hit || result === NavalResults.Sunk
  )
  const keeps = table.settings.rules.hitReplay && isHit
  const nextId = keeps ? shooterId : nextShooter(match.fighters, new Set(alive), shooterId)
  const isSunk = cells.some(({ result }) => result === NavalResults.Sunk)
  await saveMatch(table, match, {
    turnId: nextId,
    turnEndsAt: clockFrom(table, playbackMs(isSunk)),
  })
  if (nextId) await armCaptain(table, nextId, !keeps)

  return shots
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
    weapon: NavalWeapons.Cannon,
    orientation: 0,
  })
}

/**
 * Check a strike a player asks for
 * @param {NavalTable} table - Table
 * @param {NavalMatch} match - Match
 * @param {Omit<NavalStrikeAsk, 'targetId'> & { targetId: string | null }} ask - Strike asked
 * @return {string} - Target
 */

export const checkShot = (
  table: NavalTable,
  match: NavalMatch,
  ask: Omit<NavalStrikeAsk, 'targetId'> & { targetId: string | null }
): string => {
  const { shooterId, targetId, cell, weapon, orientation } = ask
  if (match.turnId !== shooterId || table.now < match.startsAt)
    throw conflict(PLAY_ERRORS.notYourTurn)
  const enemies = aliveIn(table, match).filter((id) => id !== shooterId)
  const target = targetId ?? (enemies.length === 1 ? enemies[0] : null)
  if (!target || !enemies.includes(target)) throw conflict(PLAY_ERRORS.badTarget)

  // Weapon held, paid for and turned a valid way
  const shooter = captainOf(table, shooterId)
  const isTurned =
    Number.isInteger(orientation) && orientation >= 0 && orientation < turnsOf(weaponOf(weapon))
  if (!shooter || !canWield(weapon, shooter) || !isTurned) throw conflict(PLAY_ERRORS.badWeapon)

  // Inside the sea, something left to strike
  const isAimed = isInside(cell.x, cell.y, table.sea.size)
  if (!isAimed || !strikeCells(table, match, { ...ask, targetId: target }).length)
    throw conflict(PLAY_ERRORS.badSquare)

  return target
}
